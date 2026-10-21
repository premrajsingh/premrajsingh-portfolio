import { describe, expect, it } from "vitest"
import { EDGES, NODE_BY_ID } from "./architecture.js"
import { EXPERIENCE, PROJECTS } from "../data/content.js"
import { SCENARIOS, createTraceRun, stagesOf, stepRoute } from "./trace.js"

const KNOWN_SOURCES = new Set([
  ...PROJECTS.map((p) => p.title),
  ...EXPERIENCE.map((e) => e.company).filter(Boolean),
])

describe("trace scenarios", () => {
  it("only use real connectors and real sources", () => {
    for (const scenario of SCENARIOS) {
      expect(KNOWN_SOURCES.has(scenario.source)).toBe(true)
      expect(scenario.steps.length).toBeGreaterThan(0)
      for (const step of scenario.steps) {
        expect(step.edge).toBeGreaterThanOrEqual(0)
        expect(step.edge).toBeLessThan(EDGES.length)
        expect(step.label.length).toBeGreaterThan(0)
        const { from, to } = stepRoute(step)
        expect(NODE_BY_ID[from.id]).toBeDefined()
        expect(NODE_BY_ID[to.id]).toBeDefined()
      }
    }
  })

  it("chain: every step starts where the previous stage ended", () => {
    for (const scenario of SCENARIOS) {
      const stages = stagesOf(scenario.steps)
      for (let i = 1; i < stages.length; i += 1) {
        const prevEnds = new Set(stages[i - 1].steps.map((s) => stepRoute(s).to.id))
        for (const step of stages[i].steps) {
          expect(prevEnds.has(stepRoute(step).from.id)).toBe(true)
        }
      }
    }
  })

  it("groups consecutive parallel steps into one stage", () => {
    const rag = SCENARIOS.find((s) => s.id === "rag")
    const stages = stagesOf(rag.steps)
    expect(stages.map((s) => s.steps.length)).toEqual([2, 2, 1, 1])
  })
})

describe("createTraceRun", () => {
  const lengthOf = () => 2 // every connector 2 units long → 1 s at speed 2

  it("plans a sequential timeline with holds", () => {
    const run = createTraceRun(SCENARIOS[0], { speed: 2, lengthOf })
    expect(run.spans.length).toBe(8)
    expect(run.spans[0].start).toBe(0)
    expect(run.spans[0].end).toBe(1)
    expect(run.spans[1].start).toBe(1)
    const llm = run.spans[3]
    expect(llm.hold).toBeGreaterThan(0)
    expect(llm.end - llm.start).toBeCloseTo(1 + llm.hold)
    // 8 spans, but "persist report" and "200 OK" fan out together → 7 sequential seconds.
    expect(run.total).toBeCloseTo(7 + llm.hold)
    expect(run.spans[6].start).toBe(run.spans[7].start)
  })

  it("runs parallel spans together and waits for both", () => {
    const rag = SCENARIOS.find((s) => s.id === "rag")
    const run = createTraceRun(rag, { speed: 2, lengthOf: (e) => (e.to === "neo4j" ? 2 : 4) })
    expect(run.spans[0].start).toBe(run.spans[1].start)
    expect(run.stages[0].end).toBe(2) // the slower (4-unit) span sets the stage end
    expect(run.spans[2].start).toBe(2)
  })

  it("update() reports states, progress, arrivals and completion", () => {
    const run = createTraceRun(SCENARIOS[1], { speed: 2, lengthOf })
    let r = run.update(0)
    expect(run.spans[0].state).toBe("active")
    expect(r.packets.length).toBe(1)
    expect(r.packets[0].t).toBe(0)

    r = run.update(0.5)
    expect(run.spans[0].progress).toBeCloseTo(0.5)
    expect(r.changed).toBe(false)

    r = run.update(1.25)
    expect(run.spans[0].state).toBe("done")
    expect(run.spans[1].state).toBe("active")
    expect(r.changed).toBe(true)
    expect(r.arrivals).toBe(1)

    r = run.update(100)
    expect(r.done).toBe(true)
    expect(run.spans.every((s) => s.state === "done")).toBe(true)
    expect(r.packets.length).toBe(0)
  })

  it("reverse spans move the packet from t=1 to t=0", () => {
    const run = createTraceRun(SCENARIOS[0], { speed: 2, lengthOf })
    const back = run.spans.find((s) => s.reverse)
    const r = run.update(back.start + 0.25)
    const packet = r.packets.find((p) => p.span === back)
    expect(packet.t).toBeCloseTo(0.75)
  })
})
