/**
 * Leti AI Chatbot - Engine & Interface Logic
 * Support multi-modèles (Claude, Gemini, ChatGPT, DeepSeek), mode Réflexion,
 * Rendu Markdown/LaTeX, Live Canvas / Artifacts, et Synthèse/Dictée vocale.
 */

class AIChatApp {
  constructor() {
    // État de l'application
    this.conversations = JSON.parse(localStorage.getItem('ai_conversations') || '[]');
    this.currentChatId = null;
    this.currentModel = 'claude-3-7-sonnet';
    this.isThinkingEnabled = false;
    this.soundEnabled = true;
    this.activeAttachments = [];
    this.isGenerating = false;
    this.recognition = null;
    this.isRecording = false;
    this.theme = localStorage.getItem('leti_theme') || 'dark';
    this.settings = JSON.parse(localStorage.getItem('ai_settings') || JSON.stringify({
      engine: 'neural-builtin',
      openaiKey: '',
      anthropicKey: '',
      geminiKey: '',
      systemPrompt: 'Tu es Leti AI, un assistant IA expert, bienveillant, clair et très compétent en programmation, sciences et rédaction.'
    }));

    // Cache des éléments DOM avec tolérance
    this.dom = {
      sidebar: document.getElementById('sidebar'),
      btnToggleSidebar: document.getElementById('btnToggleSidebar'),
      btnMobileSidebar: document.getElementById('btnMobileSidebar'),
      sidebarOverlay: document.getElementById('sidebarOverlay'),
      btnNewChat: document.getElementById('btnNewChat'),
      searchChatsInput: document.getElementById('searchChatsInput'),
      conversationsList: document.getElementById('conversationsList'),
      
      // Header, Thème & Outils
      btnThemeToggle: document.getElementById('btnThemeToggle'),
      themeIconSun: document.getElementById('themeIconSun'),
      themeIconMoon: document.getElementById('themeIconMoon'),
      btnModelSelector: document.getElementById('btnModelSelector'),
      currentModelName: document.getElementById('currentModelName'),
      currentModelIcon: document.getElementById('currentModelIcon'),
      modelMenu: document.getElementById('modelMenu'),
      btnToggleThinking: document.getElementById('btnToggleThinking'),
      btnToggleCanvas: document.getElementById('btnToggleCanvas'),
      btnExportChat: document.getElementById('btnExportChat'),
      
      // Messages & Input
      welcomeScreen: document.getElementById('welcomeScreen'),
      chatFeed: document.getElementById('chatFeed'),
      messagesContainer: document.getElementById('messagesContainer'),
      promptInput: document.getElementById('promptInput'),
      btnSend: document.getElementById('btnSend'),
      btnAttachFile: document.getElementById('btnAttachFile'),
      fileUploadInput: document.getElementById('fileUploadInput'),
      attachmentPreview: document.getElementById('attachmentPreview'),
      btnVoiceInput: document.getElementById('btnVoiceInput'),
      
      // Canvas / Artifacts
      canvasPane: document.getElementById('canvasPane'),
      canvasIframe: document.getElementById('canvasIframe'),
      canvasCodeView: document.getElementById('canvasCodeView'),
      canvasCodeBlock: document.getElementById('canvasCodeBlock'),
      tabCanvasPreview: document.getElementById('tabCanvasPreview'),
      tabCanvasCode: document.getElementById('tabCanvasCode'),
      btnCloseCanvas: document.getElementById('btnCloseCanvas'),
      btnRefreshCanvas: document.getElementById('btnRefreshCanvas'),
      btnCopyCanvas: document.getElementById('btnCopyCanvas'),
      
      // Paramètres
      btnOpenSettings: document.getElementById('btnOpenSettings'),
      settingsModal: document.getElementById('settingsModal'),
      btnCloseSettings: document.getElementById('btnCloseSettings'),
      btnCancelSettings: document.getElementById('btnCancelSettings'),
      btnSaveSettings: document.getElementById('btnSaveSettings'),
      engineSelect: document.getElementById('engineSelect'),
      customApiFields: document.getElementById('customApiFields'),
      openaiKey: document.getElementById('openaiKey'),
      anthropicKey: document.getElementById('anthropicKey'),
      geminiKey: document.getElementById('geminiKey'),
      systemPromptInput: document.getElementById('systemPromptInput'),
      checkSoundEnabled: document.getElementById('checkSoundEnabled'),
    };

    // Initialisation
    this.applyTheme(this.theme);
    this.initSpeechRecognition();
    this.bindEvents();
    this.loadLastConversation();
  }

