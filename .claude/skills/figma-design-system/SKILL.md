---
name: figma-design-system
description: Extract and map Figma variables (color, type, spacing, radius, shadow, breakpoints) to code tokens. Use when syncing design tokens, auditing inconsistencies, or setting up a design-token workflow.
---

# Figma design system

## When to use

Reading Figma variables/tokens and mapping them into Tailwind theme or CSS variables.

## Inspect first

- Whether Figma MCP is configured
- Existing `tailwind.config.js` and CSS custom properties
- Which Figma collections are source of truth

## Approach

1. Read typography, color, spacing, radii, shadows, breakpoints.
2. Map Figma variables to code tokens with clear naming.
3. Flag inconsistencies and ask for clarification.
4. Keep token files free of secrets.

## Avoid

- Hardcoding one-off values that contradict tokens
- Inventing a design system not present in Figma
- Committing access tokens

## Verify

- Token map documented; sample components use tokens; gaps listed for the user
