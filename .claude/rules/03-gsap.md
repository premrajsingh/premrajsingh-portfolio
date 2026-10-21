---
paths:
  - "src/**/*.{js,jsx}"
---

# GSAP

- Use GSAP when timeline-based or scroll-driven animation is genuinely useful.
- Prefer `@gsap/react` `useGSAP` for React integration and automatic cleanup.
- Use `gsap.context()` (or `useGSAP`) and dispose timelines, listeners, and `ScrollTrigger` instances.
- Prefer animating `transform` and `opacity`; avoid layout-thrashing properties.
- Avoid layout shifts; do not animate every element.
- Respect `prefers-reduced-motion` (skip or simplify animations).
- Do not create unnecessary global timelines.
- Public GSAP + ScrollTrigger only unless the user confirms a paid Club GreenSock license.
