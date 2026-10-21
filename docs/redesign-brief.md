# Redesign brief — Prem Raj, AI Software Developer

This brief is the single source of constraints for the 2026-10 redesign. Every agent
working on the redesign reads this first.

## Goal

Replace the current editorial "paper & ink" design with a **3D, clean, unique**
software-developer portfolio. The visitor is a recruiter or engineering manager
hiring for **AI / backend / systems** roles. The site must feel like it was built
by someone who designs systems for a living: precise, confident, uncluttered,
technically impressive without being noisy.

"3D" means real WebGL (React Three Fiber) where it earns its place, plus
depth/perspective in the DOM (3D tilt, layered parallax, perspective transforms)
elsewhere. "Clean" means generous whitespace, a strict type scale, one accent
colour, no gradients-everywhere, no neon glow soup, no particle clichés,
no "floating blob". "Unique" means a visitor should not be able to say
"I've seen this template before".

## Hard constraints (never break)

- Stack stays **React 18 + Vite 5 + JavaScript (JSX) + npm**. No TypeScript
  migration. No framework swap.
- Allowed libraries (already installed): `three`, `@react-three/fiber`,
  `@react-three/drei`, `@react-three/postprocessing`, `gsap` (+ ScrollTrigger),
  `@gsap/react`, `framer-motion`, `lenis`, `lucide-react`, Tailwind CSS 3.
  Adding a new dependency needs a one-line justification in the PR summary and
  must be small. Do not import transitive deps that are not in `package.json`.
- **Content accuracy**: every employer, client, date, metric, project, URL and
  certificate comes from `src/data/content.js`, which is traced to
  `public/Prem_Raj_Resume.pdf`. Never invent clients, metrics, testimonials,
  awards, outcomes or place names. If a section needs copy that is not on the
  resume, write neutral factual copy or leave it out.
- **No secrets** in source. `.env` is gitignored; `.env.example` has placeholders only.
- **Accessibility**: semantic landmarks (`header[role=banner]`, `main#main`,
  `footer`), one `h1`, section headings, keyboard-reachable controls with
  visible focus, 4.5:1 text contrast, 44px minimum tap targets, `aria-label`s on
  icon-only links, skip link.
- **Reduced motion**: when `prefers-reduced-motion: reduce`, no WebGL canvas is
  mounted in `#hero`, no scroll-scrubbed motion, all content fully visible.
  Content must also be fully visible when WebGL is unavailable.
- **Performance budget**: Lighthouse-style targets on a mid laptop — LCP < 2.5s,
  no long main-thread blocks from 3D at idle, 60fps on desktop, 3D degrades
  (fewer instances / lower DPR / static) on phones. Lazy-load every R3F scene
  with `React.lazy` + `Suspense`. `dpr={[1, 1.5]}` max. No post-processing on mobile.
- **Checks must pass** before anything is called done: `npm run lint`,
  `npm run format:check`, `npm run test`, `npm run build`, `npm run test:e2e`.
- Mobile first: no horizontal overflow at 390px wide; everything readable at 320px.

## Content decisions already made by the author (apply exactly)

1. Title / role everywhere: **"AI Software Developer"**. Positioning copy
   emphasises **system design, backend engineering and AI** (RAG, multi-agent,
   event-driven systems). Use only claims present in the resume skills/projects.
2. Add a new current role to `EXPERIENCE` (first entry):
   - role: `AI Engineer Intern`
   - company: `Plancover`
   - place: `Gurgaon`
   - period: `Oct 2026 – Present`
   - badge: `Internship`
   - points: **none** — no bullet points exist yet. Render the card gracefully
     without bullets (do not write placeholder prose).
3. Change the Droot entry period to `Jul 2026 – Sep 2026` (it has ended).
4. Remove the Travel section entirely (component, data, nav item, e2e test).
5. Keep: Hero, About, Experience, Projects ("Work"), Skills, Education +
   Certifications + Hackathons (may be merged into one "Credentials" section),
   Contact, Footer.
6. Update `ABOUT.timeline` to include Plancover (Oct 2026) and the corrected
   Droot range.

## Existing assets you may use

- `public/photos/profile-professional.jpg` (portrait, 4:5 crop works),
  `public/photos/hero.jpg` (fallback portrait).
- Project screenshots: `public/photos/{ai-estimator,dasgupta,yashoda,studify,spotify}-{main,sub1,sub2}.png`.
- Certificates: `public/photos/hackhazards-cert.png`, `public/photos/createch-cert.png`.
- Resume: `public/Prem_Raj_Resume.pdf`.
- The other `public/photos/photo*.jpg` and `landscape.jpg` are personal travel
  photos — do not use them.

## Existing code you may reuse

- `src/hooks/usePrefersReducedMotion.js`, `src/hooks/useWebGL.js`,
  `src/hooks/useLenis.js` (Lenis + ScrollTrigger sync), `src/lib/motionTokens.js`.
- `src/lib/useSectionReveal.js` — GSAP data-attribute reveal system
  (`[data-reveal]`, `[data-mask]`, `[data-line]`, `[data-stagger]`, …). Keep or
  replace, but keep the rule: GSAP owns scroll-driven motion, Framer Motion owns
  presence (menus, dialogs), CSS owns hover/focus; never animate the same
  property with two libraries.
- Test setup: `vitest.config.js`, `playwright.config.js` (starts the dev server
  itself on 127.0.0.1:5173; Chromium is installed), `e2e/smoke.spec.js`.

## Section inventory and nav ids (must exist in this order)

`#hero` → `#about` → `#experience` → `#work` → `#skills` → `#credentials` → `#contact`

Nav labels: About, Experience, Work, Skills, Credentials, Contact. Resume download
button in header and hero.

## Judging criteria for design concepts

1. **Uniqueness** — not a template, not a cliché; a signature idea tied to Prem's
   actual positioning (systems / backend / AI).
2. **Cleanliness** — restraint, hierarchy, whitespace, one accent, legibility.
3. **3D craft** — the 3D is purposeful, interactive, polished; it would make a
   senior frontend engineer nod.
4. **Communicates strengths** — a recruiter understands "AI + backend + systems"
   in five seconds, and can find experience/projects/contact instantly.
5. **Feasibility & performance** — buildable in this stack by a small team in a
   day, 60fps desktop, graceful on phones, honest reduced-motion fallback.
6. **Accessibility** — nothing essential lives only inside a canvas.
