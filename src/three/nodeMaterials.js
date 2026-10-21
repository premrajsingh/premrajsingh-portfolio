import { useEffect, useMemo } from "react"
import * as THREE from "three"
import { ACCENT } from "./architecture.js"

/**
 * Non-component helpers shared by every R3F figure: the toon ramp/material that gives all
 * solids the same three paper tones, the raycast proxy sizes, and the no-op raycaster.
 */

export const noRaycast = () => null

/** Invisible raycast proxies per kind (width, height, depth). */
export const HIT_SIZE = {
  card: [1.25, 0.85, 0.3],
  ring: [1, 0.3, 1],
  capsule: [0.95, 0.35, 0.35],
  box: [1.05, 0.55, 1.05],
  "box-sm": [0.85, 0.45, 0.85],
  queue: [2.45, 0.6, 0.6],
  cluster: [0.95, 0.5, 0.95],
  glass: [1.05, 1.05, 1.05],
  db: [0.9, 0.75, 0.9],
  graph: [1.1, 1.1, 1.1],
  lattice: [0.85, 0.85, 0.85],
  square: [0.85, 0.3, 0.85],
}

/** Three-step toon ramp: lit ≈ white, mid ≈ #ECEEEA, shadow ≈ #E3E5E0 on the page. */
export function useToonGradient() {
  const gradient = useMemo(() => {
    const tex = new THREE.DataTexture(new Uint8Array([214, 236, 255]), 3, 1, THREE.RedFormat)
    tex.minFilter = THREE.NearestFilter
    tex.magFilter = THREE.NearestFilter
    tex.generateMipmaps = false
    tex.needsUpdate = true
    return tex
  }, [])
  useEffect(() => () => gradient.dispose(), [gradient])
  return gradient
}

/** One MeshToonMaterial per owner so `emissiveIntensity` can pulse independently. */
export function useToonMaterial(gradient) {
  const material = useMemo(
    () =>
      new THREE.MeshToonMaterial({
        color: "#ffffff",
        gradientMap: gradient,
        emissive: new THREE.Color(ACCENT),
        emissiveIntensity: 0,
      }),
    [gradient]
  )
  useEffect(() => () => material.dispose(), [material])
  return material
}