  /* ==========================================================================
     Gestion du Thème (Clair / Sombre)
     ========================================================================== */
  applyTheme(theme) {
    this.theme = theme;
    if (theme === 'light') {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
      if (this.dom.themeIconSun) this.dom.themeIconSun.classList.add('hidden');
      if (this.dom.themeIconMoon) this.dom.themeIconMoon.classList.remove('hidden');
    } else {
      document.body.classList.remove('light-theme');
      document.body.classList.add('dark-theme');
      if (this.dom.themeIconSun) this.dom.themeIconSun.classList.remove('hidden');
      if (this.dom.themeIconMoon) this.dom.themeIconMoon.classList.add('hidden');
    }
    localStorage.setItem('leti_theme', theme);
  }

  toggleTheme() {
    const nextTheme = this.theme === 'light' ? 'dark' : 'light';
    this.applyTheme(nextTheme);
  }

  /* ==========================================================================
     Gestion des Conversations & Stockage
     ========================================================================== */
  createNewChat() {
    const newChat = {
      id: 'chat_' + Date.now(),
      title: 'Nouvelle discussion',
      model: this.currentModel,
      createdAt: new Date().toISOString(),
      messages: []
    };
    this.conversations.unshift(newChat);
    this.currentChatId = newChat.id;
    this.saveConversations();
    this.renderConversationsList();
    this.renderCurrentChat();
    if (this.dom.promptInput) this.dom.promptInput.focus();
  }

  loadLastConversation() {
    if (this.conversations.length > 0) {
      this.currentChatId = this.conversations[0].id;
    } else {
      this.createNewChat();
      return;
    }
    this.renderConversationsList();
    this.renderCurrentChat();
  }

  getCurrentChat() {
    return this.conversations.find(c => c.id === this.currentChatId) || null;
  }

  saveConversations() {
    localStorage.setItem('ai_conversations', JSON.stringify(this.conversations));
  }

  deleteChat(id, e) {
    if (e) e.stopPropagation();
    this.conversations = this.conversations.filter(c => c.id !== id);
    if (this.conversations.length === 0) {
      this.createNewChat();
    } else if (this.currentChatId === id) {
      this.currentChatId = this.conversations[0].id;
      this.renderCurrentChat();
    }
    this.saveConversations();
    this.renderConversationsList();
  }

  renderConversationsList() {
    if (!this.dom.conversationsList) return;
    const filter = this.dom.searchChatsInput ? this.dom.searchChatsInput.value.toLowerCase() : '';
    const filtered = this.conversations.filter(c => c.title.toLowerCase().includes(filter));

    this.dom.conversationsList.innerHTML = filtered.map(chat => `
      <div class="chat-item ${chat.id === this.currentChatId ? 'active' : ''}" data-id="${chat.id}">
        <span class="chat-item-title">${this.escapeHtml(chat.title)}</span>
        <div class="chat-item-actions">
          <button class="chat-item-btn btn-delete-chat" data-id="${chat.id}" title="Supprimer">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      </div>
    `).join('');

    // Événements sur les items
    this.dom.conversationsList.querySelectorAll('.chat-item').forEach(item => {
      item.addEventListener('click', () => {
        this.currentChatId = item.dataset.id;
        this.renderConversationsList();
        this.renderCurrentChat();
        if (window.innerWidth <= 768) {
          this.toggleSidebar(false);
        }
      });
    });

    this.dom.conversationsList.querySelectorAll('.btn-delete-chat').forEach(btn => {
      btn.addEventListener('click', e => this.deleteChat(btn.dataset.id, e));
    });
  }

  renderCurrentChat() {
    const chat = this.getCurrentChat();
    const headerTitle = document.getElementById('headerChatTitle');
    if (headerTitle) {
      headerTitle.textContent = chat && chat.title ? chat.title : 'Leti AI';
    }

    if (!chat || chat.messages.length === 0) {
      if (this.dom.welcomeScreen) this.dom.welcomeScreen.classList.remove('hidden');
      if (this.dom.chatFeed) this.dom.chatFeed.innerHTML = '';
      return;
    }

    if (this.dom.welcomeScreen) this.dom.welcomeScreen.classList.add('hidden');
    if (this.dom.chatFeed) {
      this.dom.chatFeed.innerHTML = chat.messages.map(msg => this.renderMessageHTML(msg)).join('');
    }
    
    // Coloration et LaTeX après injection
    this.highlightCodeBlocks();
    this.renderMathFormulas();
    this.attachMessageActions();
    this.scrollToBottom();
  }

