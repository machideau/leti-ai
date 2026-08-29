<template>
  <div class="modal-backdrop" id="settingsModal">
    <div class="settings-dialog">
      <div class="settings-header">
        <div class="settings-header-title">
          <div class="settings-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3" />
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
            </svg>
          </div>
          <h2>Paramètres Leti AI</h2>
        </div>
        <button class="icon-btn btn-close-modal" id="btnCloseSettings" @click="$emit('close')" aria-label="Fermer les paramètres">&times;</button>
      </div>

      <div class="settings-body">
        <div class="settings-card">
          <div class="settings-card-header">
            <span class="settings-card-icon"></span>
            <div>
              <h3>Moteur d'Intelligence & Modèle</h3>
              <p>Connectez Leti AI à un modèle Hugging Face, local ou intégré.</p>
            </div>
          </div>

          <div class="setting-group">
            <label for="engineSelect">Moteur Actif</label>
            <select id="engineSelect" class="apple-select" v-model="settings.engine">
              <option value="huggingface">Hugging Face Inference API</option>
              <option value="gemma-local">Local / Ollama (LM Studio, Jan)</option>
              <option value="neural-builtin">Mode Intégré Autonome (Leti AI)</option>
            </select>
          </div>

          <div id="hfFields" class="setting-group" v-if="settings.engine === 'huggingface'">
            <label for="hfModelId">ID du Modèle Hugging Face</label>
            <input type="text" id="hfModelId" v-model="settings.hfModelId" placeholder="google/gemma-3-4b-it">
            <p class="setting-hint">
              Exemples : <code>google/gemma-3-4b-it</code>, <code>mistralai/Mistral-7B-Instruct-v0.3</code>, <code>HuggingFaceH4/zephyr-7b-beta</code>
            </p>
          </div>
        </div>

        <div class="settings-card">
          <div class="settings-card-header">
            <span class="settings-card-icon"></span>
            <div>
              <h3>Personnalité & Instructions Système</h3>
              <p>Définissez comment Leti AI formule ses réponses et analyses.</p>
            </div>
          </div>

          <div class="setting-group">
            <label for="systemPromptInput">Prompt Système Global</label>
            <textarea id="systemPromptInput" rows="3" v-model="settings.systemPrompt"
              placeholder="Tu es Leti AI..."></textarea>
          </div>
        </div>

        <div class="settings-card">
          <div class="settings-card-header">
            <span class="settings-card-icon"></span>
            <div>
              <h3>Audio & Accessibilité</h3>
              <p>Synthèse vocale des réponses et effets sonores.</p>
            </div>
          </div>

          <div class="setting-toggle-row">
            <div>
              <span class="toggle-label">Lecture à voix haute (TTS)</span>
              <span class="toggle-desc">Activer la synthèse vocale pour les réponses</span>
            </div>
            <label class="ios-switch">
              <input type="checkbox" id="checkSoundEnabled" v-model="settings.soundEnabled">
              <span class="slider"></span>
            </label>
          </div>
        </div>

        <div class="settings-card">
          <div class="settings-card-header">
            <span class="settings-card-icon"></span>
            <div>
              <h3>Gestion des Données</h3>
              <p>Historique des discussions et stockage local.</p>
            </div>
          </div>

          <button class="btn-danger" id="btnClearAllData" @click="chat.clearHistory()">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
            <span>Effacer tout l'historique des discussions</span>
          </button>
        </div>

      </div>

      <div class="settings-footer">
        <button class="btn-secondary" id="btnCancelSettings" @click="$emit('close')">Annuler</button>
        <button class="btn-primary" id="btnSaveSettings" @click="save">Enregistrer les réglages</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useSettingsStore } from '../stores/settings.js'
import { useChatStore } from '../stores/chat.js'

const settings = useSettingsStore()
const chat = useChatStore()
const emit = defineEmits(['close'])

function save() {
  settings.save()
  emit('close')
}
</script>
