import { useMemo, useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowUpRight } from "lucide-react"
import { PROJECTS } from "../data/content"
import { useSectionReveal } from "../lib/useSectionReveal"
import { useTilt } from "../hooks/useTilt"
import SectionScene from "./SectionScene.jsx"
import SectionHead from "./SectionHead.jsx"

gsap.registerPlugin(ScrollTrigger)

const isRealUrl = (url) => typeof url === "string" && url.startsWith("http")

/** The one featured project without screenshots; its figure is the hand-drawn pipeline below. */
const BANK_TITLE = "Automated Bank Statement Processing"

/* ------------------------------------------------------------------------------------------ */
/* Fig. 04 — BankPipelineFigure (design-spec §5.5)                                             */
/* Every label is a verbatim fragment of the project's `tech` or `desc` in content.js, or a    */
/* string quoted in the spec ("PyInstaller build"). Hairline strokes, mono text, one accent    */
/* dot. The spec column typesets the same tech list, so the drawing carries nothing exclusive. */
/* ------------------------------------------------------------------------------------------ */

const NODE_W = 124
const NODE_H = 56
const ROW_1 = 72
const ROW_2 = 216

const BANK_NODES = [
  {
    id: "gmail",
    x: 40,
    y: ROW_1,
    w: NODE_W,
    h: NODE_H,
    shape: "pill",
    title: "Gmail API",
    sub: "10+ banks",
  },
  {
    id: "pypdf",
    x: 186,
    y: ROW_1,
    w: NODE_W,
    h: NODE_H,
    shape: "box",
    title: "PyPDF",
    sub: "PDF extraction",
  },
  {
    id: "bs4",
    x: 332,
    y: ROW_1,
    w: NODE_W,
    h: NODE_H,
    shape: "box",
    title: "BeautifulSoup4",
    sub: "classification",
  },
  {
    id: "sha",
    x: 478,
    y: ROW_1,
    w: NODE_W,
    h: NODE_H,
    shape: "box",
    title: "SHA-256",
    sub: "duplicate detection",
  },
  {
    id: "app",
    x: 478,
    y: ROW_2,
    w: NODE_W,
    h: NODE_H,
    shape: "window",
    title: "CustomTkinter",
    sub: "desktop application",
  },
  {
    id: "daemon",
    x: 40,
    y: 222,
    w: NODE_W,
    h: 44,
    shape: "dashed",
    title: "macOS launchd",
    sub: "monitoring daemon",
  },
]

const BANK_FOOTER = {
  left: "PyInstaller build",
  right: "reducing manual effort by 90–95%",
}

function rectPath(x, y, w, h, r = 2) {
  return [
    `M${x + r} ${y}`,
    `H${x + w - r}`,
    `Q${x + w} ${y} ${x + w} ${y + r}`,
    `V${y + h - r}`,
    `Q${x + w} ${y + h} ${x + w - r} ${y + h}`,
    `H${x + r}`,
    `Q${x} ${y + h} ${x} ${y + h - r}`,
    `V${y + r}`,
    `Q${x} ${y} ${x + r} ${y}`,
    "Z",
  ].join(" ")
}

function pillPath(x, y, w, h) {
  const r = h / 2
  return [
    `M${x + r} ${y}`,
    `H${x + w - r}`,
    `A${r} ${r} 0 0 1 ${x + w - r} ${y + h}`,
    `H${x + r}`,
    `A${r} ${r} 0 0 1 ${x + r} ${y}`,
    "Z",
  ].join(" ")
}

/** Open chevron (two strokes meeting at the tip) so the arrowhead draws in with the line. */
function chevronPath(x, y, dir) {
  if (dir === "down") return `M${x - 3.5} ${y - 5} L${x} ${y} L${x + 3.5} ${y - 5}`
  if (dir === "up") return `M${x - 3.5} ${y + 5} L${x} ${y} L${x + 3.5} ${y + 5}`
  return `M${x - 5} ${y - 3.5} L${x} ${y} L${x - 5} ${y + 3.5}`
}

