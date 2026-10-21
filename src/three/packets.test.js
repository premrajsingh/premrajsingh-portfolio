import { describe, expect, it, vi } from "vitest"
import { EDGES, PACKETS_STATIC, edgeLength } from "./architecture.js"
import {
  ASYNC_SPAWN_SHARE,
  LLM_HOLD,
  SPEED_MAX,
  SPEED_MIN,
  createPackets,
  createPacketsFrom,
  seeded,
  stepPackets,
} from "./packets.js"

/** Small synthetic graph with explicit lengths so arithmetic is exact. */
const TEST_EDGES = [
  { from: "a", to: "b", async: false, length: 1 },
  { from: "b", to: "llm", async: false, length: 2 },
  { from: "llm", to: "a", async: false, length: 1 },
  { from: "a", to: "bus", async: true, length: 1 },
]

describe("createPackets", () => {
  it("returns `count` packets with speeds in 0.10–0.18 and t in [0, 1)", () => {
    const packets = createPackets(EDGES, 20)
    expect(packets).toHaveLength(20)
    for (const packet of packets) {
      expect(packet.speed).toBeGreaterThanOrEqual(SPEED_MIN)
      expect(packet.speed).toBeLessThanOrEqual(SPEED_MAX)
      expect(packet.t).toBeGreaterThanOrEqual(0)
      expect(packet.t).toBeLessThan(1)
      expect(packet.hold).toBe(0)
      expect(packet.alive).toBe(true)
      expect(packet.edge).toBeGreaterThanOrEqual(0)
      expect(packet.edge).toBeLessThan(EDGES.length)
    }
  })

  it("is deterministic for a fixed seed", () => {
    const a = createPackets(EDGES, 20, seeded(7))
    const b = createPackets(EDGES, 20, seeded(7))
    expect(JSON.parse(JSON.stringify(a))).toEqual(JSON.parse(JSON.stringify(b)))
    const c = createPackets(EDGES, 20, seeded(8))
    expect(JSON.stringify(c)).not.toBe(JSON.stringify(a))
  })

  it("uses real edge lengths from architecture.js", () => {
    const packets = createPackets(EDGES, 1)
    expect(packets.lengths).toHaveLength(EDGES.length)
    EDGES.forEach((edge, i) => expect(packets.lengths[i]).toBeCloseTo(edgeLength(edge), 9))
  })

  it("spawns on async edges at most 30 % of the time", () => {
    const packets = createPackets(EDGES, 2000, seeded(3))
    const asyncShare = packets.filter((p) => EDGES[p.edge].async).length / packets.length
    expect(asyncShare).toBeLessThanOrEqual(ASYNC_SPAWN_SHARE + 0.03)
    expect(asyncShare).toBeGreaterThan(0.2)
  })

  it("createPacketsFrom seeds the lite tier from PACKETS_STATIC", () => {
    const packets = createPacketsFrom(EDGES, PACKETS_STATIC)
    expect(packets).toHaveLength(PACKETS_STATIC.length)
    packets.forEach((p, i) => {
      expect(p.edge).toBe(PACKETS_STATIC[i].edge)
      expect(p.t).toBe(PACKETS_STATIC[i].t)
    })
    stepPackets(packets, 0.5)
    expect(packets[0].t).toBeGreaterThan(PACKETS_STATIC[0].t)
  })
})

