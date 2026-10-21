import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { SITE } from "../data/content.js"
import { ease } from "../lib/motionTokens.js"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js"

/** Spec §5.10: visible for 500 ms (80 ms under reduced motion), then a 0.35 s fade. */
const HOLD_MS = 500
const HOLD_MS_REDUCED = 80
const BAR_S = 0.5
const FADE_S = 0.35

/**
 * Page loader: a single mono line above a 7rem hairline whose inner bar fills 0→1.
 * Framer Motion owns the presence (bar fill + exit fade); nothing here touches the
 * hero's lazy import, which Hero schedules on its own. The overlay is `aria-hidden`
 * for its whole life so it is never announced, and it contains no focusable element,
 * so Tab from the top of the document still reaches the skip link first.
 */
export default function Loader() {
  const [done, setDone] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const timer = window.setTimeout(() => setDone(true), reduced ? HOLD_MS_REDUCED : HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [reduced])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-bg"
          aria-hidden="true"
          initial={false}
          exit={{
            opacity: 0,
            // Non-animatable, so Framer applies it the instant the exit starts: clicks reach
            // the page during the fade instead of hitting the dissolving overlay.
            pointerEvents: "none",
            transition: { duration: reduced ? 0 : FADE_S, ease },
          }}
          data-loader
        >
          <div className="flex flex-col items-center gap-4 px-5">
            <p className="mono-label text-center text-muted">
              {SITE.name} — {SITE.role}
            </p>
            <div className="h-px w-28 overflow-hidden bg-line">
              <motion.div
                className="h-full w-full origin-left bg-ink"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: reduced ? 0 : BAR_S, ease }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
