<template>
  <aside class="canvas-panel">
    <div class="canvas-header">
      <span>Canvas</span>
      <div class="canvas-actions">
        <button @click="refresh" title="Rafraîchir">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
        </button>
        <button @click="chat.showCanvas = false" title="Fermer">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    <iframe
      ref="frameEl"
      class="canvas-iframe"
      sandbox="allow-scripts"
      title="Canvas de prévisualisation"
    ></iframe>
  </aside>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useChatStore } from '../stores/chat.js'

const chat = useChatStore()
const frameEl = ref(null)

function refresh() {
  if (frameEl.value) {
    frameEl.value.srcdoc = chat.canvasHtml
  }
}

watch(() => chat.canvasHtml, refresh)
onMounted(refresh)
</script>
