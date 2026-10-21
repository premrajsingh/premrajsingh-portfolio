import { useEffect, useState } from "react"

const QUERY = "(prefers-reduced-motion: reduce)"

function readPreference() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
  return window.matchMedia(QUERY).matches
}

/**
 * Synchronous initial value (read in the `useState` initialiser) so no motion branch
 * renders for a tick; stays subscribed to the media query afterwards.
 */
export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(readPreference)

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return undefined
    const mq = window.matchMedia(QUERY)
    const update = () => setReduced(mq.matches)
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  return reduced
}
