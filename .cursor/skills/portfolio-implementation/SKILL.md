---
name: portfolio-implementation
description: Apply project rules and skills when the user provides portfolio code or design instructions. Use at the start of portfolio implementation phases to inspect, ask for missing info, and implement without inventing content.
---

# Portfolio implementation

## When to use

When the user supplies portfolio content, Figma frames, or explicit build instructions after environment setup.

## Inspect first

- Current `src/` structure and existing sections
- Rules in `.cursor/rules/` and relevant skills
- Real content vs placeholders; Figma access if claimed as source of truth

## Approach

1. Inspect before editing; preserve factual content.
2. Ask for missing design, copy, assets, or integrations.
3. Implement only the requested scope; keep modules small.
4. Use GSAP / Framer Motion / R3F per animation-architecture skill.
5. Run lint, format, tests, and build before claiming done.

## Avoid

- Building hero/projects/contact (or redesigning) without an explicit request
- Inventing clients, metrics, or testimonials
- Scope creep beyond the user's instruction

## Verify

- Requested sections only; checks actually run; open questions listed for the user
