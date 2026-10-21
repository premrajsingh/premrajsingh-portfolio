import { useCallback, useRef, useState } from "react"
import { ABOUT, HERO, SITE } from "../data/content"
import { useSectionReveal } from "../lib/useSectionReveal"
import { useTilt } from "../hooks/useTilt"
import SectionHead from "./SectionHead.jsx"

/** Neutral, data-derived aside (design-spec §4.3): first timeline year → present. */
const ASIDE = `${ABOUT.timeline[0].year} – present`

/**
 * "At a glance" cell layout (design-spec §5.3): 2×2 below `sm`, 1×4 from `sm`.
 * Hairlines separate cells; the row rule only exists in the 2×2 arrangement.
 */
function glanceCellClass(index) {
  return [
    "grid content-start py-5 pr-4",
    index % 2 === 1 ? "border-l border-line pl-4" : "",
    index >= 2 ? "border-t border-line sm:border-t-0" : "",
    index > 0 ? "sm:border-l sm:border-line sm:pl-4" : "",
  ]
    .filter(Boolean)
    .join(" ")
}

export default function About() {
  const sectionRef = useRef(null)
  const tiltRef = useRef(null)
  const [photoSrc, setPhotoSrc] = useState(ABOUT.photo)

  useSectionReveal(sectionRef)
  useTilt(tiltRef, { max: 4 })

  const handlePhotoError = useCallback(() => {
    setPhotoSrc((current) => (current === ABOUT.photoFallback ? current : ABOUT.photoFallback))
  }, [])

  return (
    <section id="about" ref={sectionRef} aria-labelledby="about-heading" className="section">
      <div className="shell">
        <SectionHead index="01" title="About" titleId="about-heading" aside={ASIDE} />

        <div className="grid-12">
          {/* Portrait — two planes (plate + offset back plate) under a shallow CSS tilt. */}
          <figure
            ref={tiltRef}
            className="tilt mx-auto w-full max-w-[22rem] lg:col-span-5 lg:mx-0 lg:max-w-none lg:self-start"
            data-parallax="-16"
          >
            <div className="tilt-layer relative">
              <div className="plate-back" aria-hidden="true" />
              <div className="plate" data-clip="left">
                <img
                  data-clip-inner
                  src={photoSrc}
                  alt={SITE.name}
                  width={576}
                  height={1024}
                  className="aspect-[4/5] w-full object-cover object-[center_12%]"
                  loading="eager"
                  decoding="async"
                  onError={handlePhotoError}
                />
              </div>
              <span className="plate-float mono-xs" aria-hidden="true">
                {SITE.role} · {SITE.location}
              </span>
            </div>
            <figcaption className="mono-label mt-4 flex justify-between gap-4 text-muted">
              <span>{SITE.name}</span>
              <span>{SITE.location}</span>
            </figcaption>
          </figure>

          <div className="mt-6 lg:col-span-6 lg:col-start-7 lg:mt-0">
            <p className="lede max-w-prose text-dim" data-reveal>
              {ABOUT.bio}
            </p>

            {/* Static values from content.js — no count-up. DOM order is dt → dd (valid <dl>);
                the value is shown above its label via CSS order. */}
            <dl
              className="mt-10 grid grid-cols-2 border-y border-line sm:grid-cols-4"
              aria-label="At a glance"
              data-stagger
            >
              {HERO.stats.map((stat, index) => (
                <div key={stat.label} className={glanceCellClass(index)}>
                  <dt className="kicker order-2 mt-1">{stat.label}</dt>
                  <dd className="display-lg tabular order-1 text-ink">{stat.value}</dd>
                </div>
              ))}
            </dl>

            <ol className="mt-10 border-t border-line" aria-label="Timeline" data-stagger>
              {ABOUT.timeline.map((row) => (
                <li
                  key={`${row.year}-${row.label}`}
                  className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 border-b border-line py-4"
                >
                  <span className="mono-label tabular text-accent">{row.year}</span>
                  <div>
                    <p className="font-medium text-ink">{row.label}</p>
                    <p className="small text-muted">{row.place}</p>
                  </div>
                </li>
              ))}
            </ol>

            <ul className="mt-8 flex flex-wrap gap-2" aria-label="Quick facts">
              {ABOUT.chips.map((chip) => (
                <li key={chip} className="chip">
                  {chip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
