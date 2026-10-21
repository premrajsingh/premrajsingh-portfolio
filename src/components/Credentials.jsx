import { useCallback, useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, X } from "lucide-react"
import SectionHead from "./SectionHead.jsx"
import { CERTIFICATIONS, HACKATHONS, SITE } from "../data/content.js"
import { useSectionReveal } from "../lib/useSectionReveal.js"
import { useTilt } from "../hooks/useTilt.js"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js"
import { duration, ease } from "../lib/motionTokens.js"

/**
 * Credentials — Education · Certifications · Hackathons (design-spec §5.7).
 * Every string comes from content.js. Hackathon wording is participation only; the
 * resume states no placement, so none is shown. Framer owns the certificate dialog's
 * presence; GSAP (useSectionReveal) owns the column reveals; CSS owns tilt/hover.
 */

/** Intrinsic pixel sizes of the certificate scans in public/photos (spec §5 preamble). */
const CERT_SIZES = {
  "/photos/hackhazards-cert.png": { width: 1024, height: 735 },
  "/photos/createch-cert.png": { width: 1024, height: 723 },
}
const DEFAULT_CERT_SIZE = { width: 1024, height: 735 }

function certSize(src) {
  return CERT_SIZES[src] ?? DEFAULT_CERT_SIZE
}

const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * External text link at a 44px tap height; the `.link-underline` rule is nudged up so
 * it still hugs the text inside the taller box.
 */
const EXTERNAL_LINK_CLASS =
  "link-accent link-underline focus-ring small mt-4 inline-flex min-h-11 items-center gap-1 after:bottom-[0.6rem]"

/** Columns are 4/4/4 on desktop with a left hairline; stacked with a top hairline below 1024px. */
function columnClass(first) {
  return first
    ? "lg:col-span-4"
    : "border-t border-line pt-5 lg:col-span-4 lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0"
}