describe("stepPackets", () => {
  it("advances t by speed · dt / edgeLength", () => {
    const packets = createPacketsFrom(TEST_EDGES, [{ edge: 1, t: 0.1 }])
    packets[0].speed = 0.15
    stepPackets(packets, 2)
    expect(packets[0].t).toBeCloseTo(0.1 + (0.15 * 2) / 2, 9)
    expect(packets[0].hold).toBe(0)
  })

  it("skips dead packets", () => {
    const packets = createPacketsFrom(TEST_EDGES, [{ edge: 0, t: 0.2 }])
    packets[0].alive = false
    stepPackets(packets, 1)
    expect(packets[0].t).toBe(0.2)
  })

  it("calls onArrive with edge.to and respawns at t = 0 on a non-LLM arrival", () => {
    const packets = createPacketsFrom(TEST_EDGES, [{ edge: 0, t: 0.99 }])
    packets[0].speed = 0.18
    const onArrive = vi.fn()
    stepPackets(packets, 1, { onArrive })
    expect(onArrive).toHaveBeenCalledTimes(1)
    expect(onArrive).toHaveBeenCalledWith("b")
    expect(packets[0].t).toBe(0)
    expect(packets[0].hold).toBe(0)
    expect(packets[0].edge).toBeGreaterThanOrEqual(0)
    expect(packets[0].edge).toBeLessThan(TEST_EDGES.length)
  })

  it("holds 0.6 s at the LLM then respawns on an edge whose from === 'llm'", () => {
    const packets = createPacketsFrom(TEST_EDGES, [{ edge: 1, t: 0.99 }])
    packets[0].speed = 0.18
    const onArrive = vi.fn()
    const onLlmHold = vi.fn()

    stepPackets(packets, 1, { onArrive, onLlmHold })
    expect(onArrive).toHaveBeenCalledWith("llm")
    expect(onLlmHold).toHaveBeenCalledTimes(1)
    expect(packets[0].t).toBe(1)
    expect(packets[0].hold).toBeCloseTo(LLM_HOLD, 9)
    expect(packets[0].edge).toBe(1)

    stepPackets(packets, 0.3, { onArrive, onLlmHold })
    expect(packets[0].edge).toBe(1)
    expect(packets[0].t).toBe(1)
    expect(packets[0].hold).toBeCloseTo(0.3, 9)

    stepPackets(packets, 0.31, { onArrive, onLlmHold })
    expect(packets[0].hold).toBe(0)
    expect(packets[0].t).toBe(0)
    expect(TEST_EDGES[packets[0].edge].from).toBe("llm")
    expect(onArrive).toHaveBeenCalledTimes(1)
  })

  it("respawns on the real llm→agents connector after the hold", () => {
    const llmIn = EDGES.findIndex((e) => e.to === "llm")
    const packets = createPacketsFrom(EDGES, [{ edge: llmIn, t: 0.999 }])
    packets[0].speed = SPEED_MAX
    stepPackets(packets, 1)
    expect(packets[0].hold).toBeCloseTo(LLM_HOLD, 9)
    stepPackets(packets, LLM_HOLD + 0.01)
    expect(EDGES[packets[0].edge].from).toBe("llm")
    expect(EDGES[packets[0].edge].to).toBe("agents")
  })

  it("is deterministic over many steps for a fixed seed", () => {
    const run = (seed) => {
      const packets = createPackets(EDGES, 20, seeded(seed))
      const arrivals = []
      for (let i = 0; i < 600; i += 1) {
        stepPackets(packets, 1 / 60, { onArrive: (id) => arrivals.push(id) })
      }
      return { packets: JSON.parse(JSON.stringify(packets)), arrivals }
    }
    expect(run(11)).toEqual(run(11))
    expect(run(11).arrivals.length).toBeGreaterThan(0)
  })

  it("keeps the async spawn share at or below 30 % across respawns", () => {
    const packets = createPackets(EDGES, 50, seeded(5))
    let asyncSpawns = 0
    let spawns = 0
    for (let i = 0; i < 4000; i += 1) {
      const before = packets.map((p) => p.edge)
      stepPackets(packets, 0.5)
      packets.forEach((p, idx) => {
        if (p.t === 0 && p.hold === 0 && before[idx] !== undefined) {
          spawns += 1
          if (EDGES[p.edge].async) asyncSpawns += 1
        }
      })
    }
    expect(spawns).toBeGreaterThan(100)
    expect(asyncSpawns / spawns).toBeLessThanOrEqual(ASYNC_SPAWN_SHARE + 0.03)
  })

  it("is a no-op for non-positive dt or an empty edge list", () => {
    const packets = createPacketsFrom(TEST_EDGES, [{ edge: 0, t: 0.5 }])
    stepPackets(packets, 0)
    stepPackets(packets, -1)
    expect(packets[0].t).toBe(0.5)
    const empty = createPackets([], 5)
    expect(empty).toHaveLength(0)
    expect(stepPackets(empty, 1)).toBe(empty)
  })
})
