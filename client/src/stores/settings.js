import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme        = ref(localStorage.getItem('leti_theme') || 'dark')
  const engine       = ref('huggingface')
  const hfModelId    = ref('google/gemma-3-4b-it')
  const hfToken      = ref('')
  const systemPrompt = ref('Tu es Leti AI, un assistant IA expert, bienveillant, clair et très compétent en programmation, sciences et rédaction.')
  const ttsEnabled   = ref(false)
  const voiceLang    = ref('fr-FR')
  const maxTokens    = ref(1024)
  const temperature  = ref(0.7)
  const sidebarOpen  = ref(false)

  // Charger depuis localStorage
  const saved = JSON.parse(localStorage.getItem('ai_settings') || '{}')
  if (saved.engine)       engine.value       = saved.engine
  if (saved.hfModelId)    hfModelId.value    = saved.hfModelId
  if (saved.hfToken)      hfToken.value      = saved.hfToken
  if (saved.systemPrompt) systemPrompt.value = saved.systemPrompt
  if (saved.ttsEnabled   !== undefined) ttsEnabled.value   = saved.ttsEnabled
  if (saved.voiceLang)    voiceLang.value    = saved.voiceLang
  if (saved.maxTokens)    maxTokens.value    = saved.maxTokens
  if (saved.temperature)  temperature.value  = saved.temperature

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('leti_theme', theme.value)
  }

  function save() {
    localStorage.setItem('ai_settings', JSON.stringify({
      engine:       engine.value,
      hfModelId:    hfModelId.value,
      hfToken:      hfToken.value,
      systemPrompt: systemPrompt.value,
      ttsEnabled:   ttsEnabled.value,
      voiceLang:    voiceLang.value,
      maxTokens:    maxTokens.value,
      temperature:  temperature.value,
    }))
  }

  return {
    theme, engine, hfModelId, hfToken, systemPrompt,
    ttsEnabled, voiceLang, maxTokens, temperature, sidebarOpen,
    toggleTheme, save,
  }
})
