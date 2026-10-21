import { useState } from "react"

let cached

/**
 * Synchronous WebGL probe (webgl2, then webgl). The result is cached per page load so
 * repeated mounts do not allocate new contexts. Fails silently (returns false) when the
 * browser throws or has no canvas support.
 */
export function probeWebGL() {
  if (cached !== undefined) return cached
  if (typeof window === "undefined" || typeof document === "undefined") return false
  try {
    const canvas = document.createElement("canvas")
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl")
    // No explicit loseContext(): Chrome logs it as a console warning. The probe canvas is
    // unreferenced after this call and its context is reclaimed with it.
    cached = !!gl
  } catch {
    cached = false
  }
  return cached
}

export function useWebGL() {
  const [supported] = useState(probeWebGL)
  return supported
}