  /* ==========================================================================
     Rendu des Messages & Markdown
     ========================================================================== */
  renderMessageHTML(msg) {
    const isUser = msg.role === 'user';
    const userAvatarSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    const aiAvatarSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`;
    const avatar = isUser ? userAvatarSVG : aiAvatarSVG;
    const contentParsed = isUser ? this.escapeHtml(msg.content) : this.parseMarkdown(msg.content);

    return `
      <div class="message-row ${isUser ? 'user' : 'ai'}" data-msg-id="${msg.id || ''}">
        <div class="avatar ${isUser ? 'user-av' : 'ai-av'}">${avatar}</div>
        <div class="message-body">
          <div class="message-bubble">${contentParsed}</div>
          ${!isUser ? `
            <div class="message-actions">
              <button class="msg-btn btn-copy-msg" title="Copier la réponse">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>Copier</span>
              </button>
              <button class="msg-btn btn-speak-msg" title="Écouter à voix haute">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
                <span>Écouter</span>
              </button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  parseMarkdown(text) {
    if (!text) return '';
    let parsed = text;

    // Blocs de code ```lang ... ```
    parsed = parsed.replace(/```([a-zA-Z0-9_\-\+]*)\n([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang.trim() || 'code';
      const cleanCode = code.trim();
      const isWebCode = ['html', 'javascript', 'js', 'css', 'svg'].includes(language.toLowerCase());

      return `
        <div class="code-block-wrapper" data-code="${encodeURIComponent(cleanCode)}" data-lang="${language}">
          <div class="code-header">
            <span>${language}</span>
            <div class="code-header-actions">
              ${isWebCode ? `
                <button class="code-action-btn btn-run-canvas" title="Exécuter dans le volet Canvas">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  <span>Canvas</span>
                </button>
              ` : ''}
              <button class="code-action-btn btn-copy-code" title="Copier le code">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                <span>Copier</span>
              </button>
            </div>
          </div>
          <pre><code class="language-${language}">${this.escapeHtml(cleanCode)}</code></pre>
        </div>
      `;
    });

    // Titres
    parsed = parsed.replace(/^### (.*$)/gim, '<h3 style="font-size:16px; margin:12px 0 6px;">$1</h3>');
    parsed = parsed.replace(/^## (.*$)/gim, '<h2 style="font-size:18px; margin:14px 0 8px;">$1</h2>');
    parsed = parsed.replace(/^# (.*$)/gim, '<h1 style="font-size:22px; margin:16px 0 10px;">$1</h1>');

    // Gras et Italique
    parsed = parsed.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    parsed = parsed.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // Code inline `code`
    parsed = parsed.replace(/`([^`]+)`/g, '<code style="background:rgba(255,255,255,0.1); padding:2px 6px; border-radius:4px; font-family:var(--font-mono); font-size:12.5px;">$1</code>');

    // Listes à puces
    parsed = parsed.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left: 18px; margin-bottom: 4px;">$1</li>');
    parsed = parsed.replace(/(<li.*<\/li>)/s, '<ul style="margin: 8px 0;">$1</ul>');

    // Paragraphes
    parsed = parsed.replace(/\n\n/g, '<br><br>');

    return parsed;
  }

  highlightCodeBlocks() {
    if (typeof hljs !== 'undefined') {
      document.querySelectorAll('pre code').forEach(block => {
        hljs.highlightElement(block);
      });
    }
  }

  renderMathFormulas() {
    if (typeof katex === 'undefined') return;
    document.querySelectorAll('.message-bubble').forEach(el => {
      const text = el.innerHTML;
      const parsedMath = text.replace(/\$([^\$]+)\$/g, (match, formula) => {
        try {
          return katex.renderToString(formula, { throwOnError: false });
        } catch (e) { return match; }
      });
      el.innerHTML = parsedMath;
    });
  }

  attachMessageActions() {
    // Boutons Copier le Code
    document.querySelectorAll('.btn-copy-code').forEach(btn => {
      btn.onclick = () => {
        const wrapper = btn.closest('.code-block-wrapper');
        const code = decodeURIComponent(wrapper.dataset.code);
        navigator.clipboard.writeText(code).then(() => {
          btn.innerHTML = '<span>Copié !</span>';
          setTimeout(() => btn.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copier</span>', 1500);
        });
      };
    });

    // Boutons Ouvrir dans Canvas
    document.querySelectorAll('.btn-run-canvas').forEach(btn => {
      btn.onclick = () => {
        const wrapper = btn.closest('.code-block-wrapper');
        const code = decodeURIComponent(wrapper.dataset.code);
        const lang = wrapper.dataset.lang;
        this.openInCanvas(code, lang);
      };
    });

    // Boutons Copier Message
    document.querySelectorAll('.btn-copy-msg').forEach(btn => {
      btn.onclick = () => {
        const bubble = btn.closest('.message-body').querySelector('.message-bubble');
        navigator.clipboard.writeText(bubble.innerText).then(() => {
          btn.innerHTML = '<span>Copié !</span>';
          setTimeout(() => btn.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg><span>Copier</span>', 1500);
        });
      };
    });

    // Boutons Synthèse Vocale
    document.querySelectorAll('.btn-speak-msg').forEach(btn => {
      btn.onclick = () => {
        const bubble = btn.closest('.message-body').querySelector('.message-bubble');
        this.speakText(bubble.innerText);
      };
    });
  }

  /* ==========================================================================
     Moteur de Réponses IA & Streaming
     ========================================================================== */
  async handleSendMessage() {
    const text = this.dom.promptInput ? this.dom.promptInput.value.trim() : '';
    if ((!text && this.activeAttachments.length === 0) || this.isGenerating) return;

    this.isGenerating = true;
    if (this.dom.btnSend) this.dom.btnSend.disabled = true;

    // Créer ou récupérer le chat
    let chat = this.getCurrentChat();
    if (!chat) {
      this.createNewChat();
      chat = this.getCurrentChat();
    }

    // Nommer la discussion d'après le premier prompt
    if (chat.messages.length === 0) {
      chat.title = text.slice(0, 30) + (text.length > 30 ? '...' : '');
      this.renderConversationsList();
    }

    // Ajouter le message utilisateur
    const userMsg = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: text,
      attachments: [...this.activeAttachments],
      timestamp: new Date().toISOString()
    };
    chat.messages.push(userMsg);

    // Vider la saisie et masquer l'écran d'accueil
    if (this.dom.promptInput) {
      this.dom.promptInput.value = '';
      this.dom.promptInput.style.height = 'auto';
    }
    this.activeAttachments = [];
    this.renderAttachmentChips();
    if (this.dom.welcomeScreen) this.dom.welcomeScreen.classList.add('hidden');

    // Ajouter le message utilisateur au DOM
    this.appendUserMessageElement(userMsg);
    this.scrollToBottom();

    // Message temporaire IA pour le streaming
    const aiMsgId = 'msg_' + (Date.now() + 1);
    const aiMsg = {
      id: aiMsgId,
      role: 'assistant',
      model: this.currentModel,
      content: '',
      timestamp: new Date().toISOString()
    };
    chat.messages.push(aiMsg);

    // Génération et streaming
    await this.generateAIResponse(text, aiMsg, chat);

    this.isGenerating = false;
    if (this.dom.btnSend) this.dom.btnSend.disabled = false;
    this.saveConversations();
  }

  appendUserMessageElement(userMsg) {
    if (!this.dom.chatFeed) return;
    const userAvatarSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
    const row = document.createElement('div');
    row.className = 'message-row user';
    row.dataset.msgId = userMsg.id;
    row.innerHTML = `
      <div class="avatar user-av">${userAvatarSVG}</div>
      <div class="message-body">
        <div class="message-bubble">${this.escapeHtml(userMsg.content)}</div>
      </div>
    `;
    this.dom.chatFeed.appendChild(row);
  }

  appendAIMessageElement(msgId) {
    if (!this.dom.chatFeed) return null;
    const aiAvatarSVG = `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`;
    
    const row = document.createElement('div');
    row.className = 'message-row ai';
    row.dataset.msgId = msgId;
    row.innerHTML = `
      <div class="avatar ai-av">${aiAvatarSVG}</div>
      <div class="message-body">
        <div class="message-bubble"></div>
        <div class="message-actions">
          <button class="msg-btn btn-copy-msg" title="Copier la réponse">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            <span>Copier</span>
          </button>
          <button class="msg-btn btn-speak-msg" title="Écouter à voix haute">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>
            <span>Écouter</span>
          </button>
        </div>
      </div>
    `;
    this.dom.chatFeed.appendChild(row);
    return row.querySelector('.message-bubble');
  }

  async generateAIResponse(prompt, aiMsg, chat) {
    const isCodeRequest = /crée|code|application|jeu|horloge|widget|html|css|javascript|canvas|clone/i.test(prompt);
    const isMathRequest = /calcul|série|fourier|math|dérivée|intégrale|équation|\$|matrice/i.test(prompt);
    const isGreeting = /^(salut|bonjour|bonsoir|coucou|hello|hi|hey)[\s\.,!]*$/i.test(prompt.trim());

    let responseText = '';

    if (isGreeting) {
      responseText = `Bonjour ! Comment puis-je vous aider aujourd'hui ? Que ce soit pour concevoir une application, analyser un document ou répondre à vos questions, je suis à votre disposition.`;
    } else if (isCodeRequest) {
      responseText = `Voici une application web complète et interactive. Vous pouvez cliquer sur **"Canvas"** pour la tester et l'exécuter en direct !

\`\`\`html
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      background: radial-gradient(circle, #1a1a24, #08080c);
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
      color: #fff;
    }
    .widget-card {
      background: rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(30px);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 24px;
      padding: 32px 40px;
      text-align: center;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .time-display {
      font-size: 56px;
      font-weight: 200;
      letter-spacing: 2px;
      background: linear-gradient(180deg, #fff, #a1a1aa);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .date-display {
      font-size: 14px;
      color: #ff9500;
      font-weight: 600;
      text-transform: uppercase;
      margin-top: 8px;
    }
    .status-badge {
      display: inline-block;
      margin-top: 18px;
      padding: 6px 14px;
      background: rgba(48, 209, 88, 0.2);
      border: 1px solid rgba(48, 209, 88, 0.4);
      color: #30d158;
      border-radius: 20px;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="widget-card">
    <div class="time-display" id="clock">00:00:00</div>
    <div class="date-display" id="date">Lundi 1 Janvier</div>
    <div class="status-badge">✦ Leti AI Live Widget Actif</div>
  </div>

  <script>
    function updateTime() {
      const now = new Date();
      document.getElementById('clock').textContent = now.toLocaleTimeString('fr-FR');
      document.getElementById('date').textContent = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
    }
    setInterval(updateTime, 1000);
    updateTime();
  </script>
</body>
</html>
\`\`\`

### Caractéristiques :
- Design verre dépoli avec animations.
- Rafraîchissement dynamique chaque seconde.
- Entièrement autonome et exécutable dans le **Canvas** !`;
    } else if (isMathRequest) {
      responseText = `Voici la résolution détaillée et la démonstration mathématique :

### Décomposition en Série de Fourier
Pour une onde carrée périodique de période $T = 2\\pi$ définie par :
$$f(x) = \\begin{cases} 1 & \\text{si } 0 < x < \\pi \\\\ -1 & \\text{si } -\\pi < x < 0 \\end{cases}$$

La série de Fourier correspondante s'exprime sous la forme :
$$f(x) = \\frac{4}{\\pi} \\sum_{k=1}^{\\infty} \\frac{\\sin((2k-1)x)}{2k-1} = \\frac{4}{\\pi} \\left( \\sin(x) + \\frac{\\sin(3x)}{3} + \\frac{\\sin(5x)}{5} + \\dots \\right)$$

**Propriété remarquable** : Aux points de discontinuité, la série converge vers la moyenne des limites à gauche et à droite ($0$), avec le phénomène de Gibbs produisant un dépassement d'environ $8.95\\%$.`;
    } else {
      responseText = `Bonjour ! Je suis **Leti AI**.

Concernant votre demande :
> *${prompt}*

Je suis prêt à vous apporter une réponse détaillée ou à développer une solution sur mesure. Souhaitez-vous explorer un aspect particulier ou créer un projet interactif dans le volet Canvas ?`;
    }

    // Créer et ajouter le message IA au DOM
    const aiBubble = this.appendAIMessageElement(aiMsg.id);

    // Streaming fluide direct sans re-render complet
    let currentLength = 0;
    const chunkSize = 8;

    while (currentLength < responseText.length) {
      currentLength += chunkSize;
      aiMsg.content = responseText.slice(0, currentLength);
      if (aiBubble) {
        aiBubble.innerHTML = this.parseMarkdown(aiMsg.content);
      }
      this.scrollToBottom();
      await new Promise(r => setTimeout(r, 12));
    }

    // Traitement final (coloration, math, actions) une seule fois à la fin
    this.highlightCodeBlocks();
    this.renderMathFormulas();
    this.attachMessageActions();
    this.saveConversations();
  }

  /* ==========================================================================
     Canvas / Artifacts (Split View Runner)
     ========================================================================== */
  openInCanvas(code, lang) {
    if (!this.dom.canvasPane) return;
    this.dom.canvasPane.classList.remove('hidden');
    if (this.dom.canvasCodeBlock) {
      this.dom.canvasCodeBlock.textContent = code;
      this.dom.canvasCodeBlock.className = `language-${lang}`;
      if (typeof hljs !== 'undefined') hljs.highlightElement(this.dom.canvasCodeBlock);
    }

    // Injection dans l'iframe
    if (this.dom.canvasIframe) {
      const blob = new Blob([code], { type: 'text/html' });
      this.dom.canvasIframe.src = URL.createObjectURL(blob);
    }
    this.switchCanvasTab('preview');
  }

  switchCanvasTab(tab) {
    if (!this.dom.tabCanvasPreview || !this.dom.tabCanvasCode) return;
    if (tab === 'preview') {
      this.dom.tabCanvasPreview.classList.add('active');
      this.dom.tabCanvasCode.classList.remove('active');
      if (this.dom.canvasIframe) this.dom.canvasIframe.classList.remove('hidden');
      if (this.dom.canvasCodeView) this.dom.canvasCodeView.classList.add('hidden');
    } else {
      this.dom.tabCanvasCode.classList.add('active');
      this.dom.tabCanvasPreview.classList.remove('active');
      if (this.dom.canvasCodeView) this.dom.canvasCodeView.classList.remove('hidden');
      if (this.dom.canvasIframe) this.dom.canvasIframe.classList.add('hidden');
    }
  }

  /* ==========================================================================
     Synthèse et Reconnaissance Vocale
     ========================================================================== */
  initSpeechRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = false;
      this.recognition.lang = 'fr-FR';
      this.recognition.interimResults = false;

      this.recognition.onresult = e => {
        const transcript = e.results[0][0].transcript;
        if (this.dom.promptInput) {
          this.dom.promptInput.value += (this.dom.promptInput.value ? ' ' : '') + transcript;
        }
        if (this.dom.btnSend) this.dom.btnSend.disabled = false;
        this.toggleVoiceInput(false);
      };

      this.recognition.onerror = () => this.toggleVoiceInput(false);
      this.recognition.onend = () => this.toggleVoiceInput(false);
    }
  }

