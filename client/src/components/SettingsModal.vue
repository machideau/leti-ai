<template>
  <Teleport to="body">
    <div class="modal-backdrop" id="settingsModal" @mousedown.self="$emit('close')">
      <div class="settings-dialog" role="dialog" aria-modal="true" aria-labelledby="settingsTitle">

        <!-- Header -->
        <div class="settings-header">
          <div class="settings-header-title">
            <div class="settings-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
            </div>
            <h2 id="settingsTitle">Paramètres Leti AI</h2>
          </div>
          <button class="icon-btn btn-close-modal" id="btnCloseSettings" @click="$emit('close')" aria-label="Fermer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        <div class="settings-body">

          <!-- ── Génération ── -->
          <div class="settings-card">
            <div class="settings-card-header">
              <span class="settings-card-icon"></span>
              <div>
                <h3>Paramètres de génération</h3>
                <p>Contrôlez la longueur et la créativité des réponses.</p>
              </div>
            </div>

            <div class="setting-group">
              <label for="maxTokens">
                Tokens max
                <span class="label-value">{{ s.maxTokens }}</span>
              </label>
              <input type="range" id="maxTokens" v-model.number="s.maxTokens"
                min="128" max="4096" step="128" class="range-input">
              <div class="range-labels"><span>128</span><span>4096</span></div>
            </div>

            <div class="setting-group">
              <label for="temperature">
                Température
                <span class="label-value">{{ s.temperature.toFixed(1) }}</span>
              </label>
              <input type="range" id="temperature" v-model.number="s.temperature"
                min="0" max="2" step="0.1" class="range-input">
              <div class="range-labels"><span>Précis (0)</span><span>Créatif (2)</span></div>
            </div>
          </div>

          <!-- ── Personnalité ── -->
          <div class="settings-card">
            <div class="settings-card-header">
              <span class="settings-card-icon"></span>
              <div>
                <h3>Personnalité & Instructions</h3>
                <p>Définissez comment Leti AI formule ses réponses.</p>
              </div>
            </div>

            <div class="setting-group">
              <label for="systemPromptInput">Prompt système</label>
              <textarea id="systemPromptInput" rows="3" v-model="s.systemPrompt"
                placeholder="Tu es Leti AI..."></textarea>
              <button class="btn-reset-prompt" type="button" @click="resetPrompt">
                Remettre par défaut
              </button>
            </div>
          </div>

          <!-- ── Voix ── -->
          <div class="settings-card">
            <div class="settings-card-header">
              <span class="settings-card-icon"></span>
              <div>
                <h3>Voix & Accessibilité</h3>
                <p>Dictée vocale et lecture à voix haute.</p>
              </div>
            </div>

            <div class="setting-toggle-row">
              <div>
                <span class="toggle-label">Lecture à voix haute (TTS)</span>
                <span class="toggle-desc">Lire les réponses de l'IA automatiquement</span>
              </div>
              <label class="ios-switch">
                <input type="checkbox" id="checkTts" v-model="s.ttsEnabled">
                <span class="slider"></span>
              </label>
            </div>

            <div class="setting-group" style="margin-top: 12px;">
              <label for="voiceLang">Langue de dictée</label>
              <select id="voiceLang" class="apple-select" v-model="s.voiceLang">
                <option value="fr-FR">Français (France)</option>
                <option value="fr-CA">Français (Canada)</option>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
                <option value="es-ES">Español</option>
                <option value="de-DE">Deutsch</option>
                <option value="it-IT">Italiano</option>
                <option value="pt-BR">Português (Brasil)</option>
                <option value="zh-CN">中文 (简体)</option>
                <option value="ja-JP">日本語</option>
              </select>
            </div>
          </div>

          <!-- ── Données ── -->
          <div class="settings-card">
            <div class="settings-card-header">
              <span class="settings-card-icon"></span>
              <div>
                <h3>Gestion des données</h3>
                <p>Historique stocké localement dans votre navigateur.</p>
              </div>
            </div>

            <div class="danger-zone">
              <div v-if="!confirmClear">
                <button class="btn-danger" id="btnClearAllData" @click="confirmClear = true">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                  Effacer tout l'historique
                </button>
              </div>
              <div v-else class="confirm-clear">
                <p>Cette action est irréversible. Supprimer toutes les conversations ?</p>
                <div class="confirm-actions">
                  <button class="btn-secondary" @click="confirmClear = false">Annuler</button>
                  <button class="btn-danger" @click="clearAll">Confirmer</button>
                </div>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="settings-footer">
          <button class="btn-secondary" id="btnCancelSettings" @click="$emit('close')">Annuler</button>
          <button class="btn-primary" id="btnSaveSettings" @click="save">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Enregistrer
          </button>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from 'vue'
import { useSettingsStore } from '../stores/settings.js'
import { useChatStore } from '../stores/chat.js'

const s = useSettingsStore()
const chat = useChatStore()
const emit = defineEmits(['close'])

const showToken    = ref(false)
const confirmClear = ref(false)

const DEFAULT_PROMPT = 'Tu es Leti AI, un assistant IA expert, bienveillant, clair et très compétent en programmation, sciences et rédaction.'

function resetPrompt() {
  s.systemPrompt = DEFAULT_PROMPT
}

function clearAll() {
  chat.clearAll()
  confirmClear.value = false
  emit('close')
}

function save() {
  s.save()
  emit('close')
}
</script>
