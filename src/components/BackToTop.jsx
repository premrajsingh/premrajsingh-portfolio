import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUp } from "lucide-react"
import { duration, ease } from "../lib/motionTokens.js"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js"

/** Spec §5.11: the control appears once the page has scrolled past this many pixels. */
const SHOW_AFTER_PX = 600

function readVisible() {
  if (typeof window === "undefined") return false
  return window.scrollY > SHOW_AFTER_PX
}

/**
 * Fixed "Back to top" control. It is a plain `a[href="#hero"]`, so `useLenis`'s delegated
 * click handler scrolls smoothly with the header offset, and under reduced motion (Lenis
 * off) the browser performs a native jump — this component never calls `window.scrollTo`.
 * Framer Motion owns its presence (fade + 12px rise); CSS owns the hover state via
 * `.btn-icon`, so no property is animated by two systems.
 */
export default function BackToTop() {
  const [show, setShow] = useState(readVisible)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    // React bails out of the state update when the boolean is unchanged, so this stays cheap.
    const onScroll = () => setShow(readVisible())
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const transition = { duration: reduced ? 0 : duration.fast, ease }

  return (
    <AnimatePresence>
      {show && (
        <motion.a
          href="#hero"
          aria-label="Back to top"
          className="btn-icon focus-ring fixed bottom-6 right-6 z-40 bg-bg"
          initial={reduced ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: reduced ? 0 : 12 }}
          transition={transition}
        >
          <ArrowUp size={18} strokeWidth={1.5} aria-hidden="true" />
        </motion.a>
      )}
    </AnimatePresence>
  )
}
