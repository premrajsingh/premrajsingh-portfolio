# Cursor development setup

Professional environment for this Vite + React portfolio. **No portfolio UI was built or redesigned in this setup.**

## Detected stack

| Item            | Value                                                 |
| --------------- | ----------------------------------------------------- |
| Framework       | React 18.3.1 + Vite 5.4.21                            |
| Language        | JavaScript (JSX) — no TypeScript                      |
| Package manager | npm                                                   |
| Runtime         | Node v22.14.0                                         |
| Styling         | Tailwind CSS 3.4                                      |
| Animation       | GSAP 3.15 + `@gsap/react` 2.1.2 + Framer Motion 11.18 |
| 3D              | three 0.169 + R3F 8.18 + Drei 9.122                   |
| Icons           | lucide-react (pre-existing)                           |

## Installed packages (setup-relevant)

**Runtime:** `gsap`, `@gsap/react`, `framer-motion`, `three`, `@react-three/fiber`, `@react-three/drei`, `lucide-react`

**Dev:** ESLint 9, Prettier 3, Vitest 3, Testing Library, Playwright Test 1.63, Tailwind Prettier plugin

**Not installed (by design):** `motion` (duplicate of framer-motion)

**Now installed for later use (not wired into UI):** `lenis` 1.3.26, `@react-three/postprocessing` 2.19.1 (R3F v8–compatible)

## Animation architecture

| Concern                       | Tool               |
| ----------------------------- | ------------------ |
| Timelines / ScrollTrigger     | GSAP (+ `useGSAP`) |
| Component / presence / layout | Framer Motion      |
| Simple hover/focus            | CSS / Tailwind     |

## 3D status

Already present and kept. Lazy-load scenes; WebGL + reduced-motion fallbacks required in future work. No new scenes added during setup.

## Lenis status

**Installed** (`lenis` 1.3.26). Not integrated into the app yet — wire up only during portfolio implementation with reduced-motion + a11y safeguards.

## Plugins

| Plugin                      | Status    | Notes                                                       |
| --------------------------- | --------- | ----------------------------------------------------------- |
| Figma (`figma`)             | Installed | Official; MCP + Figma skills (authenticated)                |
| docs-canvas                 | Installed | Official docs canvas                                        |
| playwright                  | Installed | Official browser automation / screenshots / testing skills  |
| pr-review-canvas            | Installed | Diff review canvases                                        |
| wonder                      | Installed | Design-on-canvas (real code); user authenticated            |
| mobbin                      | Installed | Real-world UI/UX design references                          |
| html-css-to-image           | Installed | HTML/CSS → image / screenshot visual QA                     |
| jam                         | Installed | Bug-report recordings → agent context                       |
| browserstack                | Installed | Cloud/real-device testing — Connect in Settings if prompted |
| superdesign                 | Installed | Design exploration (do not auto-redesign until asked)       |
| aws-agents / gmail / Vercel | Skipped   | Unrelated to local portfolio design/3D                      |

**Note:** No dedicated Three.js / GSAP / WebGL marketplace plugins exist. 3D/animation use project packages + Context7 + `.cursor/skills` / rules.

Workspace recommendations: `.vscode/extensions.json` (ESLint, Prettier, Tailwind, Playwright).

## Packages added for future portfolio work

| Package                       | Version | Notes                                             |
| ----------------------------- | ------- | ------------------------------------------------- |
| `lenis`                       | 1.3.26  | Installed — **not wired into App yet**            |
| `@react-three/postprocessing` | 2.19.1  | R3F v8–compatible — **not applied to scenes yet** |

## Git hygiene

- `node_modules` removed from the Git index (`git rm -r --cached`). Files remain on disk; `.gitignore` already lists `node_modules`. Commit when ready.

## MCP servers

| Server                              | Status                      | Role                                |
| ----------------------------------- | --------------------------- | ----------------------------------- |
| Figma (`https://mcp.figma.com/mcp`) | **ready** (OAuth connected) | Design context                      |
| Context7                            | **ready**                   | Library docs                        |
| Playwright                          | **ready**                   | Browser automation                  |
| Filesystem (repo-scoped)            | **ready**                   | File access                         |
| Lighthouse (`lighthouse-mcp`)       | **ready**                   | Performance audits                  |
| Git MCP                             | **skipped**                 | Official package not on npm         |
| Image/asset MCP                     | **skipped**                 | No verified approved server         |
| Accessibility-specific MCP          | **skipped**                 | Use Lighthouse a11y + project skill |

Config: `.cursor/mcp.json` and `~/.cursor/mcp.json` (merged; existing servers preserved).

## Skills

**Project skills (`.cursor/skills/`):**

- gsap-animation, motion-animation, animation-architecture
- figma-to-code, figma-design-system
- frontend-development, responsive-design
- browser-visual-qa, accessibility-review, performance-review, seo-review
- testing-workflow, mcp-usage, portfolio-implementation

Plus Figma plugin–provided skills from the marketplace plugin.

## Rules

`.cursor/rules/` `00`–`13`: architecture, quality, UI, GSAP, Motion, Three, a11y, performance, testing, content accuracy, MCP, Figma, security, plugins.

## Workspace

Active clone: `/Users/premrajsingh/Desktop/premrajsingh-portfolio`  
Filesystem MCP is scoped to this path.

## Figma status

- Plugin installed
- Remote MCP configured and **authenticated**
- **Agent-owned design file (no user link required):**
  - Name: Prem Raj Portfolio — Design System
  - URL: https://www.figma.com/design/p0K6AvUmDsbBaZ9W5xhFKu
  - File key: `p0K6AvUmDsbBaZ9W5xhFKu`
  - Frames: Hero, About, Skills, Projects, Experience, Contact (Desktop)
- Future implementation should use this file via Figma MCP; do not ask the user for a Figma link unless they want a different file.

## Browser / performance testing

- Playwright project: `e2e/smoke.spec.js`, `npm run test:e2e`
- Playwright MCP + cursor-ide-browser for interactive QA
- Lighthouse MCP for audits against a running URL
- Vitest smoke: `src/env.smoke.test.js`

## Commands

```bash
npm install
npm run dev
npm run build
npm run preview
npm run lint
npm run format
npm run format:check
npm run typecheck
npm run test
npm run test:e2e
```

Playwright browsers (once): `npx playwright install chromium`

## Required manual steps

1. Optional: Context7 API key in Cursor MCP settings for higher rate limits.
2. Cursor Settings → Tools & MCP → **Connect** BrowserStack if cloud device testing is needed.
3. Commit the `node_modules` untrack when ready.
4. Figma design file is agent-owned — no user Figma link required.

## Future workflow

1. Provide portfolio instructions + Figma link.
2. Use `portfolio-implementation` + Figma skills.
3. Split animation ownership via `animation-architecture`.
4. Verify with `testing-workflow` + browser visual QA.

## Related docs

- [development-tools.md](./development-tools.md)
- [development-setup.md](./development-setup.md)
