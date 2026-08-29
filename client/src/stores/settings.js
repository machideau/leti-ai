import { defineStore } from 'pinia'
import { ref, watch } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref(localStorage.getItem('leti_theme') || 'dark')
  const engine = ref('huggingface')
  const hfModelId = ref('google/gemma-3-4b-it')
  const systemPrompt = ref('Tu es Leti AI, un assistant IA expert, bienveillant, clair et très compétent en programmation, sciences et rédaction.')
  const soundEnabled = ref(true)
  const sidebarOpen = ref(false)

  // Charger depuis localStorage
  const saved = JSON.parse(localStorage.getItem('ai_settings') || '{}')
  if (saved.engine)       engine.value = saved.engine
  if (saved.hfModelId)    hfModelId.value = saved.hfModelId
  if (saved.systemPrompt) systemPrompt.value = saved.systemPrompt
  if (saved.soundEnabled !== undefined) soundEnabled.value = saved.soundEnabled

  function toggleTheme() {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('leti_theme', theme.value)
  }

  function save() {
    const data = {
      engine: engine.value,
      hfModelId: hfModelId.value,
      systemPrompt: systemPrompt.value,
      soundEnabled: soundEnabled.value
    }
    localStorage.setItem('ai_settings', JSON.stringify(data))
  }

  return { theme, engine, hfModelId, systemPrompt, soundEnabled, sidebarOpen, toggleTheme, save }
})
