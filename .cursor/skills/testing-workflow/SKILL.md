---
name: testing-workflow
description: Run and extend unit, component, browser, visual, accessibility, and production-build verification for this repo. Use when verifying changes or adding tests; never claim checks passed unless executed.
---

# Testing workflow

## When to use

After meaningful changes, before claiming completion, or when adding tests.

## Inspect first

- `npm run` scripts
- Vitest / Playwright configs
- Existing smoke tests

## Approach

1. Unit: `npm run test` (Vitest).
2. E2E: `npm run test:e2e` (Playwright).
3. Quality: `lint`, `format:check`, `build`.
4. Browser QA via Playwright MCP / cursor-ide-browser when UI changes.
5. Document pre-existing failures separately from setup regressions.

## Avoid

- Claiming pass without running commands
- Replacing existing test runners

## Verify

- Commands actually executed; results reported honestly
