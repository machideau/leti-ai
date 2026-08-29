<template>
  <div class="message-input-area">
    <div class="input-container">
      <textarea
        ref="inputEl"
        v-model="text"
        class="message-input"
        placeholder="Envoyer un message à Leti AI…"
        rows="1"
        @keydown.enter.exact.prevent="send"
        @input="resize"
      ></textarea>
      <button
        class="send-btn"
        :disabled="!text.trim() || chat.isStreaming"
        @click="send"
        title="Envoyer (Entrée)"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
      </button>
    </div>
    <div class="input-footer">
      <span>Entrée pour envoyer · Shift+Entrée pour nouvelle ligne</span>
      <span>{{ settings.hfModelId }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useChatStore } from '../stores/chat.js'
import { useSettingsStore } from '../stores/settings.js'

const chat = useChatStore()
const settings = useSettingsStore()
const text = ref('')
const inputEl = ref(null)

function resize() {
  nextTick(() => {
    if (!inputEl.value) return
    inputEl.value.style.height = 'auto'
    inputEl.value.style.height = Math.min(inputEl.value.scrollHeight, 200) + 'px'
  })
}

async function send() {
  const msg = text.value.trim()
  if (!msg || chat.isStreaming) return
  text.value = ''
  resize()
  await chat.sendMessage(msg)
}
</script>