function nodeOutline(node) {
  if (node.shape === "pill") return pillPath(node.x, node.y, node.w, node.h)
  return rectPath(node.x, node.y, node.w, node.h)
}

function NodeLabels({ node }) {
  const cx = node.x + node.w / 2
  const isWindow = node.shape === "window"
  const titleY = isWindow ? node.y + 34 : node.y + node.h / 2 - 3
  const subY = isWindow ? node.y + 48 : node.y + node.h / 2 + 12
  return (
    <>
      <text
        x={cx}
        y={titleY}
        textAnchor="middle"
        fontSize="12"
        letterSpacing="0.02em"
        className="fill-dim"
        data-fade
      >
        {node.title}
      </text>
      <text x={cx} y={subY} textAnchor="middle" fontSize="10" className="fill-muted" data-fade>
        {node.sub}
      </text>
    </>
  )
}

export function BankPipelineFigure() {
  const svgRef = useRef(null)

  useGSAP(
    () => {
      const svg = svgRef.current
      if (!svg) return undefined

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const strokes = gsap.utils
          .toArray("[data-draw]", svg)
          .filter((el) => typeof el.getTotalLength === "function")
        const fades = gsap.utils.toArray("[data-fade]", svg)
        const dot = svg.querySelector("[data-dot]")

        const STEP = 0.06
        const DRAW = 0.55
        const strokesEnd = Math.max(0, strokes.length - 1) * STEP + DRAW

        // Hidden states are set by GSAP only (never CSS), so reduced motion and no-JS
        // paths show the finished drawing.
        strokes.forEach((el) => {
          const length = Math.ceil(el.getTotalLength()) + 2
          gsap.set(el, { strokeDasharray: length, strokeDashoffset: length })
        })
        if (fades.length) gsap.set(fades, { opacity: 0 })
        if (dot) gsap.set(dot, { scale: 0, transformOrigin: "50% 50%" })

        const tl = gsap.timeline({
          defaults: { ease: "power2.inOut" },
          scrollTrigger: { trigger: svg, start: "top 85%", once: true },
        })

        strokes.forEach((el, i) => {
          tl.to(el, { strokeDashoffset: 0, duration: DRAW }, i * STEP)
        })
        if (fades.length) {
          tl.to(fades, { opacity: 1, duration: 0.45, stagger: 0.03, ease: "power2.out" }, 0.4)
        }
        if (dot) {
          tl.to(dot, { scale: 1, duration: 0.5, ease: "back.out(2.5)" }, strokesEnd - 0.1)
        }
      })

      return () => mm.revert()
    },
    { scope: svgRef }
  )

  const [gmail, pypdf, bs4, sha, app, daemon] = BANK_NODES
  const railY = ROW_1 + NODE_H / 2
  const dropX = sha.x + sha.w / 2
  const daemonX = daemon.x + daemon.w / 2

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 640 360"
      role="img"
      aria-labelledby="bank-pipeline-title bank-pipeline-desc"
      data-figure="bank-pipeline"
      className="mono block aspect-[16/9] h-auto w-full"
    >
      <title id="bank-pipeline-title">
        Fig. 04 — Automated Bank Statement Processing, pipeline drawing
      </title>
      <desc id="bank-pipeline-desc">
        Pipeline for 10+ banks: Gmail API, PyPDF PDF extraction, BeautifulSoup4 classification,
        SHA-256 duplicate detection, CustomTkinter desktop application; a macOS launchd monitoring
        daemon on the side; PyInstaller build.
      </desc>

      <g
        fill="none"
        strokeWidth="1"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-edge-ink"
      >
        {/* Row 1 — the processing rail, left to right */}
        <path d={nodeOutline(gmail)} data-draw />
        <path d={`M${gmail.x + gmail.w} ${railY} H${pypdf.x - 5}`} data-draw />
        <path d={chevronPath(pypdf.x, railY, "right")} data-draw />

        <path d={nodeOutline(pypdf)} data-draw />
        <path d={`M${pypdf.x + pypdf.w} ${railY} H${bs4.x - 5}`} data-draw />
        <path d={chevronPath(bs4.x, railY, "right")} data-draw />

        <path d={nodeOutline(bs4)} data-draw />
        <path d={`M${bs4.x + bs4.w} ${railY} H${sha.x - 5}`} data-draw />
        <path d={chevronPath(sha.x, railY, "right")} data-draw />

        <path d={nodeOutline(sha)} data-draw />

        {/* Drop from SHA-256 down into the desktop application */}
        <path d={`M${dropX} ${sha.y + sha.h} V${app.y - 5}`} data-draw />
        <path d={chevronPath(dropX, app.y, "down")} data-draw />

        {/* The application, drawn as a window: outline plus a header rule */}
        <path d={nodeOutline(app)} data-draw />
        <path d={`M${app.x} ${app.y + 14} H${app.x + app.w}`} data-draw />

        {/* Side node — hidden-line (dashed) convention for the monitoring daemon */}
        <path d={nodeOutline(daemon)} strokeDasharray="4 3" data-fade />
        <path
          d={`M${daemonX} ${daemon.y} V${gmail.y + gmail.h + 5}`}
          strokeDasharray="4 3"
          data-fade
        />
        <path d={chevronPath(daemonX, gmail.y + gmail.h, "up")} data-draw />
      </g>

      {/* Title block rule */}
      <path d="M40 304 H600" fill="none" strokeWidth="1" className="stroke-line" data-draw />

      <g>
        {BANK_NODES.map((node) => (
          <NodeLabels key={node.id} node={node} />
        ))}
        <text x="40" y="324" fontSize="10" letterSpacing="0.04em" className="fill-muted" data-fade>
          {BANK_FOOTER.left}
        </text>
        <text
          x="600"
          y="324"
          textAnchor="end"
          fontSize="10"
          letterSpacing="0.04em"
          className="fill-muted"
          data-fade
        >
          {BANK_FOOTER.right}
        </text>
      </g>

      {/* The one accent dot — a packet on the drop into the application */}
      <circle cx={dropX} cy={(sha.y + sha.h + app.y) / 2} r="4" className="fill-accent" data-dot />
    </svg>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Links                                                                                       */
