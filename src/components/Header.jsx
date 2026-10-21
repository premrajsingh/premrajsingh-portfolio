import { useCallback, useEffect, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { useGSAP } from "@gsap/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Download, Github, Linkedin, Mail, Menu, X } from "lucide-react"
import { NAV, SITE } from "../data/content.js"
import { ease } from "../lib/motionTokens.js"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js"

gsap.registerPlugin(ScrollTrigger)

/**
 * Header (design-spec §5.1): skip link, wordmark + plain-text role, the six-link primary nav
 * with a per-section progress bar, a Resume download and — below 1024px — a full-screen
 * menu sheet.
 *
 * Motion ownership: GSAP ScrollTrigger owns the nav progress bars (`quickSetter`, never a
 * tween); Framer Motion owns the sheet's presence; CSS owns the hairline colour transition,
 * link hover colour and every focus ring. Under reduced motion no ScrollTrigger is created —
 * `aria-current` comes from an IntersectionObserver and the bars are hidden.
 */

const SOCIALS = [
  { label: "GitHub", href: SITE.github, Icon: Github, external: true },
  { label: "LinkedIn", href: SITE.linkedin, Icon: Linkedin, external: true },
  { label: "Email", href: `mailto:${SITE.email}`, Icon: Mail, external: false },
]

/** Hairline appears once the page has scrolled this far. */
const SCROLLED_AT = 16

/** Sheet fade + 8px rise (spec: 0.28s with the shared ease token). */
const SHEET_DURATION = 0.28
const SHEET_RISE = 8

/**
 * A section is "current" while it spans the line 60% down the viewport. ScrollTrigger reads
 * the same line (`top 60%` → `bottom 60%`); the reduced-motion observer uses a 1%-tall band
 * ending on that line so a zero-area root is never created.
 */
const ACTIVE_START = "top 60%"
const ACTIVE_END = "bottom 60%"
const ACTIVE_ROOT_MARGIN = "-59% 0px -40% 0px"

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

function lockPageScroll() {
  const { documentElement: html, body } = document
  const previous = { html: html.style.overflow, body: body.style.overflow }
  html.style.overflow = "hidden"
  body.style.overflow = "hidden"
  return () => {
    html.style.overflow = previous.html
    body.style.overflow = previous.body
  }
}

export default function Header() {
  const headerRef = useRef(null)
  const toggleRef = useRef(null)
  const sheetRef = useRef(null)
  const activeRef = useRef(null)
  const [activeId, setActiveId] = useState(null)
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const reduced = usePrefersReducedMotion()

  const setActive = useCallback((id) => {
    if (activeRef.current === id) return
    activeRef.current = id
    setActiveId(id)
  }, [])

  const closeSheet = useCallback(() => setOpen(false), [])

  /* Bottom hairline: a class toggled from a passive scroll listener; CSS transitions the colour. */
  useEffect(() => {
    let last = null
    const onScroll = () => {
      const next = window.scrollY >= SCROLLED_AT
      if (next === last) return
      last = next
      setScrolled(next)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  /* Section progress bars + aria-current (motion allowed): one ScrollTrigger per NAV section. */
  useGSAP(
    () => {
      if (reduced) return undefined
      const header = headerRef.current
      if (!header) return undefined

      const triggers = []
      NAV.forEach(({ id }) => {
        const section = document.getElementById(id)
        const bar = header.querySelector(`[data-nav-progress="${id}"]`)
        if (!section || !bar) return

        const setScale = gsap.quickSetter(bar, "scaleX")
        // Only the section in view shows its bar; passed sections reset so one link reads active.
        const sync = (self) => setScale(self.isActive ? self.progress : 0)

        triggers.push(
          ScrollTrigger.create({
            trigger: section,
            start: ACTIVE_START,
            end: ACTIVE_END,
            onUpdate: sync,
            onRefresh: sync,
            onToggle: (self) => {
              if (self.isActive) setActive(id)
              else if (activeRef.current === id) setActive(null)
            },
          })
        )
      })

      return () => triggers.forEach((trigger) => trigger.kill())
    },
    { scope: headerRef, dependencies: [reduced] }
  )

  /* aria-current under reduced motion: a single IntersectionObserver, no GSAP. */
  useEffect(() => {
    if (!reduced || typeof IntersectionObserver === "undefined") return undefined

    const sections = NAV.map(({ id }) => document.getElementById(id)).filter(Boolean)
    if (sections.length === 0) return undefined

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const { id } = entry.target
          if (entry.isIntersecting) setActive(id)
          else if (activeRef.current === id) setActive(null)
        })
      },
      { rootMargin: ACTIVE_ROOT_MARGIN, threshold: 0 }
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [reduced, setActive])

  /*
   * Open sheet: page scroll locked, focus on the first link, Tab/Shift+Tab cycle between the
   * toggle and the sheet, Escape closes. The keydown listener exists only while the sheet is
   * open, so it never competes with the hero legend's Escape. On close focus returns to the
   * toggle. Growing past 1024px closes the sheet (the toggle is hidden there).
   */
  useEffect(() => {
    if (!open) return undefined

    const toggle = toggleRef.current
    const sheet = sheetRef.current
    const unlock = lockPageScroll()

    const firstLink = sheet?.querySelector("a[href]")
    firstLink?.focus({ preventScroll: true })

    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault()
        setOpen(false)
        return
      }
      if (event.key !== "Tab" || !sheet) return

      const focusable = Array.from(sheet.querySelectorAll(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const current = document.activeElement

      if (event.shiftKey) {
        if (current === first) {
          event.preventDefault()
          toggle?.focus()
        } else if (current === toggle) {
          event.preventDefault()
          last.focus()
        }
      } else if (current === last) {
        event.preventDefault()
        toggle?.focus()
      } else if (current === toggle) {
        event.preventDefault()
        first.focus()
      }
    }

    const desktop =
      typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 1024px)") : null
    const onDesktop = (event) => {
      if (event.matches) setOpen(false)
    }

    document.addEventListener("keydown", onKeyDown)
    desktop?.addEventListener("change", onDesktop)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      desktop?.removeEventListener("change", onDesktop)
      unlock()
      toggle?.focus({ preventScroll: true })
    }
  }, [open])

  const sheetTransition = { duration: reduced ? 0 : SHEET_DURATION, ease }

  /*
   * The sheet is portalled to <body>: `backdrop-filter` on the header makes the header the
   * containing block for fixed descendants, which would collapse `fixed inset-0 top-16`.
   */
  const sheet = (
    <AnimatePresence>
      {open ? (
        <motion.nav
          ref={sheetRef}
          id="mobile-nav"
          aria-label="Mobile"
          data-lenis-prevent=""
          className="fixed inset-0 top-16 z-50 overflow-y-auto overscroll-contain bg-bg lg:hidden"
          initial={reduced ? false : { opacity: 0, y: SHEET_RISE }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? undefined : { opacity: 0, y: SHEET_RISE }}
          transition={sheetTransition}
        >
          <div className="shell pb-10 pt-2">
            <ul className="border-t border-line">
              {NAV.map(({ id, label }) => (
                <li key={id} className="border-b border-line">
                  <a
                    href={`#${id}`}
                    className="title-md focus-ring flex min-h-14 items-center text-ink"
                    aria-current={activeId === id ? "true" : undefined}
                    onClick={closeSheet}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <ul className="flex gap-2" aria-label="Profiles">
                {SOCIALS.map(({ label, href, Icon, external }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      className="btn-icon focus-ring"
                      target={external ? "_blank" : undefined}
                      rel={external ? "noreferrer" : undefined}
                    >
                      <Icon size={16} aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
              <a href={SITE.resume} download className="btn-primary focus-ring ml-auto">
                <Download size={14} aria-hidden="true" />
                Resume
              </a>
            </div>
          </div>
        </motion.nav>
      ) : null}
    </AnimatePresence>
  )

  return (
    <header
      ref={headerRef}
      role="banner"
      className={`fixed inset-x-0 top-0 z-50 h-16 border-b bg-bg/95 backdrop-blur-[6px] transition-colors duration-300 ease-out ${
        scrolled ? "border-line" : "border-transparent"
      }`}
    >
      <a href="#main" className="skip-link focus-ring">
        Skip to content
      </a>

      <div className="shell flex h-full items-center justify-between gap-4 lg:gap-6">
        <a href="#hero" className="focus-ring inline-flex min-w-0 items-baseline gap-3 py-3">
          <span className="text-base font-medium leading-6 text-ink">{SITE.name}</span>
          <span className="mono-label hidden text-muted sm:inline">{SITE.role}</span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center">
            {NAV.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="nav-link focus-ring"
                  aria-current={activeId === id ? "true" : undefined}
                >
                  {label}
                  <span
                    className="nav-progress motion-reduce:hidden"
                    data-nav-progress={id}
                    aria-hidden="true"
                  />
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a href={SITE.resume} download className="btn-ghost focus-ring">
            <Download size={14} aria-hidden="true" />
            <span className="sr-only min-[360px]:not-sr-only">Resume</span>
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="focus-ring -mr-2 inline-flex h-11 w-11 items-center justify-center text-ink lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
          </button>
        </div>
      </div>

      {typeof document !== "undefined" ? createPortal(sheet, document.body) : null}
    </header>
  )
}
