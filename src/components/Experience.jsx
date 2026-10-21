import { useEffect, useRef, useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { EXPERIENCE, NAV } from "../data/content"
import { NODE_BY_ID, NODE_KIND } from "../three/architecture.js"
import { useSectionReveal } from "../lib/useSectionReveal"
import { useTilt } from "../hooks/useTilt"
import Glyph from "./Glyph.jsx"
import SectionScene from "./SectionScene.jsx"
import SectionHead from "./SectionHead.jsx"

/* ------------------------------------------------------------------------------------------ */
/* Derived data — every string traces to src/data/content.js (design-spec §5.4)                */
/* ------------------------------------------------------------------------------------------ */

const SECTION_INDEX = NAV.find((item) => item.id === "experience")?.index ?? "02"
/** "02" → "2" so rail references read 2.1 … 2.4. */
const RAIL_PREFIX = String(Number(SECTION_INDEX))

/** Earliest four-digit year across all periods (2025) — keeps the aside data-derived. */
const FIRST_YEAR = Math.min(
  ...EXPERIENCE.flatMap((entry) => (entry.period.match(/\d{4}/g) ?? []).map(Number))
)
const ASIDE = `${EXPERIENCE.length} roles · ${FIRST_YEAR} – present`

/** Trailing legal forms are dropped from anchor ids only (the rail shows the full name). */
const LEGAL_SUFFIX = /\s+(private\s+limited|pvt\.?\s*ltd\.?|limited|ltd\.?|inc\.?|llc)\.?$/i

function slugify(text) {
  return text
    .replace(LEGAL_SUFFIX, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

/** Short name for the rail and the anchor: the company, else the role's first word. */
function shortName(entry) {
  return entry.company ?? entry.role.split(/\s+/)[0]
}

function pad(n) {
  return String(n).padStart(2, "0")
}

const ENTRIES = EXPERIENCE.map((entry, index) => {
  const name = shortName(entry)
  const slug = slugify(name)
  const points = entry.points ?? []
  const clients = entry.clients ?? []
  const stills = entry.stills ?? []
  const stack = (entry.stack ?? []).filter((id) => Boolean(NODE_BY_ID[id]))
  return {
    ...entry,
    id: `exp-${slug}`,
    headingId: `exp-${slug}-title`,
    ref: `${RAIL_PREFIX}.${index + 1}`,
    name,
    points,
    clients,
    stills,
    stack,
    /** Period still running → "Current" chip beside the badge. */
    isCurrent: /present$/i.test(entry.period.trim()),
    /** Nothing to list yet → hidden-line (dashed) card that closes after its header. */
    headerOnly: points.length === 0 && clients.length === 0,
  }
})

const IDS = ENTRIES.map((entry) => entry.id)

/* ------------------------------------------------------------------------------------------ */
/* Rail state — the card in view gets the 2px accent rule                                      */
/* ------------------------------------------------------------------------------------------ */

/**
 * Observes the four cards in a 40 %–50 % viewport band (spec rootMargin) and reports the
 * first one, in DOM order, that intersects it. Works identically under reduced motion
 * (no animation is involved) and when Lenis drives the scroll.
 */
function useActiveEntry(ids) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (typeof window === "undefined" || typeof IntersectionObserver === "undefined") {
      return undefined
    }
    const targets = ids.map((id) => document.getElementById(id)).filter(Boolean)
    if (!targets.length) return undefined

    const visible = new Set()
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) visible.add(entry.target.id)
          else visible.delete(entry.target.id)
        })
        const next = ids.find((id) => visible.has(id))
        if (next) setActiveId(next)
      },
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    )
    targets.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [ids])

  return activeId
}

/* ------------------------------------------------------------------------------------------ */
/* Pieces                                                                                      */
/* ------------------------------------------------------------------------------------------ */

/**
 * External link (§5 preamble): new tab, `noreferrer`, 14px ArrowUpRight. `inline-block py-3`
 * gives the 44px tap target while the negative vertical margin keeps the line box at the
 * text height, so wrapped client names still flow as ordinary text with the arrow at the end.
 */
