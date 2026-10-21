/**
 * Fig. 0 — Reference architecture: pure data and pure routing helpers (design-spec §6.1).
 *
 * No React, no scene code. The only three.js imports are the four curve/vector source modules
 * so the SVG plan (and therefore the footer) never pulls the full `three` bundle. Every
 * `sources` string is unit-tested against `src/data/content.js` (architecture.test.js).
 */
import { CurvePath } from "three/src/extras/core/CurvePath.js"
import { LineCurve3 } from "three/src/extras/curves/LineCurve3.js"
import { QuadraticBezierCurve3 } from "three/src/extras/curves/QuadraticBezierCurve3.js"
import { Vector3 } from "three/src/math/Vector3.js"

export const PAGE_BG = "#F7F7F5"
export const INK = "#80858C" // edges
export const ACCENT = "#1E3DF0"
export const TIER_Z = { ingress: 2.4, compute: 0, state: -2.4 }

/** id, kind, pos [x, y(centre), z], label, short, detail, sources[] */
export const NODES = [
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

/** from, to, async (dashed), offset (lateral shift in units, for return paths) */
export const EDGES = [
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

export const NODE_BY_ID = Object.freeze(Object.fromEntries(NODES.map((node) => [node.id, node])))

export const NODE_KIND = Object.freeze(
  Object.fromEntries(NODES.map((node) => [node.id, node.kind]))
)

export const GLYPH_KINDS = [
  "card",
  "ring",
  "capsule",
  "box",
  "box-sm",
  "queue",
  "cluster",
  "glass",
  "db",
  "graph",
  "lattice",
  "square",
]

/** 7 spheres and 9 links inside the Neo4j wireframe. */
export const GRAPH_INNER = {
  points: [
    [0, 0.18, 0],
    [0.22, 0.05, 0.1],
    [-0.2, 0.08, 0.12],
    [0.1, -0.16, 0.2],
    [-0.12, -0.14, -0.18],
    [0.2, -0.02, -0.22],
    [-0.24, -0.02, -0.05],
  ],
  links: [
    [0, 1],
    [0, 2],
    [1, 3],
    [2, 4],
    [1, 5],
    [2, 6],
    [3, 5],
    [4, 6],
    [0, 5],
  ],
}

/** Eight committed packet positions for the lite tier. */
export const PACKETS_STATIC = [
  { edge: 0, t: 0.35 },
  { edge: 1, t: 0.7 },
  { edge: 5, t: 0.5 },
  { edge: 7, t: 0.2 },
  { edge: 9, t: 0.6 },
  { edge: 11, t: 0.45 },
  { edge: 14, t: 0.3 },
  { edge: 15, t: 0.8 },
]

/**
 * True top-down projection for the SVG plan (viewBox 0 0 560 400):
 * sx = pad + (x + 4.6) * scale, sy = pad + (-z + 3.0) * scale.
 */
export const PLAN_PROJECTION = { angle: 0, scale: 56, pad: 48 }

/** Derived readout suffix: the real source projects / employers of a node. */
export function sourceLabel(node) {
  return node.sources.join(" · ")
}

/* ------------------------------------------------------------------------------------------ */
/* Orthogonal router                                                                           */
/* ------------------------------------------------------------------------------------------ */

const RAIL_Y = 0.12
const MIN_RUN = 0.3
const FILLET_RADIUS = 0.25
const EPS = 1e-9

function anchorY(y) {
  return y > 0.6 ? y - 0.5 : RAIL_Y
}

function samePoint(a, b) {
  return Math.abs(a.x - b.x) < EPS && Math.abs(a.y - b.y) < EPS && Math.abs(a.z - b.z) < EPS
}

/** Drop zero-length segments and merge consecutive collinear runs. */
function simplify(points) {
  const out = []
  for (const p of points) {
    if (out.length && samePoint(out[out.length - 1], p)) continue
    out.push(p)
  }
  const merged = []
  for (let i = 0; i < out.length; i += 1) {
    const p = out[i]
    if (merged.length >= 2) {
      const a = merged[merged.length - 2]
      const b = merged[merged.length - 1]
      const ab = new Vector3().subVectors(b, a).normalize()
      const bp = new Vector3().subVectors(p, b).normalize()
      if (ab.dot(bp) > 1 - 1e-6) {
        merged[merged.length - 1] = p
        continue
      }
    }
    merged.push(p)
  }
  return merged
}

/**
 * Orthogonally routed connector between two nodes with filleted corners.
 *
 * Anchors: A = (f.x, ay, f.z), B = (t.x, by, t.z) with ay = f.y > 0.6 ? f.y - 0.5 : 0.12 (same
 * for by). Anchors above the rail (y = 0.12) start/end with a vertical segment. The horizontal
 * route runs along x first, then z; `offset` shifts the z-run laterally in x and the x-run in z
 * through short orthogonal jogs so the anchors stay exact. A run shorter than 0.3 is omitted (a
 * straight path has no fillet).
 */
export function routeEdge(fromNode, toNode, offset = 0) {
  const [fx, fy, fz] = fromNode.pos
  const [tx, ty, tz] = toNode.pos
  const ay = anchorY(fy)
  const by = anchorY(ty)
  const dx = tx - fx
  const dz = tz - fz
  const runX = Math.abs(dx) >= MIN_RUN
  const runZ = Math.abs(dz) >= MIN_RUN
  const shiftZ = runX ? offset : 0 // x-run shifted in z
  const shiftX = runZ ? offset : 0 // z-run shifted in x

  const xRunZ = fz + shiftZ // z-coordinate of the x-run
  const zRunX = (runX ? tx : fx) + shiftX // x-coordinate of the z-run

  const waypoints = [new Vector3(fx, ay, fz)]
  if (ay > RAIL_Y + EPS) waypoints.push(new Vector3(fx, RAIL_Y, fz)) // drop to the rail
  waypoints.push(new Vector3(fx, RAIL_Y, xRunZ)) // jog onto the shifted x-run
  waypoints.push(new Vector3(zRunX, RAIL_Y, xRunZ)) // x-run (or lateral jog)
  if (runZ) waypoints.push(new Vector3(zRunX, RAIL_Y, tz)) // z-run
  waypoints.push(new Vector3(tx, RAIL_Y, tz)) // jog back over the target
  waypoints.push(new Vector3(tx, by, tz)) // rise to the anchor (no-op on the rail)

  const pts = simplify(waypoints)
  const path = new CurvePath()

  if (pts.length === 1) {
    path.add(new LineCurve3(pts[0].clone(), pts[0].clone()))
    return path
  }
  if (pts.length === 2) {
    path.add(new LineCurve3(pts[0], pts[1]))
    return path
  }

  // Per-corner fillet radius, clamped to half of each adjacent segment.
  const radii = []
  for (let i = 1; i < pts.length - 1; i += 1) {
    const inLen = pts[i].distanceTo(pts[i - 1])
    const outLen = pts[i].distanceTo(pts[i + 1])
    radii.push(Math.min(FILLET_RADIUS, inLen / 2, outLen / 2))
  }

  let cursor = pts[0]
  for (let i = 1; i < pts.length - 1; i += 1) {
    const corner = pts[i]
    const next = pts[i + 1]
    const r = radii[i - 1]
    const inDir = new Vector3().subVectors(corner, cursor).normalize()
    const outDir = new Vector3().subVectors(next, corner).normalize()
    const filletStart = corner.clone().addScaledVector(inDir, -r)
    const filletEnd = corner.clone().addScaledVector(outDir, r)
    if (!samePoint(cursor, filletStart)) path.add(new LineCurve3(cursor, filletStart))
    if (r > EPS) path.add(new QuadraticBezierCurve3(filletStart, corner.clone(), filletEnd))
    cursor = filletEnd
  }
  const last = pts[pts.length - 1]
  if (!samePoint(cursor, last)) path.add(new LineCurve3(cursor, last))

  return path
}

/* ------------------------------------------------------------------------------------------ */
/* Memoised per-edge geometry                                                                  */
/* ------------------------------------------------------------------------------------------ */

const curveCache = new WeakMap()
const samplesCache = new WeakMap()

/** Routed `CurvePath` for an EDGES entry (memoised per edge object). */
export function edgeCurve(edge) {
  let curve = curveCache.get(edge)
  if (!curve) {
    const from = NODE_BY_ID[edge.from]
    const to = NODE_BY_ID[edge.to]
    if (!from || !to) throw new Error(`Unknown edge endpoint: ${edge.from} → ${edge.to}`)
    curve = routeEdge(from, to, edge.offset ?? 0)
    curveCache.set(edge, curve)
  }
  return curve
}

/** Arc length of an EDGES entry in world units (memoised). */
export function edgeLength(edge) {
  return edgeCurve(edge).getLength()
}

/**
 * `getSpacedPoints(n)` flattened to a Float32Array of (n + 1) * 3 numbers, memoised per
 * (edge, n). Packets lerp between neighbouring samples instead of calling `getPointAt`.
 */
export function edgeSamples(edge, n = 64) {
  let byCount = samplesCache.get(edge)
  if (!byCount) {
    byCount = new Map()
    samplesCache.set(edge, byCount)
  }
  let samples = byCount.get(n)
  if (!samples) {
    const points = edgeCurve(edge).getSpacedPoints(n)
    samples = new Float32Array((n + 1) * 3)
    for (let i = 0; i <= n; i += 1) {
      const p = points[i]
      samples[i * 3] = p.x
      samples[i * 3 + 1] = p.y
      samples[i * 3 + 2] = p.z
    }
    byCount.set(n, samples)
  }
  return samples
}
