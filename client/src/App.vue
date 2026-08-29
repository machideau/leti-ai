<template>
  <div class="app-layout" :data-theme="settings.theme">
    <ChatSidebar />
    <main class="main-content">
      <ChatWindow />
    </main>
    <CanvasPanel v-if="chat.showCanvas" />
    <SettingsModal v-if="showSettings" @close="showSettings = false" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from './stores/settings.js'
import { useChatStore } from './stores/chat.js'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatWindow from './components/ChatWindow.vue'
import CanvasPanel from './components/CanvasPanel.vue'
import SettingsModal from './components/SettingsModal.vue'

const settings = useSettingsStore()
const chat = useChatStore()
const showSettings = ref(false)

// Expose showSettings globally via provide
import { provide } from 'vue'
provide('openSettings', () => { showSettings.value = true })
</script>