  toggleVoiceInput(forceState) {
    if (!this.recognition) {
      alert('La dictée vocale n\'est pas prise en charge sur ce navigateur.');
      return;
    }
    const newState = forceState !== undefined ? forceState : !this.isRecording;
    this.isRecording = newState;
    if (this.dom.btnVoiceInput) this.dom.btnVoiceInput.classList.toggle('recording', this.isRecording);

    if (this.isRecording) {
      try { this.recognition.start(); } catch (e) {}
    } else {
      try { this.recognition.stop(); } catch (e) {}
    }
  }

  speakText(text) {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Bloc de code omis.');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'fr-FR';
    utterance.rate = 1.05;
    window.speechSynthesis.speak(utterance);
  }

  /* ==========================================================================
     Pièces Jointes & Fichiers
     ========================================================================== */
  handleFileUpload(files) {
    Array.from(files).forEach(file => {
      const chip = { name: file.name, size: file.size, type: file.type };
      this.activeAttachments.push(chip);
    });
    this.renderAttachmentChips();
  }

  renderAttachmentChips() {
    if (!this.dom.attachmentPreview) return;
    if (this.activeAttachments.length === 0) {
      this.dom.attachmentPreview.classList.add('hidden');
      this.dom.attachmentPreview.innerHTML = '';
      return;
    }

    this.dom.attachmentPreview.classList.remove('hidden');
    this.dom.attachmentPreview.innerHTML = this.activeAttachments.map((att, idx) => `
      <div class="attachment-chip">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        <span>${att.name}</span>
        <span class="attachment-chip-remove" data-idx="${idx}">&times;</span>
      </div>
    `).join('');

    this.dom.attachmentPreview.querySelectorAll('.attachment-chip-remove').forEach(el => {
      el.onclick = () => {
        this.activeAttachments.splice(parseInt(el.dataset.idx), 1);
        this.renderAttachmentChips();
      };
    });
  }

