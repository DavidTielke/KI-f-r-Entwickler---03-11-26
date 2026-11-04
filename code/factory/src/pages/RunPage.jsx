import { useState } from 'react'
import { Icon } from '../components/icons.jsx'
import { RunFeed, RunProgress, RunStories } from '../components/RunPanel.jsx'
import { Badge, Card, Confirm, ErrorNote, Heading, Note, Topbar } from '../components/ui.jsx'
import { api, useLive } from '../lib/api.js'
import { formatDateTime, formatUsd, RUN_STATUS, RUN_TYPE } from '../lib/format.js'
import { navigate } from '../lib/router.js'

function ResultCard({ run, appUrl }) {
  if (!['done', 'partial'].includes(run.status)) return null
  return (
    <section className="dt-card dt-card--lg">
      <div className="dt-card__pad">
        <div className="dt-kicker">Ergebnis</div>
        <h3 className="f-h3 f-h3--spaced">
          <Heading>{run.status === 'done' ? 'Der Auftrag ist abgeschlossen' : 'Der Auftrag ist teilweise abgeschlossen'}</Heading>
        </h3>
        {run.summary && <p className="f-detail__text">{run.summary}</p>}
        <div className="f-result__actions">
          {run.type !== 'transfer' && appUrl && (
            <a className="dt-btn dt-btn--primary dt-btn--modal" href={appUrl} target="_blank" rel="noreferrer">
              <Icon name="external" /> Anwendung öffnen
            </a>
          )}
          {run.type === 'transfer' && (
            <a className="dt-btn dt-btn--primary dt-btn--modal" href="#/anforderungen?filter=offen">
              Anforderungen prüfen
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

function ChangesCard({ run }) {
  const [open, setOpen] = useState(false)
  if (!run.changes) return null
  return (
    <Card title="Geänderte Bereiche" kicker="Auswirkung">
      <ul className="f-areas">
        {Object.entries(run.changes.areas).map(([area, count]) => (
          <li key={area}>
            <span>{area}</span>
            <span className="dt-cell-mono">{count}</span>
          </li>
        ))}
      </ul>
      <button type="button" className="f-disclosure" onClick={() => setOpen(!open)} aria-expanded={open}>
        <Icon name={open ? 'chevronDown' : 'chevronRight'} />
        Technische Details
      </button>
      {open && (
        <ul className="f-filelist">
          {run.changes.files.map((file) => (
            <li key={file.path}>
              <code>{file.path}</code>
              <span className="dt-cell-mono">+{file.added} −{file.removed}</span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

export default function RunPage({ id }) {
  const { data: run, error, reload } = useLive(`/api/runs/${id}`, ['runs'])
  const system = useLive('/api/system')
  const [confirm, setConfirm] = useState(null)
  const [actionError, setActionError] = useState('')

  if (!run) {
    return (
      <>
        <Topbar kicker="Auftrag" title={id} back="#/umsetzung" />
        <div className="dt-content">
          <ErrorNote>{error}</ErrorNote>
        </div>
      </>
    )
  }

  const status = RUN_STATUS[run.status]
  const active = ['queued', 'running'].includes(run.status)
  const changesDatabase = run.changes?.files.some((file) => file.path.startsWith('code/backend/Migrations/'))
  const canRevert = run.type === 'delivery' && run.commit && !run.revertedBy && !active && !changesDatabase
  const canRetry = ['failed', 'canceled'].includes(run.status) && !run.canDiscard && run.type !== 'revert'

  async function perform(action) {
    setActionError('')
    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function retry() {
    const { id: nextId } = await api.post(`/api/runs/${id}/retry`)
    navigate(`#/umsetzung/${nextId}`)
  }

  async function revert() {
    const { id: nextId } = await api.post(`/api/runs/${id}/revert`)
    navigate(`#/umsetzung/${nextId}`)
  }

  return (
    <>
      <Topbar kicker={`${RUN_TYPE[run.type]} ${run.id}`} title={run.title} back="#/umsetzung">
        <Badge tone={status.tone}>{status.label}</Badge>
        {active && (
          <button type="button" className="dt-btn dt-btn--secondary" onClick={() => setConfirm('cancel')}>
            <Icon name="stop" /> Auftrag abbrechen
          </button>
        )}
        {run.canDiscard && (
          <button type="button" className="dt-btn dt-btn--secondary" onClick={() => setConfirm('discard')}>
            <Icon name="trash" /> Änderungen verwerfen
          </button>
        )}
        {canRetry && (
          <button type="button" className="dt-btn dt-btn--primary" onClick={() => perform(retry)}>
            <Icon name="refresh" /> Erneut beauftragen
          </button>
        )}
        {canRevert && (
          <button type="button" className="dt-btn dt-btn--secondary" onClick={() => setConfirm('revert')}>
            <Icon name="undo" /> Auslieferung zurücknehmen
          </button>
        )}
      </Topbar>
      <div className="dt-content">
        <div className="f-stack">
          <ErrorNote>{actionError}</ErrorNote>
          {run.error && (
            <ErrorNote>
              <strong>{run.error}</strong>
              {run.canDiscard && ' Die bisherigen Änderungen liegen noch im Arbeitsstand. Sie können sie verwerfen und den Auftrag danach erneut starten.'}
              {run.errorDetail && (
                <details className="f-errordetail">
                  <summary>Technische Details</summary>
                  <pre className="f-pre">{run.errorDetail}</pre>
                </details>
              )}
            </ErrorNote>
          )}
          {run.revertedBy && (
            <ErrorNote>
              Diese Auslieferung wurde durch <a href={`#/umsetzung/${run.revertedBy}`}>{run.revertedBy}</a> zurückgenommen.
            </ErrorNote>
          )}
          <RunProgress run={run} />
          <ResultCard run={run} appUrl={system.data?.app.url} />
          {run.type === 'delivery' && run.commit && changesDatabase && !active && (
            <Note>Diese Auslieferung enthält eine Datenbankänderung und lässt sich deshalb nicht automatisch zurücknehmen.</Note>
          )}
          <div className="f-runlayout">
            <div className="f-stack">
              <RunStories run={run} />
              <ChangesCard run={run} />
              <Card title="Eckdaten" kicker="Auftrag">
                <dl className="f-facts">
                  <div>
                    <dt>Beauftragt</dt>
                    <dd>{formatDateTime(run.queuedAt)}</dd>
                  </div>
                  <div>
                    <dt>Abgeschlossen</dt>
                    <dd>{formatDateTime(run.endedAt)}</dd>
                  </div>
                  <div>
                    <dt>Rechnerischer KI-Aufwand</dt>
                    <dd className="dt-cell-mono">{formatUsd(run.costUsd)}</dd>
                  </div>
                </dl>
              </Card>
            </div>
            <RunFeed run={run} />
          </div>
        </div>
      </div>

      {confirm === 'cancel' && (
        <Confirm title="Auftrag abbrechen" cta="Auftrag abbrechen" danger="stop" onClose={() => setConfirm(null)} onConfirm={() => api.post(`/api/runs/${id}/cancel`).then(reload)}>
          Die Arbeit wird sofort beendet. Bereits vorgenommene Änderungen bleiben zunächst erhalten, und Sie entscheiden anschließend, ob sie verworfen werden.
        </Confirm>
      )}
      {confirm === 'discard' && (
        <Confirm title="Änderungen verwerfen" cta="Verwerfen" danger onClose={() => setConfirm(null)} onConfirm={() => api.post(`/api/runs/${id}/discard`).then(reload)}>
          Alle nicht gesicherten Änderungen an der Anwendung und den Anforderungen werden entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
        </Confirm>
      )}
      {confirm === 'revert' && (
        <Confirm title="Auslieferung zurücknehmen" cta="Zurücknehmen" danger="undo" onClose={() => setConfirm(null)} onConfirm={revert}>
          Der Stand vor dieser Auslieferung wird wiederhergestellt und erneut ausgeliefert. Die betroffenen Anforderungen gelten danach wieder als offen.
        </Confirm>
      )}
    </>
  )
}
