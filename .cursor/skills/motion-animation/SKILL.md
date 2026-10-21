---
name: motion-animation
description: Implement Framer Motion component transitions, presence, layout, and UI state animation. Use when working with framer-motion, variants, AnimatePresence, or UI micro-interactions in this portfolio.
---

# Motion animation (Framer Motion)

## When to use

Component transitions, AnimatePresence, layout animations, UI state motion.

## Inspect first

- Confirm `framer-motion` is the installed package (do not add `motion`)
- Existing variants and transition patterns in `src/`

## Approach

1. Use reusable variants and consistent durations/easings.
2. Prefer `AnimatePresence` for mount/unmount transitions.
3. Support reduced motion via reduced transition or static render.
4. Leave scroll-driven cinema to GSAP when already established.

## Avoid

- Installing both `motion` and `framer-motion`
- Duplicating GSAP ScrollTrigger with Framer scroll hooks without reason
- Blocking interaction or reading content during animation

## Verify

- Transitions feel consistent; no layout jump; reduced-motion respected
