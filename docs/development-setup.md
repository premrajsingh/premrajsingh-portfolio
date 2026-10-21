# Development setup

## Detected stack

- **Framework:** React 18 + Vite 5
- **Language:** JavaScript (JSX) — TypeScript not enabled
- **Package manager:** npm
- **Styling:** Tailwind CSS 3 + PostCSS
- **Existing animation/3D:** GSAP, Framer Motion, three, R3F, Drei, lucide-react

## How to start

```bash
cd /Users/premrajsingh/Desktop/premrajsingh-portfolio
npm install
npm run dev
```

Open `http://localhost:5173`.

## How to run checks

```bash
npm run format:check
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
```

Install Playwright Chromium once if e2e fails on missing browser:

```bash
npx playwright install chromium
```

## Cursor

- Rules: `.cursor/rules/`
- Skills: `.cursor/skills/`
- Project MCP: `.cursor/mcp.json` (Playwright, Figma, Context7, filesystem, Lighthouse)
- Plugin: Figma marketplace plugin installed and OAuth-connected
- Extensions: `.vscode/extensions.json`
- Tools status: [development-tools.md](./development-tools.md)

## Environment

Copy `.env.example` to `.env` and fill placeholders only when you add real integrations. Do not commit `.env`.

## Notes

- This setup does **not** redesign or rebuild the portfolio UI.
- Figma MCP is connected; agent-owned design file: https://www.figma.com/design/p0K6AvUmDsbBaZ9W5xhFKu
- Workspace path for filesystem MCP: `/Users/premrajsingh/Desktop/premrajsingh-portfolio`
- Prefer Framer Motion for UI motion; GSAP + ScrollTrigger for timelines; keep existing R3F scenes lazy-loaded.