  /* ==========================================================================
     Événements & Raccourcis
     ========================================================================== */
  bindEvents() {
    // Envoi de prompt
    if (this.dom.btnSend) this.dom.btnSend.onclick = () => this.handleSendMessage();
    
    if (this.dom.promptInput) {
      this.dom.promptInput.onkeydown = e => {
        if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          this.handleSendMessage();
        }
      };

      this.dom.promptInput.oninput = () => {
        this.dom.promptInput.style.height = 'auto';
        this.dom.promptInput.style.height = Math.min(this.dom.promptInput.scrollHeight, 160) + 'px';
        if (this.dom.btnSend) {
          this.dom.btnSend.disabled = !this.dom.promptInput.value.trim() && this.activeAttachments.length === 0;
        }
      };
    }

    // Bascule de Thème (Clair / Sombre)
    if (this.dom.btnThemeToggle) {
      this.dom.btnThemeToggle.onclick = () => this.toggleTheme();
    }

    // Sidebar
    if (this.dom.btnToggleSidebar) this.dom.btnToggleSidebar.onclick = () => this.toggleSidebar();
    if (this.dom.btnMobileSidebar) this.dom.btnMobileSidebar.onclick = () => this.toggleSidebar(true);
    if (this.dom.sidebarOverlay) this.dom.sidebarOverlay.onclick = () => this.toggleSidebar(false);
    if (this.dom.btnNewChat) this.dom.btnNewChat.onclick = () => this.createNewChat();
    if (this.dom.searchChatsInput) this.dom.searchChatsInput.oninput = () => this.renderConversationsList();

