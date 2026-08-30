import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useSettingsStore } from './settings.js'

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

function newConversation() {
  return { id: uid(), title: 'Nouvelle conversation', messages: [], createdAt: Date.now() }
}

export const useChatStore = defineStore('chat', () => {
  const settings = useSettingsStore()

  const conversations = ref(JSON.parse(localStorage.getItem('leti_conversations') || '[]'))
  const activeId = ref(conversations.value[0]?.id || null)
  const isStreaming = ref(false)
  const canvasHtml = ref('')
  const showCanvas = ref(false)

  if (conversations.value.length === 0) {
    const c = newConversation()
    conversations.value.push(c)
    activeId.value = c.id
  }

  const activeChat = computed(() =>
    conversations.value.find(c => c.id === activeId.value) || conversations.value[0]
  )

  function save() {
    localStorage.setItem('leti_conversations', JSON.stringify(conversations.value))
  }

  function newChat() {
    const c = newConversation()
    conversations.value.unshift(c)
    activeId.value = c.id
    save()
  }

  function selectChat(id) {
    activeId.value = id
  }

  function deleteChat(id) {
    conversations.value = conversations.value.filter(c => c.id !== id)
    if (activeId.value === id) {
      activeId.value = conversations.value[0]?.id || null
      if (!activeId.value) newChat()
    }
    save()
  }

  function updateTitle(chat, text) {
    if (chat.messages.length === 1) {
      chat.title = text.slice(0, 40) + (text.length > 40 ? '…' : '')
    }
  }

  async function sendMessage(text, images = []) {
    if (!text.trim() && images.length === 0) return
    if (isStreaming.value) return
    const conv = activeChat.value

    // Construire le contenu du message utilisateur
    let userContent
    if (images.length > 0) {
      // Format multimodal : array de parts { type, text | image_url }
      userContent = []
      if (text.trim()) userContent.push({ type: 'text', text: text.trim() })
      for (const img of images) {
        userContent.push({
          type: 'image_url',
          image_url: { url: img.dataUrl }
        })
      }
    } else {
      userContent = text.trim()
    }

    // Stocker le message utilisateur (toujours en string pour l'affichage)
    const displayText = text.trim() || images.map(i => `[Image: ${i.name || 'image'}]`).join(' ')
    conv.messages.push({ id: uid(), role: 'user', content: displayText, _rawContent: userContent })
    updateTitle(conv, displayText)
    save()

    // Placeholder IA
    const aiMsg = { id: uid(), role: 'assistant', content: '' }
    conv.messages.push(aiMsg)
    isStreaming.value = true

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          modelId:      settings.hfModelId,
          hfToken:      settings.hfToken || undefined,
          maxTokens:    settings.maxTokens,
          temperature:  settings.temperature,
          systemPrompt: settings.systemPrompt,
          messages: conv.messages
            .filter(m => m.content && m.id !== aiMsg.id)
            .map(m => ({ role: m.role, content: m._rawContent || m.content }))
        })
      })

      if (!resp.ok) {
        const text = await resp.text();
        let errorMessage = `Erreur serveur (${resp.status})`;
        try {
          const err = JSON.parse(text);
          if (err.error) errorMessage = err.error;
        } catch (_) {
          if (text) errorMessage += `\n${text.slice(0, 200)}`;
        }
        aiMsg.content = errorMessage;
        save();
        return;
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop()

        for (const line of lines) {
          if (!line.startsWith('data:')) continue
          const raw = line.slice(5).trim()
          if (raw === '[DONE]') break
          try {
            const json = JSON.parse(raw)
            const delta = json.choices?.[0]?.delta?.content || ''
            if (delta) aiMsg.content += delta
          } catch (_) {}
        }
      }

      // Détection de code HTML généré → canvas
      const htmlMatch = aiMsg.content.match(/```html([\s\S]*?)```/)
      if (htmlMatch) {
        canvasHtml.value = htmlMatch[1].trim()
        showCanvas.value = true
      }
    } catch (e) {
      aiMsg.content = `Erreur de connexion au serveur.\n\n_${e.message}_`
    } finally {
      isStreaming.value = false
      save()
    }
  }

  async function editMessage(msgId, newText) {
    const trimmed = (newText || '').trim()
    if (!trimmed || isStreaming.value) return
    const conv = activeChat.value
    const idx = conv.messages.findIndex(m => m.id === msgId)
    if (idx === -1) return
    // Supprimer le message édité et tout ce qui suit (réponse IA incluse)
    conv.messages.splice(idx)
    save()
    // Appel direct à sendMessage avec le texte capturé avant le splice
    await sendMessage(trimmed)
  }

  function clearAll() {
    conversations.value = []
    newChat()
  }

  return {
    conversations, activeId, activeChat, isStreaming,
    canvasHtml, showCanvas,
    newChat, selectChat, deleteChat, sendMessage, editMessage, clearAll
  }
})
