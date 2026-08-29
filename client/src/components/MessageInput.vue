<template>
      <div class="input-area-wrapper">
        <div class="input-box" id="inputBox" :class="{ 'focus': isFocused }">
          <div class="attachment-preview-container hidden" id="attachmentPreview"></div>

          <textarea id="promptInput" class="prompt-textarea"
            placeholder="Posez une question, demandez du code ou attachez un document..." rows="1"
            v-model="prompt"
            @keydown.enter.prevent="handleEnter"
            @focus="isFocused = true"
            @blur="isFocused = false"
            ref="inputRef"
            ></textarea>

          <div class="input-actions-bar">
            <div class="input-actions-left">
              <input type="file" id="fileUploadInput" multiple hidden
                accept="image/*,.txt,.pdf,.js,.py,.html,.css,.json,.csv">
              <button class="action-btn" id="btnAttachFile" title="Ajouter une image ou un fichier">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path
                    d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                </svg>
              </button>

              <button class="action-btn" id="btnVoiceInput" title="Dictée vocale">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              </button>
            </div>

            <div class="input-actions-right">
              <button class="btn-send" id="btnSend" :disabled="!prompt.trim() || chat.isStreaming" @click="send">
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
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/chat.js'

const chat = useChatStore()
const prompt = ref('')
const inputRef = ref(null)
const isFocused = ref(false)

function handleEnter(e) {
  if (e.shiftKey) {
    prompt.value += '\n'
  } else {
    send()
  }
}

async function send() {
  if (!prompt.value.trim() || chat.isStreaming) return
  const msg = prompt.value.trim()
  prompt.value = ''
  adjustHeight()
  await chat.sendMessage(msg)
}

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
