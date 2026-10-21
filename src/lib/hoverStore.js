import { useSyncExternalStore } from "react"

/**
 * Minimal "which item is hovered" store shared between a DOM list and the R3F figure that
 * mirrors it (Skills rows ↔ shelf objects). Notifies only when the key changes; R3F reads
 * `getSnapshot()` inside useFrame without subscribing.
 */
export function createHoverStore() {
  let key = null
  const listeners = new Set()
  const store = {
    getSnapshot: () => key,
    subscribe: (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    set(next) {
      const value = next ?? null
      if (value === key) return
      key = value
      listeners.forEach((fn) => fn(key))
    },
    clear(only) {
      if (only !== undefined && key !== only) return
      store.set(null)
    },
  }
  return store
}

export function useHoverStore(store) {
  return useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot)
}

/** Skills table rows ↔ the Skills shelf figure. Keys are SKILLS[].title. */
export const skillHover = createHoverStore()
