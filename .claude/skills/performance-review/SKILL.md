---
name: performance-review
description: Review bundle size, lazy loading, images, 3D cost, animation cost, CLS, and mobile performance for this Vite portfolio. Use when investigating slow loads, optimizing bundles, or preparing a performance pass.
---

# Performance review

## When to use

After adding heavy dependencies, 3D, or large media; or when the user asks for a performance review.

## Inspect first

- `npm run build` output sizes
- Lazy boundaries around `src/three/`
- Image sizes in `public/`
- Animation and re-render hotspots

## Approach

1. Measure before changing (build + runtime feel).
2. Code-split heavy modules; compress images.
3. Reduce draw calls / geometry complexity on mobile.
4. Prefer transform/opacity animations; avoid layout thrash.
5. Use Lighthouse or browser performance tools when available (optional).

## Avoid

- Premature micro-optimizations without measurement
- Adding large libraries for small effects

## Verify

- Build size noted; critical path improved or justified; mobile still usable
