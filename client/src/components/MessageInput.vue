<template>
  <div
    class="input-area-wrapper"
    @dragover.prevent="dragging = true"
    @dragleave.prevent="dragging = false"
    @drop.prevent="onDrop"
  >
    <!-- Toast erreur micro -->
    <Transition name="toast">
      <div v-if="voiceError" class="voice-toast">{{ voiceError }}</div>
    </Transition>

    <div class="input-box" :class="{ 'focus': isFocused, 'drag-over': dragging, 'recording': isRecording }">

      <!-- Preview des fichiers joints -->
      <div v-if="attachments.length > 0" class="attachment-preview-container">
        <div
          v-for="(att, i) in attachments"
          :key="i"
          class="attachment-chip"
          :title="att.name"
        >
          <img v-if="att.type === 'image'" :src="att.dataUrl" class="chip-thumb" />
          <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
          </svg>
          <span class="chip-name">{{ att.name }}</span>
          <button class="chip-remove" @click="removeAttachment(i)" title="Retirer">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Indicateur de dictée vocale -->
      <div v-if="isRecording" class="voice-indicator">
        <div class="voice-waves">
          <span v-for="n in 5" :key="n" class="wave-bar" :style="`animation-delay:${(n-1)*0.1}s`"></span>
        </div>
        <span class="voice-label">Dictée en cours… parlez maintenant</span>
        <span class="voice-interim" v-if="interimText">{{ interimText }}</span>
      </div>

      <!-- Zone de texte -->
      <textarea
        id="promptInput"
        class="prompt-textarea"
        :placeholder="isRecording ? '' : 'Posez une question, attachez un fichier ou une image...'"
        rows="1"
        v-model="prompt"
        @keydown.enter.prevent="handleEnter"
        @focus="isFocused = true"
        @blur="isFocused = false"
        ref="inputRef"
      ></textarea>

      <!-- Barre d'actions -->
      <div class="input-actions-bar">
        <div class="input-actions-left">
          <!-- Input fichier caché -->
          <input
            type="file"
            id="fileUploadInput"
            ref="fileInputRef"
            multiple
            hidden
            accept="image/*,.txt,.pdf,.md,.js,.ts,.py,.html,.css,.json,.csv,.xml,.yaml,.yml,.sh,.vue,.jsx,.tsx"
            @change="onFileChange"
          >
          <button class="action-btn" id="btnAttachFile" title="Joindre un fichier ou une image" @click="fileInputRef.click()">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
            </svg>
          </button>

          <!-- Bouton micro -->
          <button
            class="action-btn"
            :class="{ 'recording': isRecording }"
            id="btnVoiceInput"
            :title="isRecording ? 'Arrêter la dictée' : 'Dictée vocale'"
            @click="toggleRecording"
          >
            <!-- Micro normal -->
            <svg v-if="!isRecording" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
            <!-- Stop (carré) quand recording -->
            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="18" height="18" rx="3"/>
            </svg>
          </button>
        </div>

        <div class="input-actions-right">
          <button
            class="btn-send"
            id="btnSend"
            :disabled="(!prompt.trim() && attachments.length === 0) || chat.isStreaming"
            @click="send"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="12" y1="19" x2="12" y2="5" />
              <polyline points="5 12 12 5 19 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="input-disclaimer">
      Leti AI peut faire des erreurs. Vérifiez les informations importantes.
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue'
import { useChatStore } from '../stores/chat.js'

const chat = useChatStore()
const prompt = ref('')
const inputRef = ref(null)
const fileInputRef = ref(null)
const isFocused = ref(false)
const dragging = ref(false)
const attachments = ref([])

// ──────────────────────────────────────────
// Dictée vocale (Web Speech API)
// ──────────────────────────────────────────
const isRecording = ref(false)
const interimText = ref('')
const voiceError = ref('')
let recognition = null
let errorTimer = null

function showVoiceError(msg) {
  voiceError.value = msg
  clearTimeout(errorTimer)
  errorTimer = setTimeout(() => { voiceError.value = '' }, 4000)
}

function initRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (!SpeechRecognition) {
    showVoiceError('Dictée vocale non supportée par votre navigateur (utilisez Chrome ou Edge).')
    return null
  }

  const r = new SpeechRecognition()
  r.lang = 'fr-FR'
  r.continuous = true
  r.interimResults = true

  r.onresult = (e) => {
    let interim = ''
    let final = ''
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const transcript = e.results[i][0].transcript
      if (e.results[i].isFinal) {
        final += transcript
      } else {
        interim += transcript
      }
    }
    if (final) {
      prompt.value += (prompt.value && !prompt.value.endsWith(' ') ? ' ' : '') + final
      adjustHeight()
    }
    interimText.value = interim
  }

  r.onerror = (e) => {
    const messages = {
      'not-allowed': 'Accès au micro refusé. Autorisez le micro dans les paramètres du navigateur.',
      'no-speech': 'Aucune voix détectée. Réessayez.',
      'network': 'Erreur réseau lors de la dictée.',
    }
    showVoiceError(messages[e.error] || `Erreur micro : ${e.error}`)
    stopRecording()
  }

  r.onend = () => {
    // Si on est encore en mode "recording" (pas d'arrêt manuel), redémarrer
    if (isRecording.value) {
      try { r.start() } catch (_) { stopRecording() }
    }
  }

  return r
}

function toggleRecording() {
  if (isRecording.value) {
    stopRecording()
  } else {
    startRecording()
  }
}

function startRecording() {
  recognition = initRecognition()
  if (!recognition) return
  try {
    recognition.start()
    isRecording.value = true
    interimText.value = ''
  } catch (e) {
    showVoiceError('Impossible de démarrer la dictée.')
  }
}

function stopRecording() {
  if (recognition) {
    recognition.onend = null // désactiver le redémarrage auto
    try { recognition.stop() } catch (_) {}
    recognition = null
  }
  isRecording.value = false
  interimText.value = ''
}

onUnmounted(() => { stopRecording() })

// ──────────────────────────────────────────
// Gestion des fichiers
// ──────────────────────────────────────────
const TEXT_EXTS = /\.(txt|md|js|ts|py|html|css|json|csv|xml|yaml|yml|sh|vue|jsx|tsx)$/i

async function processFiles(files) {
  for (const file of files) {
    if (attachments.value.length >= 5) break
    if (file.type.startsWith('image/')) {
      const dataUrl = await readAsDataURL(file)
      attachments.value.push({ name: file.name, type: 'image', dataUrl, mimeType: file.type })
    } else if (TEXT_EXTS.test(file.name) || file.type === 'text/plain') {
      const content = await readAsText(file)
      attachments.value.push({ name: file.name, type: 'text', content })
    } else {
      console.warn(`Type de fichier non supporté : ${file.name}`)
    }
  }
}

function onFileChange(e) {
  processFiles(Array.from(e.target.files))
  e.target.value = ''
}

function onDrop(e) {
  dragging.value = false
  processFiles(Array.from(e.dataTransfer.files))
}

function removeAttachment(i) { attachments.value.splice(i, 1) }

function readAsDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsDataURL(file)
  })
}

function readAsText(file) {
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onload = (e) => resolve(e.target.result)
    reader.readAsText(file)
  })
}

// ──────────────────────────────────────────
// Envoi
// ──────────────────────────────────────────
function handleEnter(e) {
  if (e.shiftKey) {
    prompt.value += '\n'
  } else {
    send()
  }
}

async function send() {
  if (isRecording.value) stopRecording()

  const hasText = prompt.value.trim()
  const hasFiles = attachments.value.length > 0
  if ((!hasText && !hasFiles) || chat.isStreaming) return

  const images = attachments.value.filter(a => a.type === 'image')
  const textFiles = attachments.value.filter(a => a.type === 'text')

  let finalText = prompt.value.trim()
  if (textFiles.length > 0) {
    const blocks = textFiles.map(f => {
      const ext = f.name.split('.').pop()
      return `\`\`\`${ext} (${f.name})\n${f.content}\n\`\`\``
    }).join('\n\n')
    finalText = finalText ? `${finalText}\n\n${blocks}` : blocks
  }

  prompt.value = ''
  attachments.value = []
  adjustHeight()

  if (images.length > 0) {
    await chat.sendMessage(finalText, images)
  } else {
    await chat.sendMessage(finalText)
  }
}

// ──────────────────────────────────────────
// Auto-resize textarea
// ──────────────────────────────────────────
function adjustHeight() {
  nextTick(() => {
    if (inputRef.value) {
      inputRef.value.style.height = 'auto'
      inputRef.value.style.height = Math.min(inputRef.value.scrollHeight, 200) + 'px'
    }
  })
}

watch(prompt, adjustHeight)
</script>
