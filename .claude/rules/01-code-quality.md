---
paths:
  - "src/**/*.{js,jsx,css}"
---

# Code quality

- Use clear, descriptive names for components, hooks, and utilities.
- Prefer small reusable components over giant files.
- Extract duplicated logic into shared helpers or hooks.
- Handle errors explicitly; do not swallow failures silently.
- Remove unused imports and dead code.
- Avoid unnecessary comments; explain non-obvious intent only.
- Match existing formatting (Prettier) and project conventions.
- Refactor safely: preserve behavior, keep diffs focused, verify with checks.
- Keep a maintainable folder structure (`components/`, `hooks/`, `three/`, etc.).
