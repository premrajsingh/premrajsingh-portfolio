import { useEffect, useId, useMemo, useRef } from "react"
import { activeNodeStore, useActiveNode } from "../lib/activeNodeStore.js"
import { traceStore, useTrace } from "../lib/traceStore.js"
import { EDGES, NODES, PLAN_PROJECTION, edgeCurve } from "./architecture.js"

/**
 * Fig. 0 — plan view (design-spec §6.5). A true top-down SVG twin of the 3D scene generated
 * from the same NODES / EDGES / routeEdge output. It is the Suspense fallback, the static-tier
 * hero figure and the footer colophon (`compact`). No three.js import: `edgeCurve` comes from
 * architecture.js, which pulls only the curve/vector source modules.
 */

const VIEW_W = 560
const VIEW_H = 400
const GLYPH_PX = 28
const LABEL_DY = 26
const EDGE_SAMPLES = 48
const GRID_COLS = 14
const GRID_ROWS = 10

const NUMBER_WORDS = {
  13: "thirteen",
}

function project([x, , z]) {
  const { scale, pad } = PLAN_PROJECTION
  return [pad + (x + 4.6) * scale, pad + (-z + 3.0) * scale]
}

function fmt(n) {
  return Math.round(n * 100) / 100
}

/** Pre-computed 2D geometry — identical on every render, so built once per module. */
const PLAN_NODES = NODES.map((node) => {
  const [sx, sy] = project(node.pos)
  let anchor = "middle"
  if (sx > VIEW_W - 44) anchor = "end"
  else if (sx < 44) anchor = "start"
  const labelX = anchor === "end" ? sx + GLYPH_PX / 2 : anchor === "start" ? sx - GLYPH_PX / 2 : sx
  return { ...node, sx, sy, anchor, labelX }
})

const PLAN_EDGES = EDGES.map((edge, index) => {
  const points = edgeCurve(edge).getSpacedPoints(EDGE_SAMPLES)
  const d = points
    .map((p, i) => {
      const [sx, sy] = project([p.x, p.y, p.z])
      return `${i === 0 ? "M" : "L"}${fmt(sx)} ${fmt(sy)}`
    })
    .join("")
  return { ...edge, index, d }
})

const NEIGHBOURS = NODES.reduce((map, node) => {
  map[node.id] = new Set()
  return map
}, {})
for (const edge of EDGES) {
  NEIGHBOURS[edge.from].add(edge.to)
  NEIGHBOURS[edge.to].add(edge.from)
}

const GRID_X = Array.from({ length: GRID_COLS }, (_, i) =>
  fmt(((i + 1) * VIEW_W) / (GRID_COLS + 1))
)
const GRID_Y = Array.from({ length: GRID_ROWS }, (_, i) =>
  fmt(((i + 1) * VIEW_H) / (GRID_ROWS + 1))
)

function nodeClass(id, activeId) {
  if (!activeId) return "plan-node"
  if (id === activeId) return "plan-node is-active"
  if (NEIGHBOURS[activeId]?.has(id)) return "plan-node"
  return "plan-node is-dim"
}

function edgeClass(edge, activeId) {
  if (!activeId) return "plan-edge"
  if (edge.from === activeId || edge.to === activeId) return "plan-edge is-active"
  return "plan-edge is-dim"
}

const TRACE_DOTS = 2

/**
 * Moves up to two dots along the connector paths while a trace runs and this plan is the
 * figure that drives it (no WebGL canvas on top). Pure DOM writes inside one rAF loop.
 */
function TraceDots({ driveTrace, pathRefs }) {
  const dots = useRef([])
  const { status, instant, version } = useTrace()
  const running = status === "running" && !instant

  useEffect(() => {
    if (!driveTrace || !running) {
      dots.current.forEach((dot) => dot && dot.setAttribute("r", "0"))
      return undefined
    }
    let raf = 0
    const loop = () => {
      const result = traceStore.tick(performance.now())
      const packets = result ? result.packets : []
      for (let i = 0; i < TRACE_DOTS; i += 1) {
        const dot = dots.current[i]
        const packet = packets[i]
        const path = packet ? pathRefs.current[packet.edge] : null
        if (!dot || !path || !packet) {
          dot?.setAttribute("r", "0")
          continue
        }
        const point = path.getPointAtLength(packet.t * path.getTotalLength())
        dot.setAttribute("cx", point.x.toFixed(1))
        dot.setAttribute("cy", point.y.toFixed(1))
        dot.setAttribute("r", "5")
      }
      if (result && !result.done) raf = window.requestAnimationFrame(loop)
    }
    raf = window.requestAnimationFrame(loop)
    return () => window.cancelAnimationFrame(raf)
  }, [driveTrace, running, version, pathRefs])

  return (
    <g aria-hidden="true" fill="var(--accent)" stroke="none">
      {Array.from({ length: TRACE_DOTS }, (_, i) => (
        <circle
          key={i}
          ref={(el) => {
            dots.current[i] = el
          }}
          cx="0"
          cy="0"
          r="0"
        />
      ))}
    </g>
  )
}

