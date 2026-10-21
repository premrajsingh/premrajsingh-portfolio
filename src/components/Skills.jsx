import { useRef } from "react"
import { ChevronDown } from "lucide-react"
import SectionHead from "./SectionHead.jsx"
import Glyph from "./Glyph.jsx"
import { COMPETITIVE, SKILLS } from "../data/content.js"
import { NODE_BY_ID } from "../three/architecture.js"
import { activeNodeStore, useActiveNode } from "../lib/activeNodeStore.js"
import { useSectionReveal } from "../lib/useSectionReveal.js"
import { skillHover, useHoverStore } from "../lib/hoverStore.js"
import SectionScene from "./SectionScene.jsx"

/**
 * Skills — a bill of materials (design-spec §5.6).
 *
 * Desktop (≥1024px) is one hairline table in the presentation ORDER below; below 1024px each
 * group is a `<details>` disclosure with the first three open. Every string comes from
 * content.js; the "Fig. 0 · …" cross-reference uses `short` from src/three/architecture.js.
 * Rows whose group maps to a hero-diagram node carry `data-node-id` and drive the shared
 * active-node store on hover/focus so the Fig. 0 diagram highlights that component. GSAP
 * (useSectionReveal) owns the row stagger; CSS owns hover/focus and the active-row colours.
 */

/** Presentation order (content.js is untouched). Strings equal the SKILLS[].title fields. */
const ORDER = [
  "AI",
  "Backend",
  "Messaging",
  "Databases",
  "Integrations",
  "Security",
  "Testing",
  "DevOps",
  "Languages",
  "Frontend",
  "Core CS",
  "Tools",
]

/** Hero glyph vocabulary per group; everything else is the hairline square. */
const GLYPH_BY_GROUP = {
  AI: "glass",
  Backend: "box",
  Messaging: "queue",
  Databases: "db",
  Integrations: "ring",
  Frontend: "card",
}

/** Groups that map to a Fig. 0 node (the only cross-component DOM hook is data-node-id). */
const NODE_BY_GROUP = {
  AI: "llm",
  Backend: "fastapi",
  Messaging: "bus",
  Databases: "neo4j",
  Integrations: "webhook",
  Frontend: "client",
}

const SECTION_INDEX = "04"
const RAISED_ROWS = 3
const INTRO = "Grouped as a bill of materials; items are those used in the work above."
const STORE_SOURCE = "skills"

function refLabel(n) {
  return `${Number(SECTION_INDEX)}.${String(n).padStart(2, "0")}`
}

/** SKILLS in presentation order; any group missing from ORDER is appended so nothing is dropped. */
function orderGroups() {
  const byTitle = new Map(SKILLS.map((group) => [group.title, group]))
  const ordered = ORDER.map((title) => byTitle.get(title)).filter(Boolean)
  const rest = SKILLS.filter((group) => !ORDER.includes(group.title))
  return [...ordered, ...rest]
}

const GROUPS = orderGroups().map((group, index) => ({
  ...group,
  ref: refLabel(index + 1),
  glyph: GLYPH_BY_GROUP[group.title] ?? "square",
  nodeId: NODE_BY_GROUP[group.title] ?? null,
  raised: index < RAISED_ROWS,
}))

const SHELF_GROUPS = GROUPS.map((group) => ({ title: group.title, kind: group.glyph }))

const TOTAL_ITEMS = SKILLS.reduce((sum, group) => sum + group.items.length, 0)

const FOOTNOTE = {
  ref: refLabel(GROUPS.length + 1),
  title: "Problem solving",
  text: `${COMPETITIVE.count} problems on ${COMPETITIVE.platforms}: ${COMPETITIVE.topics.join(" · ")}`,
}

/** Hover may not replace a pinned node (spec §6.3.3 / §6.7). */
function activate(nodeId) {
  if (!nodeId || activeNodeStore.getSnapshot().pinned) return
  activeNodeStore.setActive(nodeId, { source: STORE_SOURCE })
}

/** Clear only what this row set; `clear()` itself respects a pinned node. */
function deactivate(nodeId) {
  if (!nodeId || activeNodeStore.getSnapshot().id !== nodeId) return
  activeNodeStore.clear()
}

