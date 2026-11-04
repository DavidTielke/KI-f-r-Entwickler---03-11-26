import { useState } from 'react'
import Conversation from '../components/Conversation.jsx'
import { Icon } from '../components/icons.jsx'
import QualityResult, { applyFinding } from '../components/QualityCheck.jsx'
import StoryEditor from '../components/StoryEditor.jsx'
import { Confirm, ErrorNote, Heading, Inline, ReadinessList, Topbar } from '../components/ui.jsx'
import { api, useLive } from '../lib/api.js'
import { plural, storyCode } from '../lib/format.js'
import { navigate } from '../lib/router.js'

// Anforderungs-Assistent: links das Gespräch, rechts der entstehende Entwurf.
export default function AssistantPage({ id }) {
  const { data: session, error, reload } = useLive(`/api/studio/${id}`, ['studio'])
  const tree = useLive('/api/requirements', ['requirements', 'runs'])
  const [editing, setEditing] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [actionError, setActionError] = useState('')
  const [saving, setSaving] = useState(false)
  const [checking, setChecking] = useState(false)
  const [quality, setQuality] = useState(null)

  if (!session) {
    return (
      <>
        <Topbar kicker="KI-Assistent" title="Entwurf" back="#/anforderungen" />
        <div className="dt-content">
          <ErrorNote>{error}</ErrorNote>
        </div>
      </>
    )
  }

  const { draft } = session
  const isEdit = Boolean(session.storyId)
  const saved = session.status === 'saved'
  const criteriaCount = draft.criteria.reduce((sum, group) => sum + group.items.length, 0)
  const canSave = !session.busy && draft.title && draft.userStory && criteriaCount > 0

  async function save() {
    setSaving(true)
    setActionError('')
    try {
      const result = await api.post(`/api/studio/${id}/save`)
      navigate(`#/anforderungen/${result.id}`)
    } catch (err) {
      setActionError(err.message)
      setSaving(false)
    }
  }

  async function check() {
    setChecking(true)
    setActionError('')
    setQuality(null)
    try {
      setQuality(await api.post('/api/requirements/check', draft))
    } catch (err) {
      setActionError(err.message)
    } finally {
      setChecking(false)
    }
  }

  async function saveDraft(next) {
    await api.put(`/api/studio/${id}/draft`, next)
    reload()
  }

  // Der Entwurf wird im selben Formular bearbeitet wie eine fertige Anforderung.
  const editorStory = { ...draft, id: session.storyId ?? id, state: 'Modified' }

  return (
    <>
      <Topbar kicker={isEdit ? `Überarbeitung von ${storyCode(session.storyId)}` : `Entwurf ${session.id}`} title={draft.title || 'Neue Anforderung'} back="#/anforderungen">
        <span className="f-score">
          {session.readyCount}/{session.readyTotal}
        </span>
        <button type="button" className="dt-btn dt-btn--primary" disabled={!canSave || saving || saved} onClick={save}>
          <Icon name="check" /> {isEdit ? 'Änderung speichern' : 'Anforderung anlegen'}
        </button>
      </Topbar>

      <div className="f-workspace f-workspace--full">
        <Conversation
          session={session}
          assistantName="Anforderungs-Assistent"
          readOnly={saved}
          readOnlyHint="Dieser Entwurf wurde gespeichert."
          placeholder="Antworten Sie dem Assistenten oder ergänzen Sie etwas"
          onSend={(text, answers) => api.post(`/api/studio/${id}/message`, { text, answers }).then(reload)}
          onRetry={() => api.post(`/api/studio/${id}/retry`).then(reload)}
        />

        <div className="f-workspace__side">
          <ErrorNote>{actionError}</ErrorNote>
          <section className="dt-card">
            <div className="dt-card__pad">
              <div className="f-card__head">
                <div>
                  <div className="dt-kicker">Entwurf</div>
                  <h3 className="f-h3">
                    <Heading>Stand der Anforderung</Heading>
                  </h3>
                </div>
                <div className="f-card__actions">
                  <button type="button" className="dt-iconbtn" disabled={session.busy || saved} onClick={() => setEditing(true)} aria-label="Entwurf selbst bearbeiten" title="Entwurf selbst bearbeiten">
                    <Icon name="pencil" />
                  </button>
                  <button type="button" className="dt-iconbtn dt-iconbtn--danger" disabled={session.busy} onClick={() => setConfirmDelete(true)} aria-label="Entwurf verwerfen" title="Entwurf verwerfen">
                    <Icon name="trash" />
                  </button>
                </div>
              </div>

              <ReadinessList labels={session.readinessLabels} values={session.readiness} />

              <div className="f-doc__section">
                <div className="dt-field__label">Einordnung</div>
                <div className="f-doc__text">
                  {draft.placement.epicName || 'Noch offen'}
                  {draft.placement.featureName ? ` · ${draft.placement.featureName}` : ''}
                  {!isEdit && draft.placement.epicName && !draft.placement.epicNumber && <span className="dt-cell-muted"> (neuer Themenbereich)</span>}
                  {!isEdit && draft.placement.epicNumber && draft.placement.featureName && !draft.placement.featureNumber && <span className="dt-cell-muted"> (neue Funktion)</span>}
                </div>
              </div>
              <div className="f-doc__section">
                <div className="dt-field__label">Nutzen</div>
                <div className="f-doc__text">{draft.userStory ? <Inline text={draft.userStory} /> : <span className="dt-cell-muted">Noch offen</span>}</div>
              </div>
              <div className="f-doc__section">
                <div className="dt-field__label">Beschreibung</div>
                <div className="f-doc__text">{draft.description ? <Inline text={draft.description} /> : <span className="dt-cell-muted">Noch offen</span>}</div>
              </div>
              <div className="f-doc__section">
                <div className="f-doc__sectionhead">
                  <div className="dt-field__label">{plural(criteriaCount, 'Abnahmekriterium', 'Abnahmekriterien')}</div>
                  <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" disabled={!canSave || checking} onClick={check}>
                    <Icon name="quality" /> {checking ? 'Prüfung läuft …' : 'Qualität prüfen'}
                  </button>
                </div>
                <QualityResult
                  result={quality}
                  onApply={async (finding) => {
                    await saveDraft({ criteria: applyFinding(draft.criteria, finding) })
                    setQuality({ ...quality, findings: quality.findings.filter((item) => item !== finding) })
                  }}
                />
                {draft.criteria.map((group, index) => (
                  <div key={index} className="f-criteria">
                    {group.heading && <div className="f-criteria__heading">{group.heading}</div>}
                    <ul>
                      {group.items.map((item) => (
                        <li key={item}>
                          <span className="f-criteria__mark" />
                          <span>
                            <Inline text={item} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>

      {editing && (
        <StoryEditor
          story={editorStory}
          tree={tree.data?.tree ?? []}
          defaults={draft.placement}
          showPlacement={!isEdit}
          onClose={() => setEditing(false)}
          onSave={async (next) => {
            await saveDraft(next)
            setEditing(false)
          }}
        />
      )}
      {confirmDelete && (
        <Confirm
          title="Entwurf verwerfen"
          cta="Verwerfen"
          danger
          onClose={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await api.del(`/api/studio/${id}`)
            navigate('#/anforderungen')
          }}
        >
          Der Entwurf und das Gespräch werden entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
        </Confirm>
      )}
    </>
  )
}