function PlanSvg({ compact, interactive, driveTrace, active }) {
  const uid = useId().replace(/:/g, "")
  const titleId = `plan-title-${uid}`
  const descId = `plan-desc-${uid}`
  const activeId = active?.id ?? null
  const pinned = Boolean(active?.pinned)
  const pathRefs = useRef([])

  const desc = useMemo(() => {
    const count = NUMBER_WORDS[NODES.length] ?? String(NODES.length)
    return `Composite diagram of ${count} components Prem Raj has shipped or lists on his résumé: ${NODES.map(
      (n) => n.label
    ).join(", ")}.`
  }, [])

  const handlers = (id) =>
    interactive
      ? {
          onPointerEnter: () => {
            if (!activeNodeStore.getSnapshot().pinned) {
              activeNodeStore.setActive(id, { source: "plan" })
            }
          },
          onPointerLeave: () => {
            activeNodeStore.clear()
          },
          onClick: () => {
            const snap = activeNodeStore.getSnapshot()
            if (snap.id === id && snap.pinned) activeNodeStore.clear({ force: true })
            else activeNodeStore.setActive(id, { pin: true, source: "plan" })
          },
        }
      : {}

  return (
    <svg
      data-plan=""
      data-compact={compact ? "" : undefined}
      viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
      role="img"
      aria-labelledby={`${titleId} ${descId}`}
      className="block h-auto w-full select-none"
      style={{ color: "var(--edge-ink)" }}
      focusable="false"
    >
      <title id={titleId}>Fig. 0 — Reference architecture, plan view</title>
      <desc id={descId}>{desc}</desc>

      <g aria-hidden="true" stroke="var(--grid-cell)" strokeWidth="1" fill="none">
        {GRID_X.map((x) => (
          <line key={`gx${x}`} x1={x} y1="0" x2={x} y2={VIEW_H} />
        ))}
        {GRID_Y.map((y) => (
          <line key={`gy${y}`} x1="0" y1={y} x2={VIEW_W} y2={y} />
        ))}
      </g>

      <g fill="none" stroke="var(--edge-ink)" strokeWidth="1" strokeLinejoin="round">
        {PLAN_EDGES.map((edge) => (
          <path
            key={`${edge.from}-${edge.to}-${edge.index}`}
            ref={(el) => {
              pathRefs.current[edge.index] = el
            }}
            className={edgeClass(edge, activeId)}
            data-edge={`${edge.from}-${edge.to}`}
            d={edge.d}
            strokeDasharray={edge.async ? "6 4" : undefined}
          />
        ))}
      </g>

      {interactive ? <TraceDots driveTrace={driveTrace} pathRefs={pathRefs} /> : null}

      <g fill="none" stroke="var(--edge-ink)" strokeWidth="1.25">
        {PLAN_NODES.map((node) => (
          <g
            key={node.id}
            className={nodeClass(node.id, activeId)}
            data-node-id={node.id}
            data-pinned={pinned && node.id === activeId ? "" : undefined}
            style={interactive ? { cursor: "pointer" } : undefined}
            {...handlers(node.id)}
          >
            {/* hit area + paper backing so connectors do not run through the glyph */}
            <circle
              cx={fmt(node.sx)}
              cy={fmt(node.sy)}
              r={GLYPH_PX / 2 + 4}
              fill="var(--plan-bg, var(--bg))"
              stroke="none"
            />
            <use
              href={`#glyph-${node.kind}`}
              x={fmt(node.sx - GLYPH_PX / 2)}
              y={fmt(node.sy - GLYPH_PX / 2)}
              width={GLYPH_PX}
              height={GLYPH_PX}
            />
            {compact ? null : (
              <text
                className="mono"
                x={fmt(node.labelX)}
                y={fmt(node.sy + LABEL_DY)}
                fontSize="11"
                textAnchor={node.anchor}
                fill="var(--muted)"
                stroke="none"
              >
                {node.short}
              </text>
            )}
          </g>
        ))}
      </g>
    </svg>
  )
}

function InteractivePlan({ compact, driveTrace }) {
  const active = useActiveNode()
  return <PlanSvg compact={compact} interactive driveTrace={driveTrace} active={active} />
}

/**
 * `driveTrace`: this plan animates "Run a request" (true when no canvas is drawn on top).
 */
export default function ArchitecturePlan({
  compact = false,
  interactive = true,
  driveTrace = false,
}) {
  if (interactive) return <InteractivePlan compact={compact} driveTrace={driveTrace} />
  return <PlanSvg compact={compact} interactive={false} driveTrace={false} active={null} />
}
