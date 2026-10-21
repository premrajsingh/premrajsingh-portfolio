---
name: responsive-design
description: Implement mobile-first responsive layouts, breakpoints, touch targets, and overflow prevention for this Tailwind portfolio. Use when adjusting layouts across mobile, tablet, and desktop viewports.
---

# Responsive design

## When to use

Breakpoints, mobile-first layouts, touch interactions, overflow fixes.

## Inspect first

- `tailwind.config.js` breakpoints
- Existing responsive classes in `src/`
- Target viewports (mobile ~375, tablet ~768, desktop ~1280)

## Approach

1. Mobile-first Tailwind utilities.
2. Touch-friendly hit areas; avoid hover-only critical actions.
3. Prevent horizontal overflow; test sticky/fixed elements.
4. Simplify heavy 3D/animation on small screens.

## Avoid

- Desktop-only layouts
- Tiny tap targets
- Horizontal scroll from padding/widths

## Verify

- Resize checks at key breakpoints; no overflow; readable type
