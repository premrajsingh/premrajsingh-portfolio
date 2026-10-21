import { Component, Suspense, useCallback, useEffect, useRef, useState } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowUpRight, Download, Github, Linkedin, Mail, Play } from "lucide-react"
import { HERO, SITE } from "../data/content"
import { EDGES, NODES, NODE_BY_ID, sourceLabel } from "../three/architecture.js"
import ArchitecturePlan from "../three/ArchitecturePlan.jsx"
import Glyph, { GlyphDefs } from "./Glyph.jsx"
import { activeNodeStore, useActiveNode } from "../lib/activeNodeStore.js"
import { traceStore, useTrace } from "../lib/traceStore.js"
import { useSceneTier } from "../hooks/useSceneTier.js"

gsap.registerPlugin(ScrollTrigger)

/**
 * Hero — Fig. 0 (design-spec §5.2, §6.4 amended by §0.1).
 *
 * The figure always starts as the SVG plan. When the scene tier allows WebGL, the three.js
 * chunk is requested after idle; once the canvas has drawn its first frame it crossfades in
 * and the plan unmounts. If the chunk fails to load or the canvas throws, the plan stays at
 * full opacity. GSAP owns the entrance timeline and the scroll scrub; the canvas reads
 * `progressRef` / `pointerRef` and never re-renders React per frame.
 */

const SOCIALS = [
  { Icon: Github, href: SITE.github, label: "GitHub" },
  { Icon: Linkedin, href: SITE.linkedin, label: "LinkedIn" },
  { Icon: Mail, href: `mailto:${SITE.email}`, label: "Email" },
]

/** Soft edge so the drawn grid fades into the page instead of stopping at the canvas box. */
const STAGE_FADE = {
  maskImage: "radial-gradient(ellipse 72% 68% at 50% 50%, #000 62%, transparent 100%)",
  WebkitMaskImage: "radial-gradient(ellipse 72% 68% at 50% 50%, #000 62%, transparent 100%)",
}

let scenePromise = null
function loadScene() {
  if (!scenePromise) scenePromise = import("../three/ArchitectureScene.jsx")
  return scenePromise
}

function whenIdle(fn) {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(fn, { timeout: 1200 })
    return () => window.cancelIdleCallback(id)
  }
  const id = window.setTimeout(fn, 1)
  return () => window.clearTimeout(id)
}

class SceneBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError?.()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function Readout() {
  const { id } = useActiveNode()
  const node = id ? NODE_BY_ID[id] : null
  return (
    <p
      id="hero-active"
      className="readout mt-2"
      aria-live="polite"
      data-empty={node ? undefined : ""}
    >
      {node ? `${node.label} — ${node.detail} · ${sourceLabel(node)}` : "—"}
    </p>
  )
}

function Legend() {
  const { id: activeId, pinned } = useActiveNode()
  const [focusIndex, setFocusIndex] = useState(0)
  const buttons = useRef([])

  const activate = (id) => {
    if (!activeNodeStore.getSnapshot().pinned) activeNodeStore.setActive(id, { source: "legend" })
  }
  const release = (id) => {
    const snap = activeNodeStore.getSnapshot()
    if (!snap.pinned && snap.id === id && snap.source === "legend") activeNodeStore.clear()
  }
  const togglePin = (id) => {
    const snap = activeNodeStore.getSnapshot()
    if (snap.id === id && snap.pinned) activeNodeStore.clear({ force: true })
    else activeNodeStore.setActive(id, { pin: true, source: "legend" })
  }

  const move = (next) => {
    const i = (next + NODES.length) % NODES.length
    setFocusIndex(i)
    buttons.current[i]?.focus()
  }

  const onKeyDown = (event) => {
    switch (event.key) {
      case "ArrowRight":
      case "ArrowDown":
        event.preventDefault()
        move(focusIndex + 1)
        break
      case "ArrowLeft":
      case "ArrowUp":
        event.preventDefault()
        move(focusIndex - 1)
        break
      case "Home":
        event.preventDefault()
        move(0)
        break
      case "End":
        event.preventDefault()
        move(NODES.length - 1)
        break
      case "Escape":
        event.preventDefault()
        activeNodeStore.clear({ force: true })
        break
      default:
    }
  }

  return (
    <details className="legend group/legend">
      <summary className="mono-label focus-ring inline-flex min-h-11 cursor-pointer list-none items-center gap-2 text-dim hover:text-ink [&::-webkit-details-marker]:hidden">
        <span
          aria-hidden
          className="inline-block transition-transform duration-200 group-open/legend:rotate-90"
        >
          ›
        </span>
        Components ({NODES.length})
      </summary>
      <div
        role="toolbar"
        aria-label="Components"
        className="legend-toolbar mt-2"
        onKeyDown={onKeyDown}
        onMouseLeave={() => {
          const snap = activeNodeStore.getSnapshot()
          if (!snap.pinned && snap.source === "legend") activeNodeStore.clear()
        }}
      >
        {NODES.map((node, i) => {
          const isActive = activeId === node.id
          return (
            <button
              key={node.id}
              ref={(el) => {
                buttons.current[i] = el
              }}
              type="button"
              data-node-id={node.id}
              tabIndex={i === focusIndex ? 0 : -1}
              aria-pressed={pinned && isActive}
              className={isActive ? "chip-btn focus-ring is-active" : "chip-btn focus-ring"}
              onMouseEnter={() => activate(node.id)}
              onFocus={() => {
                setFocusIndex(i)
                activate(node.id)
              }}
              onBlur={() => release(node.id)}
              onClick={() => togglePin(node.id)}
            >
              <Glyph kind={node.kind} />
              {node.short}
            </button>
          )
        })}
      </div>
    </details>
  )
}