function ExternalLink({ href, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="link-accent link-underline focus-ring -my-3 inline-block py-3 after:bottom-3"
    >
      {children}
      <ArrowUpRight size={14} aria-hidden="true" className="ml-1 inline-block align-[-0.125em]" />
    </a>
  )
}

function CompanyLine({ entry }) {
  if (!entry.company && !entry.affiliation) return null
  return (
    <p className="small mt-1 text-dim">
      {entry.companyUrl ? (
        <ExternalLink href={entry.companyUrl}>{entry.company}</ExternalLink>
      ) : (
        entry.company
      )}
      {entry.affiliation ? (
        <>
          {entry.company ? " · " : null}
          {entry.affiliationUrl ? (
            <ExternalLink href={entry.affiliationUrl}>{entry.affiliation}</ExternalLink>
          ) : (
            entry.affiliation
          )}
        </>
      ) : null}
    </p>
  )
}

/** Indexed hairline list. The visible 01/02 index is decorative — the <ol> carries the order. */
function PointList({ points, className = "" }) {
  return (
    <ol className={`border-t border-line ${className}`.trim()} data-stagger>
      {points.map((point, index) => (
        <li
          key={point}
          className="body grid grid-cols-[2rem_minmax(0,1fr)] items-baseline gap-4 border-b border-line py-3 text-dim"
        >
          <span className="mono-xs tabular text-muted" aria-hidden="true">
            {pad(index + 1)}
          </span>
          <span>{point}</span>
        </li>
      ))}
    </ol>
  )
}

function ClientBlock({ client }) {
  return (
    <section aria-label={client.name} className="mt-6">
      <h4 className="small font-medium text-ink">
        {client.url ? <ExternalLink href={client.url}>{client.name}</ExternalLink> : client.name}
      </h4>
      <PointList points={client.points} className="mt-3" />
    </section>
  )
}

/**
 * One still: two planes (plate + offset back plate) under a ±3° CSS tilt, no fan. The back
 * plate is parked at translateZ(-40px) by the foundation; under the 1200px perspective that
 * projects 3.2 % smaller, so on hover-capable devices (the only ones with perspective) the
 * plane is scaled by 1240/1200 to keep the plate's footprint — same compensation as Work.
 */
function Still({ still }) {
  const tiltRef = useRef(null)
  useTilt(tiltRef, { max: 3 })

  return (
    <li ref={tiltRef} className="tilt">
      <figure>
        <div className="tilt-layer relative">
          <div
            className="plate-back [translate:6px_6px] [@media(hover:hover)]:[scale:1.0333]"
            aria-hidden="true"
          />
          <div className="plate">
            <img
              src={still.src}
              alt={still.alt}
              width={1024}
              height={576}
              className="aspect-[16/9] object-cover object-top"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
        <figcaption className="mono-xs mt-3 text-muted">{still.caption}</figcaption>
      </figure>
    </li>
  )
}

function Stills({ stills }) {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-3" aria-label="Client interfaces">
      {stills.map((still) => (
        <Still key={still.src} still={still} />
      ))}
    </ul>
  )
}

/**
 * Card footer: the hero's glyph vocabulary for the components named in the bullets. Each
 * glyph keeps its SVG <title> as a hover tooltip; the icon row is hidden from assistive tech
 * and the names are read from the visually hidden list instead, so nothing is announced twice.
 */
function StackRow({ stack }) {
  if (!stack.length) return null
  const nodes = stack.map((id) => NODE_BY_ID[id])
  return (
    <div className="mt-6 flex flex-wrap items-center gap-2">
      <span className="mono-xs mr-1 text-muted" aria-hidden="true">
        Stack
      </span>
      <ul className="flex flex-wrap items-center gap-2 text-dim" aria-hidden="true">
        {nodes.map((node) => (
          <li key={node.id} className="inline-flex">
            <Glyph kind={NODE_KIND[node.id]} title={node.label} />
          </li>
        ))}
      </ul>
      <p className="mono-xs sr-only">Stack: {nodes.map((node) => node.label).join(" · ")}</p>
    </div>
  )
}

