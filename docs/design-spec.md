# Design specification — "Fig. 0 — Reference Architecture" (rev 2026.10)

Implementation-ready spec for the 2026-10 redesign of Prem Raj's portfolio. It synthesises the
winning concept (Fig. 0 — Reference Architecture, 147 pts) with grafts from Octet (spec plate,
Lightformer rig, scene tiers, text-safe accent), The Trace (ultramarine accent, section-progress
nav, `eventSource` raycasting, PerformanceMonitor ladder), General Arrangement (3-step toon
shading, hidden-line Plancover card), Adjacency (traceability test, `useSyncExternalStore` store)
and Rebalance (computed live readout, frozen mobile packets, copy buttons, GSAP-only hidden
states). Every judge warning is resolved inline; the resolution is marked **[W]**.

Read `docs/redesign-brief.md` first. The brief wins over this spec if they ever conflict.
Content accuracy rule: every string shown to the visitor comes from `src/data/content.js`
(section 8 lists the exact edits) or from the data file `src/three/architecture.js`, whose every
`source` is unit-tested against content.js.

Implementers work in parallel on separate files (section 11). Where this spec says "exact", paste
it; where it gives a starting value ("start at"), tune only inside your own file.

---

## 0. Amendments (these override anything below that conflicts)

**0.1 Phones get real 3D (lite tier), not the SVG plan.** The author wants the 3D diagram on every
device. `useSceneTier()` returns `static` ONLY when `prefers-reduced-motion: reduce`, the WebGL
probe fails, or `navigator.connection?.saveData` is true. It returns `lite` when `innerWidth < 1024`
or `hardwareConcurrency <= 4` or `deviceMemory <= 4`, else `full`. Lite tier on all widths (phones
included): `dpr={1}`, no `Environment`, no glass (`LLM_GLASS` flat path), no entrance animation, no
`PerformanceMonitor`, `ContactShadows` resolution 256, **8 packets initialised from
`PACKETS_STATIC` and then stepped normally so they move**, `frameloop="always"` while `#hero` is
≥ 5 % visible and the tab is visible, otherwise `"never"` (same IntersectionObserver rule as full —
there is no `demand` tier any more). Lite camera base position is higher — `[9, 14, 9]` scaled by
the same aspect fit — so the diagram reads as a drawing in portrait; scroll still lifts it to the
plan view `[6, 21, 6]`. Phone hero stage: `aspect-[4/3]` full width (≈ 350 px tall at 390 px wide).
Every "phones get the SVG plan / no three chunk on phones" line in §5.2, §6.4, §6.8, §10 and §12 is
void; the SVG plan remains the Suspense fallback, the static-tier hero and the footer colophon. The
390 px / 320 px overflow tests must pass with the canvas mounted.

**0.2 Deleting files.** Do not use `rm` or `git rm`. "Delete" means:
`mv <file> "/private/tmp/claude-501/-Users-premrajsingh-Library-Application-Support-Claude-scratch-workspaces-8f31ba59-3d8a-491a-9a13-7ffc3dd86fbf-d876636c-4469-40f6-9232-000619e6205b-scratch-2026-10-08-1ee3a4/5e6b9bb2-3a6d-4112-9fff-04d13e366b5c/scratchpad/deleted/"`
(create that directory with `mkdir -p` first).

**0.3 Foundation gate.** The foundation wave cannot make `npm run build` pass on its own, because
the old component files still import removed modules until wave 2 rewrites them. Foundation must
pass `npx eslint` + `npx prettier --check` on every file it touched and `npm run test` (vitest).
The build, e2e and screenshot checks are the integrator's job after all groups finish.

---

## 1. Thesis and signature idea

