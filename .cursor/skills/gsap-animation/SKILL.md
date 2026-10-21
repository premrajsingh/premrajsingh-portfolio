---
name: gsap-animation
description: Implement GSAP timelines, ScrollTrigger, cleanup, and reduced-motion handling in this React Vite portfolio. Use when adding or refactoring GSAP, ScrollTrigger, useGSAP, or scroll-driven sequences.
---

# GSAP animation

## When to use

Complex timelines, ScrollTrigger, text/mask reveals, advanced sequences, or cleaning up existing GSAP.

## Inspect first

- Whether `gsap` and `@gsap/react` are installed
- Existing ScrollTrigger usage in `src/`
- `prefers-reduced-motion` handling

## Approach

1. Prefer `useGSAP` for React components.
2. Register only needed plugins (e.g. `ScrollTrigger`).
3. Scope selectors with a container ref / context.
4. Animate transform and opacity; kill triggers on cleanup.
5. Gate or simplify when reduced motion is requested.

## Avoid

- Global unmanaged timelines
- Animating layout properties that cause thrashing
- Paid Club GreenSock plugins without a confirmed license
- Demo animations during environment-only tasks

## Verify

- No console errors; ScrollTrigger instances disposed on unmount
- Reduced-motion path works; animations do not block content
