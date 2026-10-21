---
name: accessibility-review
description: Review semantic HTML, keyboard access, focus, contrast, labels, reduced motion, and WebGL fallbacks. Use when auditing a11y, fixing accessibility issues, or preparing portfolio sections for assistive tech.
---

# Accessibility review

## When to use

Before shipping UI changes or when the user requests an a11y audit.

## Inspect first

- Heading order and landmark structure
- Interactive elements (buttons vs divs)
- Focus styles and keyboard traps
- 3D canvases and fallback content

## Approach

1. Prefer semantic elements and labeled controls.
2. Ensure visible focus and logical tab order.
3. Check contrast for text and UI chrome.
4. Honor reduced motion; provide non-WebGL alternatives for essential info.

## Avoid

- Icon-only controls without accessible names
- Content that only exists inside WebGL
- Removing focus outlines without a visible replacement

## Verify

- Keyboard-only pass; screen-reader spot check if available; reduced-motion path confirmed
