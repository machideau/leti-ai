<template>
  <div class="chat-window">
    <!-- Header -->
    <header class="chat-header">
      <div class="chat-header-left">
        <div class="header-title">{{ chat.activeChat?.title || 'Leti AI' }}</div>
        <div class="header-badge" :class="{ streaming: chat.isStreaming }">
          <span class="badge-dot"></span>
          {{ chat.isStreaming ? 'En train de répondre…' : 'Actif' }}
        </div>
      </div>
      <div class="chat-header-right">
        <span class="model-tag">{{ settings.hfModelId }}</span>
      </div>
    </header>

    <!-- Messages -->
    <div class="messages-container" ref="messagesEl">
      <div v-if="!chat.activeChat?.messages?.length" class="empty-state">
        <div class="empty-logo">L</div>
        <h2>Comment puis-je vous aider ?</h2>
        <p>Posez une question, demandez du code, ou explorez une idée.</p>
      </div>

      <MessageBubble
        v-for="msg in chat.activeChat?.messages"
        :key="msg.id"
        :message="msg"
      />

      <div v-if="chat.isStreaming" class="typing-indicator">
        <span></span><span></span><span></span>
      </div>
    </div>

    <!-- Input -->
    <MessageInput />
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from 'vue'
import { useChatStore } from '../stores/chat.js'
import { useSettingsStore } from '../stores/settings.js'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'

const chat = useChatStore()
const settings = useSettingsStore()
const messagesEl = ref(null)

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

watch(() => chat.activeChat?.messages?.length, scrollToBottom)
watch(() => chat.activeChat?.messages?.at(-1)?.content, scrollToBottom)
</script>
