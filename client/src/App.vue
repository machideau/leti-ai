<template>
  <div class="ambient-background">
    <div class="ai-glow ai-glow-1"></div>
    <div class="ai-glow ai-glow-2"></div>
    <div class="ai-glow ai-glow-3"></div>
  </div>

  <div class="app-layout" id="appLayout">
    <ChatSidebar />
    <div class="sidebar-overlay" id="sidebarOverlay" :class="{ active: settings.sidebarOpen }" @click="settings.sidebarOpen = false"></div>
    <ChatWindow />
    <CanvasPanel v-if="chat.showCanvas" />
  </div>
  
  <SettingsModal v-if="showSettings" @close="showSettings = false" />
</template>

<script setup>
import { ref, watchEffect, provide } from 'vue'
import { useSettingsStore } from './stores/settings.js'
import { useChatStore } from './stores/chat.js'
import ChatSidebar from './components/ChatSidebar.vue'
import ChatWindow from './components/ChatWindow.vue'
import CanvasPanel from './components/CanvasPanel.vue'
import SettingsModal from './components/SettingsModal.vue'

const settings = useSettingsStore()
const chat = useChatStore()
const showSettings = ref(false)

// Global classes based on theme
watchEffect(() => {
  document.body.className = settings.theme === 'light' ? 'light-theme' : 'dark-theme'
})

provide('openSettings', () => { showSettings.value = true })
</script>
