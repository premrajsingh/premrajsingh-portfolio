import { describe, expect, it } from "vitest"
import { EXPERIENCE, PROJECTS } from "../data/content.js"
import {
  EDGES,
  GLYPH_KINDS,
  GRAPH_INNER,
  NODES,
  NODE_BY_ID,
  NODE_KIND,
  PACKETS_STATIC,
  PLAN_PROJECTION,
  edgeCurve,
  edgeLength,
  edgeSamples,
  routeEdge,
  sourceLabel,
} from "./architecture.js"

const RAIL_Y = 0.12
const anchorY = (y) => (y > 0.6 ? y - 0.5 : RAIL_Y)
const anchorOf = (node) => [node.pos[0], anchorY(node.pos[1]), node.pos[2]]

describe("architecture data — composite honesty", () => {
  const allowedSources = new Set([
    ...PROJECTS.map((p) => p.title),
    ...EXPERIENCE.map((e) => e.company).filter(Boolean),
    "Skills",
  ])

  it("has thirteen nodes and seventeen edges", () => {
    expect(NODES).toHaveLength(13)
    expect(EDGES).toHaveLength(17)
  })

  it("every node source is a PROJECTS title, an EXPERIENCE company or 'Skills'", () => {
    for (const node of NODES) {
      expect(node.sources.length, `${node.id} has sources`).toBeGreaterThan(0)
      for (const source of node.sources) {
        expect(allowedSources.has(source), `${node.id}: "${source}"`).toBe(true)
      }
    }
  })

  it("node ids are unique and NODE_BY_ID / NODE_KIND match", () => {
    const ids = NODES.map((n) => n.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const node of NODES) {
      expect(NODE_BY_ID[node.id]).toBe(node)
      expect(NODE_KIND[node.id]).toBe(node.kind)
    }
  })

  it("every node kind is a glyph kind", () => {
    for (const node of NODES) expect(GLYPH_KINDS).toContain(node.kind)
    expect(GLYPH_KINDS).toContain("square")
  })

  it("every edge endpoint is a node id", () => {
    for (const edge of EDGES) {
      expect(NODE_BY_ID[edge.from], `from ${edge.from}`).toBeDefined()
      expect(NODE_BY_ID[edge.to], `to ${edge.to}`).toBeDefined()
      expect(typeof edge.async).toBe("boolean")
    }
  })

  it("the bus is Skills-only and no edge implies Estimator→Neo4j/Pinecone or Droot→Kafka", () => {
    expect(NODE_BY_ID.bus.sources).toEqual(["Skills"])
    const touching = (id) => EDGES.filter((e) => e.from === id || e.to === id)
    for (const edge of [...touching("neo4j"), ...touching("pinecone")]) {
      expect([edge.from, edge.to]).toContain("rag")
    }
    for (const edge of touching("bus")) {
      expect(["node-api", "fastapi", "agents"]).toContain(edge.from === "bus" ? edge.to : edge.from)
    }
  })

  it("sourceLabel joins sources with a middle dot", () => {
    expect(sourceLabel(NODE_BY_ID.llm)).toBe("AI Project Estimator · Droot Private Limited")
  })

  it("every EXPERIENCE stack id exists in NODES", () => {
    for (const entry of EXPERIENCE) {
      for (const id of entry.stack ?? []) {
        expect(NODE_BY_ID[id], `${entry.role}: ${id}`).toBeDefined()
      }
    }
  })

  it("GRAPH_INNER has 7 points and 9 links inside range", () => {
    expect(GRAPH_INNER.points).toHaveLength(7)
    expect(GRAPH_INNER.links).toHaveLength(9)
    for (const [a, b] of GRAPH_INNER.links) {
      expect(a).toBeGreaterThanOrEqual(0)
      expect(b).toBeGreaterThanOrEqual(0)
      expect(a).toBeLessThan(7)
      expect(b).toBeLessThan(7)
    }
  })

  it("PACKETS_STATIC references valid edges with 0 ≤ t ≤ 1", () => {
    expect(PACKETS_STATIC).toHaveLength(8)
    for (const packet of PACKETS_STATIC) {
      expect(Number.isInteger(packet.edge)).toBe(true)
      expect(packet.edge).toBeGreaterThanOrEqual(0)
      expect(packet.edge).toBeLessThan(EDGES.length)
      expect(packet.t).toBeGreaterThanOrEqual(0)
      expect(packet.t).toBeLessThanOrEqual(1)
    }
  })

  it("PLAN_PROJECTION keeps every node inside the 560×400 viewBox", () => {
    const { scale, pad } = PLAN_PROJECTION
    for (const node of NODES) {
      const sx = pad + (node.pos[0] + 4.6) * scale
      const sy = pad + (-node.pos[2] + 3.0) * scale
      expect(sx).toBeGreaterThan(14)
      expect(sx).toBeLessThan(560 - 14)
      expect(sy).toBeGreaterThan(14)
      expect(sy).toBeLessThan(400 - 14)
    }
  })
})

