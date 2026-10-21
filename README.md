# Prem Raj — AI Software Developer

Personal portfolio built with React 18, Vite 5, Tailwind CSS 3, GSAP (ScrollTrigger), Framer Motion, Lenis and React Three Fiber. The hero is a WebGL reference-architecture diagram assembled only from components on the résumé, with a **Run a request** button that plays a scripted request through it hop by hop next to a span waterfall. The same drawn vocabulary continues down the page: each Experience role shows its stack as 3D objects, Work screenshots stand as 3D screens, and the Skills groups sit on a 3D shelf that answers the table's hover. Every figure loads only when it scrolls near, stops rendering off-screen, and has a plain DOM fallback for reduced motion and assistive tech. Every visible string comes from `src/data/content.js`, which is traced to `public/Prem_Raj_Resume.pdf`. The design and implementation contract lives in `docs/redesign-brief.md` and `docs/design-spec.md` (§13 covers the request trace and section figures).

## Scripts

| command                                | what it does                                                                                      |
| -------------------------------------- | ------------------------------------------------------------------------------------------------- |
| `npm run dev`                          | Vite dev server on http://localhost:5173                                                          |
| `npm run build`                        | production build to `dist/`                                                                       |
| `npm run preview`                      | serve the production build locally                                                                |
| `npm run lint`                         | ESLint over the repo                                                                              |
| `npm run format`                       | Prettier write                                                                                    |
| `npm run format:check`                 | Prettier check                                                                                    |
| `npm run test`                         | Vitest unit tests                                                                                 |
| `npm run test:e2e`                     | Playwright smoke tests (starts the dev server)                                                    |
| `node scripts/capture.mjs [--reduced]` | screenshots + console/overflow report into `test-results/screens/` (needs the dev server running) |

## Before every release

```bash
npm run lint && npm run format:check && npm run test && npm run build && npm run test:e2e
```

## Deploy (Vercel)

The site is a static Vite build (`dist/`); Vercel detects it automatically — no `vercel.json` is needed. Deploys are triggered by pushing to `main`.

`node_modules` was committed before `.gitignore` excluded it. Remove it from the index once (this deletes nothing on disk):

```bash
git rm -r -q --cached node_modules
```

Then commit and push:

```bash
git add -A && git commit -m "Redesign: Fig. 0 reference-architecture portfolio" && git push origin main
```

Environment variables are not required. `.env` stays local; `.env.example` lists the optional keys.

## Content

Everything shown on the page comes from `src/data/content.js`. To add bullet points for a role (for example the current Plancover internship), edit its `points` array there — nothing else changes.
