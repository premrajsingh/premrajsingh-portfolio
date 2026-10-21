import { useEffect } from "react"

const ENABLE_QUERY = "(hover: hover) and (prefers-reduced-motion: no-preference)"
const LERP = 0.12
const SETTLE = 0.01

/**
 * Shallow CSS perspective tilt (design-spec §7). Writes `--rx` / `--ry` (deg) on the
 * `.tilt` element; `.tilt-layer` reads them in CSS. Pointer position is normalised to
 * −1..1 across the element; a rAF loop lerps toward the target and stops when settled.
 * On touch devices or under reduced motion no listeners are attached. Returns nothing.
 */
export function useTilt(ref, { max = 4 } = {}) {
  useEffect(() => {
    const el = ref.current
    if (!el || typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return undefined
    }
    if (!window.matchMedia(ENABLE_QUERY).matches) return undefined

    let targetX = 0
    let targetY = 0
    let currentX = 0
    let currentY = 0
    let frame = 0

    const write = () => {
      el.style.setProperty("--rx", `${currentX.toFixed(3)}deg`)
      el.style.setProperty("--ry", `${currentY.toFixed(3)}deg`)
    }

    const tick = () => {
      currentX += (targetX - currentX) * LERP
      currentY += (targetY - currentY) * LERP
      const settled = Math.abs(targetX - currentX) < SETTLE && Math.abs(targetY - currentY) < SETTLE
      if (settled) {
        currentX = targetX
        currentY = targetY
        write()
        frame = 0
        return
      }
      write()
      frame = requestAnimationFrame(tick)
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(tick)
    }

    const onMove = (event) => {
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      const px = ((event.clientX - rect.left) / rect.width) * 2 - 1
      const py = ((event.clientY - rect.top) / rect.height) * 2 - 1
      targetX = -py * max
      targetY = px * max
      schedule()
    }

    const onLeave = () => {
      targetX = 0
      targetY = 0
      schedule()
    }

    el.addEventListener("pointermove", onMove, { passive: true })
    el.addEventListener("pointerleave", onLeave, { passive: true })

    return () => {
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
      if (frame) cancelAnimationFrame(frame)
      el.style.removeProperty("--rx")
      el.style.removeProperty("--ry")
    }
  }, [ref, max])
}
