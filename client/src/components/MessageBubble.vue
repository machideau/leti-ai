<template>
      <div class="message-row" :class="msg.role === 'user' ? 'user' : 'ai'">
        <div class="avatar" :class="msg.role === 'user' ? 'user-av' : 'ai-av'" v-html="avatarSvg"></div>
        
        <div class="message-body">
          <div class="typing-indicator" v-if="msg.role === 'assistant' && !msg.content && isStreaming">
            <span></span><span></span><span></span>
          </div>
          <div v-else class="message-bubble" v-html="parsedContent" ref="bubbleRef"></div>
          
          <div class="message-actions" v-if="msg.role !== 'user'">
              <button class="msg-btn btn-copy-msg" title="Copier la réponse" @click="copy">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span v-if="copied">Copié</span>
                <span v-else>Copier</span>
              </button>
          </div>
        </div>
      </div>
</template>

<script setup>
import { computed, ref, watch, nextTick } from 'vue'
import { marked } from 'marked'
import hljs from 'highlight.js'
import DOMPurify from 'dompurify'

const props = defineProps({
  msg: Object,
  isStreaming: Boolean
})

const copied = ref(false)
const bubbleRef = ref(null)

const userAvatarSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`
const aiAvatarSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`

const avatarSvg = computed(() => props.msg.role === 'user' ? userAvatarSVG : aiAvatarSVG)

const parsedContent = computed(() => {
  if (props.msg.role === 'user') {
    return DOMPurify.sanitize(props.msg.content.replace(/\n/g, '<br>'))
  }
  let c = props.msg.content
  if (props.msg.isStreaming) {
    c += '<span class="cursor-blink">|</span>'
  }
  return DOMPurify.sanitize(marked.parse(c, { breaks: true, gfm: true }))
})

watch(() => props.msg.content, async () => {
  if (props.msg.role === 'user') return
  await nextTick()
  if (bubbleRef.value) {
    bubbleRef.value.querySelectorAll('pre code').forEach((block) => {
      hljs.highlightElement(block)
    })
  }
}, { immediate: true })

async function copy() {
  await navigator.clipboard.writeText(props.msg.content)
  copied.value = true
  setTimeout(() => copied.value = false, 2000)
}
</script>
