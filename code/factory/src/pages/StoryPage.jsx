import { useState } from 'react'
import { Icon } from '../components/icons.jsx'
import IntakeModal from '../components/IntakeModal.jsx'
import QualityResult, { applyFinding } from '../components/QualityCheck.jsx'
import StartDeliveryModal from '../components/StartDeliveryModal.jsx'
import StoryEditor from '../components/StoryEditor.jsx'
import { Badge, Card, Confirm, ErrorNote, Heading, Inline, Note, Topbar } from '../components/ui.jsx'
import { api, useLive } from '../lib/api.js'
import { formatDate, plural, RUN_STATUS, STORY_STATUS, storyCode } from '../lib/format.js'
import { navigate } from '../lib/router.js'
import { useSelection } from '../lib/selection.js'

export default function StoryPage({ id }) {
  const { data: story, error, reload } = useLive(`/api/requirements/${id}`, ['requirements', 'runs'])
  const tree = useLive('/api/requirements', ['requirements', 'runs'])
  const selection = useSelection()
  const [dialog, setDialog] = useState(null)
  const [checking, setChecking] = useState(false)
  const [quality, setQuality] = useState(null)
  const [actionError, setActionError] = useState('')

  if (!story) {
    return (
      <>
        <Topbar kicker="Anforderung" title={storyCode(id)} back="#/anforderungen" />
        <div className="dt-content">
          <ErrorNote>{error}</ErrorNote>
        </div>
      </>
    )
  }

  const status = STORY_STATUS[story.state] ?? STORY_STATUS.Modified
  const isOpen = story.state !== 'Implemented'
  const locked = tree.data?.locked
  const canChange = !story.isTool && !locked

  async function runCheck() {
    setChecking(true)
    setActionError('')
    setQuality(null)
    try {
      setQuality(await api.post('/api/requirements/check', story))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setChecking(false)
    }
  }

  async function applySuggestion(finding) {
    setActionError('')
    try {
      await api.put(`/api/requirements/${id}`, { ...story, criteria: applyFinding(story.criteria, finding) })
      setQuality({ ...quality, findings: quality.findings.filter((item) => item !== finding) })
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function startAssistant(text) {
    const { id: sessionId } = await api.post('/api/studio', { text, storyId: id })
    navigate(`#/assistent/${sessionId}`)
  }

  return (
    <>
      <Topbar kicker={`Anforderung · ${storyCode(id)}`} title={story.title} back="#/anforderungen">
        <Badge tone={status.tone}>{status.label}</Badge>
        {canChange && (
          <>
            <button type="button" className="dt-btn dt-btn--secondary" onClick={() => setDialog('assistant')}>
              <Icon name="mic" /> Mit Assistent überarbeiten
            </button>
            <button type="button" className="dt-btn dt-btn--secondary" onClick={() => setDialog('edit')}>
              <Icon name="pencil" /> Bearbeiten
            </button>
            {isOpen && (
              <button type="button" className="dt-btn dt-btn--primary" onClick={() => setDialog('deliver')}>
                <Icon name="factory" /> Umsetzung starten
              </button>
            )}
          </>
        )}
      </Topbar>
      <div className="dt-content">
        <div className="f-detail">
          <div className="f-stack">
            <ErrorNote>{actionError}</ErrorNote>
            {story.isTool && (
              <Note>Diese Anforderung beschreibt die Software Factory selbst. Sie wird über den regulären Entwicklungsprozess geändert, nicht über die Factory.</Note>
            )}
            <section className="dt-card dt-card--lg">
              <div className="dt-card__pad">
                <div className="dt-kicker">Nutzen</div>
                <p className="f-userstory">
                  <Inline text={story.userStory} />
                </p>
                {story.description && (
                  <>
                    <div className="dt-field__label f-detail__label">Beschreibung</div>
                    <p className="f-detail__text">
                      <Inline text={story.description} />
                    </p>
                  </>
                )}
              </div>
            </section>

            <Card
              title="Abnahmekriterien"
              kicker={plural(story.criteriaCount, 'Kriterium', 'Kriterien')}
              actions={
                !story.isTool && (
                  <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={runCheck} disabled={checking}>
                    <Icon name="quality" /> {checking ? 'Prüfung läuft …' : 'Qualität prüfen'}
                  </button>
                )
              }
            >
              <QualityResult result={quality} onApply={canChange ? applySuggestion : null} />
              {story.criteria.map((group, index) => (
                <div key={index} className="f-criteria">
                  {group.heading && <div className="f-criteria__heading">{group.heading}</div>}
                  <ul>
                    {group.items.map((item) => (
                      <li key={item} className={isOpen ? '' : 'is-done'}>
                        <span className="f-criteria__mark">{!isOpen && <Icon name="check" size={12} strokeWidth={3} />}</span>
                        <span>
                          <Inline text={item} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </Card>
          </div>

          <aside className="f-stack">
            <Card title="Einordnung" kicker="Struktur">
              <dl className="f-facts">
                <div>
                  <dt>Themenbereich</dt>
                  <dd>{story.epicName}</dd>
                </div>
                <div>
                  <dt>Funktion</dt>
                  <dd>{story.featureName}</dd>
                </div>
                <div>
                  <dt>Herkunft</dt>
                  <dd>
                    {story.origin ? (
                      <a href={`#/ideen/${story.origin.id}`}>
                        Idee {story.origin.id} »{story.origin.title}«
                      </a>
                    ) : (
                      'Direkt erfasst'
                    )}
                  </dd>
                </div>
              </dl>
              {isOpen && !story.isTool && (
                <button
                  type="button"
                  className="dt-btn dt-btn--secondary dt-btn--modal dt-btn--block f-facts__action"
                  onClick={() => selection.toggle(id)}
                  aria-pressed={selection.isSelected(id)}
                >
                  {selection.isSelected(id) ? 'Aus der Auswahl entfernen' : 'Zur Auswahl hinzufügen'}
                </button>
              )}
              {isOpen && !story.isTool && (
                <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal dt-btn--block f-facts__action" onClick={() => setDialog('delete')} disabled={locked}>
                  <Icon name="trash" /> Anforderung entfernen
                </button>
              )}
            </Card>

            <Card title="Umsetzungen" kicker="Nachweis">
              {story.runs.length === 0 ? (
                <div className="dt-stat__sub">Noch nicht über die Software Factory umgesetzt.</div>
              ) : (
                <ul className="f-timeline">
                  {story.runs.map((run) => {
                    const runStatus = RUN_STATUS[run.status]
                    return (
                      <li key={run.id}>
                        <a href={`#/umsetzung/${run.id}`}>
                          <span className="dt-cell-mono">{run.id}</span> {runStatus?.label}
                        </a>
                        <span className="dt-stat__sub">{formatDate(run.endedAt)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>

            <Card title="Änderungsverlauf" kicker="Versionen">
              {story.history.length === 0 ? (
                <div className="dt-stat__sub">Noch keine gesicherte Version.</div>
              ) : (
                <ul className="f-timeline">
                  {story.history.map((entry) => (
                    <li key={entry.hash}>
                      <span>{entry.subject}</span>
                      <span className="dt-stat__sub">
                        {formatDate(entry.at)} · <span className="dt-cell-mono">{entry.hash}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </aside>
        </div>
      </div>

      {dialog === 'edit' && (
        <StoryEditor
          story={story}
          tree={tree.data?.tree ?? []}
          onClose={() => setDialog(null)}
          onSaved={() => {
            setDialog(null)
            reload()
          }}
        />
      )}
      {dialog === 'assistant' && (
        <IntakeModal
          kicker={`Anforderung ${storyCode(id)}`}
          title="Mit dem Assistenten überarbeiten"
          label="Was soll sich ändern"
          placeholder="Beschreiben Sie, was an dieser Anforderung anders werden soll."
          cta="Gespräch starten"
          onSubmit={startAssistant}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'deliver' && <StartDeliveryModal stories={[story]} onClose={() => setDialog(null)} />}
      {dialog === 'delete' && (
        <Confirm
          title="Anforderung entfernen"
          cta="Entfernen"
          danger
          onClose={() => setDialog(null)}
          onConfirm={async () => {
            await api.del(`/api/requirements/${id}`)
            selection.set(selection.selected.filter((item) => item !== id))
            navigate('#/anforderungen')
          }}
        >
          »{story.title}« wird entfernt. In der Versionsverwaltung bleibt der Vorgang nachvollziehbar. Umgesetzte Anforderungen lassen sich nicht entfernen.
        </Confirm>
      )}
    </>
  )
}
