/**
 * Packet simulation for the Fig. 0 connectors (design-spec §6.2). Pure and deterministic:
 * no three.js, no React. `createPackets` builds the state, `stepPackets` mutates it.
 *
 * Packet shape: { edge: number, t: 0..1, speed: units/s, hold: seconds left at the LLM, alive }.
 * The returned array also carries non-enumerable `edges`, `lengths` and `rng` so that
 * `stepPackets(state, dt, hooks)` needs nothing else.
 */
import { edgeLength } from "./architecture.js"

export const SPEED_MIN = 0.1
export const SPEED_MAX = 0.18
export const LLM_HOLD = 0.6
export const ASYNC_SPAWN_SHARE = 0.3
const LLM_ID = "llm"

/** mulberry32 — small deterministic PRNG returning numbers in [0, 1). */
export function seeded(seed = 7) {
  let a = seed >>> 0
  return function next() {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function resolveLength(edge) {
  if (typeof edge.length === "number" && edge.length > 0) return edge.length
  return edgeLength(edge)
}

function randomSpeed(rng) {
  return SPEED_MIN + rng() * (SPEED_MAX - SPEED_MIN)
}

/**
 * Pick a spawn edge. Async (bus) edges are chosen at most 30 % of the time so the message bus
 * is never the busiest path.
 */
function pickEdge(edges, rng) {
  const asyncIdx = []
  const syncIdx = []
  edges.forEach((edge, i) => (edge.async ? asyncIdx : syncIdx).push(i))
  const pool =
    asyncIdx.length && (syncIdx.length === 0 || rng() < ASYNC_SPAWN_SHARE) ? asyncIdx : syncIdx
  return pool[Math.min(pool.length - 1, Math.floor(rng() * pool.length))]
}

function attachState(packets, edges, rng) {
  const lengths = edges.map(resolveLength)
  Object.defineProperties(packets, {
    edges: { value: edges, enumerable: false },
    lengths: { value: lengths, enumerable: false },
    rng: { value: rng, enumerable: false },
  })
  return packets
}

/**
 * Create `count` packets spread along random edges with speeds uniform in 0.10–0.18 u/s.
 * Deterministic for a fixed `rng`.
 */
export function createPackets(edges, count, rng = seeded(7)) {
  const packets = []
  if (edges.length === 0) return attachState(packets, edges, rng)
  for (let i = 0; i < count; i += 1) {
    packets.push({
      edge: pickEdge(edges, rng),
      t: rng(),
      speed: randomSpeed(rng),
      hold: 0,
      alive: true,
    })
  }
  return attachState(packets, edges, rng)
}

/**
 * Create packets from committed `{ edge, t }` positions (PACKETS_STATIC) so the lite tier
 * starts from a known picture and is then stepped normally.
 */
export function createPacketsFrom(edges, statics, rng = seeded(7)) {
  const packets = statics
    .filter((s) => s.edge >= 0 && s.edge < edges.length)
    .map((s) => ({
      edge: s.edge,
      t: Math.min(1, Math.max(0, s.t)),
      speed: randomSpeed(rng),
      hold: 0,
      alive: true,
    }))
  return attachState(packets, edges, rng)
}

function respawn(packet, edgeIndex) {
  packet.edge = edgeIndex
  packet.t = 0
  packet.hold = 0
}

/**
 * Advance every live packet by `dt` seconds.
 *   hooks.onArrive(nodeId)  — a packet reached the end of its edge
 *   hooks.onLlmHold()       — a packet started its 0.6 s hold at the LLM
 */
export function stepPackets(state, dt, hooks = {}) {
  const { edges, lengths, rng } = state
  if (!edges || edges.length === 0 || !(dt > 0)) return state
  const llmOut = edges.findIndex((edge) => edge.from === LLM_ID)

  for (let i = 0; i < state.length; i += 1) {
    const packet = state[i]
    if (!packet.alive) continue

    if (packet.hold > 0) {
      packet.hold -= dt
      if (packet.hold <= 0) {
        respawn(packet, llmOut >= 0 ? llmOut : pickEdge(edges, rng))
      }
      continue
    }

    const length = lengths[packet.edge] || 1
    packet.t += (packet.speed * dt) / length
    if (packet.t < 1) continue

    const edge = edges[packet.edge]
    if (typeof hooks.onArrive === "function") hooks.onArrive(edge.to)

    if (edge.to === LLM_ID) {
      packet.t = 1
      packet.hold = LLM_HOLD
      if (typeof hooks.onLlmHold === "function") hooks.onLlmHold()
    } else {
      respawn(packet, pickEdge(edges, rng))
    }
  }
  return state
}