function lockBodyScroll() {
  const body = document.body
  const previous = { overflow: body.style.overflow, paddingRight: body.style.paddingRight }
  const scrollbar = window.innerWidth - document.documentElement.clientWidth
  body.style.overflow = "hidden"
  if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`
  return () => {
    body.style.overflow = previous.overflow
    body.style.paddingRight = previous.paddingRight
  }
}

/**
 * Modal certificate viewer. Focus lands on the close button, Tab/Shift+Tab wrap inside,
 * Escape and a backdrop click close, body scroll is locked while open (Lenis is told to
 * ignore wheel events over the backdrop). Rendered through a portal so the fixed backdrop
 * is never trapped by a transformed or clipped ancestor from the reveal system.
 */
function CertDialog({ item, onClose }) {
  const reduced = usePrefersReducedMotion()
  const titleId = useId()
  const dialogRef = useRef(null)
  const closeRef = useRef(null)
  const dismissedRef = useRef(false)
  const pressedBackdropRef = useRef(false)
  const { width, height } = certSize(item.img)

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return
    dismissedRef.current = true
    onClose()
  }, [onClose])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return undefined

    const unlock = lockBodyScroll()
    const initialFocus = closeRef.current ?? dialog
    initialFocus.focus({ preventScroll: true })

    const onKeyDown = (event) => {
      if (dismissedRef.current) return
      if (event.key === "Escape") {
        event.preventDefault()
        dismiss()
        return
      }
      if (event.key !== "Tab") return

      const focusable = Array.from(dialog.querySelectorAll(FOCUSABLE_SELECTOR))
      if (focusable.length === 0) {
        event.preventDefault()
        dialog.focus()
        return
      }
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement
      const inside = dialog.contains(active)
      if (event.shiftKey) {
        if (!inside || active === first) {
          event.preventDefault()
          last.focus()
        }
      } else if (!inside || active === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("keydown", onKeyDown)
      unlock()
    }
  }, [dismiss])

  const fade = { duration: reduced ? 0 : duration.fast, ease }
  const rise = { duration: reduced ? 0 : 0.35, ease }

  return createPortal(
    <motion.div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/60 p-4 sm:p-8"
      data-lenis-prevent=""
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={fade}
      onPointerDown={(event) => {
        pressedBackdropRef.current = event.target === event.currentTarget
      }}
      onClick={(event) => {
        if (pressedBackdropRef.current && event.target === event.currentTarget) dismiss()
        pressedBackdropRef.current = false
      }}
    >
      <motion.div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="card w-full max-w-3xl p-4 shadow-lift outline-none"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 8 }}
        transition={rise}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 pt-2">
            <h3 id={titleId} className="title-md text-ink">
              {item.title}
            </h3>
            {item.team ? <p className="mono-xs mt-1 text-muted">{item.team}</p> : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            className="btn-icon focus-ring"
            aria-label="Close"
            onClick={dismiss}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-4 border border-line bg-surface-2 p-2">
          <img
            src={item.img}
            alt={`${item.title} certificate`}
            width={width}
            height={height}
            decoding="async"
            className="mx-auto block max-h-[calc(100svh_-_14rem)] w-auto max-w-full"
          />
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

/** 96px certificate thumbnail: a tilt plate with one offset back plate; opens CertDialog. */
function CertThumb({ item, onOpen }) {
  const tiltRef = useRef(null)
  useTilt(tiltRef, { max: 5 })
  const { width, height } = certSize(item.img)

  return (
    <div ref={tiltRef} className="tilt relative ml-auto mr-2.5 w-24 flex-none">
      <div className="plate-back" aria-hidden="true" style={{ "--tz": "-30px" }} />
      <button
        type="button"
        className="plate tilt-layer focus-ring block w-full"
        aria-label={`View certificate: ${item.title}`}
        onClick={(event) => onOpen(item, event.currentTarget)}
      >
        <img
          src={item.img}
          alt=""
          width={width}
          height={height}
          loading="lazy"
          decoding="async"
          className="aspect-[7/5] w-full object-cover"
        />
      </button>
    </div>
  )
}

export default function Credentials() {
  const sectionRef = useRef(null)
  const openerRef = useRef(null)
  const [openCert, setOpenCert] = useState(null)

  useSectionReveal(sectionRef)

  const handleOpen = useCallback((item, trigger) => {
    openerRef.current = trigger
    setOpenCert(item)
  }, [])

  const handleClose = useCallback(() => {
    setOpenCert(null)
    const opener = openerRef.current
    openerRef.current = null
    if (opener && typeof opener.focus === "function") opener.focus()
  }, [])

  const { education } = SITE
  const { leadership } = CERTIFICATIONS

  return (
    <section
      ref={sectionRef}
      id="credentials"
      aria-labelledby="credentials-heading"
      className="section"
    >
      <div className="shell">
        <SectionHead
          index="05"
          title="Credentials"
          titleId="credentials-heading"
          aside="Education · Certifications · Hackathons"
        />

        {/* The reveal wrappers carry 8px of negative-margin slack so the reveal system's
            terminal clip-path never clips a focus ring or back plate at a column edge. */}
        <div className="grid-12" data-stagger>
          <div className={columnClass(true)}>
            <div className="-m-2 p-2" data-reveal>
              <h3 className="kicker">Education</h3>
              <p className="title-md mt-3 text-ink">{education.degree}</p>
              <p className="small mt-2 text-dim">{education.school}</p>
              <p className="mono-label tabular mt-2 text-muted">
                {education.years} · CGPA {education.cgpa}
              </p>
            </div>
          </div>

          <div className={columnClass(false)}>
            <div className="-m-2 p-2" data-reveal>
              <h3 className="kicker">Certifications</h3>
              <ol className="mt-3 border-t border-line">
                {CERTIFICATIONS.items.map((item, i) => (
                  <li
                    key={item.title}
                    className="grid grid-cols-[2rem_minmax(0,1fr)] gap-4 border-b border-line py-3"
                  >
                    <span className="mono-xs tabular pt-0.5 text-muted">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div>
                      <p className="small text-ink">{item.title}</p>
                      <p className="mono-xs mt-1 text-muted">{item.issuer}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <a
                className={EXTERNAL_LINK_CLASS}
                href={CERTIFICATIONS.certificatesUrl}
                target="_blank"
                rel="noreferrer"
              >
                All certificates
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className={columnClass(false)}>
            <div className="-m-2 p-2" data-reveal>
              <h3 className="kicker">Hackathons</h3>
              <ul className="mt-3 border-t border-line">
                {HACKATHONS.items.map((item) => (
                  <li
                    key={item.title}
                    className="flex items-center gap-4 border-b border-line py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="small text-ink">{item.title}</p>
                      {item.team ? <p className="mono-xs mt-1 text-muted">{item.team}</p> : null}
                    </div>
                    {item.img ? <CertThumb item={item} onOpen={handleOpen} /> : null}
                  </li>
                ))}
              </ul>
              <a
                className={EXTERNAL_LINK_CLASS}
                href={HACKATHONS.certificatesUrl}
                target="_blank"
                rel="noreferrer"
              >
                Hackathon certificates
                <ArrowUpRight size={14} strokeWidth={1.75} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-line pt-4">
          <p className="small text-dim">
            <span className="font-medium text-ink">{leadership.title}</span> — {leadership.detail}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {openCert ? (
          <CertDialog key={openCert.title} item={openCert} onClose={handleClose} />
        ) : null}
      </AnimatePresence>
    </section>
  )
}
