<template>
  <div class="settings-overlay" @click.self="$emit('close')">
    <div class="settings-modal">
      <div class="settings-header">
        <h2>Paramètres</h2>
        <button class="btn-close-modal" @click="$emit('close')">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div class="settings-body">
        <!-- Modèle HF -->
        <div class="settings-card">
          <h3>Modèle Hugging Face</h3>
          <div class="setting-group">
            <label>ID du modèle</label>
            <input v-model="form.hfModelId" placeholder="google/gemma-3-4b-it" />
            <p class="setting-hint">
              Ex : <code>google/gemma-3-4b-it</code>, <code>mistralai/Mistral-7B-Instruct-v0.3</code>
            </p>
          </div>
        </div>

        <!-- Personnalité -->
        <div class="settings-card">
          <h3>Instructions système</h3>
          <div class="setting-group">
            <label>Prompt système</label>
            <textarea v-model="form.systemPrompt" rows="4" placeholder="Tu es Leti AI…"></textarea>
          </div>
        </div>

        <!-- Danger -->
        <div class="settings-card danger-card">
          <h3>Données</h3>
          <button class="btn-danger" @click="clearAll">Effacer toutes les conversations</button>
        </div>
      </div>

      <div class="settings-footer">
        <button class="btn-cancel" @click="$emit('close')">Annuler</button>
        <button class="btn-save" @click="save">Enregistrer</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useSettingsStore } from '../stores/settings.js'
import { useChatStore } from '../stores/chat.js'

const emit = defineEmits(['close'])
const settings = useSettingsStore()
const chat = useChatStore()

const form = reactive({
  hfModelId: settings.hfModelId,
  systemPrompt: settings.systemPrompt
})

function save() {
  settings.hfModelId = form.hfModelId
  settings.systemPrompt = form.systemPrompt
  settings.save()
  emit('close')
}

function clearAll() {
  if (confirm('Supprimer toutes les conversations ?')) {
    chat.clearAll()
    emit('close')
  }
}
</script>