    // Menu des Modèles (si présent)
    if (this.dom.btnModelSelector && this.dom.modelMenu) {
      this.dom.btnModelSelector.onclick = e => {
        e.stopPropagation();
        this.dom.modelMenu.classList.toggle('hidden');
      };
      document.addEventListener('click', () => this.dom.modelMenu.classList.add('hidden'));

      document.querySelectorAll('.model-item').forEach(item => {
        item.onclick = () => {
          this.selectModel(item.dataset.model, item.dataset.name, item.dataset.icon, item.dataset.tag);
        };
      });
    }

    // Bouton Raisonnement (si présent)
    if (this.dom.btnToggleThinking) {
      this.dom.btnToggleThinking.onclick = () => {
        this.isThinkingEnabled = !this.isThinkingEnabled;
        this.dom.btnToggleThinking.classList.toggle('active', this.isThinkingEnabled);
      };
    }

    // Canvas actions
    if (this.dom.btnToggleCanvas) this.dom.btnToggleCanvas.onclick = () => this.dom.canvasPane.classList.toggle('hidden');
    if (this.dom.btnCloseCanvas) this.dom.btnCloseCanvas.onclick = () => this.dom.canvasPane.classList.add('hidden');
    if (this.dom.tabCanvasPreview) this.dom.tabCanvasPreview.onclick = () => this.switchCanvasTab('preview');
    if (this.dom.tabCanvasCode) this.dom.tabCanvasCode.onclick = () => this.switchCanvasTab('code');
    if (this.dom.btnRefreshCanvas) {
      this.dom.btnRefreshCanvas.onclick = () => {
        const code = this.dom.canvasCodeBlock ? this.dom.canvasCodeBlock.textContent : '';
        if (this.dom.canvasIframe) {
          this.dom.canvasIframe.src = URL.createObjectURL(new Blob([code], { type: 'text/html' }));
        }
      };
    }
    if (this.dom.btnCopyCanvas) {
      this.dom.btnCopyCanvas.onclick = () => {
        const code = this.dom.canvasCodeBlock ? this.dom.canvasCodeBlock.textContent : '';
        navigator.clipboard.writeText(code).then(() => alert('Code Canvas copié !'));
      };
    }