function RoleCard({ entry }) {
  const { headerOnly, isCurrent } = entry
  return (
    <article
      id={entry.id}
      aria-labelledby={entry.headingId}
      className={`${headerOnly ? "card-dashed" : "card"} scroll-mt-[5.5rem] p-6 sm:p-8`}
      data-reveal
    >
      {/* Header row. For the header-only (current, not yet detailed) role the wrapper carries
          the 2px accent rule and the card closes after it — no list, no placeholder prose. */}
      <div
        className={`flex flex-wrap items-start justify-between gap-x-6 gap-y-4 ${
          headerOnly ? "border-b-2 border-accent pb-6" : ""
        }`.trim()}
      >
        <div className="min-w-0">
          <h3 id={entry.headingId} className="title-md text-ink">
            {entry.role}
          </h3>
          <CompanyLine entry={entry} />
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <p className="mono-label tabular text-muted">
            {entry.place ? `${entry.place} · ` : ""}
            {entry.period}
          </p>
          <span className="chip">{entry.badge}</span>
          {isCurrent ? <span className="chip border-accent text-accent">Current</span> : null}
        </div>
      </div>

      {entry.points.length > 0 ? <PointList points={entry.points} className="mt-6" /> : null}

      {entry.clients.map((client) => (
        <ClientBlock key={client.name} client={client} />
      ))}

      {entry.stills.length > 0 ? <Stills stills={entry.stills} /> : null}

      {entry.stack.length > 0 ? (
        <SectionScene
          kind="stack"
          layout="stacked"
          ids={entry.stack}
          height="11rem"
          className="mt-6"
          fallback={<StackRow stack={entry.stack} />}
        />
      ) : null}
    </article>
  )
}

/**
 * Role rail: sticky on desktop (cols 1–4), a plain list above the cards below lg. The entry
 * whose card is in view carries `.is-active` (2px accent left rule, ink text); CSS transitions
 * the colours. Anchors are smooth-scrolled by useLenis's delegated handler, or jump natively
 * under reduced motion (cards carry scroll-margin for the fixed header).
 */
function RoleRail({ activeId }) {
  return (
    <nav aria-label="Roles" className="lg:sticky lg:top-24 lg:col-span-4 lg:self-start">
      <ul>
        {ENTRIES.map((entry) => {
          const active = entry.id === activeId
          return (
            <li key={entry.id}>
              <a
                href={`#${entry.id}`}
                aria-current={active ? "true" : undefined}
                className={`mono-label flex min-h-11 items-center gap-3 border-l-2 border-transparent pl-4 text-dim transition-colors duration-300 ease-out hover:text-ink [&.is-active]:border-accent [&.is-active]:text-ink ${
                  active ? "is-active" : ""
                }`.trim()}
              >
                <span className="tabular text-muted">{entry.ref}</span> <span>{entry.name}</span>
              </a>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/* ------------------------------------------------------------------------------------------ */
/* Section                                                                                     */
/* ------------------------------------------------------------------------------------------ */

export default function Experience() {
  const sectionRef = useRef(null)
  useSectionReveal(sectionRef)
  const activeId = useActiveEntry(IDS)

  return (
    <section
      id="experience"
      ref={sectionRef}
      aria-labelledby="experience-heading"
      className="section"
    >
      <div className="shell">
        <SectionHead
          index={SECTION_INDEX}
          title="Experience"
          titleId="experience-heading"
          aside={ASIDE}
        />

        <div className="grid-12 items-start">
          <RoleRail activeId={activeId} />

          <div className="flex flex-col gap-6 lg:col-span-8">
            {ENTRIES.map((entry) => (
              <RoleCard key={entry.id} entry={entry} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