/** Row hover drives the shelf figure (every group) and the hero diagram (groups with a node). */
function nodeHandlers(nodeId, title) {
  return {
    onMouseEnter: () => {
      skillHover.set(title)
      activate(nodeId)
    },
    onMouseLeave: () => {
      skillHover.clear(title)
      deactivate(nodeId)
    },
    onFocus: () => {
      skillHover.set(title)
      activate(nodeId)
    },
    onBlur: () => {
      skillHover.clear(title)
      deactivate(nodeId)
    },
  }
}

const COLOUR_TRANSITION = "transition-colors duration-[250ms] ease-out"
const ACTIVE_TEXT = "group-[.is-active]:text-accent"

/**
 * 96×54 proof thumbnail linking back to the Work section. CSS owns the lift (translateY −2px,
 * motion-safe only) and the single `--shadow-lift` token on hover / focus-visible.
 */
function EvidenceThumb({ proof, className = "" }) {
  return (
    <a
      href="#work"
      className={`group/thumb focus-ring inline-flex flex-col items-start gap-1.5 ${className}`}
    >
      <span className="plate block h-[3.375rem] w-24 transition-[transform,box-shadow] duration-[250ms] ease-out group-hover/thumb:shadow-lift group-focus-visible/thumb:shadow-lift motion-safe:group-hover/thumb:-translate-y-0.5 motion-safe:group-focus-visible/thumb:-translate-y-0.5">
        <img
          src={proof.src}
          alt={proof.alt}
          width={1024}
          height={576}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover object-top"
        />
      </span>
      <span className="mono-xs text-muted">{proof.caption}</span>
    </a>
  )
}

/** One desktop table row. The `<tr>` is the Tailwind `group`; `.is-active` colours its cells. */
function SkillRow({ group, active }) {
  const node = group.nodeId ? NODE_BY_ID[group.nodeId] : null
  const rowClass = [
    "group border-b border-line align-top [&.is-active]:bg-accent-soft",
    COLOUR_TRANSITION,
    group.raised ? "bg-surface" : "",
    active ? "is-active" : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <tr
      className={rowClass}
      data-node-id={group.nodeId ?? undefined}
      {...nodeHandlers(group.nodeId, group.title)}
    >
      <td
        className={`mono-xs tabular pb-4 pr-3 pt-[1.2rem] text-muted ${COLOUR_TRANSITION} ${ACTIVE_TEXT}`}
      >
        {group.ref}
      </td>
      <td className={`px-3 py-4 text-dim ${COLOUR_TRANSITION} ${ACTIVE_TEXT}`}>
        <Glyph kind={group.glyph} />
      </td>
      <th
        scope="row"
        className={`small px-3 py-4 text-left font-medium text-ink ${COLOUR_TRANSITION} ${ACTIVE_TEXT}`}
      >
        {group.title}
        {node ? (
          <span className="mono-xs mt-0.5 block font-normal text-muted">Fig. 0 · {node.short}</span>
        ) : null}
      </th>
      <td className="mono-label px-3 pb-4 pt-[1.2rem] text-dim">{group.items.join(" · ")}</td>
      <td className="py-3 pl-3">{group.proof ? <EvidenceThumb proof={group.proof} /> : null}</td>
    </tr>
  )
}

/** Mobile disclosure for one group; AI, Backend and Messaging start open. */
function SkillDisclosure({ group, active }) {
  const node = group.nodeId ? NODE_BY_ID[group.nodeId] : null
  const detailsClass = ["group border-b border-line", active ? "is-active" : ""]
    .filter(Boolean)
    .join(" ")

  return (
    <details
      className={detailsClass}
      data-node-id={group.nodeId ?? undefined}
      open={group.raised}
      {...nodeHandlers(group.nodeId, group.title)}
    >
      <summary className="small focus-ring flex min-h-11 cursor-pointer list-none items-center gap-3 py-4 font-medium text-ink [&::-webkit-details-marker]:hidden">
        <Glyph kind={group.glyph} className={`text-dim ${COLOUR_TRANSITION} ${ACTIVE_TEXT}`} />
        <span className={`min-w-0 flex-1 ${COLOUR_TRANSITION} ${ACTIVE_TEXT}`}>{group.title}</span>
        <span className="mono-xs tabular flex-none text-muted">{group.items.length} items</span>
        <ChevronDown
          size={14}
          strokeWidth={1.5}
          aria-hidden="true"
          className="flex-none text-muted transition-transform duration-[250ms] ease-out group-open:rotate-180"
        />
      </summary>
      <div className="pb-5 pl-8">
        <p className="mono-label text-dim">{group.items.join(" · ")}</p>
        {node ? <p className="mono-xs mt-2 text-muted">Fig. 0 · {node.short}</p> : null}
        {group.proof ? <EvidenceThumb proof={group.proof} className="mt-4" /> : null}
      </div>
    </details>
  )
}

