---
name: browser-visual-qa
description: Run browser smoke and visual QA for desktop/mobile viewports, console errors, overflow, focus, and reduced motion. Use when verifying UI, screenshots, responsive layout, or animation behavior in the browser.
---

# Browser visual QA

## When to use

After UI or animation changes, or when validating the local dev server.

## Inspect first

- Dev server URL (default `http://localhost:5173`)
- Available browser MCP (`cursor-ide-browser` / Playwright)
- Target pages and breakpoints

## Approach

1. Open the app; check console for errors.
2. Test desktop and mobile widths; look for horizontal overflow.
3. Check focus visibility and keyboard path for primary controls.
4. Toggle reduced motion; capture screenshots when useful.
5. Report concrete visual inconsistencies.

## Avoid

- Claiming visual QA without opening the browser
- Changing design during a QA-only pass unless asked

## Verify

- Checklist covered; screenshots or notes attached; failures listed with viewport
