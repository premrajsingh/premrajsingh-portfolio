---
paths:
  - "src/**/*.{js,jsx}"
---

# Motion (Framer Motion)

- This project uses **`framer-motion`**. Do not install `motion` alongside it.
- Use Framer Motion for component transitions, presence, layout, and UI state animation.
- Prefer reusable variants and consistent transition tokens.
- Support `prefers-reduced-motion`.
- Do not duplicate GSAP scroll/timeline work with Framer Motion unless there is a clear split of responsibility.
- Never block access to content with animations.
