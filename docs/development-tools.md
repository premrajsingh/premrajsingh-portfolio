# Development tools

Status of tooling for **prem-raj-portfolio** (React 18 + Vite + npm). No secrets are stored here.

## Stack

| Item            | Value                                        |
| --------------- | -------------------------------------------- |
| Framework       | React 18 + Vite 5                            |
| Language        | JavaScript (JSX)                             |
| Package manager | npm                                          |
| Styling         | Tailwind CSS 3                               |
| Animation       | GSAP (+ `@gsap/react`), Framer Motion        |
| 3D              | three, @react-three/fiber, @react-three/drei |
| Icons           | lucide-react (pre-existing)                  |

## Installed development tools

- ESLint 9 (flat config: `eslint.config.js`)
- Prettier 3 + `prettier-plugin-tailwindcss`
- Vitest + Testing Library + jsdom
- Playwright Test (`@playwright/test`)
- EditorConfig
- `@gsap/react` for React-safe GSAP hooks

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
npm run typecheck   # documents that TS is not configured
npm run test
npm run test:e2e
```

First-time Playwright browsers (required once per machine):

```bash
npx playwright install chromium
```

If `npm run test:e2e` fails with “Executable doesn't exist”, run the install command above.

## Cursor rules

Project rules live in `.cursor/rules/` (`00`–`13`).

## Cursor skills

Project skills live in `.cursor/skills/*/SKILL.md` (14 skills), plus marketplace plugin skills (Figma, Playwright, etc.).

## Cursor plugins

| Plugin             | Status    | Notes                                           |
| ------------------ | --------- | ----------------------------------------------- |
| Figma (`figma`)    | Installed | Official; Figma MCP + skills (authenticated)    |
| docs-canvas        | Installed | Docs as navigable canvas                        |
| playwright         | Installed | Official Playwright automation plugin           |
| pr-review-canvas   | Installed | PR/diff review canvases                         |
| wonder             | Installed | Design canvas (real code); authenticated        |
| mobbin             | Installed | UI/UX reference search                          |
| html-css-to-image  | Installed | Screenshot / HTML→image visual QA               |
| jam                | Installed | Jam recordings for debug automation             |
| browserstack       | Installed | Cloud/real-device testing — Connect if prompted |
| superdesign        | Installed | Design exploration canvas                       |
| aws-agents / gmail | Skipped   | Unrelated                                       |

Also installed (packages, not wired into UI yet): `lenis` 1.3.26, `@react-three/postprocessing` 2.19.1.

`node_modules` removed from Git index (files kept on disk).

No Three.js/GSAP marketplace plugins available — use packages + Context7 + project skills.

VS Code/Cursor extension recommendations: `.vscode/extensions.json` (ESLint, Prettier, Tailwind, Playwright).

## MCP status

Configuration locations:

- **Project:** [`.cursor/mcp.json`](../.cursor/mcp.json)
- **User (merged, playwright preserved):** `~/.cursor/mcp.json`

### Configured

| Server                  | How                                                           | Purpose                                            |
| ----------------------- | ------------------------------------------------------------- | -------------------------------------------------- |
| `playwright`            | `npx -y @playwright/mcp@latest`                               | Browser automation / smoke testing                 |
| Figma (official remote) | **ready** (OAuth connected)                                   | Design context, frames, tokens                     |
| `context7`              | `npx -y @upstash/context7-mcp`                                | Up-to-date library docs (React, GSAP, Three, etc.) |
| `filesystem`            | `@modelcontextprotocol/server-filesystem` scoped to this repo | Restricted file access                             |
| `lighthouse`            | `npx -y lighthouse-mcp`                                       | Performance / a11y / SEO audits                    |

Built-in Cursor session tools (not in mcp.json): `cursor-ide-browser`, `cursor-app-control`, `cursor-subscriptions`.

### Manual auth still required

1. **Figma** — Connected (OAuth complete). For design work, send a Figma file/frame URL in chat.
2. **Context7** (optional) — For higher rate limits, add `CONTEXT7_API_KEY` in Cursor MCP env / settings. Do not commit the key.

### Unavailable / skipped

| Integration                                 | Reason                                                               |
| ------------------------------------------- | -------------------------------------------------------------------- |
| Official `@modelcontextprotocol/server-git` | Not published on npm (404) — use local `git` CLI                     |
| Third-party Talk-to-Figma community stacks  | Skipped; official Figma remote MCP + marketplace plugin used instead |
| Hardcoded API tokens                        | Never added                                                          |

## Figma workflow

1. Plugin installed (`figma`) and MCP authenticated.
2. **Agent-owned file:** https://www.figma.com/design/p0K6AvUmDsbBaZ9W5xhFKu  
   (`Prem Raj Portfolio — Design System`, key `p0K6AvUmDsbBaZ9W5xhFKu`)
3. Section frames present: Hero, About, Skills, Projects, Experience, Contact.
4. Do not ask the user for a Figma URL unless they prefer a different file.
5. Use project skills `figma-to-code` and `figma-design-system` during implementation.

## Testing approach

- **Unit:** Vitest — `src/env.smoke.test.js`
- **E2E:** Playwright — `e2e/smoke.spec.js`
- **Browser QA:** Playwright MCP + `cursor-ide-browser`
- **Performance:** Lighthouse MCP against a running URL (`npm run preview` or deployed URL)
- **Quality:** ESLint + Prettier

## Environment variables

See `.env.example` for app placeholders only. MCP secrets belong in Cursor MCP settings, not in git.

## Pre-existing repository notes

- `node_modules` is **tracked in git** (~14k files). `.gitignore` lists `node_modules`, but Git keeps tracking until `git rm -r --cached node_modules`.
- Production build warns that some chunks exceed 500 kB.
- `src/three/ProfileScene.jsx` exists but is unused.

## Out of scope for environment setup

- Portfolio UI redesign / new sections / demo animations
- Lenis, duplicate `motion` package, postprocessing package
