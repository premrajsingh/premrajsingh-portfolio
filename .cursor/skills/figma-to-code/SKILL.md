---
name: figma-to-code
description: Translate approved Figma frames into semantic React and Tailwind code for this portfolio. Use when implementing designs from Figma, matching layout/spacing/typography, or asking for design clarification.
---

# Figma to code

## When to use

Implementing UI from an approved Figma file after the user provides access and frames.

## Inspect first

- Figma MCP availability and file access
- Target frames/pages named by the user
- Existing tokens and Tailwind theme in this repo

## Approach

1. Inspect structure, auto-layout, spacing, and typography before coding.
2. Map to semantic HTML and existing component patterns.
3. Prefer CSS/Tailwind over exported images for UI chrome.
4. Confirm ambiguous decisions with the user.

## Avoid

- Blindly pasting generated code
- Inventing missing specs
- Storing Figma tokens in the repo
- Building portfolio sections without an explicit request

## Verify

- Spacing/type/color match within agreed tolerance; responsive behavior checked
