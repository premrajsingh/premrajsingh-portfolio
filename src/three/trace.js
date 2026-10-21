/**
 * "Run a request" — scripted traces through the Fig. 0 diagram.
 *
 * Pure and deterministic (no React, no three.js scene code). A scenario is a list of steps;
 * each step moves a trace packet along one existing connector (`edge` is an index into
 * EDGES). `reverse` walks the connector end → start, which is how a response travels back on
 * the same link. Steps that share a `parallel` key start together and the next stage waits
 * for all of them. Every label names only components and behaviour described on the résumé;
 * the timings are the animation's own, never production measurements.
 */
import { EDGES, NODE_BY_ID, edgeLength } from "./architecture.js"

export const TRACE_SPEED = 4.6 // world units per second
export const TRACE_LLM_HOLD = 0.8 // seconds a trace packet waits for inference

export const SCENARIOS = [
  {
    id: "estimate",
    title: "Estimate request",
    source: "AI Project Estimator",
    steps: [
      { edge: 1, label: "POST /estimate" },
      { edge: 6, label: "publish estimate.requested" },
      { edge: 7, label: "agent picks up the job" },
      { edge: 9, label: "LLM inference", hold: TRACE_LLM_HOLD },
      { edge: 10, label: "cost · timeline · risk reports" },
      { edge: 8, reverse: true, label: "result returned" },
      { edge: 11, label: "persist report", parallel: "finish" },
      { edge: 1, reverse: true, label: "200 OK", parallel: "finish" },
    ],
  },
  {
    id: "whatsapp",
    title: "Inbound WhatsApp message",
    source: "Droot Private Limited",
    steps: [
      { edge: 2, label: "webhook received · verified" },
      { edge: 5, label: "publish message.received", parallel: "fanout" },
      { edge: 3, label: "emit message event", parallel: "fanout" },
      { edge: 4, label: "delivered to the client" },
    ],
  },
  {
    id: "rag",
    title: "Knowledge-graph RAG query",
    source: "Droot Private Limited",
    steps: [
      { edge: 14, label: "graph traversal", parallel: "fetch" },
      { edge: 15, label: "vector search", parallel: "fetch" },
      { edge: 14, reverse: true, label: "graph context", parallel: "merge" },
      { edge: 15, reverse: true, label: "top-k chunks", parallel: "merge" },
      { edge: 16, label: "grounded generation", hold: TRACE_LLM_HOLD },
      { edge: 16, reverse: true, label: "answer returned" },
    ],
  },
]

/** Human-readable "from → to" for a step, respecting `reverse`. */
export function stepRoute(step) {
  const edge = EDGES[step.edge]
  const from = NODE_BY_ID[step.reverse ? edge.to : edge.from]
  const to = NODE_BY_ID[step.reverse ? edge.from : edge.to]
  return { from, to, async: Boolean(edge.async) }
}

/** Group consecutive steps that share a `parallel` key into one stage. */
export function stagesOf(steps) {
  const stages = []
  for (const step of steps) {
    const last = stages[stages.length - 1]
    if (step.parallel && last && last.key === step.parallel) last.steps.push(step)
    else stages.push({ key: step.parallel ?? null, steps: [step] })
  }
  return stages
}

/**
 * Build a run: a planned timeline (seconds) for every span plus an `update(elapsed)` that
 * derives packet positions and span states. `lengthOf` is injectable for tests.
 */
export function createTraceRun(scenario, { speed = TRACE_SPEED, lengthOf = edgeLength } = {}) {
  const spans = []
  const stages = []
  let cursor = 0

  for (const stage of stagesOf(scenario.steps)) {
    const start = cursor
    let end = start
    const stageSpans = stage.steps.map((step) => {
      const length = lengthOf(EDGES[step.edge])
      const travel = length / speed
      const hold = step.hold ?? 0
      const { from, to, async } = stepRoute(step)
      const span = {
        index: spans.length,
        label: step.label,
        from: from.id,
        to: to.id,
        async,
        edge: step.edge,
        reverse: Boolean(step.reverse),
        length,
        travel,
        hold,
        duration: travel + hold,
        start,
        end: start + travel + hold,
        state: "pending", // pending | active | done
        arrived: false, // packet reached the destination (hold may still be running)
        progress: 0, // 0..1 along the connector in travel direction
      }
      end = Math.max(end, span.end)
      spans.push(span)
      return span
    })
    stages.push({ key: stage.key, spans: stageSpans, start, end })
    cursor = end
  }

  const total = cursor
  const packets = [] // reused array of { edge, t, reverse, span }

  function update(elapsed) {
    let changed = false
    let arrivals = 0
    packets.length = 0
    for (const span of spans) {
      const prevState = span.state
      const prevArrived = span.arrived
      if (elapsed < span.start) {
        span.state = "pending"
        span.progress = 0
        span.arrived = false
      } else if (elapsed >= span.end) {
        span.state = "done"
        span.progress = 1
        span.arrived = true
      } else {
        span.state = "active"
        span.progress = span.travel > 0 ? Math.min(1, (elapsed - span.start) / span.travel) : 1
        span.arrived = span.progress >= 1
        packets.push({
          edge: span.edge,
          reverse: span.reverse,
          t: span.reverse ? 1 - span.progress : span.progress,
          span,
        })
      }
      if (span.state !== prevState) changed = true
      if (span.arrived && !prevArrived) arrivals += 1
    }
    return { changed, arrivals, done: elapsed >= total, packets }
  }

  return { scenario, spans, stages, total, packets, update }
}
