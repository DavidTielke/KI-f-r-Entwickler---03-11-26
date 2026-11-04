import { Badge, Inline, Note } from './ui.jsx'

// Ergebnis der Qualitätsprüfung. Vorschläge lassen sich einzeln übernehmen.
export default function QualityResult({ result, onApply }) {
  if (!result) return null
  return (
    <div className="f-quality">
      <Note icon={result.verdict === 'gut' ? 'check' : 'alert'}>
        <Inline text={result.summary} />
      </Note>
      {result.findings.map((finding) => (
        <article key={finding.criterion} className="f-finding">
          <div className="f-finding__head">
            <Badge tone="orange">{finding.principle}</Badge>
          </div>
          <div className="f-finding__criterion">
            <Inline text={finding.criterion} />
          </div>
          <div className="dt-stat__sub">
            <Inline text={finding.problem} />
          </div>
          <div className="dt-field__label f-finding__label">Vorschlag</div>
          <ul className="f-doc__list">
            {finding.suggestions.map((suggestion) => (
              <li key={suggestion}>
                <Inline text={suggestion} />
              </li>
            ))}
          </ul>
          {onApply && (
            <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={() => onApply(finding)}>
              Vorschlag übernehmen
            </button>
          )}
        </article>
      ))}
    </div>
  )
}

// Ersetzt ein Kriterium durch die vorgeschlagenen Formulierungen.
export function applyFinding(criteria, finding) {
  return criteria.map((group) => ({
    ...group,
    items: group.items.flatMap((item) => (item === finding.criterion ? finding.suggestions : [item])),
  }))
}