    // Fichiers et Dictée
    if (this.dom.btnAttachFile && this.dom.fileUploadInput) {
      this.dom.btnAttachFile.onclick = () => this.dom.fileUploadInput.click();
      this.dom.fileUploadInput.onchange = e => this.handleFileUpload(e.target.files);
    }
    if (this.dom.btnVoiceInput) this.dom.btnVoiceInput.onclick = () => this.toggleVoiceInput();

    // Paramètres
    if (this.dom.btnOpenSettings) this.dom.btnOpenSettings.onclick = () => this.openSettingsModal();
    if (this.dom.btnCloseSettings) this.dom.btnCloseSettings.onclick = () => this.closeSettingsModal();
    if (this.dom.btnCancelSettings) this.dom.btnCancelSettings.onclick = () => this.closeSettingsModal();
    if (this.dom.btnSaveSettings) this.dom.btnSaveSettings.onclick = () => this.saveSettings();
    if (this.dom.engineSelect && this.dom.customApiFields) {
      this.dom.engineSelect.onchange = () => {
        this.dom.customApiFields.classList.toggle('hidden', this.dom.engineSelect.value !== 'custom-api');
      };
    }

    const btnClearAll = document.getElementById('btnClearAllData');
    if (btnClearAll) {
      btnClearAll.onclick = () => {
        if (confirm('Voulez-vous vraiment effacer tout l\'historique des discussions ?')) {
          this.conversations = [];
          localStorage.removeItem('ai_conversations');
          this.createNewChat();
          this.closeSettingsModal();
        }
      };
    }

