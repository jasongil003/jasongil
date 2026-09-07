# ⚡ Jason Gil — Interactive Developer Portfolio

A state-of-the-art, fully responsive, ultra-interactive developer portfolio website tailored for **Jason Gil** (Technical Lead | Linux, Network, Cloud, Automation & Applied AI), featuring brutalist minimalism, halftone dot textures, and rich micro-interactions.

![Portfolio Preview Banner](https://img.shields.io/badge/Status-Production%20Ready-brightgreen?style=for-the-badge)
![Built with](https://img.shields.io/badge/Built%20with-Vanilla%20HTML5%20%7C%20CSS3%20%7C%20Web%20Audio-black?style=for-the-badge)
![GitHub](https://img.shields.io/badge/GitHub-jasongil003-181717?style=for-the-badge&logo=github)

---

## 👨‍💻 Profile Summary

- **Name**: Jason Gil
- **Role**: Technical Lead | SaaS/MSP | Linux, Network, Cloud, Automation & Applied AI
- **Location**: Makati City, Philippines
- **GitHub**: [github.com/jasongil003](https://github.com/jasongil003)

Technical Lead with 8+ years across Linux infrastructure, enterprise networking, SaaS/MSP operations, and applied AI systems. Proven progression from System Engineer to Subject Matter Expert (SME) and Technical Lead at ANTlabs, managing global escalations across APAC, EMEA, and North America.

---

## 🌟 Key Features

1. **Monochromatic Brutalist Aesthetics**:
   - Refined dark and light mode color palette with coordinated color crossfade and circular reveal View Transitions.
   - Halftone matrix radial dot shaders and mask gradients.
   - Geist, Geist Mono, and Geist Pixel typography.

2. **Web Audio FX Synthesizer (`js/audio.js`)**:
   - Zero external audio files or dependencies.
   - Procedural Web Audio API sound engine generating mechanical clicks, toggles, success melodies, ticks, steps, and collision tones.
   - Global sound mute toggle with persisted preferences.

3. **Spotlight 3D Card Deck (`js/main.js`)**:
   - Interactive project carousel featuring ANTlabs Local AI Knowledge Base, Document Processing OCR Automation, and Operations Telemetry App.

4. **Ask AI Terminal / Command Palette (`⌘K` / `Ctrl+K`)**:
   - Interactive intelligent command modal with quick prompt chips and typewriter effect tailored to Jason's career and skills.

5. **Speed Typing Test (`⌘J` / `Ctrl+J`)**:
   - Monkeytype-style real-time typing test with live WPM, accuracy %, animated keyboard heatmap feedback, and technical word challenge.

6. **Retro 2D Canvas Workspace Game (`js/game.js`)**:
   - Top-down pixel developer studio simulation with WASD / Arrow keyboard controls, furniture collision, and roaming colleagues.

7. **Community Guestbook & Presence Heartbeat (`js/chat.js`)**:
   - Interactive message guestbook with DiceBear notionist avatars, device detection, and persistent storage.

8. **Halftone GitHub Activity Heatmap**:
   - Dynamic interactive contribution matrix connected to `@jasongil003`.

---

## 🚀 1-Click Deployment to GitHub Pages

You can easily host this portfolio on **GitHub Pages** under your chosen GitHub repository:

```bash
cd /path/to/portfolio
git init
git add .
git commit -m "feat: release interactive developer portfolio based on resume"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```
Then enable GitHub Pages under **Settings** > **Pages** (select `main` branch, `/ root` folder). Your site will be live immediately!

---

## 📁 Project Structure

```
portfolio/
├── index.html              # Main semantic HTML5 portfolio document
├── .nojekyll               # Disables Jekyll processing on GitHub Pages
├── README.md               # Documentation & deployment guide
├── css/
│   └── style.css           # Design tokens, halftone masks, 3D deck, and modal styles
└── js/
    ├── audio.js            # Procedural Web Audio API sound synthesizer
    ├── ask.js              # Command palette & Ask AI assistant (⌘K)
    ├── typing.js           # Interactive speed typing test (⌘J)
    ├── game.js             # Retro 2D Canvas dev simulator
    ├── chat.js             # Guestbook & visitor presence
    └── main.js             # Theme switcher, 3D deck, GitHub heatmap, modals
```

© 2026 Jason Gil. Makati City, Philippines.

