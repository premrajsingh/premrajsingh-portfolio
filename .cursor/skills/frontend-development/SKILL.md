---
name: frontend-development
description: Implement maintainable React Vite frontend architecture, components, loading/error states, and framework conventions. Use when building or refactoring UI components, pages structure, or app architecture in this portfolio.
---

# Frontend development

## When to use

Component architecture, React/Vite conventions, loading/error states, maintainable structure.

## Inspect first

- `src/` layout and existing `App.jsx` patterns
- Tailwind usage and design tokens
- Existing lazy-loaded 3D modules

## Approach

1. Prefer small components over growing `App.jsx`.
2. Follow React 18 + Vite conventions; keep JS/JSX unless TypeScript is approved.
3. Handle loading, empty, and error states explicitly.
4. Reuse existing animation/3D libraries; do not add duplicates.

## Avoid

- Redesigning without request
- Inventing content
- Unnecessary dependencies

## Verify

- Lint, format, build; UI behavior unchanged unless requested
