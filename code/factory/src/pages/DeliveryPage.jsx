import { Badge, Card, Empty, ErrorNote, Topbar, Working } from '../components/ui.jsx'
import { useLive } from '../lib/api.js'
import { formatDateTime, formatDuration, plural, RUN_STATUS, RUN_TYPE } from '../lib/format.js'
import { navigate } from '../lib/router.js'

export default function DeliveryPage() {
  const { data, error } = useLive('/api/runs', ['runs'])
  const overview = useLive('/api/overview', ['requirements', 'runs'])
  const runs = data ?? []
  const active = runs.filter((run) => ['queued', 'running'].includes(run.status))
  const open = overview.data?.totals.open ?? 0

  return (
    <>
      <Topbar kicker="Fertigung" title="Umsetzung">
        <a className="dt-btn dt-btn--primary" href="#/anforderungen?filter=offen">
          {open > 0 ? `${plural(open, 'offene Anforderung', 'offene Anforderungen')} auswählen` : 'Anforderungen ansehen'}
        </a>
      </Topbar>
      <div className="dt-content">
        <div className="f-stack">
          <ErrorNote>{error}</ErrorNote>

          {active.length > 0 && (
            <Card title="Aktuell in der Fertigung" kicker={plural(active.length, 'Auftrag', 'Aufträge')}>
              <ul className="f-actions">
                {active.map((run) => (
                  <li key={run.id}>
                    <a href={`#/umsetzung/${run.id}`} className="f-action">
                      <span className="dt-cell-mono">{run.id}</span>
                      <span className="f-action__title">
                        {RUN_TYPE[run.type]}: {run.title}
                      </span>
                      <span className="f-action__cta">
                        {run.status === 'running' ? <Working>{run.phases.find((p) => p.status === 'active')?.label ?? 'Läuft'}</Working> : 'Wartet auf Start'}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <section className="dt-tablecard">
            <div className="dt-tablecard__head">
              <span>{data ? plural(runs.length, 'Auftrag', 'Aufträge') : 'Wird geladen …'}</span>
            </div>
            {data && runs.length === 0 ? (
              <Empty
                title="Noch keine Aufträge"
                hint="Wählen Sie unter Anforderungen die offenen Punkte aus und starten Sie die Umsetzung."
              />
            ) : (
              <table className="dt-table f-table">
                <thead>
                  <tr>
                    <th>Nummer</th>
                    <th>Art</th>
                    <th>Auftrag</th>
                    <th>Beauftragt</th>
                    <th>Dauer</th>
                    <th>Version</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {runs.map((run) => {
                    const status = RUN_STATUS[run.status]
                    const duration = run.startedAt && run.endedAt ? new Date(run.endedAt) - new Date(run.startedAt) : null
                    return (
                      <tr key={run.id} className="f-table__row" onClick={() => navigate(`#/umsetzung/${run.id}`)}>
                        <td className="dt-cell-mono">
                          <a href={`#/umsetzung/${run.id}`} onClick={(event) => event.stopPropagation()}>{run.id}</a>
                        </td>
                        <td className="dt-cell-muted">{RUN_TYPE[run.type]}</td>
                        <td className="dt-cell-strong">{run.title}</td>
                        <td className="dt-cell-muted f-table__nowrap">{formatDateTime(run.queuedAt)}</td>
                        <td className="dt-cell-mono f-table__nowrap">{formatDuration(duration)}</td>
                        <td className="dt-cell-mono">{run.commit ?? '–'}</td>
                        <td className="f-table__nowrap">
                          <Badge tone={run.revertedBy ? 'neutral' : status.tone}>{run.revertedBy ? 'Zurückgenommen' : status.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
