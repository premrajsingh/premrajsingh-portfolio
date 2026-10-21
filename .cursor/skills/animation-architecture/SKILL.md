---
name: animation-architecture
description: Decide between CSS, GSAP, and Framer Motion; prevent overlap and performance issues. Use when planning animation systems, motion tokens, or choosing which library should own an effect.
---

# Animation architecture

## When to use

Choosing or restructuring how animations are owned across CSS, GSAP, and Framer Motion.

## Inspect first

- Current usage of CSS transitions, GSAP, and `framer-motion`
- Performance-sensitive areas (hero, 3D, scroll sections)

## Approach

1. CSS for simple hover/focus and small state changes.
2. Framer Motion for component enter/exit, layout, and UI state.
3. GSAP for timelines and ScrollTrigger-driven sequences.
4. Define shared motion tokens (duration, easing, distance).
5. Document ownership so the same effect is not built twice.

## Avoid

- Using all three for the same interaction
- Global animation registries that are hard to clean up
- Animating everything by default

## Verify

- Clear ownership per interaction type; reduced-motion path; no duplicate libraries
