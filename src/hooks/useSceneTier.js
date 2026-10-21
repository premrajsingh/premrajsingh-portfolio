import { useEffect, useState } from "react"
import { probeWebGL } from "./useWebGL.js"

const RM_QUERY = "(prefers-reduced-motion: reduce)"
const WIDE_QUERY = "(min-width: 1024px)"

function matches(query) {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
  return window.matchMedia(query).matches
}

/**
 * Scene tier (design-spec §6.4 as amended by §0.1).
 *
 *   static — prefers-reduced-motion, no WebGL, or `navigator.connection.saveData`
 *   lite   — viewport narrower than 1024px, or ≤ 4 cores, or ≤ 4 GB device memory
 *   full   — everything else
 *
 * Phones get real 3D (lite); the SVG plan is only the static tier, the Suspense fallback
 * and the footer colophon.
 */
export function computeSceneTier() {
  if (typeof window === "undefined" || typeof navigator === "undefined") return "static"
  if (matches(RM_QUERY)) return "static"
  if (!probeWebGL()) return "static"
  if (navigator.connection && navigator.connection.saveData) return "static"

  const narrow = !matches(WIDE_QUERY)
  const cores = navigator.hardwareConcurrency
  const memory = navigator.deviceMemory
  if (
    narrow ||
    (typeof cores === "number" && cores <= 4) ||
    (typeof memory === "number" && memory <= 4)
  ) {
    return "lite"
  }
  return "full"
}

/**
 * Returns "full" | "lite" | "static", computed synchronously in the `useState` initialiser
 * so the hero never mounts the wrong branch for a tick. Re-evaluates when the
 * reduced-motion or width media queries change.
 */
export function useSceneTier() {
  const [tier, setTier] = useState(computeSceneTier)

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined
    const queries = [window.matchMedia(RM_QUERY), window.matchMedia(WIDE_QUERY)]
    const update = () => setTier(computeSceneTier())
    update()
    queries.forEach((mq) => mq.addEventListener("change", update))
    return () => queries.forEach((mq) => mq.removeEventListener("change", update))
  }, [])

  return tier
}