/** "Run a request" — starts the next scripted trace (src/three/trace.js). */
function TraceButton({ instant }) {
  const { status, run } = useTrace()
  const running = status === "running"
  const label = running
    ? `Running · ${run.scenario.title}`
    : status === "done"
      ? "Run another request"
      : "Run a request"
  return (
    <button
      type="button"
      className="chip-btn focus-ring"
      disabled={running}
      aria-controls="hero-trace"
      onClick={() => traceStore.start({ instant })}
    >
      <Play size={11} aria-hidden fill="currentColor" />
      {label}
    </button>
  )
}

function fmtMs(seconds) {
  return `${Math.round(seconds * 1000)} ms`
}

/** Span waterfall for the current trace. Bars grow via a rAF loop writing CSS vars (no React per frame). */
function TracePanel() {
  const { status, run, startedAt, instant } = useTrace()
  const rows = useRef(new Map())

  useEffect(() => {
    if (status !== "running" || instant || !run) return undefined
    let raf = 0
    const loop = () => {
      const elapsed = (performance.now() - startedAt) / 1000
      for (const span of run.spans) {
        const el = rows.current.get(span.index)
        if (!el) continue
        const shown = Math.max(0, Math.min(span.duration, elapsed - span.start))
        el.style.setProperty("--w", `${(shown / run.total) * 100}%`)
      }
      raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [status, run, startedAt, instant])

  if (!run) return null

  return (
    <div id="hero-trace" className="trace mt-4" data-status={status}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 pb-2">
        <p className="mono-label text-ink">
          Trace · {run.scenario.title}
          <span className="text-muted"> · {run.scenario.source}</span>
        </p>
        <p className="mono-xs text-muted">
          simulated on Fig. 0 · {run.spans.length} spans · {run.total.toFixed(1)} s
        </p>
      </div>
      <ol className="trace-list">
        {run.spans.map((span) => {
          const from = NODE_BY_ID[span.from]
          const to = NODE_BY_ID[span.to]
          const done = span.state === "done"
          return (
            <li
              key={span.index}
              className="trace-row"
              data-state={span.state}
              ref={(el) => {
                if (el) rows.current.set(span.index, el)
                else rows.current.delete(span.index)
              }}
              style={{
                "--x": `${(span.start / run.total) * 100}%`,
                "--w": done ? `${(span.duration / run.total) * 100}%` : "0%",
              }}
            >
              <span className="mono-xs tabular text-muted">
                {String(span.index + 1).padStart(2, "0")}
              </span>
              <span className="trace-label">
                <span className="small font-medium text-ink">{span.label}</span>
                <span className="mono-xs block text-muted">
                  {from.short} → {to.short}
                  {span.async ? " · async" : ""}
                  {span.hold ? " · hold" : ""}
                </span>
              </span>
              <span className="trace-track" aria-hidden="true">
                <span className="trace-fill" />
              </span>
              <span className="mono-xs tabular text-right text-dim">
                {done ? fmtMs(span.duration) : span.state === "active" ? "…" : ""}
              </span>
            </li>
          )
        })}
      </ol>
      <p className="sr-only" role="status" aria-live="polite">
        {status === "done"
          ? `Trace complete: ${run.spans.length} spans in ${run.total.toFixed(1)} seconds.`
          : status === "running"
            ? `Running ${run.scenario.title}.`
            : ""}
      </p>
    </div>
  )
}

export default function Hero() {
  const tier = useSceneTier()
  const rootRef = useRef(null)
  const stageRef = useRef(null)
  const progressRef = useRef(0)
  const pointerRef = useRef({ x: 0, y: 0 })
  const [Scene, setScene] = useState(null)
  const [sceneReady, setSceneReady] = useState(false)
  const [planGone, setPlanGone] = useState(false)
  const [sceneFailed, setSceneFailed] = useState(false)

  const motion = tier !== "static"

  // Request the three.js chunk after idle, only for tiers that render WebGL.
  useEffect(() => {
    if (!motion || sceneFailed) return undefined
    let cancelled = false
    const cancelIdle = whenIdle(() => {
      loadScene()
        .then((mod) => {
          if (!cancelled) setScene(() => mod.default)
        })
        .catch(() => {
          if (!cancelled) setSceneFailed(true)
        })
    })
    return () => {
      cancelled = true
      cancelIdle()
    }
  }, [motion, sceneFailed])

  // Unmount the plan once the canvas has crossfaded in.
  useEffect(() => {
    if (!sceneReady) return undefined
    const id = window.setTimeout(() => setPlanGone(true), 450)
    return () => window.clearTimeout(id)
  }, [sceneReady])

  const onSceneError = useCallback(() => {
    setSceneFailed(true)
    setSceneReady(false)
    setPlanGone(false)
  }, [])

  const onPointerMove = useCallback((event) => {
    const rect = rootRef.current?.getBoundingClientRect()
    if (!rect) return
    pointerRef.current = {
      x: ((event.clientX - rect.left) / rect.width) * 2 - 1,
      y: ((event.clientY - rect.top) / rect.height) * 2 - 1,
    }
  }, [])

  const onPointerLeave = useCallback(() => {
    pointerRef.current = { x: 0, y: 0 }
  }, [])

  useEffect(() => {
    if (!motion) return undefined
    const onKey = (event) => {
      if (event.key !== "Escape") return
      const target = event.target
      if (target instanceof Element && target.closest("[role='dialog'], #mobile-nav")) return
      if (rootRef.current?.contains(document.activeElement) || activeNodeStore.getSnapshot().id) {
        activeNodeStore.clear({ force: true })
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [motion])

  useGSAP(
    () => {
      if (!motion || !rootRef.current) return undefined
      const mm = gsap.matchMedia()
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const root = rootRef.current
        const lines = root.querySelectorAll("[data-hero-name] .mask-line > span")
        const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.3 })
        tl.from("[data-hero-eyebrow]", { y: 12, opacity: 0.001, duration: 0.45 }, 0)
          .from(lines, { yPercent: 112, duration: 1.05, stagger: 0.1 }, 0.04)
          .from("[data-hero-body]", { y: 16, opacity: 0.001, duration: 0.65, stagger: 0.06 }, 0.3)
          .from(
            "[data-hero-figure]",
            { y: 24, opacity: 0.001, duration: 1, ease: "power3.out" },
            0.15
          )
          .from(
            "[data-hero-spec]",
            { scaleX: 0, transformOrigin: "left center", duration: 0.9, ease: "power3.inOut" },
            0.45
          )
          .from(
            "[data-hero-spec] > li",
            { y: 14, opacity: 0.001, duration: 0.5, stagger: 0.05 },
            0.65
          )

        // Replay the intro when the hero comes back: reset once it has fully scrolled away,
        // restart (without the load delay) as soon as its bottom edge re-enters the viewport.
        ScrollTrigger.create({
          trigger: root,
          start: "top bottom",
          end: "bottom top",
          onLeave: () => tl.pause(0),
          onEnterBack: () => tl.restart(),
        })

        ScrollTrigger.create({
          trigger: root,
          start: "top top",
          end: "bottom top",
          scrub: 0.6,
          onUpdate: (self) => {
            progressRef.current = self.progress
          },
        })

        gsap.fromTo(
          stageRef.current,
          { y: 0, opacity: 1 },
          {
            y: "-6vh",
            opacity: 0,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: () => `top+=${root.offsetHeight * 0.35} top`,
              end: "bottom top",
              scrub: 0.6,
            },
          }
        )
      })
      return () => mm.revert()
    },
    { scope: rootRef, dependencies: [motion] }
  )

  const showCanvas = motion && Scene && !sceneFailed
  const showPlan = !showCanvas || !planGone

  return (
    <section
      id="hero"
      ref={rootRef}
      aria-labelledby="hero-heading"
      className="relative flex min-h-[100svh] flex-col overflow-x-clip pt-16"
      onPointerMove={showCanvas ? onPointerMove : undefined}
      onPointerLeave={showCanvas ? onPointerLeave : undefined}
    >
      <GlyphDefs />

      <div className="shell grid-12 flex-1 content-center items-center gap-y-10 py-10 lg:py-6">
        <div className="min-w-0 lg:col-span-5">
          <p className="kicker flex items-center gap-2" data-hero-eyebrow>
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
            {HERO.available ? "Open to work · " : ""}
            {SITE.location}
          </p>

          <h1 id="hero-heading" data-hero-name className="display-xl mt-5 text-ink">
            <span className="mask-line">
              <span>{SITE.name}</span>
            </span>
            <span className="mask-line">
              <span className="font-normal text-dim">{SITE.role}</span>
            </span>
          </h1>

          <p className="lede mt-6 max-w-lede text-dim" data-hero-body>
            {HERO.lede}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3" data-hero-body>
            <a href="#work" className="btn-primary focus-ring w-full sm:w-auto">
              View work
              <ArrowUpRight size={14} aria-hidden />
            </a>
            <a href={SITE.resume} download className="btn-ghost focus-ring w-full sm:w-auto">
              <Download size={14} aria-hidden />
              Download resume
            </a>
          </div>

          <ul className="mt-4 flex gap-2" data-hero-body aria-label="Profiles">
            {SOCIALS.map(({ Icon, href, label }) => (
              <li key={label}>
                <a
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noreferrer" : undefined}
                  aria-label={label}
                  className="btn-icon focus-ring"
                >
                  <Icon size={16} aria-hidden />
                </a>
              </li>
            ))}
          </ul>
        </div>

        <figure
          className="relative min-w-0 lg:col-span-7"
          aria-describedby="hero-caption"
          data-hero-figure
        >
          <div
            ref={stageRef}
            data-hero-stage
            className="relative aspect-[4/3] w-full lg:aspect-auto lg:h-[min(54vh,600px)]"
          >
            {showPlan ? (
              <div
                className="absolute inset-0 flex items-center justify-center transition-opacity duration-[400ms] ease-out"
                style={{ opacity: showCanvas && sceneReady ? 0 : 1 }}
              >
                <ArchitecturePlan driveTrace={!showCanvas || !sceneReady} />
              </div>
            ) : null}

            {showCanvas ? (
              <div
                className="pointer-events-none absolute inset-0 transition-opacity duration-[400ms] ease-out"
                style={{ opacity: sceneReady ? 1 : 0, touchAction: "pan-y", ...STAGE_FADE }}
                aria-hidden="true"
                tabIndex={-1}
              >
                <SceneBoundary onError={onSceneError}>
                  <Suspense fallback={null}>
                    <Scene
                      tier={tier}
                      eventSource={rootRef}
                      progressRef={progressRef}
                      pointerRef={pointerRef}
                      onReady={() => setSceneReady(true)}
                    />
                  </Suspense>
                </SceneBoundary>
              </div>
            ) : null}
          </div>

          <figcaption id="hero-caption" className="mt-3">
            <p className="mono-label text-muted">
              {HERO.figureCaption} {NODES.length} components · {EDGES.length} connectors.{" "}
              {showCanvas ? "Hover, tap or tab to a component." : "Static plan."}
            </p>
            <div className="mt-1 flex flex-wrap items-start gap-x-5 gap-y-1">
              <Legend />
              <div className="flex min-h-11 items-center">
                <TraceButton instant={!motion} />
              </div>
            </div>
            <Readout />
            <TracePanel />
          </figcaption>
        </figure>
      </div>

      <div className="shell pb-8 sm:pb-10">
        <ul className="spec-plate" aria-label="Capabilities" data-hero-spec>
          {HERO.specPlate.map((cell) => (
            <li key={cell.index} className="min-w-0 py-4">
              <span className="mono-xs tabular text-muted">{cell.index}</span>
              <p className="small mt-1 font-medium uppercase tracking-[0.04em] text-ink">
                {cell.title}
              </p>
              <p className="mono-label mt-1 text-dim">{cell.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