describe("routeEdge", () => {
  it.each(EDGES.map((edge, i) => [i, edge]))(
    "edge %i starts at the from anchor and ends at the to anchor",
    (_i, edge) => {
      const from = NODE_BY_ID[edge.from]
      const to = NODE_BY_ID[edge.to]
      const path = routeEdge(from, to, edge.offset ?? 0)
      const [ax, ay, az] = anchorOf(from)
      const [bx, by, bz] = anchorOf(to)
      const start = path.getPoint(0)
      const end = path.getPoint(1)
      expect(start.x).toBeCloseTo(ax, 6)
      expect(start.y).toBeCloseTo(ay, 6)
      expect(start.z).toBeCloseTo(az, 6)
      expect(end.x).toBeCloseTo(bx, 6)
      expect(end.y).toBeCloseTo(by, 6)
      expect(end.z).toBeCloseTo(bz, 6)
      const length = path.getLength()
      expect(Number.isFinite(length)).toBe(true)
      expect(length).toBeGreaterThan(0)
    }
  )

  it("routes orthogonally on the rail plane between the anchors", () => {
    const path = routeEdge(NODE_BY_ID.client, NODE_BY_ID["node-api"])
    const points = path.getSpacedPoints(64)
    for (const p of points) expect(p.y).toBeCloseTo(RAIL_Y, 6)
    // the LLM anchor sits above the rail and drops to it first
    const drop = routeEdge(NODE_BY_ID.agents, NODE_BY_ID.llm).getSpacedPoints(32)
    expect(drop[0].y).toBeCloseTo(RAIL_Y, 6)
    expect(drop[drop.length - 1].y).toBeCloseTo(0.85, 6)
  })

  it("a lateral offset displaces the middle of the route but not the anchors", () => {
    const plain = routeEdge(NODE_BY_ID.agents, NODE_BY_ID.llm)
    const shifted = routeEdge(NODE_BY_ID.llm, NODE_BY_ID.agents, 0.18)
    const midPlain = plain.getPoint(0.5)
    const midShifted = shifted.getPoint(0.5)
    expect(Math.abs(midShifted.x - midPlain.x)).toBeGreaterThan(0.1)
  })

  it("omits a run shorter than 0.3 so the path is a straight line", () => {
    const path = routeEdge(NODE_BY_ID.fastapi, NODE_BY_ID.agents)
    expect(path.curves).toHaveLength(1)
    expect(path.getLength()).toBeCloseTo(4.2, 6)
  })
})

describe("edge geometry memoisation", () => {
  it("edgeSamples(edge, 64) has 65 × 3 numbers and is memoised", () => {
    const samples = edgeSamples(EDGES[0], 64)
    expect(samples).toBeInstanceOf(Float32Array)
    expect(samples.length).toBe(65 * 3)
    expect(edgeSamples(EDGES[0], 64)).toBe(samples)
    expect(edgeSamples(EDGES[0], 16).length).toBe(17 * 3)
  })

  it("edgeCurve and edgeLength are consistent and finite for every edge", () => {
    for (const edge of EDGES) {
      const curve = edgeCurve(edge)
      expect(edgeCurve(edge)).toBe(curve)
      expect(edgeLength(edge)).toBeCloseTo(curve.getLength(), 9)
      expect(Number.isFinite(edgeLength(edge))).toBe(true)
    }
  })
})
