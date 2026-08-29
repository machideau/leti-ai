<template>
    <main class="chat-main">
      <header class="chat-header">
        <div class="header-left">
          <button class="icon-btn mobile-menu-btn" id="btnMobileSidebar" @click="settings.sidebarOpen = !settings.sidebarOpen">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>

        <div class="header-right">
          <button class="icon-btn" id="btnThemeToggle" title="Changer de thème" @click="settings.toggleTheme()">
            <svg v-if="settings.theme === 'dark'" id="themeIconSun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
            <svg v-else id="themeIconMoon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          </button>

          <button class="icon-btn" id="btnToggleCanvas" title="Ouvrir le panneau Canvas" @click="chat.showCanvas = !chat.showCanvas">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M15 3v18" />
            </svg>
          </button>

          <button class="icon-btn" id="btnExportChat" title="Exporter la discussion">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </button>
        </div>
      </header>

      <div class="messages-container" id="messagesContainer">
        <div class="welcome-screen" id="welcomeScreen" v-if="chat.activeChat.messages.length === 0">
          <h1 class="welcome-title">Que pouvons-nous créer aujourd'hui ?</h1>
          <p class="welcome-subtitle">Propulsé par les moteurs d'IA les plus performants au monde avec exécution en direct.</p>
        </div>

      <div class="chat-feed" id="chatFeed" v-else>
          <MessageBubble v-for="msg in chat.activeChat.messages" :key="msg.id" :msg="msg" :isStreaming="chat.isStreaming" />
      </div>
      </div>

      <MessageInput />
    </main>
</template>

<script setup>
import { useChatStore } from '../stores/chat.js'
import { useSettingsStore } from '../stores/settings.js'
import MessageBubble from './MessageBubble.vue'
import MessageInput from './MessageInput.vue'

const chat = useChatStore()
const settings = useSettingsStore()
</script>