export default function Skills() {
  const sectionRef = useRef(null)
  useSectionReveal(sectionRef)
  const { id: activeId } = useActiveNode()
  const hovered = useHoverStore(skillHover)

  return (
    <section id="skills" ref={sectionRef} aria-labelledby="skills-heading" className="section">
      <div className="shell">
        <SectionHead
          index={SECTION_INDEX}
          title="Skills"
          titleId="skills-heading"
          aside={`${TOTAL_ITEMS} items · ${SKILLS.length} groups`}
        />

        <p className="small max-w-prose text-muted">{INTRO}</p>

        {/* The twelve groups as objects on a shelf; hovering a row below lifts its object. */}
        <div className="mt-8 hidden lg:block">
          <SectionScene kind="shelf" groups={SHELF_GROUPS} height="13rem" />
          <p className="mono-label mt-1 text-muted" aria-hidden="true">
            {hovered
              ? `Fig. 4 · ${hovered}`
              : "Fig. 4 · the twelve groups as components — hover a row or an object"}
          </p>
        </div>

        {/* Desktop: one table in presentation order. */}
        <table className="mt-6 hidden w-full table-fixed border-t border-line-strong lg:table">
          <caption className="sr-only">Skills by group</caption>
          <colgroup>
            <col className="w-14" />
            <col className="w-10" />
            <col className="w-44" />
            <col />
            <col className="w-44" />
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              <th scope="col" className="kicker pb-3 pr-3 pt-4 text-left font-normal">
                Ref
              </th>
              <th scope="col" className="px-3 pb-3 pt-4">
                <span className="sr-only">Glyph</span>
              </th>
              <th scope="col" className="kicker px-3 pb-3 pt-4 text-left font-normal">
                Group
              </th>
              <th scope="col" className="kicker px-3 pb-3 pt-4 text-left font-normal">
                Items
              </th>
              <th scope="col" className="kicker pb-3 pl-3 pt-4 text-left font-normal">
                Evidence
              </th>
            </tr>
          </thead>
          <tbody data-stagger>
            {GROUPS.map((group) => (
              <SkillRow
                key={group.title}
                group={group}
                active={
                  (Boolean(group.nodeId) && activeId === group.nodeId) || hovered === group.title
                }
              />
            ))}
            <tr className="border-b border-line align-top">
              <td className="mono-xs tabular pb-4 pr-3 pt-[1.2rem] text-muted">{FOOTNOTE.ref}</td>
              <td className="px-3 py-4 text-dim">
                <Glyph kind="square" />
              </td>
              <th scope="row" className="small px-3 py-4 text-left font-medium text-ink">
                {FOOTNOTE.title}
              </th>
              <td className="mono-label px-3 pb-4 pt-[1.2rem] text-dim" colSpan={2}>
                {FOOTNOTE.text}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Mobile: one disclosure per group; the first three are open. */}
        <div className="mt-6 border-t border-line-strong lg:hidden" data-stagger>
          {GROUPS.map((group) => (
            <SkillDisclosure
              key={group.title}
              group={group}
              active={Boolean(group.nodeId) && activeId === group.nodeId}
            />
          ))}
          <div className="flex gap-3 border-b border-line py-4">
            <Glyph kind="square" className="mt-px text-dim" />
            <div className="min-w-0">
              <p className="small font-medium text-ink">{FOOTNOTE.title}</p>
              <p className="mono-label mt-1 text-dim">{FOOTNOTE.text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
