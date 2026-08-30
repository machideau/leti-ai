<template>
    <aside class="sidebar" id="sidebar" :class="{ 'open': settings.sidebarOpen }">
      <div class="sidebar-header">
        <div class="app-brand">
          <div class="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path
                d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <span class="brand-title">Leti AI</span>
        </div>
        <button class="icon-btn" id="btnToggleSidebar" @click="settings.sidebarOpen = !settings.sidebarOpen" title="Masquer la barre latérale" aria-label="Masquer le menu">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M9 3v18" />
          </svg>
        </button>
      </div>

      <div class="sidebar-action-new">
        <button class="btn-new-chat" id="btnNewChat" @click="chat.newChat()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span>Nouvelle discussion</span>
        </button>
      </div>

      <div class="sidebar-search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input type="text" id="searchChatsInput" placeholder="Rechercher...">
      </div>

      <div class="conversations-wrapper" id="conversationsWrapper">
        <div class="chat-section-label">Récents</div>
        <div class="conversations-list" id="conversationsList">
            <div
                v-for="conv in chat.conversations"
                :key="conv.id"
                class="chat-item"
                :class="{ active: conv.id === chat.activeId }"
                @click="selectConv(conv.id)"
            >
                <span class="chat-item-title">{{ conv.title }}</span>
                <div class="chat-item-actions">
                    <button class="chat-item-btn btn-delete-chat" @click.stop="chat.deleteChat(conv.id)" title="Supprimer">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                    </button>
                </div>
            </div>
        </div>
      </div>

      <div class="sidebar-footer">
        <button class="btn-sidebar-option" id="btnOpenSettings" @click="openSettings()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="3" />
            <path
              d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
          <span>Paramètres & Clés API</span>
        </button>
      </div>
    </aside>
</template>

<script setup>
import { inject } from 'vue'
import { useChatStore } from '../stores/chat.js'
import { useSettingsStore } from '../stores/settings.js'

const chat = useChatStore()
const settings = useSettingsStore()
const openSettings = inject('openSettings')

function selectConv(id) {
  chat.selectChat(id)
  // Fermer la sidebar sur mobile après sélection
  if (window.innerWidth <= 768) {
    settings.sidebarOpen = false
  }
}
</script>
