<template>
  <div class="message-row" :class="message.role">
    <div v-if="message.role === 'assistant'" class="avatar ai-avatar">L</div>
    <div class="message-bubble" :class="message.role">
      <div class="bubble-content" v-html="rendered"></div>
      <div v-if="message.content" class="bubble-actions">
        <button @click="copy" :class="{ copied }" title="Copier">
          <svg v-if="!copied" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <svg v-else width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
          {{ copied ? 'Copié' : 'Copier' }}
        </button>
      </div>
    </div>
    <div v-if="message.role === 'user'" class="avatar user-avatar">U</div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'

const props = defineProps({ message: Object })

marked.setOptions({
  breaks: true,
  gfm: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(code, { language: lang }).value
    }
    return hljs.highlightAuto(code).value
  }
})

const rendered = computed(() => {
  if (!props.message.content) return '<span class="cursor-blink">▋</span>'
  return marked(props.message.content)
})

const copied = ref(false)
function copy() {
  navigator.clipboard.writeText(props.message.content)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
</script>
