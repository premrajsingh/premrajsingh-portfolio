import { useEffect } from "react"
import Lenis from "lenis"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { usePrefersReducedMotion } from "./usePrefersReducedMotion"

gsap.registerPlugin(ScrollTrigger)

const HEADER_OFFSET = 0 // section[id] scroll-margin-top (index.css) owns the header offset

function targetFromHash(hash) {
  if (!hash || hash === "#") return null
  try {
    return document.querySelector(hash)
  } catch {
    return null
  }
}

/**
 * Lenis + GSAP ScrollTrigger sync (official Lenis docs pattern).
 * Disabled when prefers-reduced-motion is set (anchors then jump natively).
 * Anchors are handled by a delegated click handler with the header offset, and
 * ScrollTrigger is refreshed once more when web fonts finish loading so trigger
 * positions account for the final line-wrapping.
 */
export function useLenis() {
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) return undefined

    let disposed = false

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      touchMultiplier: 1.15,
      autoRaf: false,
      anchors: false,
    })

    lenis.on("scroll", ScrollTrigger.update)

    const update = (time) => {
      lenis.raf(time * 1000)
    }
    gsap.ticker.add(update)
    gsap.ticker.lagSmoothing(0)

    const scrollToHash = (hash, immediate = false) => {
      const target = targetFromHash(hash)
      if (!target) return
      lenis.scrollTo(target, { offset: HEADER_OFFSET, immediate })
    }

    const onClick = (event) => {
      const link = event.target.closest('a[href^="#"]')
      if (!link) return
      const href = link.getAttribute("href")
      const target = targetFromHash(href)
      if (!target) return
      event.preventDefault()
      scrollToHash(href)
      history.pushState(null, "", href)
    }

    const onHash = () => {
      scrollToHash(window.location.hash)
      ScrollTrigger.refresh()
    }

    document.addEventListener("click", onClick)
    window.addEventListener("hashchange", onHash)
    requestAnimationFrame(() => {
      if (disposed) return
      ScrollTrigger.refresh()
      if (window.location.hash) scrollToHash(window.location.hash, true)
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => {
          if (!disposed) ScrollTrigger.refresh()
        })
      }
    })

    return () => {
      disposed = true
      document.removeEventListener("click", onClick)
      window.removeEventListener("hashchange", onHash)
      gsap.ticker.remove(update)
      lenis.destroy()
    }
  }, [reduced])
}
