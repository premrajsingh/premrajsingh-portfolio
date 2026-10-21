import { useRef } from "react"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ArrowUp, ArrowUpRight } from "lucide-react"
import { NAV, SITE } from "../data/content.js"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js"
import ArchitecturePlan from "../three/ArchitecturePlan.jsx"

gsap.registerPlugin(ScrollTrigger)

/**
 * Footer (design-spec §5.9): the Fig. 0 plan as a static colophon (compact, no labels, no store
 * wiring), the name + meta line, and a labelled footer nav — the six section links, GitHub /
 * LinkedIn / Email and "Back to top".
 *
 * Motion ownership: GSAP owns the one-shot stagger of the two link lists (`[data-stagger]`);
 * CSS owns link colour, the underline draw and every focus ring; nothing else moves. The plan
 * is static. Under reduced motion no tween is created, so every link is visible from the first
 * paint — the hidden state exists only inside `gsap.from`, never in CSS.
 *
 * The stagger is driven here rather than by `useSectionReveal` on purpose: the lists are the last
 * thing on the page, 90–140 px above the document end, so the shared system's `start: "top 90%"`
 * is beyond the maximum scroll position on viewports taller than ~900 px and would never fire.
 * `clamp()` pins the start to the scroll range so the links always enter.
 */

/** Spec-quoted colophon strings (§5.9). */
const REVISION = "2026.10"
const BUILT_WITH = "React, Vite, three.js"
const CAPTION = "Fig. 0 (plan) — the same reference architecture, drawn."

const ELSEWHERE = [
  { label: "GitHub", href: SITE.github, external: true },
  { label: "LinkedIn", href: SITE.linkedin, external: true },
  { label: "Email", href: `mailto:${SITE.email}`, external: false },
]

/**
 * `.small link-underline` per spec; `min-h-11` gives the 44 px tap target and
 * `after:bottom-[0.6rem]` keeps the drawn underline hugging the text inside that taller box.
 */
const LINK_CLASS =
  "small link-underline focus-ring inline-flex min-h-11 items-center gap-1 text-dim transition-colors duration-[250ms] ease-out after:bottom-[0.6rem] hover:text-ink"

/** Same values as the reveal system's `[data-stagger]` tween, so the footer matches the page. */
const STAGGER_FROM = { y: 14, opacity: 0.001, duration: 0.5, stagger: 0.04, ease: "power3.out" }

export default function Footer() {
  const footerRef = useRef(null)
  const reduced = usePrefersReducedMotion()
  const year = new Date().getFullYear()

  useGSAP(
    () => {
      const root = footerRef.current
      if (reduced || !root) return undefined

      const mm = gsap.matchMedia()

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        root.querySelectorAll("[data-stagger]").forEach((list) => {
          const items = list.children
          if (!items.length) return
          gsap.from(items, {
            ...STAGGER_FROM,
            scrollTrigger: {
              trigger: list,
              start: "clamp(top 90%)",
              end: "bottom top",
              toggleActions: "play reset play reset",
            },
          })
        })
      })

      return () => mm.revert()
    },
    { scope: footerRef, dependencies: [reduced] }
  )

  return (
    <footer ref={footerRef} role="contentinfo" className="border-t border-line">
      <div className="shell py-12">
        <figure className="max-w-[24rem]">
          <ArchitecturePlan compact interactive={false} />
          <figcaption className="mono-label mt-2 text-muted">{CAPTION}</figcaption>
        </figure>

        <div className="mt-10 flex flex-wrap items-start justify-between gap-6">
          <div>
            <p className="small font-medium text-ink">{SITE.name}</p>
            <p className="mono-xs tabular mt-1 text-muted">
              {SITE.role} · rev. {REVISION} · {BUILT_WITH} · © {year}
            </p>
          </div>

          {/* `-my-3` absorbs the links' 44 px tap-target padding so the first row's text aligns with the name. */}
          <nav aria-label="Footer" className="-my-3 flex flex-col lg:items-end">
            <ul className="flex flex-wrap gap-x-6 lg:justify-end" data-stagger>
              {NAV.map(({ id, label }) => (
                <li key={id}>
                  <a href={`#${id}`} className={LINK_CLASS}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <ul className="flex flex-wrap gap-x-6 lg:justify-end" data-stagger>
              {ELSEWHERE.map(({ label, href, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    target={external ? "_blank" : undefined}
                    rel={external ? "noreferrer" : undefined}
                    className={LINK_CLASS}
                  >
                    {label}
                    {external ? <ArrowUpRight size={14} aria-hidden className="flex-none" /> : null}
                  </a>
                </li>
              ))}
              <li>
                <a href="#hero" className={LINK_CLASS}>
                  Back to top
                  <ArrowUp size={14} aria-hidden className="flex-none" />
                </a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
