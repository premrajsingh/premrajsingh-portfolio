import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowUpRight, Check, Copy, Download, Mail } from "lucide-react"
import { HERO, SITE } from "../data/content.js"
import { duration, ease } from "../lib/motionTokens.js"
import { usePrefersReducedMotion } from "../hooks/usePrefersReducedMotion.js"
import { useSectionReveal } from "../lib/useSectionReveal.js"
import SectionHead from "./SectionHead.jsx"

const COPIED_MS = 1500

/** Email / Phone / GitHub / LinkedIn / Location — every value comes from SITE (design-spec §5.8). */
const ROWS = [
  {
    key: "email",
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    copy: { text: SITE.email, label: "Copy email", announce: "Email address copied" },
  },
  {
    key: "phone",
    label: "Phone",
    value: SITE.phone,
    href: SITE.phoneHref,
    tabular: true,
    copy: { text: SITE.phone, label: "Copy phone number", announce: "Phone number copied" },
  },
  { key: "github", label: "GitHub", value: SITE.githubHandle, href: SITE.github, external: true },
  {
    key: "linkedin",
    label: "LinkedIn",
    value: SITE.linkedinHandle,
    href: SITE.linkedin,
    external: true,
  },
  { key: "location", label: "Location", value: SITE.location },
]

/** Clipboard API first; `execCommand` for insecure contexts. Resolves to whether the copy succeeded. */
async function copyText(text) {
  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      /* fall through to the legacy path */
    }
  }
  if (typeof document === "undefined") return false
  const area = document.createElement("textarea")
  area.value = text
  area.setAttribute("readonly", "")
  area.setAttribute("aria-hidden", "true")
  area.style.position = "fixed"
  area.style.top = "0"
  area.style.left = "0"
  area.style.opacity = "0"
  document.body.appendChild(area)
  area.select()
  let ok = false
  try {
    ok = document.execCommand("copy")
  } catch {
    ok = false
  }
  document.body.removeChild(area)
  return ok
}

export default function Contact() {
  const sectionRef = useRef(null)
  const timerRef = useRef(null)
  const [copiedKey, setCopiedKey] = useState(null)
  const [announcement, setAnnouncement] = useState("")
  const reduced = usePrefersReducedMotion()
  useSectionReveal(sectionRef)

  useEffect(() => () => window.clearTimeout(timerRef.current), [])

  const swap = { duration: reduced ? 0 : duration.fast, ease }

  const handleCopy = async (row) => {
    const ok = await copyText(row.copy.text)
    window.clearTimeout(timerRef.current)
    setCopiedKey(ok ? row.key : null)
    setAnnouncement(ok ? row.copy.announce : "Copy failed")
    timerRef.current = window.setTimeout(() => {
      setCopiedKey(null)
      setAnnouncement("")
    }, COPIED_MS)
  }

  const aside = `${SITE.location}${HERO.available ? " · Open to work" : ""}`

  return (
    <section id="contact" ref={sectionRef} aria-labelledby="contact-heading" className="section">
      <div className="shell">
        <SectionHead index="06" title="Contact" titleId="contact-heading" aside={aside} />

        <div className="grid-12 items-start">
          {/* `-m-2 p-2`: the reveal clip-path ends at inset(0), so a little padding keeps focus rings unclipped. */}
          <div className="-m-2 p-2 lg:col-span-7" data-reveal>
            <a
              href={`mailto:${SITE.email}`}
              className="display-lg link-underline focus-ring block font-medium tracking-tight text-ink transition-colors duration-[250ms] ease-out [overflow-wrap:anywhere] hover:text-accent"
            >
              {SITE.email}
            </a>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a href={`mailto:${SITE.email}`} className="btn-primary focus-ring">
                <Mail size={14} aria-hidden />
                Email
              </a>
              <a href={SITE.resume} download className="btn-ghost focus-ring">
                <Download size={14} aria-hidden />
                Download resume
              </a>
            </div>
          </div>

          <dl
            className="mt-10 border-t border-line lg:col-span-4 lg:col-start-9 lg:mt-0"
            data-stagger
          >
            {ROWS.map((row) => {
              const isCopied = copiedKey === row.key
              return (
                <div
                  key={row.key}
                  className="grid grid-cols-[5rem_minmax(0,1fr)_auto] items-center gap-4 border-b border-line py-4"
                >
                  <dt className="mono-label text-muted">{row.label}</dt>
                  <dd
                    className={`small min-w-0 text-ink [overflow-wrap:anywhere] ${row.tabular ? "tabular" : ""}`}
                  >
                    {row.href && row.external ? (
                      <a
                        href={row.href}
                        target="_blank"
                        rel="noreferrer"
                        className="link-accent link-underline focus-ring inline-flex max-w-full items-center gap-1"
                      >
                        {row.value}
                        <ArrowUpRight size={14} aria-hidden className="flex-none" />
                      </a>
                    ) : row.href ? (
                      <a
                        href={row.href}
                        className="link-underline focus-ring inline-block max-w-full text-ink"
                      >
                        {row.value}
                      </a>
                    ) : (
                      <span>{row.value}</span>
                    )}
                  </dd>
                  {row.copy ? (
                    <dd className="relative flex justify-end">
                      <AnimatePresence>
                        {isCopied ? (
                          <motion.span
                            aria-hidden
                            className="mono-xs pointer-events-none absolute bottom-full right-0 mb-0.5 whitespace-nowrap leading-none text-accent"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={swap}
                          >
                            Copied
                          </motion.span>
                        ) : null}
                      </AnimatePresence>
                      <button
                        type="button"
                        onClick={() => handleCopy(row)}
                        aria-label={row.copy.label}
                        className={`btn-icon focus-ring ${isCopied ? "border-accent text-accent" : ""}`}
                      >
                        <AnimatePresence mode="wait" initial={false}>
                          <motion.span
                            key={isCopied ? "check" : "copy"}
                            className="inline-flex"
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -4 }}
                            transition={swap}
                          >
                            {isCopied ? (
                              <Check size={16} aria-hidden />
                            ) : (
                              <Copy size={16} aria-hidden />
                            )}
                          </motion.span>
                        </AnimatePresence>
                      </button>
                    </dd>
                  ) : null}
                </div>
              )
            })}
          </dl>
        </div>

        <p className="sr-only" role="status">
          {announcement}
        </p>
      </div>
    </section>
  )
}
