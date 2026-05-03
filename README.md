# 🚀 Prem Raj — 3D Animated Portfolio

A premium, recruiter-stopping portfolio built with React, React Three Fiber, GSAP, Framer Motion, and Three.js.

## 🛠️ Tech Stack
- **React 18** + **Vite**
- **React Three Fiber** (@react-three/fiber + @react-three/drei) — 3D scenes
- **Three.js** — 3D engine under the hood
- **GSAP** + **ScrollTrigger** — cinematic scroll animations
- **Framer Motion** — UI transitions & spring physics
- **Tailwind CSS** — utility styling
- **Syne** (Google Fonts) — typography

## ⚡ Features
- 🎬 Cinematic loading screen with GSAP bar animation
- 🌐 3D floating photo collage in hero (your real photos as polaroids!)
- 🌍 3D profile photo sphere with rotating rings (About section)
- 🔮 3D floating skill orbs (Skills section background)
- 🃏 Sticky stacking project cards with 3D tilt on hover
- ✨ Custom magnetic cursor + green particle trail
- 📊 GSAP ScrollTrigger scroll-driven animations
- 🎉 Easter egg: type "hire" anywhere → confetti!
- 📱 Fully responsive (mobile-first)
- 🌿 Grain film overlay, dot-grid backgrounds

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open http://localhost:5173
```

## 📁 Project Structure
```
prem-portfolio/
├── public/
│   └── photos/          ← Your real photos (already included!)
│       ├── hero.jpg      ← Main hero + profile sphere
│       ├── photo2-9.jpg  ← Hero collage + project images
│       └── landscape.jpg
├── src/
│   ├── App.jsx           ← Main app (all sections)
│   ├── index.css         ← Global styles + animations
│   ├── main.jsx          ← React root
│   └── three/
│       ├── HeroScene.jsx    ← 3D hero with floating photo cards
│       ├── ProfileScene.jsx ← 3D spinning photo sphere
│       └── SkillsScene.jsx  ← 3D floating skill orbs
├── package.json
├── tailwind.config.js
├── vite.config.js
└── index.html
```

## ✏️ How to Customize

### Replace Photos
Photos are already in `/public/photos/`. Replace any file keeping the same filename.

### Update Projects / Skills
Edit the `PROJECTS`, `SKILLS` arrays at the top of `src/App.jsx`.

### Fill in Certifications
Update the `CERTS` array in `src/App.jsx` with your actual cert names and platforms.

### Fill in Hackathons
Update the `HACKS` array in `src/App.jsx` with your actual hackathon details.

### Update Links
Search for `github.com/premrajsingh` and `linkedin.com/in/prem-raj` in `App.jsx` and replace with your actual URLs.

## 🎯 Easter Egg
Type **"hire"** anywhere on the page → confetti explosion! 🎉

## 📦 Build for Production
```bash
npm run build
# Output in /dist — deploy to Vercel/Netlify
```

---
Built with ❤️ by Prem Raj · © 2026