**Design thesis.** The page is a quiet engineering document whose only picture is the system its
author builds. Paper-white (#F7F7F5), one grotesk at two weights, one mono for apparatus, one
accent — blueprint ultramarine — and hairlines. No gradients, no glow, no particles, no dark mode,
no serif, no noise overlay, no marquee, no typewriter. Depth comes from real geometry: a WebGL
architecture diagram in the hero and shallow CSS perspective (tilt plates with one offset back
plate) elsewhere. A recruiter reads "AI + backend + systems" from the picture and the four-cell
spec plate before the lede renders; a senior engineer sees orthogonal routing, instanced packets,
a baked contact shadow, a single justified transmission material and a frameloop that goes to
zero below the fold. Every section is one scroll from the next; Experience is reachable in two.
**[W: palette/apparatus continuity]** — the accent moves from the burnt-orange family to
ultramarine `#1E3DF0`; the document apparatus is confined to the hero figure caption, "Fig." labels
on the five Work figures and plain two-digit section indices; there is no § mark, no revision
table, no appendix framing, no "paper tooth" overlay.

**Signature 3D idea.** "Fig. 0" is a composite reference architecture assembled only from
components Prem has shipped or lists on his résumé, drawn in the glyph vocabulary of C4/UML
diagrams: thin standing card for the React client, a flat ring for webhook ingress, a capsule for
Socket.IO, boxes for the Node/Express and FastAPI services and the LangChain RAG retriever, a
horizontal cylinder for the Kafka/Redis bus, three small cubes on a plinth for the multi-agent
orchestrator, a glass icosahedron for the LLM, vertical cylinders for MongoDB Atlas and MySQL, a
wireframe sphere with inner nodes for the Neo4j knowledge graph and a point lattice for the
Pinecone index. Thirteen nodes stand on a drawn engineering grid in three depth tiers (ingress /
compute / state), joined by seventeen orthogonally routed connectors with filleted corners (solid
= sync REST, dashed = async bus). Twenty ultramarine packets travel the connectors slowly; a
packet reaching a store makes its disc pulse, a packet reaching the LLM holds 0.6 s "thinking" and
returns. The pointer gently rotates the rig (±6° yaw, ±2.5° pitch) and hovering a node — or
hovering/arrowing through the DOM legend — highlights that node and its connectors while the rest
fade to hairlines; the live readout under the figure prints the component and its real source
project. Scrolling out of the hero lifts the camera into a top-down plan view so the diagram
flattens into a drawing. The same `NODES`/`EDGES` data generates an inline SVG plan view
(`ArchitecturePlan.jsx`) that is the reduced-motion hero, the no-WebGL hero, the phone hero, the
Suspense fallback and the footer colophon, and the same thirteen glyphs recur as 2D icons in
Experience card footers and the Skills table. Nothing a visitor needs lives only in the canvas.

---

## 2. Design tokens

### 2.1 CSS custom properties (exact — paste into `:root` in `src/index.css`)

```css
:root {
  color-scheme: light;
  /* surfaces */
  --bg: #f7f7f5; /* page */
  --surface: #ffffff; /* cards, plates */
  --surface-2: #eff0ed; /* back plates, table header, code-ish blocks */
  /* text */
  --text: #15171a; /* 16.9:1 on bg */
  --text-dim: #3e434a; /* 9.6:1 on bg — secondary body */
  --muted: #646a72; /* 5.1:1 on bg — captions, labels ≥ 12px */
  /* rules */
  --line: #dadddb; /* hairlines */
  --line-strong: #b9bdb7; /* emphasised rules, table head rule */
  /* accent — blueprint ultramarine, 6.5:1 on bg: legal for text at any size */
  --accent: #1e3df0;
  --accent-deep: #1733b8; /* hover/active state of accent elements */
  --accent-soft: rgba(30, 61, 240, 0.08); /* footprints, tints, selection */
  --focus: #1e3df0;
  /* 3D / diagram ink (also used by the SVG plan) */
  --edge-ink: #80858c; /* 3D Edges and SVG strokes */
  --grid-cell: #e6e8e4;
  --grid-section: #d0d3ce;
  /* shape */
  --radius: 2px;
  --shadow-lift: 0 24px 48px -32px rgba(21, 23, 26, 0.28);
  --ease-out: cubic-bezier(0.22, 1, 0.36, 1);
  /* layout */
  --gutter: 1.25rem;
  --shell: 76rem;
  --header-h: 4rem;
}
@media (min-width: 640px) {
  :root {
    --gutter: 2rem;
  }
}
@media (min-width: 1280px) {
  :root {
    --gutter: 3rem;
  }
}
```

Light-only. There is no dark theme and no `prefers-color-scheme` rule; `color-scheme: light` is
declared so form controls and scrollbars render light.

### 2.2 Tailwind `theme.extend` (exact — replace the block in `tailwind.config.js`)

```js
extend: {
  colors: {
    bg: "#F7F7F5",
    surface: "#FFFFFF",
    "surface-2": "#EFF0ED",
    ink: "#15171A",
    text: "#15171A",
    dim: "#3E434A",
    muted: "#646A72",
    line: "#DADDDB",
    "line-strong": "#B9BDB7",
    accent: "#1E3DF0",
    "accent-deep": "#1733B8",
    "accent-soft": "rgba(30, 61, 240, 0.08)",
    "edge-ink": "#80858C",
  },
  fontFamily: {
    sans: ["'Instrument Sans'", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
    mono: ["'DM Mono'", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
  },
  letterSpacing: {
    display: "-0.03em",
    tight: "-0.02em",
    label: "0.06em",
  },
  maxWidth: {
    shell: "76rem",
    prose: "60ch",
    lede: "34ch",
  },
  borderRadius: {
    DEFAULT: "2px",
  },
  boxShadow: {
    lift: "0 24px 48px -32px rgba(21, 23, 26, 0.28)",
  },
  transitionTimingFunction: {
    out: "cubic-bezier(0.22, 1, 0.36, 1)",
  },
},
```

Remove the old keys (`oxide`, `accent-ink`, `faint`, `paper`, `serif`). Components must not
reference them.

### 2.3 Google Fonts (exact)

`src/index.css` first line:

```css
@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Mono:wght@400;500&display=swap");
```

`index.html` adds `<link rel="preconnect" href="https://fonts.googleapis.com">` and
`<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`. Two families, six
instances total. Fallback faces (declared in index.css to limit h1 layout shift):

```css
@font-face {
  font-family: "Instrument Sans Fallback";
  src: local("Arial");
  size-adjust: 97%;
  ascent-override: 92%;
  descent-override: 24%;
}
```

and `font-family: "Instrument Sans", "Instrument Sans Fallback", system-ui, sans-serif` on body.

### 2.4 Type scale (strict 1.25 ratio, two fluid steps; named classes)

| class         | font / weight          | size                            | line-height | tracking | use                                   |
| ------------- | ---------------------- | ------------------------------- | ----------- | -------- | ------------------------------------- |
| `.display-xl` | Instrument Sans 600    | `clamp(2.75rem, 6.5vw, 5.5rem)` | 0.95        | -0.03em  | h1 only (both spans)                  |
| `.display-lg` | Instrument Sans 600    | `clamp(2rem, 3.6vw, 3rem)`      | 1.02        | -0.025em | h2, Contact email                     |
| `.title-md`   | Instrument Sans 500    | `1.375rem`                      | 1.25        | -0.01em  | h3 (roles, project titles)            |
| `.lede`       | Instrument Sans 400    | `1.125rem`                      | 1.55        | 0        | hero lede, About bio                  |
| `.body`       | Instrument Sans 400    | `1rem`                          | 1.6         | 0        | paragraphs, bullets                   |
| `.small`      | Instrument Sans 400    | `0.875rem`                      | 1.5         | 0        | secondary rows, captions in sans      |
| `.mono-label` | DM Mono 400            | `0.75rem`                       | 1.4         | 0.06em   | all apparatus: indices, periods, tech |
| `.mono-xs`    | DM Mono 400            | `0.6875rem`                     | 1.4         | 0.06em   | chips, table refs, footer meta        |
| `.kicker`     | DM Mono 400, uppercase | `0.75rem`                       | 1.4         | 0.08em   | section index rows, eyebrow           |

Body minimum is 16px everywhere; mono apparatus never below 11px. Numerals in mono use
`font-variant-numeric: tabular-nums` (`.tabular`).

### 2.5 Spacing, shell, grid, radius, borders, shadows

- 8px spacing grid. Section vertical padding: `clamp(5rem, 10vw, 8rem)` (`.section`).
- Shell: `max-width: 76rem`, `padding-inline: var(--gutter)` (1.25rem → 2rem at 640 → 3rem at 1280).
- Grid: 12 columns on ≥1024px (`.grid-12` = `grid-template-columns: repeat(12, minmax(0, 1fr))`,
  `gap: 1.25rem` → `2rem` at 1280). Below 1024px everything is a single column unless stated.
- Radius: `2px` on buttons, chips, cards, plates, images. Hairlines have no radius.
- Borders: hairlines are `1px solid var(--line)`; emphasised rules `var(--line-strong)`; the only
  ink border is on `.btn-ghost` and `.btn-icon`; the only 2px rule is the accent marker on active
  items (nav progress, active rail entry, Plancover "Current" header rule).
- Shadows: exactly one token, `--shadow-lift`, used only on a hovered/focused tilt plate and the
  certificate dialog. Nothing else casts a shadow.
- Header height `4rem`; `section[id] { scroll-margin-top: 5.5rem }`.

---

## 3. Global CSS contract (`src/index.css`)

Replace the current file entirely. Keep Tailwind directives, `html.lenis` rules and the
`prefers-reduced-motion` global clamp. Remove: the Fraunces/IBM Plex import, `body::after` noise,
`.folio*`, `.heading-*`, `.ink-field*`, `.masthead`, `.rule-double`, `.plate::after`, `.drop-cap`,
`.path-node`, `.story-*`, `.exp-spine*`, `[data-readout]`, `.marquee*`, `@keyframes marquee-scroll`.

Every class below must exist in `@layer components` (or base where noted) with exactly this name.

| class             | what it does                                                                                                                                                                                            |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.shell`          | width 100%, max-width `var(--shell)`, centred, `padding-inline: var(--gutter)`.                                                                                                                         |
| `.grid-12`        | 12-col CSS grid at ≥1024px (gap 1.25rem; 2rem at ≥1280); single column below.                                                                                                                           |
| `.section`        | `padding-block: clamp(5rem, 10vw, 8rem)`; `position: relative`.                                                                                                                                         |
| `.section-index`  | Row above each h2: flex, baseline, `border-top: 1px solid var(--line)`, `padding-top: 1rem`, kicker.                                                                                                    |
| `.kicker`         | DM Mono 0.75rem uppercase 0.08em, `color: var(--muted)`.                                                                                                                                                |
| `.mono`           | `font-family` DM Mono, `font-feature-settings: "tnum"`.                                                                                                                                                 |
| `.mono-label`     | DM Mono 0.75rem / 1.4 / 0.06em.                                                                                                                                                                         |
| `.mono-xs`        | DM Mono 0.6875rem / 1.4 / 0.06em.                                                                                                                                                                       |
| `.display-xl`     | h1 step (table 2.4).                                                                                                                                                                                    |
| `.display-lg`     | h2 step.                                                                                                                                                                                                |
| `.title-md`       | h3 step.                                                                                                                                                                                                |
| `.lede`           | 1.125rem / 1.55, `max-width: 34ch` is NOT built in (apply `max-w-lede` where wanted).                                                                                                                   |
| `.small`          | 0.875rem / 1.5.                                                                                                                                                                                         |
| `.tabular`        | `font-variant-numeric: tabular-nums`.                                                                                                                                                                   |
| `.rule`           | `height: 1px; background: var(--line)`.                                                                                                                                                                 |
| `.rule-strong`    | `height: 1px; background: var(--line-strong)`.                                                                                                                                                          |
| `.btn-primary`    | solid `--text` bg, `--bg` text, 44px min-height, `padding: 0 1.25rem`, radius, hover bg `--accent`, 0.25s.                                                                                              |
| `.btn-ghost`      | 1px `--text` border, transparent, 44px min-height, hover: bg `--text` + text `--bg`.                                                                                                                    |
| `.btn-icon`       | 44×44 inline-flex centre, 1px `--line` border, `--text-dim` icon; hover border/icon `--text`.                                                                                                           |
| `.link-underline` | underline draws left→right on hover/focus-visible via `::after` scaleX (0.4s `--ease-out`).                                                                                                             |
| `.link-accent`    | `color: var(--accent)`; hover `--accent-deep`; used for Live ↗ / Code ↗ / external links.                                                                                                               |
| `.card`           | `background: var(--surface); border: 1px solid var(--line); border-radius: var(--radius)`.                                                                                                              |
| `.card-dashed`    | `.card` with `border-style: dashed` (hidden-line convention — Plancover).                                                                                                                               |
| `.chip`           | mono-xs, `--text-dim`, 1px `--line` border, `padding: 0.4rem 0.6rem`, min-height 44px when it is a button (`.chip-btn`).                                                                                |
| `.chip-btn`       | `.chip` as a `<button>`: 44px min-height, `.is-active` → border/text `--accent`, bg `--accent-soft`.                                                                                                    |
| `.focus-ring`     | `:focus-visible { outline: 2px solid var(--focus); outline-offset: 3px }`.                                                                                                                              |
| `.skip-link`      | visually hidden until focused; then fixed top-left, `--text` bg, `--bg` text, z 60.                                                                                                                     |
| `.mask-line`      | `display:block; overflow:hidden; padding-bottom: 0.08em`; `> span { display:block }` (reveal system).                                                                                                   |
| `.plate`          | image/portrait frame: `.card` + `overflow: hidden`; `img { display:block; width:100% }`.                                                                                                                |
| `.tilt`           | `perspective: 1200px; transform-style: preserve-3d; --rx: 0deg; --ry: 0deg` container (hover: hover only).                                                                                              |
| `.tilt-layer`     | `transform: rotateX(var(--rx)) rotateY(var(--ry)) translateZ(var(--tz, 0)); transition: transform .35s var(--ease-out)`; `will-change: transform` only while `.tilt:hover`.                             |
| `.plate-back`     | absolutely positioned back plate: `inset: 0; translate: 10px 10px; background: var(--surface-2); border: 1px solid var(--line); z-index: -1` — the second plane. With `.tilt` it sits at `--tz: -40px`. |
| `.spec-plate`     | 4-cell grid (`repeat(4, minmax(0,1fr))` ≥1024, `repeat(2, …)` below), hairline top+bottom, cells separated by 1px `--line` (`> li + li { border-left }` ≥1024).                                         |
| `.legend-toolbar` | wrapped flex row of `.chip-btn`s with a 20px inline SVG glyph; `gap: 0.5rem`.                                                                                                                           |
| `.readout`        | mono-label line, `min-height: 1.4em`, `color: var(--text-dim)`; `[data-empty] { color: var(--muted) }`.                                                                                                 |
| `.nav-link`       | header link: 0.875rem 500, `--text-dim`, hover `--text`, `padding: 0.75rem 0.625rem`, position relative.                                                                                                |
| `.nav-progress`   | 2px bar at bottom of `.nav-link`: `background: var(--accent); transform: scaleX(0); transform-origin: left`.                                                                                            |
| `.glyph`          | inline SVG sizing: `width: 1.25rem; height: 1.25rem; stroke: currentColor; fill: none; stroke-width: 1.25; flex: none`.                                                                                 |
| `.is-active`      | state class toggled by the active-node store on `[data-node-id]` elements (chips, SVG groups, skills rows). Chips: accent border; SVG groups: `stroke: var(--accent)`.                                  |
| `.is-dim`         | SVG groups not connected to the active node: `stroke: var(--line)`.                                                                                                                                     |
| `.sr-only`        | Tailwind's; use the utility.                                                                                                                                                                            |

Base rules to keep/add: `* { box-sizing: border-box; margin: 0; padding: 0 }`,
`html { -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility }` (no
`scroll-behavior: smooth`; Lenis handles anchors, and under reduced motion jumps are instant),
`body { background: var(--bg); color: var(--text); overflow-x: hidden }`,
`::selection { background: var(--accent-soft) }`, `canvas { display: block }`,
`img { max-width: 100% }`, `section[id] { scroll-margin-top: 5.5rem }`, and the reduced-motion
clamp (`animation-duration: 0.01ms !important; transition-duration: 0.01ms !important`).

**Reveal system data attributes** (unchanged from `src/lib/useSectionReveal.js`): `[data-mask]`
(inner `.mask-line > span`), `[data-reveal]` (clip wipe from below), `[data-line]` (rule draws
left→right), `[data-rise]` (vertical rule draws), `[data-clip="up|down|left|right"]` with optional
`[data-clip-inner]`, `[data-parallax="<px>"]` (scrubbed translateY), `[data-stagger]` (children
enter staggered). Rule **[W: GSAP-only hidden states]**: no CSS rule may set an initial hidden
state (opacity 0, clip-path, scaleX(0)) on any element — GSAP `from/fromTo` sets it, so when
ScrollTrigger never fires (reduced motion, no-JS motion) everything is visible. The existing
`[data-readout] { transform: scaleX(0) }` rule is deleted for this reason.

---

## 4. Page structure

### 4.1 `src/App.jsx` (exact)

```jsx
import Loader from "./components/Loader.jsx"
import Header from "./components/Header.jsx"
import Hero from "./components/Hero.jsx"
import About from "./components/About.jsx"
import Experience from "./components/Experience.jsx"
import Projects from "./components/Projects.jsx"
import Skills from "./components/Skills.jsx"
import Credentials from "./components/Credentials.jsx"
import Contact from "./components/Contact.jsx"
import Footer from "./components/Footer.jsx"
import BackToTop from "./components/BackToTop.jsx"
import { useLenis } from "./hooks/useLenis.js"

export default function App() {
  useLenis()
  return (
    <>
      <Loader />
      <Header />
      <main id="main">
        <Hero />
        <About />
        <Experience />
        <Projects />
        <Skills />
        <Credentials />
        <Contact />
      </main>
      <Footer />
      <BackToTop />
    </>
  )
}
```

Section ids in DOM order: `#hero` → `#about` → `#experience` → `#work` → `#skills` →
`#credentials` → `#contact`. Each section element: `<section id="…" aria-labelledby="…-heading"
class="section">`, with exactly one `h2#…-heading` (the hero has the page's only `h1#hero-heading`).

### 4.2 NAV shape (content.js)

```js
export const NAV = [
  { id: "about", label: "About", index: "01" },
  { id: "experience", label: "Experience", index: "02" },
  { id: "work", label: "Work", index: "03" },
  { id: "skills", label: "Skills", index: "04" },
  { id: "credentials", label: "Credentials", index: "05" },
  { id: "contact", label: "Contact", index: "06" },
]
```

`index` is used by `SectionHead` (section index row) and the header progress bars. The hero is
"00" and is not in NAV.

### 4.3 Shared component `src/components/SectionHead.jsx` (foundation owns; exact API)

```jsx
<SectionHead
  index="02"
  title="Experience"
  titleId="experience-heading"
  aside="4 roles · 2025 – present"
/>
```

Renders:

```html
<header class="mb-10 sm:mb-14">
  <div class="section-index">
    <p class="kicker"><span class="tabular">02</span> — Experience</p>
    <p class="kicker">4 roles · 2025 – present</p>
    <!-- aside, optional -->
  </div>
  <h2 id="experience-heading" class="display-lg mt-6 text-ink" data-mask>
    <span class="mask-line"><span>Experience</span></span>
  </h2>
</header>
```

No decorative rule under the h2 (the `.section-index` hairline is the only rule). `aside` strings
must be neutral and derived from data (counts, periods) — never claims.

---

## 5. Per-section specification

Conventions used below: "desktop" = ≥1024px, "mobile" = <1024px (single column) with specific notes
for 390px and 320px. "RM" = `prefers-reduced-motion: reduce`. All images carry `width`/`height`
attributes (screenshots 1024×576, portrait 576×1024, hackhazards cert 1024×735, createch cert
1024×723), `alt`, `decoding="async"`, and `loading="lazy"` except the portrait (eager). External
links: `target="_blank" rel="noreferrer"` with a lucide `ArrowUpRight` 14px glyph, aria-hidden.

### 5.1 Header — `src/components/Header.jsx`

- `<header role="banner" class="fixed inset-x-0 top-0 z-50 h-16 bg-bg/95 backdrop-blur-[6px]">`
  with a bottom hairline that is transparent at scrollY < 16 and `--line` after (toggle a class on
  a passive scroll listener; CSS owns the border colour transition).
- First child in DOM: `<a href="#main" class="skip-link focus-ring">Skip to content</a>`.
- Left: `<a href="#hero">` wordmark "Prem Raj" (Instrument Sans 500, 1rem) + plain text
  `<span class="mono-label text-muted hidden sm:inline">AI Software Developer</span>`
  **[W: one h1 — the role also appears as plain header text]**.
- Centre/right on desktop: `<nav aria-label="Primary">` with six `.nav-link`s from `NAV`
  (label only; no index shown), each containing `<span class="nav-progress" aria-hidden />`. A GSAP
  `ScrollTrigger` per section (`trigger: #id, start: "top 60%", end: "bottom 60%", scrub: false,
onUpdate: quickSetter(scaleX = self.progress), onToggle: set aria-current="true" on the active
link, remove from others`). This is The Trace's span-progress nav reduced to the existing nav
  **[graft]**. Under RM: no ScrollTriggers; `aria-current` set by a 1-section IntersectionObserver;
  bars hidden.
- Right: `<a href={SITE.resume} download class="btn-ghost focus-ring">` "Resume" with lucide
  `Download` 14px.
- Mobile (<1024): wordmark + Resume (icon-only ≥360px shows text) + 44×44 menu button
  (`aria-expanded`, `aria-controls="mobile-nav"`, label "Open menu"/"Close menu"). Sheet:
  `<motion.nav id="mobile-nav" aria-label="Mobile">` full-screen (`fixed inset-0 top-16 bg-bg`),
  Framer `AnimatePresence` fade+8px rise 0.28s `ease` from motionTokens; links at `.title-md`, 56px
  rows with hairlines; below: three `.btn-icon` socials (aria-labels GitHub / LinkedIn / Email) and
  a `.btn-primary` Resume. Escape closes; body scroll locked while open; focus moves to the first
  link on open and back to the toggle on close. Link click closes the sheet. Escape handling lives
  in a `keydown` listener that is attached only while open, so it cannot conflict with the hero
  legend's Escape **[W: Escape conflict]**.
- Remove the old `[data-readout]` scroll bar and the GSAP nav entrance.

### 5.2 Hero — `src/components/Hero.jsx` (+ `src/three/ArchitectureScene.jsx`, `src/three/ArchitecturePlan.jsx`)

**Content (content.js):** `SITE.name`, `SITE.role`, `SITE.location`, `HERO.available`,
`HERO.lede`, `HERO.specPlate[]`, `HERO.figureCaption`, `SITE.resume`, `SITE.github`,
`SITE.linkedin`, `SITE.email`. Counts in the caption come from `architecture.js`
(`NODES.length`, `EDGES.length`), never typed.

**Desktop layout.** `section#hero.section` with `min-height: 100svh`, `padding-top: var(--header-h)`,
flex column; inner `.shell.grid-12` grows to fill and vertically centres; a bottom strip spans 12
cols. **[W: hero density]** the hero contains exactly: eyebrow, h1, lede, two CTAs, three icon
links, figure (canvas or SVG), one-line caption + readout, spec plate. Nothing else.

- Cols 1–5 (text column, `self-center`):
  1. Eyebrow `.kicker`: `<span class="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden/>`
     then `Open to work · New Delhi, India` (available ? "Open to work · " : "") + `SITE.location`.
  2. `<h1 id="hero-heading" class="display-xl text-ink mt-5" data-mask>` containing two
     `<span class="mask-line"><span>…</span></span>` lines: "Prem Raj" and "AI Software Developer";
     the second inner span adds `font-normal text-dim`. One heading, announced as
     "Prem Raj AI Software Developer".
  3. `<p class="lede max-w-lede mt-6 text-dim">{HERO.lede}</p>`.
  4. Actions row `mt-8 flex flex-wrap items-center gap-3`: `<a href="#work" class="btn-primary focus-ring">View work</a>`,
     `<a href={SITE.resume} download class="btn-ghost focus-ring"><Download/> Download resume</a>`,
     then `<ul class="flex gap-2 ml-2">` of three `.btn-icon` links (aria-label "GitHub",
     "LinkedIn", "Email"; lucide `Github`, `Linkedin`, `Mail` 16px).
- Cols 6–12 (figure column): `<figure class="relative" aria-describedby="hero-caption">`
  - `<div data-hero-stage class="relative aspect-[4/3] lg:aspect-auto lg:h-[min(62vh,640px)]">`
    containing either the lazy `ArchitectureScene` (tier full/lite) inside `Suspense` whose
    fallback is `<ArchitecturePlan />`, or `<ArchitecturePlan />` alone (tier static). The canvas
    wrapper is `absolute inset-0 pointer-events-none` with `aria-hidden tabIndex={-1}`; it starts
    at `opacity: 0` and crossfades to 1 over 400 ms (CSS transition on a class toggled in the
    scene's `onCreated` callback) while the plan fades to 0 and is then unmounted. If the lazy
    import rejects, the plan stays at opacity 1 **[W: fallback opacity]**.
  - `<figcaption id="hero-caption" class="mt-3 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">`
    - `<p class="mono-label text-muted">` = `HERO.figureCaption` + ` ${NODES.length} components ·
${EDGES.length} connectors.` + (tier static ? " Static plan." : " Hover or tab to a component.")
    - `<details class="legend">` with `<summary class="mono-label focus-ring cursor-pointer">Components</summary>`
      (one Tab stop, collapsed by default on all widths). Inside: `<div role="toolbar"
aria-label="Components" class="legend-toolbar mt-3">` of 13 `<button class="chip-btn focus-ring"
data-node-id={id} aria-pressed={pinned}>` each with its 20px glyph (`<Glyph kind=… />`) and
      `node.short`. Roving tabindex: only one button has `tabIndex=0` (the active or first);
      ArrowRight/ArrowLeft/Home/End move focus and set active; Enter/Space toggles pinned;
      Escape clears **[W: 13 tab stops]**.
  - `<p id="hero-active" class="readout mt-2" aria-live="polite">`: when nothing is active it reads
    `—` with `data-empty`; when a node is active it reads
    `${node.label} — ${node.detail} · ${node.sourceLabel}` e.g.
    `Neo4j graph — Knowledge graph for the Slnko Energy RAG · Droot Private Limited`. It updates
    only on pointer/focus events via the store subscription (never per frame)
    **[W: live region]**. This line replaces the drei `<Html>` callouts, which are cut.
- Bottom strip (cols 1–12): `<ul class="spec-plate mt-10" aria-label="Capabilities">` with four
  `<li class="py-4 lg:px-5 first:pl-0">` cells from `HERO.specPlate`:
  `<span class="mono-xs text-muted tabular">01</span>` / `<p class="small font-medium text-ink
mt-1">KNOWLEDGE-GRAPH RAG</p>` (uppercase via text) / `<p class="mono-label text-dim mt-1">LangChain ·
Neo4j · Pinecone</p>`. Octet's spec plate **[graft]**; HERO.stats move to About.

**Mobile layout.** Stack: eyebrow, h1 (wraps to 2–3 lines; 2.75rem at 320px), lede, actions
(buttons full-width 48px, icons row below), figure (`ArchitecturePlan` — phones are tier static,
see 6.4), caption + collapsed `Components` disclosure (chips wrap; never scroll horizontally),
readout, spec plate 2×2. Zero horizontal overflow at 390px; caption wraps.

**Motion.** Entrance (GSAP timeline, no-preference only, delay 0.3s): eyebrow fade-rise 12px 0.45s;
h1 mask lines `yPercent 112→0` 1.05s expo.out stagger 0.1; lede/actions fade-rise 16px 0.65s stagger
0.06; spec-plate hairlines `scaleX 0→1` 0.9s power3.inOut; cells fade-rise stagger 0.05. All
`from`/`fromTo`, nothing hidden by CSS. Scroll: one ScrollTrigger (`trigger: #hero, start: "top
top", end: "bottom top", scrub: 0.6`) writes `progressRef.current` for the scene (camera rise) and
separately tweens the stage wrapper `y: 0 → -6vh` and `opacity: 1 → 0` between progress 0.35 and 1
(GSAP owns wrapper transform/opacity; R3F owns the camera; no shared property). Pointer: the
section's `onPointerMove` writes normalised `pointerRef` (−1..1) read by the scene.
RM: no entrance timeline, no ScrollTrigger, no pointer handler, static SVG plan, readout and legend
still work (instant class toggles).

**Hover/focus.** Hovering a 3D node, or hovering/focusing a legend chip, sets the store's active id.
Pinned (Enter/Space or click) persists through pointer-out; Escape or clicking the empty stage
clears. Chips get `.is-active`; SVG groups get `.is-active` / `.is-dim`.

**Data attributes.** `data-mask` (h1), `data-hero-stage`, `data-node-id` (chips, SVG groups).

### 5.3 About — `src/components/About.jsx`

**Content:** `ABOUT.bio`, `ABOUT.photo`, `ABOUT.photoFallback`, `HERO.stats` (as "At a glance"),
`ABOUT.timeline` (5 rows), `ABOUT.chips`, `SITE.location`.

**Desktop.** `SectionHead index="01" title="About" aside="2023 – present"`. Then `.grid-12`:

- Cols 1–5: `<figure class="tilt">` → `<div class="tilt-layer relative"><div class="plate-back"
aria-hidden/><div class="plate" data-clip="left"><img data-clip-inner src={ABOUT.photo}
alt="Prem Raj" width=576 height=1024 class="aspect-[4/5] object-cover object-[center_12%]"
loading="eager" onError→photoFallback/></div></div>` + `<figcaption class="mono-label text-muted
mt-2 flex justify-between"><span>Prem Raj</span><span>{SITE.location}</span></figcaption>`.
  `useTilt(ref, { max: 4 })` drives `--rx/--ry`.
- Cols 7–12: `<p class="lede text-dim max-w-prose" data-reveal>{ABOUT.bio}</p>`; then
  `<dl class="mt-10 grid grid-cols-2 sm:grid-cols-4 border-y border-line" aria-label="At a glance"
data-stagger>` with `HERO.stats` cells (`<dd class="display-lg tabular">300+</dd><dt class="kicker
mt-1">DSA problems</dt>`; static values, no count-up); then the timeline as a plain list
  **[W: no revision-history table]**: `<ol class="mt-10 border-t border-line" data-stagger>` of
  rows `grid grid-cols-[6rem_minmax(0,1fr)] gap-4 py-4 border-b border-line` →
  `<span class="mono-label text-accent tabular">{year}</span>` / `<p class="font-medium text-ink">
{label}</p><p class="small text-muted">{place}</p>`; then `<ul class="mt-8 flex flex-wrap gap-2"
aria-label="Quick facts">` of `.chip`s from `ABOUT.chips`. **[W: Experience distance]** About is
  bio + glance + 5-row list + chips — about one viewport tall on desktop.

**Mobile.** Portrait first (max-width 22rem, centred), then bio, glance 2×2, timeline, chips.

**Motion.** `data-clip="left"` wipe on the portrait, `data-reveal` on bio, `data-stagger` on glance
and timeline, `data-parallax="-16"` on the figure vs text. Tilt: CSS transform via `--rx/--ry`
written by `useTilt` (rAF-lerped, hover-capable devices only). RM/touch: `useTilt` writes nothing;
everything static and visible.

### 5.4 Experience — `src/components/Experience.jsx`

**Content:** `EXPERIENCE[]` (`role, company, companyUrl, affiliation, affiliationUrl, place, period,
badge, points, clients[], stills[], stack[]`), `PROJECTS` not needed. Order is content.js order:
Plancover, Droot, Freelance, Coding Bits.

**Desktop.** `SectionHead index="02" title="Experience" aside={`${EXPERIENCE.length} roles · 2025 –
present`}`. `.grid-12`:

- Cols 1–4, `lg:sticky lg:top-24 self-start`: `<nav aria-label="Roles">` of 4 anchors
  `#exp-plancover`, `#exp-droot`, `#exp-freelance`, `#exp-coding-bits` (ids derived from
  `company ?? role` slug) in `.mono-label`: `2.1 Plancover`, `2.2 Droot Private Limited`,
  `2.3 Freelance`, `2.4 Coding Bits`; the entry in view has a 2px accent left rule
  (`.is-active`, IntersectionObserver `rootMargin: "-40% 0px -50% 0px"`); CSS transitions the rule.
- Cols 5–12: four `<article class="card p-6 sm:p-8" id=…>` stacked with 1.5rem gap, each:
  - Header row (`flex flex-wrap justify-between gap-4`): left `<h3 class="title-md">{role}</h3>` and
    `<p class="small text-dim mt-1">` company (link if `companyUrl`) + (affiliation ? `·` +
    affiliation link : "") ; right `<p class="mono-label text-muted">{place ? place + " · " : ""}{period}</p>`
    - `<span class="chip">{badge}</span>`.
  - Body: `<ol class="mt-6 border-t border-line">` of points, each
    `grid grid-cols-[2rem_minmax(0,1fr)] gap-4 py-3 border-b border-line body text-dim` with a
    `mono-xs text-muted tabular` index `01, 02…`.
  - Freelance: no `points`; two client blocks `<section aria-label={client.name}>` with
    `<h4 class="small font-medium"><a href={url}>{name} ↗</a></h4>` and its own indexed list; after
    both, `<ul class="mt-6 grid grid-cols-2 gap-3">` of the two `stills` as `.plate` images
    (1024×576, `alt`, lazy).
  - Footer (`mt-6 flex gap-2`, omitted when `stack` is empty/undefined): the `stack` ids rendered as
    `<Glyph kind={NODE_KIND[id]} title={node.label} />` 20px icons with a `mono-xs` list of names
    in `sr-only` — the hero vocabulary reused.
  - **Plancover** **[W: Plancover]**: `<article class="card-dashed …">` header row only, with a 2px
    accent rule under the header (`border-bottom: 2px solid var(--accent)` on the header wrapper)
    and `<span class="chip text-accent border-accent">Current</span>` beside the badge. No `<ul>`,
    no `<ol>`, no footer glyph row, no placeholder sentence. The card closes after the header.
- All four cards are at full contrast at all times **[W: do not dim roles]**.

**Mobile.** Rail becomes a plain `<ul>` of role headings above the cards (not sticky). Cards
single column; stills 2-up; header row wraps (period under role).

**Motion.** Cards `data-reveal` (clip wipe) — no rotateX entrances; lists `data-stagger`. Stills:
`.tilt` container with `useTilt({max:3})`, no fan. RM: static.

### 5.5 Projects ("Work") — `src/components/Projects.jsx`

**Content:** `PROJECTS` filtered `featured === true` (5) as figures; `featured === false` (2) as the
"Also on GitHub" list. Fields: `num, title, type, tech[], desc, imgs[], live, github`.

**Desktop.** `SectionHead index="03" title="Work" aside="5 figures"`. Five `<article>` rows separated
by hairlines, each `.grid-12 items-center py-16`; odd rows figure cols 1–7 / spec cols 8–12, even
rows mirrored (`lg:order-2`).

- Figure: `<figure class="tilt" data-parallax="-20">` → `<div class="tilt-layer relative">`
  `<div class="plate-back" aria-hidden/>` + `<div class="plate" data-clip="up"><img src={imgs[0]}
alt={`${title} interface`} width=1024 height=576 class="aspect-[16/9] object-cover object-top"
  loading="lazy"/></div>`; beneath, `<ul class="mt-2 grid grid-cols-2 gap-2">` of `imgs[1..2]` as
  small `.plate`s (alt `${title} detail 1/2`). Exactly two planes (image + back plate) — the
three-plane stack is cut **[W: scope]**. `<figcaption class="mono-label text-muted mt-2">Fig. 0{n}
  · {type}</figcaption>`.
  - **Fig. 04 Automated Bank Statement Processing** has no images: its figure is
    `BankPipelineFigure`, a hand-authored inline SVG (viewBox `0 0 640 360`, hairline strokes
    `var(--edge-ink)`, mono `<text>` labels, one accent dot) drawing the pipeline stated in `desc`
    and `tech`: `Gmail API` → `PyPDF` (PDF extraction) → `BeautifulSoup4` (classification) →
    `SHA-256 dedupe` → `CustomTkinter app` with a side node `macOS launchd daemon` and a footer
    label `PyInstaller build`. `<title>`/`<desc>` present. The `tech` array is also typeset as text in
    the spec column (so the SVG carries no exclusive information). No other project gets a
    mini-architecture **[W: per-project SVGs not generable]**.
- Spec column: `<p class="kicker">Fig. 0{n} · {type}</p>`, `<h3 class="title-md mt-3">{title}</h3>`,
  `<p class="body text-dim mt-4">{desc}</p>`, `<p class="mono-label text-muted mt-5">{tech.join(" · ")}</p>`,
  links row `mt-6 flex gap-6`: `live` → `<a class="link-accent focus-ring link-underline">Live ↗</a>`,
  `github` → `Code ↗`; omit when null (Yashoda: Live only; Bank Statement: Code only). No dialog, no
  "Open file" button.
- After the five figures: `<div class="mt-16 border-t border-line pt-6">` with
  `<h3 class="kicker">Also on GitHub — public repos, not on the resume</h3>` and a two-row
  hairline list (title · type · tech · Live/Code links) for Spotify Web Clone and CRUD Application.
  No imagery, no "appendix" wording **[W: appendix framing]**.

**Mobile.** Figure above spec, full width; sub-images 2-up; back plate offset 6px; no tilt.

**Motion.** `data-clip="up"` on main plates, `data-reveal` on spec text, `data-parallax="-20"` on
the figure (scrub), `useTilt({max:5})` on hover-capable devices. BankPipelineFigure paths draw in
once via GSAP `stroke-dashoffset` inside the component's own `useGSAP` (matchMedia no-preference).
RM: all static; SVG fully drawn.

### 5.6 Skills — `src/components/Skills.jsx`

**Content:** `SKILLS[]` (`title, items[], proof?`), `COMPETITIVE`. Presentation order constant in
the component (content.js untouched) **[W: skills order]**:

```js
const ORDER = [
  "AI",
  "Backend",
  "Messaging",
  "Databases",
  "Integrations",
  "Security",
  "Testing",
  "DevOps",
  "Languages",
  "Frontend",
  "Core CS",
  "Tools",
]
```

(strings must equal the `title` fields exactly). Glyph per group:
`AI → "glass"`, `Backend → "box"`, `Messaging → "queue"`, `Databases → "db"`, `Integrations →
"ring"`, `Frontend → "card"`, others → `"square"` (hairline square). Groups that map to a hero node
carry `data-node-id`: AI → `llm`, Backend → `fastapi`, Messaging → `bus`, Databases → `neo4j`,
Integrations → `webhook`, Frontend → `client`.

**Desktop.** `SectionHead index="04" title="Skills" aside={`${total} items · ${SKILLS.length}
groups`}`. One-line intro `.small text-muted`: "Grouped as a bill of materials; items are those used
in the work above." Then `<table class="w-full border-t border-line-strong">` with `<caption class="sr-only">Skills by group</caption>`:
columns `Ref` (mono-xs `4.01`…`4.12`), glyph (20px, `aria-hidden`), `Group` (`<th scope="row">`
title in `small font-medium`), `Items` (mono-label `items.join(" · ")`, wraps), `Evidence` (only
for AI / Backend / Frontend: `<a href="#work">` 96×54 `.plate` thumbnail from `proof.src` with
`alt=proof.alt`, caption `mono-xs`). Rows `border-b border-line py-4`. The first three rows (AI,
Backend, Messaging) have `bg-surface` to read as raised. Footnote row `4.13`:
`Problem solving — ${COMPETITIVE.count} problems on ${COMPETITIVE.platforms}: ${topics.join(" · ")}`.
Hovering a row with `data-node-id` sets the active node in the store (so scrolling back to the hero
shows it highlighted); `onMouseLeave` clears unless pinned.

**Mobile.** Each group is `<details class="border-b border-line">` with `<summary class="flex gap-3
py-4 small font-medium">` (glyph + title + `mono-xs` count); AI, Backend, Messaging `open` by
default **[graft: Rebalance]**. Evidence thumbs inline under the items.

**Motion.** Rows `data-stagger` (parent `<tbody>`). Thumbnails: CSS `translateY(-2px)` + shadow-lift
on hover. RM: static.

### 5.7 Credentials — `src/components/Credentials.jsx` (new)

**Content:** `SITE.education`, `CERTIFICATIONS.items`, `CERTIFICATIONS.certificatesUrl`,
`CERTIFICATIONS.leadership`, `HACKATHONS.items`, `HACKATHONS.certificatesUrl`.

**Desktop.** `SectionHead index="05" title="Credentials" aside="Education · Certifications ·
Hackathons"`. `.grid-12` with three columns (4/4/4), each `border-l border-line pl-6 first:border-0
first:pl-0`:

- 5.1 Education: `<h3 class="kicker">Education</h3>`, `<p class="title-md mt-3">{degree}</p>`,
  `<p class="small text-dim mt-2">{school}</p>`, `<p class="mono-label text-muted mt-2">{years} ·
CGPA {cgpa}</p>`.
- 5.2 Certifications: `<ol class="mt-3 border-t border-line">` of 5 rows (`mono-xs` index, title
  `small`, issuer `mono-xs text-muted`), then `<a class="link-accent link-underline focus-ring"
href={certificatesUrl}>All certificates ↗</a>`.
- 5.3 Hackathons: `<ul class="mt-3 border-t border-line">` of 4 rows: title `small`, team
  (`mono-xs text-muted`, when present), and for items with `img` a `<button type="button"
class="plate tilt-layer ml-auto w-24 focus-ring" aria-label={`View certificate: ${title}`}>` with
  the thumbnail (`alt=""` since the button is labelled). Wording is participation only: no
  "winner", "finalist" or placement words anywhere. Then `<a href={HACKATHONS.certificatesUrl}>
Hackathon certificates ↗</a>`.
- Row 5.4 across 12 cols, `mt-10 border-t border-line pt-4`: `<p class="small"><span class="font-medium">
{leadership.title}</span> — {leadership.detail}</p>`.

**Dialog (`CertDialog`, Framer owns presence):** opening a certificate button renders
`<motion.div role="dialog" aria-modal="true" aria-labelledby={id}>` inside a fixed backdrop
(`bg-ink/60`), `.card shadow-lift max-w-3xl p-4`, with `<h3 id>` = hackathon title, the full
image (`alt={`${title} certificate`}`), and a 44×44 close button (`aria-label="Close"`) that
receives focus on open. Focus is trapped (Tab/Shift+Tab wrap), Escape and backdrop click close,
focus returns to the opener, body scroll locked while open. Transition 0.25s fade / 0.35s rise
(`motionTokens`); RM: instant.

**Mobile.** Columns stack with hairlines between; thumbnails 96px.

**Motion.** Columns `data-reveal` with 80ms stagger (`data-stagger` on the grid), certificate
thumbs `.tilt` ±5° on hover-capable devices with `.plate-back` at `--tz: -30px`. RM: static.

### 5.8 Contact — `src/components/Contact.jsx`

**Content:** `SITE.email`, `SITE.phone`, `SITE.phoneHref`, `SITE.github`, `SITE.githubHandle`,
`SITE.linkedin`, `SITE.linkedinHandle`, `SITE.location`, `SITE.resume`, `HERO.available`.

**Desktop.** `SectionHead index="06" title="Contact" aside={`${SITE.location}${HERO.available ? " ·
Open to work" : ""}`}`. `.grid-12`:

- Cols 1–7: `<a href={`mailto:${SITE.email}`} class="display-lg font-medium tracking-tight
link-underline focus-ring block [overflow-wrap:anywhere]">{SITE.email}</a>` — Instrument Sans 500
  at the h2 step **[W: typography hedge resolved]**, `overflow-wrap: anywhere` so it wraps at 320px
  **[W: 320px]**. Beneath: `mt-8 flex gap-3`: `.btn-primary` "Email" (mailto) and `.btn-ghost`
  "Download resume".
- Cols 9–12: `<dl class="border-t border-line">` rows `grid grid-cols-[5rem_minmax(0,1fr)_auto]
gap-4 py-4 border-b border-line items-center`: Email / Phone (tel:) / GitHub / LinkedIn /
  Location. Email and Phone rows carry a 44×44 `<button aria-label="Copy email">` /
  `"Copy phone number"` (lucide `Copy` → `Check`) that writes to the clipboard and shows "Copied"
  for 1.5 s (Framer `AnimatePresence mode="wait"` swap, 0.25s) and announces via a `sr-only`
  `role="status"` line **[graft: Rebalance]**. External rows show `ArrowUpRight`.

**Mobile.** Single column: email, buttons (full width), list.

**Motion.** `data-reveal` on the email block, `data-stagger` on the list. RM: static.

### 5.9 Footer — `src/components/Footer.jsx`

`<footer class="border-t border-line">` (no dark field). `.shell py-12`:

- Colophon figure: `<ArchitecturePlan compact />` at `max-w-[48rem]` with
  `<p class="mono-label text-muted mt-2">Fig. 0 (plan) — the same reference architecture, drawn.</p>`.
  Compact mode has no labels and no readout wiring (`interactive={false}`).
- Row `mt-10 flex flex-wrap justify-between gap-6`: left `<p class="small font-medium">Prem Raj</p>
  <p class="mono-xs text-muted mt-1">AI Software Developer · rev. 2026.10 · React, Vite, three.js ·
  © {year}</p>`; right `<nav aria-label="Footer">` of the six NAV links + GitHub / LinkedIn / Email
  (`.small link-underline`) and `<a href="#hero">Back to top</a>`.
- Motion: `data-stagger` on the link list only. The compact plan is static (no draw-in, no dots).

### 5.10 Loader — `src/components/Loader.jsx`

Keep the component; restyle: `fixed inset-0 z-[100] bg-bg flex items-center justify-center`,
content `<p class="mono-label text-muted">Prem Raj — AI Software Developer</p>` above a 7rem
hairline whose inner bar scales 0→1 (Framer, 0.5s). Auto-dismiss after 500 ms (RM: 80 ms) with a
0.35s fade (Framer `AnimatePresence`). `aria-hidden` while visible so it never announces. The
loader must not delay the hero's lazy import (the import is scheduled by Hero independently).

### 5.11 BackToTop — `src/components/BackToTop.jsx`

Becomes an anchor: `<motion.a href="#hero" aria-label="Back to top" class="btn-icon bg-bg fixed
bottom-6 right-6 z-40">` with lucide `ArrowUp` 18px, shown when `scrollY > 600` (Framer presence
fade/12px). As an `a[href^="#"]` it is handled by `useLenis`'s delegated click handler (smooth) and
by native jump under RM; the component no longer calls `window.scrollTo`.

---

## 6. 3D scenes

There is exactly one R3F scene on the site: the hero's `ArchitectureScene`. Everything else is DOM.
`@react-three/postprocessing` is not imported anywhere (remove any import; the dependency may stay
in package.json). Only APIs present in three 0.169 / fiber 8.18 / drei 9.122 are used; every drei
import below exists in the installed `node_modules/@react-three/drei/core` listing.

### 6.1 Data — `src/three/architecture.js` (pure data + pure helpers, no React, no three imports except `Vector3`/curves)

Exports:

```js
export const PAGE_BG = "#F7F7F5"
export const INK = "#80858C" // edges
export const ACCENT = "#1E3DF0"
export const TIER_Z = { ingress: 2.4, compute: 0, state: -2.4 }

export const NODES = [
  // id, kind, pos [x, y(centre), z], label, short, detail, sources[]
  {
    id: "client",
    kind: "card",
    pos: [-4.0, 0.42, 2.4],
    label: "React client",
    short: "Client",
    detail:
      "Web front ends for the AI Project Estimator, the Dasgupta Maiti portal and the Yashoda Bhawan system",
    sources: ["AI Project Estimator", "Dasgupta Maiti Portal", "Yashoda Bhawan System"],
  },
  {
    id: "webhook",
    kind: "ring",
    pos: [-1.5, 0.08, 2.6],
    label: "Webhook ingress",
    short: "Webhooks",
    detail: "WhatsApp Cloud API and Meta Business API webhooks for Slnko Energy",
    sources: ["Droot Private Limited"],
  },
  {
    id: "socket",
    kind: "capsule",
    pos: [1.0, 0.13, 2.6],
    label: "Socket.IO",
    short: "Socket.IO",
    detail: "Real-time messaging worked on at Droot",
    sources: ["Droot Private Limited"],
  },
  {
    id: "node-api",
    kind: "box",
    pos: [-2.5, 0.25, 0],
    label: "REST API · Node + Express",
    short: "Node API",
    detail:
      "MERN and MySQL back ends for Dasgupta Maiti & Associates and Yashoda Bhawan; REST APIs at Droot",
    sources: ["Dasgupta Maiti Portal", "Yashoda Bhawan System", "Droot Private Limited"],
  },
  {
    id: "fastapi",
    kind: "box",
    pos: [0, 0.25, 0],
    label: "FastAPI service",
    short: "FastAPI",
    detail: "Multi-agent estimation service for the AI Project Estimator",
    sources: ["AI Project Estimator"],
  },
  {
    id: "bus",
    kind: "queue",
    pos: [2.6, 0.3, 0.6],
    label: "Kafka / Redis Pub/Sub",
    short: "Message bus",
    detail: "Event-driven messaging and message queues",
    sources: ["Skills"],
  },
  {
    id: "agents",
    kind: "cluster",
    pos: [4.2, 0, 0],
    label: "Multi-agent orchestrator",
    short: "Agents",
    detail: "Gemini-backed agents producing cost, timeline, risk and architecture reports",
    sources: ["AI Project Estimator"],
  },
  {
    id: "rag",
    kind: "box-sm",
    pos: [1.6, 0.2, -1.2],
    label: "LangChain RAG retriever",
    short: "RAG",
    detail: "Knowledge Graph-augmented RAG for Slnko Energy with graph-aware semantic search",
    sources: ["Droot Private Limited"],
  },
  {
    id: "llm",
    kind: "glass",
    pos: [4.2, 1.35, -1.2],
    label: "LLM",
    short: "LLM",
    detail: "Gemini AI in the Estimator; LLMs in the Slnko Energy RAG",
    sources: ["AI Project Estimator", "Droot Private Limited"],
  },
  {
    id: "mongo",
    kind: "db",
    pos: [-3.0, 0.35, -2.4],
    label: "MongoDB Atlas",
    short: "MongoDB",
    detail: "Estimator report store; Dasgupta Maiti portal data",
    sources: ["AI Project Estimator", "Dasgupta Maiti Portal"],
  },
  {
    id: "mysql",
    kind: "db",
    pos: [-1.4, 0.35, -2.4],
    label: "MySQL",
    short: "MySQL",
    detail: "Yashoda Bhawan hostel system via Sequelize",
    sources: ["Yashoda Bhawan System"],
  },
  {
    id: "neo4j",
    kind: "graph",
    pos: [1.2, 0.55, -2.6],
    label: "Neo4j graph",
    short: "Neo4j",
    detail: "Knowledge graph for the Slnko Energy RAG",
    sources: ["Droot Private Limited"],
  },
  {
    id: "pinecone",
    kind: "lattice",
    pos: [3.0, 0.4, -2.6],
    label: "Pinecone index",
    short: "Pinecone",
    detail: "Vector index for the Slnko Energy RAG",
    sources: ["Droot Private Limited"],
  },
]

export const EDGES = [
  // from, to, async (dashed), offset (lateral shift in units, for return paths)
  { from: "client", to: "node-api", async: false },
  { from: "client", to: "fastapi", async: false },
  { from: "webhook", to: "node-api", async: false },
  { from: "node-api", to: "socket", async: false },
  { from: "socket", to: "client", async: false, offset: 0.15 },
  { from: "node-api", to: "bus", async: true },
  { from: "fastapi", to: "bus", async: true },
  { from: "bus", to: "agents", async: true },
  { from: "fastapi", to: "agents", async: false, offset: -0.2 },
  { from: "agents", to: "llm", async: false },
  { from: "llm", to: "agents", async: false, offset: 0.18 },
  { from: "fastapi", to: "mongo", async: false },
  { from: "node-api", to: "mysql", async: false },
  { from: "node-api", to: "mongo", async: false, offset: 0.15 },
  { from: "rag", to: "neo4j", async: false },
  { from: "rag", to: "pinecone", async: false },
  { from: "rag", to: "llm", async: false, offset: -0.18 },
]
```

Honesty rules **[W: composite honesty]**: `sources` strings must each equal a `PROJECTS[].title`, an
`EXPERIENCE[].company`, or the literal `"Skills"`. The bus is Skills-only and says so. The RAG
retriever node exists so that Neo4j/Pinecone/LLM edges belong to Droot and FastAPI/agents/LLM edges
belong to the Estimator — no edge implies the Estimator used Neo4j or that Droot ran Kafka. The
`detail` strings above are the only copy allowed in the readout. `sourceLabel` (derived) =
`sources.join(" · ")`.

Other exports:

- `NODE_BY_ID` (map), `NODE_KIND` (id → kind), `GLYPH_KINDS = ["card","ring","capsule","box","box-sm","queue","cluster","glass","db","graph","lattice","square"]`.
- `GRAPH_INNER = { points: [[0,0.18,0],[0.22,0.05,0.1],[-0.2,0.08,0.12],[0.1,-0.16,0.2],[-0.12,-0.14,-0.18],[0.2,-0.02,-0.22],[-0.24,-0.02,-0.05]], links: [[0,1],[0,2],[1,3],[2,4],[1,5],[2,6],[3,5],[4,6],[0,5]] }` (7 spheres, 9 links inside the Neo4j wireframe).
- `routeEdge(fromNode, toNode, offset = 0)` → `THREE.CurvePath` of `LineCurve3` segments with
  `QuadraticBezierCurve3` fillets (radius 0.25): start anchor `A = (f.x, ay, f.z)`, end anchor
  `B = (t.x, by, t.z)` where `ay = f.y > 0.6 ? f.y - 0.5 : 0.12` (same for `by`); if either anchor
  is above 0.12, the path begins/ends with a vertical segment to/from `y = 0.12`; the horizontal
  route runs along x first, then z (`offset` shifts the z-run laterally in x, and the x-run in z);
  when `|dx| < 0.3` or `|dz| < 0.3` the corresponding run is omitted (no fillet). Pure; unit-tested.
- `edgeSamples(edge, n = 64)` → `Float32Array` of `getSpacedPoints(n)` flattened, memoised per
  edge; packets lerp between samples (never `getPointAt` per frame) **[W: perf]**.
- `PACKETS_STATIC = [ {edge: 0, t: 0.35}, {edge: 1, t: 0.7}, {edge: 5, t: 0.5}, {edge: 7, t: 0.2}, {edge: 9, t: 0.6}, {edge: 11, t: 0.45}, {edge: 14, t: 0.3}, {edge: 15, t: 0.8} ]` — eight committed positions for the lite tier **[graft: Rebalance]**.
- `PLAN_PROJECTION = { angle: 0, scale: 56, pad: 48 }` — the SVG plan is a true top-down view:
  `sx = pad + (x + 4.6) * scale`, `sy = pad + (-z + 3.0) * scale` (viewBox `0 0 560 400`).

### 6.2 Packets — `src/three/packets.js` (pure; unit-tested)

```js
export function createPackets(edges, count, rng = seeded(7))  // → [{ edge, t, speed, hold, alive }]
export function stepPackets(state, dt, hooks)                   // mutates; hooks.onArrive(nodeId), hooks.onLlmHold()
```

Rules: `speed` uniform in `0.10–0.18` units/s (slower than Fig. 0's draft) **[W: packets]**;
`t += speed * dt / edgeLength`; at `t ≥ 1` call `onArrive(edge.to)`; if `edge.to` is `"llm"` the
packet holds `0.6 s` then respawns on the first edge whose `from` is `"llm"`; otherwise it respawns
at a random edge with `t = 0`. Packets never spawn on async edges more than 30 % of the time (so the
bus is not the busiest path). Desktop count 20, lite tier 0 (static positions used instead).

### 6.3 Scene — `src/three/ArchitectureScene.jsx`

Default export `ArchitectureScene({ tier, eventSource, progressRef, pointerRef, onReady })`:

- `tier`: `"full" | "lite"`.
- `eventSource`: ref to `section#hero` (DOM) so raycasting works while the canvas wrapper is
  `pointer-events: none` **[W: OrbitControls vs scroll — there are no OrbitControls]**.
- `progressRef.current` 0..1 hero scroll progress (written by GSAP in Hero.jsx).
- `pointerRef.current = { x, y }` normalised −1..1 (written by Hero.jsx's pointermove; `{0,0}` on leave).
- `onReady()` called from `Canvas onCreated` after the first frame (Hero crossfades the plan out).

Imports: `Canvas, useFrame, useThree` from fiber; `PerspectiveCamera, Grid, ContactShadows,
Environment, Lightformer, Edges, Line, MeshTransmissionMaterial, PerformanceMonitor` from drei;
`* as THREE` from three; `NODES, EDGES, routeEdge, edgeSamples, GRAPH_INNER, PAGE_BG, INK, ACCENT,
PACKETS_STATIC` from `./architecture.js`; `createPackets, stepPackets` from `./packets.js`;
`activeNodeStore` from `../lib/activeNodeStore.js`.

Canvas (exact props):

```jsx
<Canvas
  dpr={tier === "full" ? [1, 1.5] : 1}
  flat
  frameloop={frameloop}               // state: "always" | "demand" | "never" (see Frameloop)
  gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
  eventSource={eventSource}
  eventPrefix="client"
  onCreated={({ gl }) => { gl.setClearAlpha(0); onReady?.() }}
  style={{ position: "absolute", inset: 0 }}
>
```

(`camera={false}` is not a valid prop — the default camera is replaced by `<PerspectiveCamera makeDefault>` **[W: spec slips]**.)

Scene graph:

1. `<PerspectiveCamera makeDefault fov={24} near={1} far={60} position={[13, 10.5, 13]} />`;
   `camera.lookAt(0.4, 0.4, 0)` each frame. `fitDistance = 21 * Math.max(1, 1.15 / aspect)` applied
   on resize by scaling the base position vector; the plan-view end position is `[6, 21, 6]` scaled
   the same way.
2. `<group ref={rig}>` — the whole diagram; `rotation.y = sway + yaw`, `rotation.x = pitch` where
   `sway = sin(t * 2π / 14) * 0.05`, `yaw = damp(yaw, pointer.x * 0.10, 4, dt)`, `pitch = damp(pitch,
-pointer.y * 0.045, 4, dt)`. Pointer parallax replaces OrbitControls (±6° / ±2.5°).
3. Ground: `<Grid args={[14, 10]} cellSize={0.5} cellThickness={0.6} cellColor="#E6E8E4"
sectionSize={2.5} sectionThickness={1} sectionColor="#D0D3CE" fadeDistance={22} fadeStrength={1.5}
position={[0.4, -0.001, 0]} />` (not infinite).
4. `<ContactShadows frames={1} resolution={tier === "full" ? 512 : 256} scale={16} blur={2.2} far={3}
opacity={0.3} position={[0.4, 0, 0]} />` — baked once; nodes never move after the entrance (the
   entrance runs the shadow with `frames={1}` after it completes: render shadows only once
   `entranceDone` is true by mounting the component then).
5. Lights: `<ambientLight intensity={0.55} />`, `<directionalLight position={[5, 8, 3]} intensity={1.1} />`.
   No shadow maps.
6. `full` tier only: `<Environment resolution={64} frames={1}>` with three `<Lightformer>`s
   **[graft: Octet]**: `form="rect" intensity={1.2} scale={[4, 4, 1]} position={[0, 5, 0]}
rotation-x={-Math.PI / 2}`; `form="rect" intensity={0.6} scale={[2, 6, 1]} position={[-5, 2, 0]}
rotation-y={Math.PI / 2}`; dark card `form="rect" intensity={1} color="#0B0D10" scale={[6, 2, 1]}
position={[0, 1, -6]}`. It exists only to give the glass something to refract; toon materials
   ignore it.
7. Solids material **[W: white-on-white form]** — deterministic three-tone shading via
   `MeshToonMaterial` with a 3-step `gradientMap` **[graft: General Arrangement]**:

   ```js
   const gradient = new THREE.DataTexture(new Uint8Array([225, 240, 255]), 3, 1, THREE.RedFormat)
   gradient.minFilter = gradient.magFilter = THREE.NearestFilter
   gradient.needsUpdate = true
   // per node: new THREE.MeshToonMaterial({ color: "#FFFFFF", gradientMap: gradient, emissive: ACCENT, emissiveIntensity: 0 })
   ```

   Target face tones on the page: lit faces ≈ `#FFFFFF`, mid ≈ `#ECEEEA`, shadow ≈ `#E3E5E0`;
   tune `ambientLight`/`directionalLight` intensities inside this file until the three tones land
   within ±4 hex of those targets on a non-retina display. Each node owns its material instance so
   `emissiveIntensity` can pulse (0 → 0.22, decays ×0.90 per frame). Every solid gets
   `<Edges threshold={25} color={INK} />` (drei Edges in 9.122 renders Line2 — pass `lineWidth={1}`).

8. Node geometry by `kind` (one geometry instance per kind, shared via `useMemo`):
   - `card`: `RoundedBoxGeometry` via drei `RoundedBox args={[1.2, 0.75, 0.06]} radius={0.03}`
     (standing; thin on z).
   - `ring`: `torusGeometry args={[0.42, 0.05, 12, 48]}` `rotation-x={Math.PI / 2}`.
   - `capsule`: `capsuleGeometry args={[0.12, 0.6, 4, 12]}` `rotation-z={Math.PI / 2}`.
   - `box`: `RoundedBox args={[1.0, 0.5, 1.0]} radius={0.04}`; `box-sm`: `[0.8, 0.4, 0.8]`.
   - `queue`: `cylinderGeometry args={[0.28, 0.28, 2.4, 32]}` `rotation-z={Math.PI / 2}` (Edges show
     the end caps).
   - `cluster`: plinth `RoundedBox args={[0.9, 0.08, 0.9]} radius={0.01}` at local y 0.04 plus three
     `RoundedBox args={[0.3, 0.3, 0.3]} radius={0.02}` at `[-0.25, 0.23, 0.2]`, `[0.25, 0.23, 0.2]`,
     `[0, 0.23, -0.22]`.
   - `glass`: `icosahedronGeometry args={[0.5, 0]}` — see 6.3.1.
   - `db`: `cylinderGeometry args={[0.42, 0.42, 0.7, 32]}`.
   - `graph`: `<mesh><icosahedronGeometry args={[0.5, 1]} /><meshBasicMaterial wireframe color={INK} /></mesh>`
     plus `<instancedMesh args={[undefined, undefined, 7]}>` of `sphereGeometry [0.05, 8, 6]` with
     `meshToonMaterial` (white, same gradient) at `GRAPH_INNER.points`, plus one `<lineSegments>`
     built from `GRAPH_INNER.links` with `lineBasicMaterial color={INK}`. The highlight target is
     the wireframe mesh (raycast on an invisible `sphereGeometry [0.55]` proxy).
   - `lattice`: `<points>` with a `BufferGeometry` of 5×5×5 = 125 positions spanning ±0.32 and
     `pointsMaterial size={0.035} color="#646A72" sizeAttenuation`, inside `<Edges>` of an invisible
     `boxGeometry [0.8, 0.8, 0.8]` (`<mesh visible={false}>` child Edges still render — use a mesh with
     `meshBasicMaterial transparent opacity={0}` plus Edges). Raycast proxy: that box.
     Raycasting: only the 13 node proxies/meshes raycast; `Grid`, `ContactShadows`, Lines, points,
     packets set `raycast={() => null}`.
9. Connectors: for each `EDGES[i]`, `<Line points={routeEdge(...).getSpacedPoints(48)} lineWidth={1.2}
color="#9A9F98" dashed={edge.async} dashSize={0.18} gapSize={0.1} transparent opacity={1} />`.
   Highlight state lerps `material.color` toward `ACCENT` (connected) or `#DADDDB` (others) and
   back to `#9A9F98`. Connector draw-in **[W: Line2 dashOffset fiddliness — decided now]**:
   connectors fade in by `opacity` 0 → 1 over 0.8 s starting at 0.6 s (no dashOffset animation).
10. Packets: `<instancedMesh args={[undefined, undefined, 20]} frustumCulled={false}
raycast={() => null}>` with `sphereGeometry args={[0.055, 8, 6]}` and `meshBasicMaterial
color={ACCENT} transparent` (`opacity = 1 - progress`). Per frame: `stepPackets(state, dt,
{ onArrive: pulse(nodeId) })`, position = lerp between `edgeSamples` neighbours, `setMatrixAt`,
    `instanceMatrix.needsUpdate = true`. Packets on the active node's connectors scale 1.4×.
    Lite tier: `count = 8`, matrices set once from `PACKETS_STATIC`, never stepped.
11. Active footprint: one `<mesh rotation-x={-Math.PI/2}><ringGeometry args={[0.55, 0.62, 48]} />
<meshBasicMaterial color={ACCENT} transparent opacity={0} /></mesh>` moved under the active node
    (opacity damped to 0.9), sized per kind (`queue` 1.35, `card` 0.75, others 0.6).

#### 6.3.1 The LLM material (time-boxed decision) **[W: glass spike]**

`const LLM_GLASS = true` at the top of the file. With `LLM_GLASS` and `tier === "full"`:

```jsx
<MeshTransmissionMaterial transmission={1} thickness={0.5} roughness={0.12} ior={1.45}
  chromaticAberration={0.012} anisotropicBlur={0.1} distortion={0} samples={glassSamples}
  resolution={glassResolution} background={new THREE.Color(PAGE_BG)} />
<Edges threshold={1} color={INK} lineWidth={1} />
```

Spike rule for the scene implementer: render it on #F7F7F5 within the first 15 minutes; if the
icosahedron reads as a grey smudge on a non-retina display, set `LLM_GLASS = false` and ship the
flat path: `MeshToonMaterial` white with `<Edges threshold={1}>` on every facet (the LLM stays the
only object lifted off the ground, so it remains the special node). `chromaticAberration` must stay
≤ 0.015 (no second hue). Lite tier always uses the flat path; `Environment` is not mounted in lite.

#### 6.3.2 PerformanceMonitor ladder (full tier) **[graft: The Trace]**

```jsx
<PerformanceMonitor flipflops={2} onDecline={step} onFallback={fallback} />
```

`step` #1: `glassResolution 512 → 384`, `glassSamples 6 → 4`, `dpr → 1`. `step` #2 / `fallback`:
`LLM_GLASS` state → false (flat icosahedron), `ContactShadows` stays (baked). Never add
postprocessing.

#### 6.3.3 Frameloop, scroll, entrance, highlight

- Frameloop: `full`: `"always"` while `#hero` is ≥ 5 % visible (IntersectionObserver threshold
  `[0, 0.05]`) and `document.visibilityState === "visible"`, else `"never"` **[mandatory]**.
  `lite`: `"demand"`; Hero calls the scene's `invalidate` via `useThree` inside a child that watches
  `progressRef` — simplest: a `<DemandDriver />` child reads `progressRef` each `useFrame` call and
  calls `invalidate()` from a `scroll` listener on `window` (passive) while the hero is visible.
- Scroll: in `useFrame`, `p = easeInOut(progressRef.current)`; `camera.position.lerpVectors(base,
plan, p)`; `lookAt(0.4, 0.4, 0)`; packet opacity `1 - progressRef.current`. Lite tier maps
  `progress` to `rig.rotation.y = 0.55 * progress` instead of a camera rise.
- Entrance (R3F clock, once, full tier only): nodes rise from `y - 0.6` with 40 ms stagger (0.9 s,
  cubic-out), connector opacity 0 → 1 from 0.6 s (0.8 s), packets spawn at 1.4 s, then
  `entranceDone = true` mounts `ContactShadows`. Lite tier: no entrance (everything at rest on first
  frame).
- Highlight: `useFrame` reads `activeNodeStore.getSnapshot().id`; per node lerp Edges colour toward
  `ACCENT` (active), `INK` (idle) or `#DADDDB` (dimmed while another is active); connectors as in
  item 9. Hover: `onPointerOver` on a node proxy → `setActive(id, { source: "scene" })` unless
  pinned; `onPointerOut` → schedule clear in 80 ms, cancelled if another node is entered (hysteresis)
  **[graft: Rebalance]**. `onClick` on a node → toggle pinned. `onPointerMissed` (Canvas prop) →
  `clear()` when not pinned. Nothing in the scene calls `setState` per frame.

### 6.4 Tiers, lazy loading, fallback — `src/hooks/useSceneTier.js` **[graft: Octet] [W: hook gating flash]**

```js
export function useSceneTier() // → "full" | "lite" | "static", computed synchronously
```

Initialiser (runs once, in `useState(() => …)`): `static` if `matchMedia("(prefers-reduced-motion:
reduce)").matches`, or WebGL probe fails (`canvas.getContext("webgl2") || getContext("webgl")`),
or `navigator.connection?.saveData`, or `innerWidth < 768`; else `lite` if `innerWidth < 1024` or
`navigator.hardwareConcurrency <= 4` or `navigator.deviceMemory <= 4`; else `full`. Effects
subscribe to the reduced-motion and `(min-width: 768px)` / `(min-width: 1024px)` media queries and
re-evaluate. `usePrefersReducedMotion` and `useWebGL` are likewise rewritten to initialise from
`matchMedia` / a synchronous probe inside their `useState` initialisers (guarded with `typeof window
!== "undefined"`), so no motion branch renders for a tick.

Hero mounting rule: when `tier !== "static"`, schedule `import("../three/ArchitectureScene.jsx")`
in `requestIdleCallback` (fallback `setTimeout(fn, 1)`) after the first effect; render
`<Suspense fallback={<ArchitecturePlan />}><ArchitectureScene … /></Suspense>` only after that
promise resolves (`const Scene = lazy(() => sceneImport)` where `sceneImport` is the cached promise).
If the import rejects (offline, blocked chunk) set `sceneFailed = true` and render
`<ArchitecturePlan />` at full opacity. Vite's `manualChunks.three` already isolates the chunk.

Phones (<768px) are `static` **[W: phone canvas]**: they get the SVG plan — same figure, zero
three.js download, legible labels. Tablets 768–1023 get `lite`: dpr 1, `frameloop="demand"`, 8
frozen packets, no `Environment`, no glass, no entrance, no PerformanceMonitor, `ContactShadows` 256.

### 6.5 SVG twin — `src/three/ArchitecturePlan.jsx`

`ArchitecturePlan({ compact = false, interactive = true })` renders an inline
`<svg viewBox="0 0 560 400" role="img" aria-labelledby="plan-title plan-desc">` generated from
`NODES`/`EDGES` via `PLAN_PROJECTION`: `<title id="plan-title">Fig. 0 — Reference architecture,
plan view</title>`, `<desc id="plan-desc">Composite diagram of thirteen components Prem Raj has
shipped or lists on his résumé: …labels joined…</desc>`; hairline orthogonal connectors (`stroke:
var(--edge-ink)`, `stroke-width: 1`, `stroke-dasharray: 6 4` for async) drawn from the same
`routeEdge` output projected to 2D; per node a `<g data-node-id={id} class="plan-node">` containing
the 2D glyph for its kind (`<use href="#glyph-…">` from `Glyph`'s symbol set, 28px) and, unless
`compact`, a `<text class="mono" font-size="11">` label (`short`) in `var(--muted)` — real,
selectable text. When `interactive`, the component subscribes to `activeNodeStore` and toggles
`.is-active`/`.is-dim` on the groups (instant, no transition) and sets `data-node-id` so legend
hover highlights it. Light grid: 14 vertical × 10 horizontal hairlines at `var(--grid-cell)`
behind everything. Under RM nothing animates; in the Footer `compact` hides labels. This component
has no three.js import (it only uses `routeEdge`, which may import `three` curves — to keep the
footer free of three, `routeEdge` lives in `architecture.js` and imports only
`three/src/extras/core/CurvePath.js`, `LineCurve3.js`, `QuadraticBezierCurve3.js`, `Vector3.js`;
Vite tree-shakes the rest. Verify the footer's chunk does not pull the whole `three` bundle; if it
does, duplicate a 40-line 2D router inside `ArchitecturePlan.jsx`).

### 6.6 Glyphs — `src/components/Glyph.jsx`

`GlyphDefs()` renders one hidden `<svg aria-hidden>` with a `<symbol id="glyph-{kind}" viewBox="0 0
24 24">` per `GLYPH_KINDS` entry (hairline strokes, `currentColor`, stroke-width 1.25):
`card` (standing rectangle 10×14), `ring` (circle r 7), `capsule` (rounded pill 16×7), `box`
(isometric cube), `box-sm` (smaller cube), `queue` (horizontal cylinder), `cluster` (three small
squares on a line), `glass` (hexagon with one inner line), `db` (vertical cylinder), `graph` (circle
with 4 inner dots joined), `lattice` (3×3 dot grid in a square), `square` (plain square).
`Glyph({ kind, title })` renders `<svg class="glyph"><use href={`#glyph-${kind}`} />{title &&
<title>{title}</title>}</svg>`. `GlyphDefs` is mounted exactly once, by
`Hero.jsx` (first child of `main`, so the symbols exist before any `<use>` further down the page);
`App.jsx` does not import it. Every other consumer (Experience footers, Skills rows,
ArchitecturePlan, the legend) renders only `<Glyph>` / `<use href="#glyph-…">`.

### 6.7 Active-node store — `src/lib/activeNodeStore.js` **[graft: Adjacency]**

```js
let state = { id: null, pinned: false, source: null }
const listeners = new Set()
export const activeNodeStore = {
  getSnapshot: () => state,
  subscribe: (fn) => (listeners.add(fn), () => listeners.delete(fn)),
  setActive(id, { pin = false, source = null } = {}) { /* no-op if unchanged */ … emit },
  clear({ force = false } = {}) { if (state.pinned && !force) return; … emit },
}
export function useActiveNode() { return useSyncExternalStore(activeNodeStore.subscribe, activeNodeStore.getSnapshot) }
```

Notifies only when `id` or `pinned` changes. DOM consumers (Hero legend, Skills rows,
ArchitecturePlan) use `useActiveNode()`; the scene reads `getSnapshot()` in `useFrame` without
subscribing. Hero's single DOM effect toggles `.is-active` on all `[data-node-id]` chips via one
`querySelectorAll` pass per change.

### 6.8 Mobile / reduced-motion / no-WebGL summary

| condition                               | hero figure                    | three.js downloaded | motion                               |
| --------------------------------------- | ------------------------------ | ------------------- | ------------------------------------ |
| ≥1024, WebGL, no RM, decent hardware    | full scene                     | yes (idle-deferred) | entrance, packets, pointer, scrub    |
| 768–1023 or weak hardware, WebGL, no RM | lite scene (dpr 1, demand)     | yes                 | scroll-coupled rotation only         |
| <768                                    | `ArchitecturePlan` SVG         | no                  | DOM reveals only                     |
| RM (any width)                          | `ArchitecturePlan` SVG         | no                  | none; all content visible; Lenis off |
| no WebGL / saveData                     | `ArchitecturePlan` SVG         | no                  | DOM reveals allowed (not RM)         |
| chunk fails to load                     | `ArchitecturePlan` SVG (100 %) | attempted           | as per tier                          |

---

## 7. Motion rules

**Ownership (never animate one property with two libraries):**

- **GSAP (+ScrollTrigger)** owns everything scroll-driven and every one-shot entrance: the
  `useSectionReveal` attribute system, the hero entrance timeline, the hero scroll scrub
  (`progressRef` + wrapper `y`/`opacity`), `[data-parallax]` scrubs, header progress bars
  (`quickSetter`), the BankPipelineFigure draw-in. GSAP writes transforms only on elements that CSS
  never transitions (`.tilt-layer` is off-limits to GSAP).
- **Framer Motion** owns presence only: Loader exit, mobile nav sheet, CertDialog, BackToTop
  appearance, the Copy/Copied label swap. Tokens from `src/lib/motionTokens.js` (`ease
[0.22,1,0.36,1]`, `duration.fast 0.25 / base 0.45 / slow 0.7`).
- **CSS** owns hover/focus/active states (button fills, link underline draw 0.4s, chip `.is-active`,
  nav rule colour), the tilt transform (`.tilt-layer` reads `--rx/--ry/--tz` written by `useTilt`),
  thumbnail lift, canvas/plan crossfade (opacity transition 0.4s on a class), and the
  reduced-motion global clamp.
- **R3F `useFrame`** owns everything inside the canvas and only reads refs/store snapshots; it never
  sets React state per frame.

**Durations/easings:** reveals as in `useSectionReveal` (mask 1.05s expo.out; clip 0.95–1.15s
power3.out; line 1.05s; stagger 0.5s/0.04). Hero entrance: 0.3s delay, 1.05s expo.out lines,
0.65s body. Scrubs: `scrub: 0.6`. Hover transitions 0.25s `--ease-out`; tilt return 0.35s. Framer
presence 0.25–0.45s. Scene: damping λ 4 (pointer), emissive decay ×0.90/frame, LLM hold 0.6s.

**Reveal system:** keep `src/lib/useSectionReveal.js` as is (attributes in §3). Each section
component calls `useSectionReveal(sectionRef)` once. Initial hidden states only via GSAP.

**`useTilt(ref, { max = 4 })` — `src/hooks/useTilt.js`:** on `(hover: hover) and
(prefers-reduced-motion: no-preference)` only; `pointermove` on the `.tilt` element computes target
`rx = -(py) * max`, `ry = px * max` (deg), a rAF loop lerps (0.12) and writes `--rx/--ry` as CSS
custom properties; `pointerleave` targets 0 and the loop stops when settled (|Δ| < 0.01). Returns
nothing. Under RM/touch it attaches no listeners (identity).

**Lenis:** `useLenis` unchanged (desktop smooth wheel, anchors via delegated click handler, offset
−72, `ScrollTrigger.update` on scroll, disabled under RM). Add `ScrollTrigger.refresh()` on
`document.fonts.ready` (inside `useLenis` after the first rAF). The hero canvas wrapper is
`pointer-events: none`, so wheel events always reach Lenis **[W: wheel over canvas]**.

---

## 8. `src/data/content.js` changes (exact)

Apply in place; keep the file header comment and the inconsistency note.

1. **SITE**
   ```js
   role: "AI Software Developer",
   roleLong: "AI Software Developer",
   title: "Prem Raj — AI Software Developer",
   description:
     "Prem Raj — AI Software Developer. Backend systems and AI pipelines: knowledge-graph RAG, multi-agent services, event-driven integrations. Final-year B.Tech IT, GGSIPU New Delhi.",
   ```
   (all other SITE fields unchanged).
2. **NAV** → the array in §4.2.
3. **HERO** — replace the whole object:
   ```js
   export const HERO = {
     available: true,
     /** Every noun traces to a resume line: Droot KG-RAG (LangChain, Neo4j, Pinecone), AI Project
      *  Estimator (FastAPI multi-agent), Skills: Event-Driven Architecture / Webhooks / Socket.IO,
      *  Dasgupta Maiti production platform. */
     lede: "I design backend systems and AI pipelines — RAG over knowledge graphs, multi-agent services, event-driven integrations — and ship them to production.",
     /** Four capability cells; each detail is a verbatim skill or project tech item. */
     specPlate: [
       { index: "01", title: "Knowledge-graph RAG", detail: "LangChain · Neo4j · Pinecone" },
       { index: "02", title: "Multi-agent systems", detail: "FastAPI · Gemini AI" },
       {
         index: "03",
         title: "Event-driven integrations",
         detail: "WhatsApp Cloud API · Webhooks · Socket.IO",
       },
       { index: "04", title: "Production", detail: "MERN platform · 100+ users · 99%+ uptime" },
     ],
     /** Counts are appended at render time from src/three/architecture.js. */
     figureCaption:
       "Fig. 0 — Reference architecture. Composite of components from shipped work (Slnko Energy RAG, AI Project Estimator, Dasgupta Maiti portal, Yashoda Bhawan).",
     stats: [
       { value: "300+", label: "DSA problems" },
       { value: "8.0", label: "CGPA" },
       { value: "2027", label: "Graduating" },
       { value: "2", label: "Freelance clients" },
     ],
   }
   ```
   (`roles` and `summary` are removed; `useTypewriter.js` is deleted.)
4. **PROJECTS** — delete every `color` field (one accent only). Nothing else changes.
5. **EXPERIENCE** — replace the whole array:
   ```js
   export const EXPERIENCE = [
     {
       role: "AI Engineer Intern",
       company: "Plancover",
       companyUrl: null,
       place: "Gurgaon",
       period: "Oct 2026 – Present",
       badge: "Internship",
       /** No bullet points exist yet; the card renders header-only (no placeholder prose). */
       points: [],
     },
     {
       role: "Tech Intern",
       company: "Droot Private Limited",
       companyUrl: "https://www.droot.com/",
       affiliation: "Slnko Energy Pvt. Ltd.",
       affiliationUrl: "https://www.slnkoenergy.com/",
       place: "Noida",
       period: "Jul 2026 – Sep 2026",
       badge: "Internship",
       points: [/* the four existing Droot bullets, verbatim */],
       /** Hero-diagram node ids named in the bullets above (src/three/architecture.js). */
       stack: ["rag", "neo4j", "pinecone", "llm", "webhook", "socket", "node-api"],
     },
     {
       role: "Freelance Full-Stack Developer",
       company: null,
       period: "Nov 2025 – Jan 2026",
       badge: "Freelance",
       points: [],
       clients: [/* unchanged two client blocks */],
       stills: [
         {
           src: "/photos/dasgupta-main.png",
           alt: "Dasgupta Maiti portal interface",
           caption: "Dasgupta Maiti & Associates",
         },
         {
           src: "/photos/yashoda-main.png",
           alt: "Yashoda Bhawan system interface",
           caption: "Yashoda Bhawan",
         },
       ],
       stack: ["client", "node-api", "mongo", "mysql"],
     },
     {
       role: "Frontend Developer Intern",
       company: "Coding Bits",
       period: "June 2025 – July 2025",
       badge: "Internship",
       points: [/* unchanged two bullets */],
       stack: ["client"],
     },
   ]
   ```
   All `visual` fields are removed.
6. **ABOUT** — replace `bio`, remove `pullQuote`, replace `timeline`:
   ```js
   bio: "I'm Prem Raj, a final-year B.Tech Information Technology student at Bhagwan Parshuram Institute of Technology, GGSIPU, graduating in 2027. I design and build backend systems and AI applications — knowledge-graph RAG pipelines, multi-agent services and event-driven integrations — and have shipped production full-stack platforms for real clients with React, Node.js, Express, FastAPI, MongoDB and MySQL.",
   timeline: [
     { year: "2023", label: "Started B.Tech IT", place: "BPIT, GGSIPU, New Delhi" },
     { year: "Jun 2025", label: "Frontend Developer Intern", place: "Coding Bits" },
     { year: "Nov 2025", label: "Freelance Full-Stack Developer", place: "Dasgupta Maiti & Associates · Yashoda Bhawan" },
     { year: "Jul 2026", label: "Tech Intern (Jul – Sep 2026)", place: "Droot / Slnko Energy, Noida" },
     { year: "Oct 2026", label: "AI Engineer Intern", place: "Plancover, Gurgaon" },
   ],
   ```
   `photo`, `photoFallback`, `chips` unchanged.
7. **TRAVEL** — delete the export and its comment block entirely.
8. **CORE_STACK** — keep (unused by the UI after Marquee removal; harmless) or delete; if deleted,
   grep for imports first.

Unchanged: `PROJECTS` content (except `color`), `COMPETITIVE`, `CERTIFICATIONS`, `HACKATHONS`,
`SKILLS`.

---

## 9. `index.html` changes (exact)

- `<title>Prem Raj — AI Software Developer</title>`
- `<meta name="description" content="Prem Raj — AI Software Developer. Backend systems and AI pipelines: knowledge-graph RAG, multi-agent services, event-driven integrations. Final-year B.Tech IT, GGSIPU New Delhi.">`
- `<meta name="theme-color" content="#F7F7F5">`
- OG/Twitter: `og:title` and `twitter:title` = "Prem Raj — AI Software Developer";
  `og:description`/`twitter:description` = "Backend systems and AI pipelines — knowledge-graph RAG, multi-agent services, event-driven integrations. Final-year B.Tech IT, GGSIPU New Delhi."; keep
  `og:image`/`twitter:image` = `/photos/profile-professional.jpg`, `og:type`, `og:url`, canonical.
- Inline style: `html, body, #root { width: 100%; min-height: 100%; background: #f7f7f5; }`.
- Add preconnects: `<link rel="preconnect" href="https://fonts.googleapis.com">`,
  `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
- Favicon (data URI SVG, a hairline box glyph with an ultramarine packet):
  `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect x='5.5' y='9.5' width='21' height='15' rx='1' fill='%23F7F7F5' stroke='%2315171A' stroke-width='1.5'/%3E%3Cpath d='M5.5 15.5h21' stroke='%2315171A' stroke-width='1.5'/%3E%3Ccircle cx='16' cy='15.5' r='2.6' fill='%231E3DF0'/%3E%3C/svg%3E`
- Keep `lang="en"`, viewport, author.

---

## 10. Testing specification

### 10.1 Unit (vitest) — new files

- `src/three/architecture.test.js` **[graft: Adjacency]**: every `NODES[].sources[]` entry equals a
  `PROJECTS[].title`, an `EXPERIENCE[].company`, or `"Skills"`; every `EDGES[].from/to` is a node id;
  node ids unique; `NODES.length === 13`; `EDGES.length === 17`; `routeEdge` returns a path whose
  first point is at the `from` anchor and last point at the `to` anchor (±1e-6) and whose
  `getLength()` is finite; `edgeSamples(edge, 64).length === 65 * 3`; every `PACKETS_STATIC.edge`
  is a valid index and `0 ≤ t ≤ 1`; every `EXPERIENCE[].stack[]` id exists in `NODES`.
- `src/three/packets.test.js`: `createPackets` returns `count` packets with speeds in range;
  `stepPackets` advances `t`, calls `onArrive` with `edge.to` on arrival, holds 0.6 s at `llm` then
  respawns on an edge whose `from === "llm"`; is deterministic for a fixed seed.
- `src/lib/activeNodeStore.test.js`: notifies only on change; `clear()` respects `pinned`;
  `clear({force:true})` always clears.
- Keep `src/env.smoke.test.js`.

### 10.2 e2e — rewrite `e2e/smoke.spec.js` (Chromium project as configured; add a second project

`{ name: "reduced-motion", use: { ...devices["Desktop Chrome"], reducedMotion: "reduce" } }` to
`playwright.config.js`, and scope the RM test to it with `test.skip(project !== "reduced-motion")`
or by filename; the simplest is `page.emulateMedia({ reducedMotion: "reduce" })` inside that test
as today — either is acceptable as long as it runs).

Tests (each `page.goto("/")`):

1. **Landmarks**: `getByRole("banner")`, `#main`, `footer` (`getByRole("contentinfo")`) visible;
   exactly one `h1`; the `h1` text contains both "Prem Raj" and "AI Software Developer";
   `header` contains text "AI Software Developer" outside the h1 (`getByRole("banner").getByText(/AI
Software Developer/)` count ≥ 1); skip link exists (`a[href="#main"]`).
2. **Section order**: ids `hero, about, experience, work, skills, credentials, contact` all attached
   and in that DOM order (`compareDocumentPosition` chain); header nav has exactly the six NAV labels
   in order; no `#travel`, no text "Travel".
3. **Experience**: `getByRole("heading", { name: "AI Engineer Intern" })` visible after scroll; its
   card contains "Plancover", "Gurgaon", "Oct 2026 – Present", "Internship" and contains no `ul`/`ol`;
   Droot card contains "Jul 2026 – Sep 2026"; page contains no "July 2026 – Present".
4. **Work**: the five resume-backed titles exist as `h3` headings (exact match); the live links
   `https://software-cost-esstimator-frontend.vercel.app/`, `https://dasguptamaitiassociates.com/`,
   `https://yashodabhawan.in/`, `https://premrajsingh.github.io/StudifyHub/` are attached; the Bank
   Statement figure `svg[data-figure="bank-pipeline"]` is attached; "Also on GitHub" list contains
   "Spotify Web Clone" and "CRUD Application"; no "Open file" button exists.
5. **Hero figure**: either `#hero canvas` (count ≥ 1, after `waitForTimeout(2500)`) or `#hero
svg[data-plan]` is attached (headless may lack WebGL); `#hero-caption` contains "13 components ·
   17 connectors"; the `Components` disclosure opens and reveals 13 `button[data-node-id]`; pressing
   ArrowRight moves focus to the next chip and `#hero-active` text changes from "—".
6. **Spec plate**: `#hero` contains "Knowledge-graph RAG", "Multi-agent systems", "Event-driven
   integrations", "Production".
7. **Credentials dialog**: click `getByRole("button", { name: /View certificate: HackHazards 2025/ })`
   → `getByRole("dialog")` visible with `aria-modal="true"`, contains the active element; Escape hides
   it and focus returns to the trigger.
8. **Contact**: `a[href="mailto:singhpremraj264@gmail.com"]` and `a[href="tel:+917726960080"]`
   attached; `getByRole("button", { name: "Copy email" })` attached.
9. **No horizontal overflow at 390×844** (`scrollWidth ≤ clientWidth + 1` after `networkidle` +
   1200 ms) and at **320×700**.
10. **Reduced motion**: with `reducedMotion: "reduce"`: `#hero canvas` count 0; `#hero svg[data-plan]`
    attached; no `[data-reveal], [data-mask], [data-clip], [data-stagger] > *` element has
    `visibility: hidden` or opacity < 0.9 or a non-full `clip-path`; `document.documentElement` has
    no `lenis` class.
11. **No console errors / page errors** after `networkidle` + 1500 ms (ignore nothing — the
    `three` chunk must not log; WebGL-unavailable in headless must be handled silently by the probe).
12. **Keyboard**: Tab from the top reaches the skip link first, then the wordmark; all `a`,
    `button`, `summary` in `#hero` are reachable and have a visible outline on `:focus-visible`
    (assert computed `outline-style !== "none"` on the focused element).

Remove the Travel test and the "Open file" assertions.

---

## 11. File ownership for parallel implementation

Groups run in two waves. Wave 1 (`foundation`, then `architecture`) must complete and pass
`npm run lint && npm run format:check && npm run test && npm run build` before any wave-2 group
starts. Each wave-2 group owns exactly one component file (plus its listed companions) and may not
edit any other file; shared needs go through this spec.

| group        | files (create ✚ / modify ✎ / delete ✖)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | dependsOn                |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| foundation   | ✎ `src/data/content.js`, ✎ `src/index.css`, ✎ `tailwind.config.js`, ✎ `index.html`, ✎ `src/App.jsx`, ✎ `src/components/SectionHead.jsx`, ✎ `src/hooks/usePrefersReducedMotion.js`, ✎ `src/hooks/useWebGL.js`, ✎ `src/hooks/useLenis.js` (fonts.ready refresh), ✚ `src/hooks/useSceneTier.js`, ✚ `src/hooks/useTilt.js`, ✚ `src/lib/activeNodeStore.js`, ✚ `src/lib/activeNodeStore.test.js`, ✚ `src/components/Credentials.jsx` (stub exporting an empty `<section id="credentials">` so App builds), ✖ `src/components/Travel.jsx`, ✖ `src/components/Marquee.jsx`, ✖ `src/hooks/useTypewriter.js`, ✖ `src/three/HeroScene.jsx`, ✎ `README.md` (remove stale feature list; one paragraph + scripts) | —                        |
| architecture | ✚ `src/three/architecture.js`, ✚ `src/three/architecture.test.js`, ✚ `src/three/packets.js`, ✚ `src/three/packets.test.js`, ✚ `src/components/Glyph.jsx`, ✚ `src/three/ArchitecturePlan.jsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | foundation               |
| header       | ✎ `src/components/Header.jsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | foundation               |
| hero         | ✎ `src/components/Hero.jsx`, ✚ `src/three/ArchitectureScene.jsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     | foundation, architecture |
| about        | ✎ `src/components/About.jsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | foundation               |
| experience   | ✎ `src/components/Experience.jsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    | foundation, architecture |
| projects     | ✎ `src/components/Projects.jsx` (includes `BankPipelineFigure`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | foundation               |
| skills       | ✎ `src/components/Skills.jsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | foundation, architecture |
| credentials  | ✎ `src/components/Credentials.jsx` (includes `CertDialog`)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | foundation               |
| contact      | ✎ `src/components/Contact.jsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | foundation               |
| footer       | ✎ `src/components/Footer.jsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        | foundation, architecture |
| chrome       | ✎ `src/components/Loader.jsx`, ✎ `src/components/BackToTop.jsx`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | foundation               |
| tests        | ✎ `e2e/smoke.spec.js`, ✎ `playwright.config.js`                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | all component groups     |

Contracts between groups (so files fit without talking): `SectionHead` API (§4.3); class names
(§3); `NODES/EDGES/NODE_KIND/GLYPH_KINDS` exports (§6.1); `Glyph`/`GlyphDefs` API (§6.6);
`ArchitecturePlan({ compact, interactive })` (§6.5); `ArchitectureScene` props (§6.3);
`activeNodeStore` API (§6.7); `useSceneTier()` return values (§6.4); `useTilt(ref, { max })` (§7);
content.js field names (§8). `GlyphDefs` is mounted by Hero only. `data-node-id` is the only
cross-component DOM hook.

Deletions also require: remove `Travel`/`Marquee`/`useTypewriter`/`HeroScene` imports everywhere
(only App.jsx, Hero.jsx and Skills/Experience referenced them). `scripts/capture.mjs` is untouched.

---

## 12. Acceptance checklist

- [ ] `npm run lint`, `npm run format:check`, `npm run test`, `npm run build`, `npm run test:e2e` all pass.
- [ ] `grep -rn "AI Full Stack" src index.html` returns nothing; "AI Software Developer" appears in the h1, the header, the footer, `<title>` and OG tags.
- [ ] Section ids in DOM order `hero, about, experience, work, skills, credentials, contact`; nav labels About · Experience · Work · Skills · Credentials · Contact; no Travel anywhere (code, data, tests, photos untouched).
- [ ] Plancover card: first in Experience, header-only, dashed border, "Current" chip, no list element, no placeholder prose; Droot period "Jul 2026 – Sep 2026"; About timeline has five rows ending with Plancover.
- [ ] Hero contains only: eyebrow, h1 (two spans), lede, "View work", "Download resume", three icon links, figure, one-line caption + collapsed Components disclosure + readout, four-cell spec plate. Legend opens to 13 chips with roving tabindex; Escape clears; `aria-pressed` reflects pin.
- [ ] Full tier: 13 nodes, 17 connectors (3 dashed), 20 packets at 0.10–0.18 u/s, LLM hold 0.6 s, store discs pulse, pointer rotates rig ±6°/±2.5°, hover highlights node + connectors and prints the readout, scroll lifts the camera to plan view and fades the stage; frameloop is `never` when the hero is <5 % visible or the tab is hidden (verify in DevTools performance: zero GPU below the fold).
- [ ] No `OrbitControls`, no `@react-three/postprocessing` import, no drei `Html`, `dpr` ≤ 1.5, `MeshTransmissionMaterial` resolution ≤ 512 / samples ≤ 6, chromatic aberration ≤ 0.015; glass spike decision recorded as the `LLM_GLASS` constant.
- [ ] Lite tier (768–1023 or weak hardware): dpr 1, demand frameloop, 8 frozen packets, no glass, no Environment. Phones (<768): SVG plan, no three chunk requested (check Network panel at 390px).
- [ ] Reduced motion: no canvas in `#hero`, SVG plan present, Lenis not initialised, every `[data-*]` reveal element fully visible, no scrubs, no tilt, no draw-ins; legend still highlights the SVG.
- [ ] Chunk failure: blocking the `three` chunk in DevTools leaves the SVG plan at 100 % opacity with no console error.
- [ ] Composite honesty: `architecture.test.js` passes; caption contains "Composite of components from shipped work"; bus readout cites "Skills"; no node outside the résumé; no edge Estimator→Neo4j/Pinecone or Droot→Kafka.
- [ ] Skills table order starts AI, Backend, Messaging; mobile `<details>` with first three open; no horizontal scroll in the table at 390px.
- [ ] Contact email wraps at 320px (`overflow-wrap: anywhere`); copy buttons 44×44 announce "Copied".
- [ ] All controls ≥ 44px, visible 2px focus ring, one `h1`, one `h2` per section, `header[role=banner]`, `main#main`, `footer`, skip link first in DOM, icon-only links labelled, canvas wrapper `aria-hidden tabIndex=-1`, SVG plan has `<title>`/`<desc>`, images have width/height/alt.
- [ ] Contrast: text #15171A, #3E434A, #646A72 and accent #1E3DF0 all ≥ 4.5:1 on #F7F7F5 and #FFFFFF; no other hues on the page (per-project `color` fields deleted).
- [ ] Performance: LCP element is the h1 text; three chunk requested only after idle; Lighthouse mobile ≥ 90 performance on the static tier; desktop 60 fps with the hero visible on an integrated-GPU laptop (PerformanceMonitor ladder degrades glass first).
- [ ] Zero horizontal overflow at 390px and 320px with and without the canvas mounted.
- [ ] No gradients, glow, particles, blobs, dark fields, marquee, typewriter, serif, noise overlay, § marks, revision-history table or appendix wording anywhere.

---

## 13. Addendum (2026-10-10) — "Run a request" and site-wide 3D

**Run a request** (`src/three/trace.js`, `src/lib/traceStore.js`, `TracePacket` in
`ArchitectureScene.jsx`, `TraceDots` in `ArchitecturePlan.jsx`, `TraceButton`/`TracePanel` in
`Hero.jsx`). A chip button under the hero figure plays a scripted request through the diagram:
a larger accent packet with a seven-bead trail travels real connectors hop by hop (reverse hops
are responses on the same link; steps sharing a `parallel` key fan out together), the
destination node lights and the readout follows, and a span waterfall under the figure narrates
each hop with the animation's measured timings (labelled "simulated on Fig. 0"). Three
scenarios cycle per click — Estimate request (AI Project Estimator), Inbound WhatsApp message
(Droot), Knowledge-graph RAG query (Droot) — each unit-tested for using only real connectors,
real sources and a continuous chain. On the static tier the run completes instantly and the
waterfall shows the planned spans; on the SVG plan two dots move along the paths.

**3D in every section** (`src/three/figures.jsx` — one lazy chunk; `src/components/SectionScene.jsx`
mounts a figure when its box is within 1.5 viewports, unmounts it again when far, and keeps the
render loop off while off-screen; the DOM fallback stays underneath for the static tier and for
assistive tech):

- Experience — `StackFigure`: each role's `stack` ids as the hero's shapes on a strip of grid;
  hovering an object lights it and the matching hero node (shared `activeNodeStore`).
- Work — `ScreenFigure`: the project's screenshots as standing textured screens (the diagram's
  "card" shape) with the two details behind at depth; the whole stack turns with the pointer.
  The Bank Statement project keeps its SVG pipeline figure.
- Skills — `ShelfFigure`: the twelve groups as objects on a shelf (desktop); hovering a table row
  lifts its object and vice-versa via `src/lib/hoverStore.js`; a caption names the hovered group.
- About — `.plate-float`: a third plane 44px in front of the tilted portrait.

Shared shapes live in `src/three/nodeShapes.jsx` (+ `nodeMaterials.js`); a `square` kind was
added for Skills groups with no diagram node. All figures: dpr 1, toon solids, ink edges, baked
contact shadows, no post-processing, `frameloop="never"` off-screen.