    // Exportation discussion
    if (this.dom.btnExportChat) this.dom.btnExportChat.onclick = () => this.exportCurrentChat();

    // Raccourcis globaux
    window.addEventListener('keydown', e => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.createNewChat();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleSidebar();
      }
    });
  }

  toggleSidebar(force) {
    if (!this.dom.sidebar) return;
    if (window.innerWidth <= 768) {
      const isOpen = force !== undefined ? force : !this.dom.sidebar.classList.contains('open');
      this.dom.sidebar.classList.toggle('open', isOpen);
      if (this.dom.sidebarOverlay) this.dom.sidebarOverlay.classList.toggle('active', isOpen);
    } else {
      this.dom.sidebar.classList.toggle('collapsed');
    }
  }

  selectModel(modelKey, name, icon, tag) {
    this.currentModel = modelKey;
    if (this.dom.currentModelName) this.dom.currentModelName.textContent = name;
    if (this.dom.currentModelIcon) this.dom.currentModelIcon.textContent = icon;
    document.querySelectorAll('.model-item').forEach(el => {
      el.classList.toggle('active', el.dataset.model === modelKey);
    });
  }

  getModelName(key) {
    const names = {
      'claude-3-7-sonnet': 'Claude 3.7 Sonnet',
      'gemini-2-5-pro': 'Gemini 2.5 Pro',
      'gpt-4o': 'ChatGPT-4o',
      'deepseek-r1': 'DeepSeek R1',
      'apple-intelligence': 'Leti AI'
    };
    return names[key] || 'Leti AI';
  }

  getModelIcon(key) {
    return '✦';
  }

  exportCurrentChat() {
    const chat = this.getCurrentChat();
    if (!chat || chat.messages.length === 0) return;
    const textContent = chat.messages.map(m => `### ${m.role === 'user' ? 'Utilisateur' : 'Leti AI'}\n\n${m.content}\n`).join('\n---\n\n');
    const blob = new Blob([textContent], { type: 'text/markdown' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${chat.title.replace(/\s+/g, '_')}.md`;
    a.click();
  }

  openSettingsModal() {
    if (!this.dom.settingsModal) return;
    this.dom.settingsModal.classList.remove('hidden');
    if (this.dom.engineSelect) this.dom.engineSelect.value = this.settings.engine;
    if (this.dom.customApiFields) this.dom.customApiFields.classList.toggle('hidden', this.settings.engine !== 'custom-api');
    if (this.dom.openaiKey) this.dom.openaiKey.value = this.settings.openaiKey || '';
    if (this.dom.anthropicKey) this.dom.anthropicKey.value = this.settings.anthropicKey || '';
    if (this.dom.geminiKey) this.dom.geminiKey.value = this.settings.geminiKey || '';
    if (this.dom.systemPromptInput) this.dom.systemPromptInput.value = this.settings.systemPrompt || '';
    if (this.dom.checkSoundEnabled) this.dom.checkSoundEnabled.checked = this.soundEnabled;
  }

  closeSettingsModal() {
    if (this.dom.settingsModal) this.dom.settingsModal.classList.add('hidden');
  }

  saveSettings() {
    this.soundEnabled = this.dom.checkSoundEnabled ? this.dom.checkSoundEnabled.checked : true;
    this.settings = {
      engine: this.dom.engineSelect ? this.dom.engineSelect.value : 'neural-builtin',
      openaiKey: this.dom.openaiKey ? this.dom.openaiKey.value.trim() : '',
      anthropicKey: this.dom.anthropicKey ? this.dom.anthropicKey.value.trim() : '',
      geminiKey: this.dom.geminiKey ? this.dom.geminiKey.value.trim() : '',
      systemPrompt: this.dom.systemPromptInput ? this.dom.systemPromptInput.value.trim() : '',
      soundEnabled: this.soundEnabled
    };
    localStorage.setItem('ai_settings', JSON.stringify(this.settings));
    this.closeSettingsModal();
  }

  scrollToBottom() {
    if (this.dom.messagesContainer) {
      this.dom.messagesContainer.scrollTop = this.dom.messagesContainer.scrollHeight;
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
}

// Initialisation au chargement
document.addEventListener('DOMContentLoaded', () => {
  window.aiChatApp = new AIChatApp();
});
