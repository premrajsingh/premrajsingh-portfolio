/**
 * Section index row + h2 (design-spec §4.3). `aside` is optional and must be a neutral,
 * data-derived string (counts, periods). The `.section-index` hairline is the only rule.
 */
export default function SectionHead({ index, title, titleId, aside }) {
  return (
    <header className="mb-10 sm:mb-14">
      <div className="section-index">
        <p className="kicker">
          <span className="tabular">{index}</span> — {title}
        </p>
        {aside ? <p className="kicker">{aside}</p> : null}
      </div>
      <h2 id={titleId} className="display-lg mt-6 text-ink" data-mask>
        <span className="mask-line">
          <span>{title}</span>
        </span>
      </h2>
    </header>
  )
}
