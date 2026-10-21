import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion"

gsap.registerPlugin(ScrollTrigger)

/**
 * GSAP owns scroll-driven motion. Framer Motion owns menu/dialog presence.
 * CSS owns hover/focus. Never animate the same property with two libraries.
 *
 *   [data-mask]     whole-line mask (inner .mask-line > span)
 *   [data-reveal]   clip wipe from below (not a fade)
 *   [data-line]     horizontal rule draws left → right
 *   [data-rise]     vertical rule draws top → bottom
 *   [data-clip]     image/plate wipe (up|down|left|right)
 *   [data-clip-inner] crop shift inside the wipe
 *   [data-parallax] scrubbed translateY in px
 *   [data-stagger]  children enter with a short stagger
 *
 * Reduced motion: matchMedia no-preference only; mm.revert() restores styles.
 */
export function useSectionReveal(scopeRef) {
  const reduced = usePrefersReducedMotion()

  useGSAP(
    () => {
      const root = scopeRef.current
      if (reduced || !root) return undefined

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const finishIfPast = (self) => {
          const trigger = self.trigger
          if (!trigger) return
          if (trigger.getBoundingClientRect().top < window.innerHeight * 0.92) {
            self.animation.progress(1)
          }
        }

        root.querySelectorAll("[data-mask]").forEach((block) => {
          const lines = block.querySelectorAll(".mask-line > span")
          if (!lines.length) return
          gsap.from(lines, {
            yPercent: 112,
            duration: 1.05,
            ease: "expo.out",
            stagger: 0.09,
            scrollTrigger: {
              trigger: block,
              start: "top 88%",
              once: true,
              onRefresh: finishIfPast,
            },
          })
        })

        root.querySelectorAll("[data-reveal]").forEach((el) => {
          gsap.fromTo(
            el,
            { clipPath: "inset(100% 0% 0% 0%)" },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.95,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 90%",
                once: true,
                onRefresh: finishIfPast,
              },
            }
          )
        })

        const clipFrom = {
          up: "inset(110% 0% 0% 0%)",
          down: "inset(0% 0% 110% 0%)",
          left: "inset(0% 110% 0% 0%)",
          right: "inset(0% 0% 0% 110%)",
        }

        root.querySelectorAll("[data-clip]").forEach((el) => {
          const dir = el.getAttribute("data-clip") || "up"
          gsap.fromTo(
            el,
            { clipPath: clipFrom[dir] || clipFrom.up },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 1.15,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
                onRefresh: finishIfPast,
              },
            }
          )

          const inner = el.querySelector("[data-clip-inner]")
          if (inner) {
            gsap.fromTo(
              inner,
              { yPercent: 12 },
              {
                yPercent: 0,
                duration: 1.25,
                ease: "power2.out",
                scrollTrigger: {
                  trigger: el,
                  start: "top 88%",
                  once: true,
                  onRefresh: finishIfPast,
                },
              }
            )
          }
        })

        root.querySelectorAll("[data-line]").forEach((el) => {
          gsap.fromTo(
            el,
            { scaleX: 0 },
            {
              scaleX: 1,
              duration: 1.05,
              ease: "power3.out",
              transformOrigin: "left center",
              scrollTrigger: {
                trigger: el,
                start: "top 94%",
                once: true,
                onRefresh: finishIfPast,
              },
            }
          )
        })

        root.querySelectorAll("[data-rise]").forEach((el) => {
          gsap.fromTo(
            el,
            { scaleY: 0 },
            {
              scaleY: 1,
              duration: 0.8,
              ease: "power3.out",
              transformOrigin: "top center",
              scrollTrigger: {
                trigger: el,
                start: "top 92%",
                once: true,
                onRefresh: finishIfPast,
              },
            }
          )
        })

        root.querySelectorAll("[data-stagger]").forEach((parent) => {
          const kids = parent.children
          if (!kids.length) return
          gsap.from(kids, {
            y: 14,
            opacity: 0.001,
            duration: 0.5,
            stagger: 0.04,
            ease: "power3.out",
            scrollTrigger: {
              trigger: parent,
              start: "top 90%",
              once: true,
              onRefresh: finishIfPast,
            },
          })
        })

        root.querySelectorAll("[data-parallax]").forEach((el) => {
          const distance = Number(el.dataset.parallax) || -24
          gsap.fromTo(
            el,
            { y: -distance * 0.5 },
            {
              y: distance * 0.5,
              ease: "none",
              scrollTrigger: {
                trigger: el.parentElement || el,
                start: "top bottom",
                end: "bottom top",
                scrub: 0.6,
              },
            }
          )
        })

        ScrollTrigger.refresh()
      })

      return () => mm.revert()
    },
    { scope: scopeRef, dependencies: [reduced] }
  )
}
