import { Component, Suspense, lazy, useCallback, useEffect, useRef, useState } from "react"
import { useSceneTier } from "../hooks/useSceneTier.js"

/**
 * Lazily mounts one of the small R3F figures (src/three/figures.jsx) when its box comes
 * within a viewport of the screen, keeps it mounted afterwards, and tells it whether it is
 * on screen so the render loop can stop. On the static tier (reduced motion, no WebGL,
 * save-data) it renders only `fallback`, which stays visible under the canvas on every
 * tier until the figure has drawn and is also what assistive tech reads.
 */

let figuresPromise = null
function loadFigures() {
  if (!figuresPromise) figuresPromise = import("../three/figures.jsx")
  return figuresPromise
}

const FIGURES = {
  stack: lazy(() => loadFigures().then((m) => ({ default: m.StackFigure }))),
  shelf: lazy(() => loadFigures().then((m) => ({ default: m.ShelfFigure }))),
  screen: lazy(() => loadFigures().then((m) => ({ default: m.ScreenFigure }))),
}

class FigureBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { failed: false }
  }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

/**
 * `layout="overlay"` (default): the canvas covers the fallback, which fades out once drawn —
 * for figures that replace an image. `layout="stacked"`: the canvas gets its own box above a
 * fallback that stays visible — for figures that add to a row of labels.
 */
export default function SectionScene({
  kind,
  fallback = null,
  className = "",
  height,
  layout = "overlay",
  ...props
}) {
  const tier = useSceneTier()
  const hostRef = useRef(null)
  const [near, setNear] = useState(false)
  const [visible, setVisible] = useState(false)
  const [drawn, setDrawn] = useState(false)
  const enabled = tier !== "static"

  useEffect(() => {
    const el = hostRef.current
    if (!enabled || !el || typeof IntersectionObserver === "undefined") return undefined
    // Mount within one viewport of the screen; unmount again two viewports away so the
    // number of live WebGL contexts stays small no matter how long the page is.
    const nearObserver = new IntersectionObserver(([entry]) => setNear(entry.isIntersecting), {
      rootMargin: "150% 0px",
    })
    const visibleObserver = new IntersectionObserver(
      ([entry]) => setVisible(entry.intersectionRatio > 0.02),
      { threshold: [0, 0.02] }
    )
    nearObserver.observe(el)
    visibleObserver.observe(el)
    return () => {
      nearObserver.disconnect()
      visibleObserver.disconnect()
    }
  }, [enabled])

  // The figure reports its first frame via onReady; until then the fallback stays visible.
  useEffect(() => {
    if (!near) setDrawn(false)
  }, [near])
  const onReady = useCallback(() => setDrawn(true), [])

  const Figure = FIGURES[kind]

  const stacked = layout === "stacked"
  const canvas =
    enabled && near && Figure ? (
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out"
        style={{ opacity: drawn ? 1 : 0 }}
        aria-hidden="true"
      >
        <FigureBoundary>
          <Suspense fallback={null}>
            <Figure hostRef={hostRef} visible={visible} onReady={onReady} {...props} />
          </Suspense>
        </FigureBoundary>
      </div>
    ) : null

  if (stacked) {
    return (
      <div ref={hostRef} className={`relative ${className}`.trim()} data-section-scene={kind}>
        {enabled ? (
          <div className="relative" style={{ height }}>
            {canvas}
          </div>
        ) : null}
        {fallback}
      </div>
    )
  }

  return (
    <div
      ref={hostRef}
      className={`relative ${className}`.trim()}
      style={{ height: enabled ? height : undefined }}
      data-section-scene={kind}
    >
      {fallback ? (
        <div
          className="transition-opacity duration-500 ease-out"
          style={{ opacity: enabled && drawn ? 0 : 1 }}
        >
          {fallback}
        </div>
      ) : null}
      {canvas}
    </div>
  )
}
