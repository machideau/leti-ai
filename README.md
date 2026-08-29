# Leti AI — Interface de Chatbot Intelligent & Canvas Live

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg?style=for-the-badge)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

<p align="center">
  Une interface web de chatbot IA haut de gamme, moderne et responsive inspirée du design macOS / iOS et des fonctionnalités de ChatGPT, Claude et Gemini.
</p>

</div>

---

## Fonctionnalités Principales

### Design Apple & Glassmorphism Épuré
- **Design System macOS / iOS** : Dégradés subtils, flous d'arrière-plan en temps réel (`backdrop-filter: blur`), bordures translucides et halos lumineux ambiants.
- **Thèmes Clair & Sombre** : Bascule instantanée entre le mode sombre profond et le mode clair épuré avec mémorisation des préférences.
- **Responsive Design** : Interface adaptée aux smartphones, tablettes et écrans de bureau avec panneau latéral rétractable.

### Canvas / Artifacts Live Runner (Split-View)
- **Exécution de code en direct** : Visualisation et interaction immédiates avec les applications HTML, CSS et JavaScript générées par l'IA dans un environnement isolé (`iframe sandbox`).
- **Mode Double Vue** : Basculement fluide entre l'aperçu dynamique et le code source complet avec coloration syntaxique.

### Gestion des Discussions
- **Multi-conversations** : Création, renommage automatique d'après la première requête, recherche instantanée et suppression.
- **Persistance locale** : Toutes les discussions et préférences utilisateur sont enregistrées de manière sécurisée dans `localStorage`.
- **Exportation** : Export des échanges au format Markdown (`.md`).

### Rendu Markdown, Mathématiques (LaTeX) & Code
- **Formules mathématiques KaTeX** : Rendu des équations en ligne `$f(x)$` et des blocs mathématiques complexes `$$...$$`.
- **Coloration syntaxique Highlight.js** : Prise en charge multi-langages avec fonction de copie rapide.
- **Streaming fluide** : Rendu progressif et continu sans clignotement de l'écran.

### Interaction Vocale (Web Speech API)
- **Reconnaissance vocale (STT)** : Dictée vocale des messages via le microphone.
- **Synthèse vocale (TTS)** : Lecture audio des réponses de l'IA.

### Moteur IA Modulaire & Clés API Personnalisées
- **Moteur neuronal intégré** : Mode démonstration et réponses contextuelles prêtes à l'emploi.
- **Intégration d'API tierces** : Configuration possible de clés d'API (OpenAI, Anthropic Claude, Google Gemini) dans les paramètres.
- **Prompt Système Personnalisable** : Définition des instructions, du rôle et du style de réponse de l'assistant.

---

## Structure du Projet

```text
atmodel/
├── index.html        # Structure HTML5 (Sidebar, Chat, Canvas, Modale Paramètres)
├── style.css         # Styles, variables CSS, thèmes clair/sombre et responsive
├── app.js            # Moteur applicatif (Gestion d'état, streaming, Markdown, Canvas runner, Web Speech)
└── README.md         # Documentation du projet
```

---

## Démarrage Rapide

### Prérequis
Un navigateur web moderne (Google Chrome, Apple Safari, Microsoft Edge, Mozilla Firefox).

### Lancement Local

1. **Cloner ou ouvrir le dossier du projet** :
   ```bash
   git clone https://github.com/votre-utilisateur/leti-ai.git
   cd atmodel
   ```

2. **Démarrer un serveur local** (recommandé pour l'exécution fluide des scripts et de l'iframe Canvas) :
   - **Avec Python 3** :
     ```bash
     python3 -m http.server 3000
     ```
   - **Avec Node.js** :
     ```bash
     npx serve .
     ```
   - **Avec l'extension VS Code Live Server** : Activer *Go Live*.

3. **Accéder à l'application** :
   Ouvrez votre navigateur à l'adresse [http://localhost:3000](http://localhost:3000).

---

## Technologies Utilisées

| Composant | Rôle |
| :--- | :--- |
| **HTML5** | Structure sémantique de l'interface, panneaux et conteneur sandbox. |
| **CSS3** | Système de design verre, variables CSS, mise en page Flexbox/Grid et animations. |
| **JavaScript (ES6+)** | Logique applicative, moteur de streaming et gestion des événements. |
| **KaTeX** | Moteur de rendu mathématique LaTeX. |
| **Highlight.js** | Coloration syntaxique des blocs de code. |
| **Web Speech API** | Interfaces de reconnaissance et de synthèse vocales. |

---

## Raccourcis Clavier

- <kbd>Entrée</kbd> : Envoyer le message.
- <kbd>Maj</kbd> + <kbd>Entrée</kbd> : Insérer un saut de ligne.

---

## Licence

Projet distribué sous licence MIT.
