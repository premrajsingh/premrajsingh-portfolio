import { useSyncExternalStore } from "react"
import { SCENARIOS, createTraceRun } from "../three/trace.js"

/**
 * Shared state for "Run a request". One run at a time; `start()` cycles through SCENARIOS.
 * Whoever animates the figure (the 3D scene's useFrame, or the SVG plan's rAF loop) calls
 * `tick(nowMs)` and reads the returned packet positions. Listeners are notified only when a
 * span changes state or the run starts/finishes — never per frame.
 */
const IDLE = Object.freeze({
  status: "idle", // idle | running | done
  scenarioIndex: -1,
  run: null,
  startedAt: 0,
  elapsed: 0,
  instant: false,
  version: 0,
})

let state = IDLE
const listeners = new Set()

function emit() {
  listeners.forEach((fn) => fn(state))
}

export const traceStore = {
  getSnapshot: () => state,
  subscribe: (fn) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  /** Start the next scenario. `instant` completes it immediately (reduced motion). */
  start({ instant = false, now = performance.now() } = {}) {
    if (state.status === "running") return
    const scenarioIndex = (state.scenarioIndex + 1) % SCENARIOS.length
    const run = createTraceRun(SCENARIOS[scenarioIndex])
    state = {
      status: "running",
      scenarioIndex,
      run,
      startedAt: now,
      elapsed: 0,
      instant,
      version: state.version + 1,
    }
    emit()
    if (instant) traceStore.tick(now)
  },
  /** Advance the run to wall-clock `nowMs`. Returns the run's update result or null. */
  tick(nowMs) {
    if (state.status !== "running" || !state.run) return null
    const elapsed = state.instant ? state.run.total : (nowMs - state.startedAt) / 1000
    const result = state.run.update(elapsed)
    if (result.done || result.changed) {
      state = {
        ...state,
        elapsed,
        status: result.done ? "done" : "running",
        version: state.version + 1,
      }
      emit()
    } else {
      state.elapsed = elapsed
    }
    return result
  },
  reset() {
    if (state === IDLE) return
    state = { ...IDLE, scenarioIndex: state.scenarioIndex }
    emit()
  },
}

export function useTrace() {
  return useSyncExternalStore(traceStore.subscribe, traceStore.getSnapshot, traceStore.getSnapshot)
}
