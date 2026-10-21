import { GLYPH_KINDS } from "../three/architecture.js"

/**
 * The thirteen-node glyph vocabulary as 2D icons (design-spec §6.6). `GlyphDefs` is mounted
 * exactly once by Hero (first child of `main`); every consumer renders `<Glyph kind=… />` or
 * `<use href="#glyph-…">`. Symbol children carry no stroke attributes so `.is-active` /
 * `.is-dim` set on an ancestor inherit through `<use>`.
 */
const SYMBOLS = {
  card: <rect x="7" y="5" width="10" height="14" rx="0.5" />,
  ring: (
    <>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="4.5" />
    </>
  ),
  capsule: <rect x="4" y="8.5" width="16" height="7" rx="3.5" />,
  box: (
    <>
      <path d="M12 4.5L18.5 8.25V15.75L12 19.5L5.5 15.75V8.25Z" />
      <path d="M5.5 8.25L12 12L18.5 8.25M12 12V19.5" />
    </>
  ),
  "box-sm": (
    <>
      <path d="M12 6.6L16.7 9.3V14.7L12 17.4L7.3 14.7V9.3Z" />
      <path d="M7.3 9.3L12 12L16.7 9.3M12 12V17.4" />
    </>
  ),
  queue: (
    <>
      <ellipse cx="6.5" cy="12" rx="2.5" ry="5" />
      <path d="M6.5 7H17.5M6.5 17H17.5" />
      <path d="M17.5 7a2.5 5 0 0 1 0 10" />
    </>
  ),
  cluster: (
    <>
      <path d="M3 18.5H21" />
      <rect x="4.5" y="12" width="4" height="4" />
      <rect x="10" y="12" width="4" height="4" />
      <rect x="15.5" y="12" width="4" height="4" />
    </>
  ),
  glass: (
    <>
      <path d="M12 4L19 8V16L12 20L5 16V8Z" />
      <path d="M5 8L19 16" />
    </>
  ),
  db: (
    <>
      <ellipse cx="12" cy="7" rx="6" ry="2.5" />
      <path d="M6 7V17M18 7V17" />
      <path d="M6 17a6 2.5 0 0 0 12 0" />
    </>
  ),
  graph: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M9 9L15 10M9 9L10 15M15 10L15 15M10 15L15 15" />
      <circle cx="9" cy="9" r="1" />
      <circle cx="15" cy="10" r="1" />
      <circle cx="10" cy="15" r="1" />
      <circle cx="15" cy="15" r="1" />
    </>
  ),
  lattice: (
    <>
      <rect x="4.5" y="4.5" width="15" height="15" />
      <path d="M8 8h0.01M12 8h0.01M16 8h0.01M8 12h0.01M12 12h0.01M16 12h0.01M8 16h0.01M12 16h0.01M16 16h0.01" />
    </>
  ),
  square: <rect x="5" y="5" width="14" height="14" />,
}

/** Hidden symbol sheet. Mounted once (by Hero). */
export function GlyphDefs() {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      width="0"
      height="0"
      className="absolute h-0 w-0 overflow-hidden"
      style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
    >
      <defs>
        {GLYPH_KINDS.map((kind) => (
          <symbol
            key={kind}
            id={`glyph-${kind}`}
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {SYMBOLS[kind] ?? SYMBOLS.square}
          </symbol>
        ))}
      </defs>
    </svg>
  )
}

/**
 * 20px inline glyph. With a `title` it is announced as an image; without one it is decorative.
 */
export default function Glyph({ kind, title, className = "" }) {
  const safeKind = GLYPH_KINDS.includes(kind) ? kind : "square"
  const labelled = Boolean(title)
  return (
    <svg
      className={className ? `glyph ${className}` : "glyph"}
      viewBox="0 0 24 24"
      role={labelled ? "img" : undefined}
      aria-hidden={labelled ? undefined : "true"}
      focusable="false"
    >
      {labelled ? <title>{title}</title> : null}
      <use href={`#glyph-${safeKind}`} />
    </svg>
  )
}
