<template>
    <aside class="canvas-pane" id="canvasPane">
      <div class="canvas-header">
        <div class="canvas-tabs">
          <button class="canvas-tab" :class="{ active: tab === 'preview' }" @click="tab = 'preview'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="2" y="3" width="20" height="14" rx="2" />
              <line x1="8" y1="21" x2="16" y2="21" />
              <line x1="12" y1="17" x2="12" y2="21" />
            </svg>
            <span>Aperçu en Direct</span>
          </button>
          <button class="canvas-tab" :class="{ active: tab === 'code' }" @click="tab = 'code'">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            <span>Code Source</span>
          </button>
        </div>

        <div class="canvas-actions">
          <button class="icon-btn" id="btnRefreshCanvas" title="Recharger l'aperçu" @click="refresh">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
          <button class="icon-btn" id="btnCopyCanvas" title="Copier le code">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          </button>
          <button class="icon-btn" id="btnCloseCanvas" title="Fermer le Canvas" @click="chat.showCanvas = false">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </div>

      <div class="canvas-content">
        <iframe v-show="tab === 'preview'" ref="frameEl" class="canvas-frame" sandbox="allow-scripts allow-modals"></iframe>
        
        <div v-show="tab === 'code'" class="canvas-code-view">
          <pre><code class="language-html">{{ chat.canvasHtml }}</code></pre>
        </div>
      </div>
    </aside>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useChatStore } from '../stores/chat.js'

const chat = useChatStore()
const frameEl = ref(null)
const tab = ref('preview')

function refresh() {
  if (frameEl.value) {
    frameEl.value.srcdoc = chat.canvasHtml
  }
}

watch(() => chat.canvasHtml, refresh)
onMounted(refresh)
</script>
