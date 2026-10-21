import { useSyncExternalStore } from "react"

/**
 * Active-node store (design-spec §6.7). One mutable singleton shared by the hero
 * legend, the 3D scene, the SVG plan and the Skills rows. Listeners are notified only
 * when `id` or `pinned` changes; `source` is recorded silently. The scene reads
 * `getSnapshot()` inside `useFrame` without subscribing; DOM consumers use
 * `useActiveNode()`.
 */
const EMPTY = Object.freeze({ id: null, pinned: false, source: null })

let state = EMPTY
const listeners = new Set()

function emit() {
  listeners.forEach((fn) => fn(state))
}

export const activeNodeStore = {
  getSnapshot: () => state,
  subscribe: (fn) => {
    listeners.add(fn)
    return () => listeners.delete(fn)
  },
  /**
   * Activate `id`. `pin` persists the selection through pointer-out; callers decide
   * whether a hover may replace a pinned node (the spec says it may not).
   */
  setActive(id, { pin = false, source = null } = {}) {
    const nextId = id ?? null
    const nextPinned = Boolean(pin)
    if (state.id === nextId && state.pinned === nextPinned) {
      if (state.source !== source) state = { ...state, source }
      return
    }
    state = { id: nextId, pinned: nextPinned, source }
    emit()
  },
  /** Clear the active node. A pinned node survives unless `force` is set. */
  clear({ force = false } = {}) {
    if (state.pinned && !force) return
    if (state.id === null && !state.pinned) return
    state = EMPTY
    emit()
  },
}

export function useActiveNode() {
  return useSyncExternalStore(
    activeNodeStore.subscribe,
    activeNodeStore.getSnapshot,
    activeNodeStore.getSnapshot
  )
}