/* ------------------------------------------------------------------------------------------ */

function ExternalLink({ href, label, title }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link-accent link-underline focus-ring inline-flex min-h-11 items-center gap-1 py-3 text-sm font-medium after:bottom-[10px]"
    >
      {label}
      <span className="sr-only"> — {title}</span>
      <ArrowUpRight size={14} aria-hidden />
    </a>
  )
}

function LinksRow({ project, className = "" }) {
  const hasLive = isRealUrl(project.live)
  const hasCode = isRealUrl(project.github)
  if (!hasLive && !hasCode) return null
  return (
    <div className={`flex flex-wrap gap-x-6 ${className}`.trim()}>
      {hasLive ? <ExternalLink href={project.live} label="Live" title={project.title} /> : null}
      {hasCode ? <ExternalLink href={project.github} label="Code" title={project.title} /> : null}
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Figures                                                                                     */
/* ------------------------------------------------------------------------------------------ */

function WorkPlates({ project, isBank, main, details }) {
  return (
    <>
      <div className="tilt-layer relative">
        {/* The foundation parks `.plate-back` at translateZ(-40px); under the 1200px `.tilt`
            perspective that projects 3.2 % smaller and swallows the right-hand lip, so on
            hover-capable devices (the only ones with perspective) scale by 1240/1200 to keep
            the plate's footprint. Offset is 6px on phones, 10px from lg. */}
        <div
          className="plate-back [translate:6px_6px] lg:[translate:10px_10px] [@media(hover:hover)]:[scale:1.0333]"
          aria-hidden
        />
        <div className="plate">
          {isBank ? (
            <BankPipelineFigure />
          ) : main ? (
            <div data-clip="up">
              <img
                src={main}
                alt={`${project.title} interface`}
                width={1024}
                height={576}
                className="aspect-[16/9] object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </div>
          ) : null}
        </div>
      </div>

      {details.length > 0 ? (
        <ul className="mt-3 grid grid-cols-2 gap-2" data-stagger>
          {details.map((src, i) => (
            <li key={src} className="plate">
              <img
                src={src}
                alt={`${project.title} detail ${i + 1}`}
                width={1024}
                height={576}
                className="aspect-[16/9] object-cover object-top"
                loading="lazy"
                decoding="async"
              />
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}

function WorkFigure({ project, mirrored }) {
  const figureRef = useRef(null)
  useTilt(figureRef, { max: 5 })

  const isBank = project.title === BANK_TITLE
  const [main, ...rest] = project.imgs ?? []
  const details = rest.slice(0, 2)
  const plates = <WorkPlates project={project} isBank={isBank} main={main} details={details} />

  return (
    <figure
      ref={figureRef}
      className={`tilt lg:col-span-7 ${mirrored ? "lg:order-2" : ""}`.trim()}
      data-parallax="-20"
    >
      {/* Screenshot projects become standing 3D screens (the diagram's "card" shape); the DOM
          plates remain underneath as the static-tier figure and the accessible content. */}
      {isBank || !main ? (
        plates
      ) : (
        <SectionScene
          kind="screen"
          images={[main, ...details].map((src, i) => ({
            src,
            alt: i === 0 ? `${project.title} interface` : `${project.title} detail ${i}`,
          }))}
          fallback={plates}
        />
      )}

      <figcaption className="mono-label mt-2 text-muted">
        Fig. {project.num} · {project.type}
      </figcaption>
    </figure>
  )
}

function WorkRow({ project, index }) {
  const mirrored = index % 2 === 1
  const headingId = `work-${project.num}-title`

  return (
    <article
      className="grid-12 items-center py-16 first:pt-0 last:pb-0"
      aria-labelledby={headingId}
    >
      <WorkFigure project={project} mirrored={mirrored} />

      <div className={`min-w-0 lg:col-span-5 ${mirrored ? "lg:order-1" : ""}`.trim()}>
        <div data-reveal>
          {/* Below lg the figcaption sits directly above this block, so the eyebrow is desktop-only. */}
          <p className="kicker hidden lg:block">
            Fig. {project.num} · {project.type}
          </p>
          <h3 id={headingId} className="title-md mt-3 text-ink">
            {project.title}
          </h3>
          <p className="body mt-4 text-dim">{project.desc}</p>
          <p className="mono-label mt-5 text-muted">{project.tech.join(" · ")}</p>
        </div>
        <LinksRow project={project} className="mt-3" />
      </div>
    </article>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Also on GitHub — public repos that are not on the resume                                    */
/* ------------------------------------------------------------------------------------------ */

function AlsoOnGitHub({ projects }) {
  return (
    <div className="mt-16 border-t border-line pt-6">
      <h3 className="kicker">Also on GitHub — public repos, not on the resume</h3>
      <ul className="mt-4 border-t border-line" data-stagger>
        {projects.map((project) => (
          <li
            key={project.num}
            className="grid gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto] sm:items-center"
          >
            <p className="small font-medium text-ink">
              {project.title}
              <span className="mono-xs ml-2 text-muted">{project.type}</span>
            </p>
            <p className="mono-label text-muted">{project.tech.join(" · ")}</p>
            <LinksRow project={project} className="sm:justify-end" />
          </li>
        ))}
      </ul>
    </div>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Section                                                                                     */
/* ------------------------------------------------------------------------------------------ */

export default function Projects() {
  const sectionRef = useRef(null)
  useSectionReveal(sectionRef)

  const featured = useMemo(() => PROJECTS.filter((p) => p.featured), [])
  const extras = useMemo(() => PROJECTS.filter((p) => !p.featured), [])

  return (
    <section id="work" ref={sectionRef} aria-labelledby="work-heading" className="section">
      <div className="shell">
        <SectionHead
          index="03"
          title="Work"
          titleId="work-heading"
          aside={`${featured.length} figures`}
        />

        <div className="divide-y divide-line">
          {featured.map((project, index) => (
            <WorkRow key={project.num} project={project} index={index} />
          ))}
        </div>

        {extras.length > 0 ? <AlsoOnGitHub projects={extras} /> : null}
      </div>
    </section>
  )
}
