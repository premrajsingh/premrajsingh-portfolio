
# Project architecture

- Preserve **React 18 + Vite + npm**. Do not replace the framework or package manager.
- Prefer modular components under `src/`; avoid growing `App.jsx` further without extraction.
- Avoid unnecessary dependencies; justify each new package against an existing need.
- Language is **JavaScript (JSX)** unless the user explicitly approves a TypeScript migration.
- Do not delete existing functionality without explicit approval.
- Do not fabricate clients, metrics, testimonials, awards, or project results.
- Keep secrets out of source, rules, skills, and docs. Use `.env` locally and `.env.example` placeholders only.
- After meaningful changes, run relevant checks (`lint`, `format:check`, `test`, `build`) before claiming completion.
- Never mark work complete without verification that was actually run.
