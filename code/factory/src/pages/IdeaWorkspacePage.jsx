import { useState } from 'react'
import Conversation from '../components/Conversation.jsx'
import { Icon } from '../components/icons.jsx'
import {
  Badge,
  Confirm,
  ErrorNote,
  Heading,
  Inline,
  Modal,
  Note,
  ReadinessList,
  Stepper,
  Topbar,
  VoiceField,
} from '../components/ui.jsx'
import { api, useLive } from '../lib/api.js'
import { IDEA_PHASES, IDEA_STATUS } from '../lib/format.js'
import { navigate } from '../lib/router.js'

function phaseSteps(idea) {
  if (idea.state !== 'Draft') return IDEA_PHASES.map((phase) => ({ ...phase, status: 'done' }))
  const current = Math.max(0, IDEA_PHASES.findIndex((phase) => phase.key === idea.phase))
  return IDEA_PHASES.map((phase, index) => ({
    ...phase,
    status: index < current ? 'done' : index === current ? 'active' : 'pending',
  }))
}

function DocSection({ label, children, empty = 'Noch offen' }) {
  const hasContent = Array.isArray(children) ? children.length > 0 : Boolean(children)
  return (
    <div className="f-doc__section">
      <div className="dt-field__label">{label}</div>
      {hasContent ? (
        Array.isArray(children) ? (
          <ul className="f-doc__list">
            {children.map((item) => (
              <li key={item}>
                <Inline text={item} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="f-doc__text">
            <Inline text={children} />
          </div>
        )
      ) : (
        <div className="dt-cell-muted f-doc__text">{empty}</div>
      )}
    </div>
  )
}

const clean = (value) => (value && value.trim() !== '…' ? value : '')

function EditDocument({ doc, onSave, onClose }) {
  const [form, setForm] = useState({
    title: doc.title,
    problem: clean(doc.problem),
    solution: clean(doc.solution),
    inScope: clean(doc.inScope),
    outOfScope: clean(doc.outOfScope),
  })
  const [openPoints, setOpenPoints] = useState(doc.openPoints.join('\n'))
  const [error, setError] = useState('')
  const set = (key) => (value) => setForm((prev) => ({ ...prev, [key]: value }))

  async function submit() {
    try {
      await onSave({
        ...form,
        openPoints: openPoints.split('\n').map((line) => line.trim()).filter(Boolean),
      })
      onClose()
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <Modal
      wide
      kicker="Ideen-Dokument"
      title="Idee bearbeiten"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={onClose}>
            Abbrechen
          </button>
          <button type="button" className="dt-btn dt-btn--primary dt-btn--modal" onClick={submit}>
            Speichern
          </button>
        </>
      }
    >
      <div className="f-stack f-stack--tight">
        <ErrorNote>{error}</ErrorNote>
        <VoiceField label="Titel" value={form.title} onChange={set('title')} />
        <VoiceField label="Problem und Nutzen" rows={4} value={form.problem} onChange={set('problem')} />
        <VoiceField label="Lösungsidee" rows={4} value={form.solution} onChange={set('solution')} />
        <VoiceField label="Das gehört dazu" rows={3} value={form.inScope} onChange={set('inScope')} />
        <VoiceField label="Das gehört nicht dazu" rows={3} value={form.outOfScope} onChange={set('outOfScope')} />
        <VoiceField label="Offene Punkte (je Zeile einer)" rows={3} value={openPoints} onChange={setOpenPoints} />
      </div>
    </Modal>
  )
}

export default function IdeaWorkspacePage({ id }) {
  const { data: idea, error, reload } = useLive(`/api/ideas/${id}`, ['ideas'])
  const [editing, setEditing] = useState(false)
  const [confirm, setConfirm] = useState(null)
  const [actionError, setActionError] = useState('')
  const [showTechnical, setShowTechnical] = useState(false)

  if (!idea) {
    return (
      <>
        <Topbar kicker="Idee" title={id} back="#/ideen" />
        <div className="dt-content">
          <ErrorNote>{error}</ErrorNote>
        </div>
      </>
    )
  }

  const { doc } = idea
  const status = IDEA_STATUS[idea.state] ?? IDEA_STATUS.Draft
  const isDraft = idea.state === 'Draft'
  const missing = idea.readinessLabels.filter((item) => item.key !== 'approved' && !idea.readiness[item.key])
  const canApprove = isDraft && missing.length === 0 && !idea.busy

  async function perform(action) {
    setActionError('')
    try {
      await action()
      reload()
    } catch (err) {
      setActionError(err.message)
    }
  }

  async function startTransfer() {
    const { id: runId } = await api.post(`/api/ideas/${id}/transfer`)
    navigate(`#/umsetzung/${runId}`)
  }

  return (
    <>
      <Topbar kicker={`Idee ${idea.id}`} title={doc.title} back="#/ideen">
        <Badge tone={status.tone}>{status.label}</Badge>
        {isDraft && (
          <button
            type="button"
            className="dt-btn dt-btn--primary"
            disabled={!canApprove}
            title={canApprove ? undefined : 'Die Definition of Ready ist noch nicht erfüllt.'}
            onClick={() => setConfirm('approve')}
          >
            <Icon name="check" /> Idee freigeben
          </button>
        )}
        {idea.state === 'Ready' && (
          <>
            <button type="button" className="dt-btn dt-btn--secondary" onClick={() => perform(() => api.post(`/api/ideas/${id}/reopen`))}>
              Erneut öffnen
            </button>
            <button type="button" className="dt-btn dt-btn--primary" onClick={() => setConfirm('transfer')}>
              <Icon name="list" /> Anforderungen erstellen
            </button>
          </>
        )}
        {idea.state === 'Übernommen' && (
          <a className="dt-btn dt-btn--primary" href="#/anforderungen">
            Anforderungen ansehen
          </a>
        )}
      </Topbar>

      <div className="f-phaseband">
        <Stepper steps={phaseSteps(idea)} />
      </div>

      <div className="f-workspace">
        <Conversation
          session={idea}
          assistantName="Product Owner"
          readOnly={!isDraft}
          readOnlyHint={
            idea.state === 'Ready'
              ? 'Diese Idee ist freigegeben. Öffnen Sie sie erneut, um das Gespräch fortzusetzen.'
              : 'Diese Idee ist abgeschlossen und bleibt als Nachweis erhalten.'
          }
          placeholder="Antworten Sie dem Product Owner oder ergänzen Sie etwas"
          onSend={(text, answers) => api.post(`/api/ideas/${id}/message`, { text, answers }).then(reload)}
          onRetry={() => perform(() => api.post(`/api/ideas/${id}/retry`))}
        />

        <div className="f-workspace__side">
          <ErrorNote>{actionError}</ErrorNote>
          <section className="dt-card">
            <div className="dt-card__pad">
              <div className="f-card__head">
                <div>
                  <div className="dt-kicker">Definition of Ready</div>
                  <h3 className="f-h3">
                    <Heading>Reifegrad</Heading>
                  </h3>
                </div>
                <span className="f-score">
                  {idea.readyCount}/{idea.readyTotal}
                </span>
              </div>
              <ReadinessList labels={idea.readinessLabels} values={idea.readiness} />
              {isDraft && missing.length === 0 && !idea.busy && (
                <Note icon="check">Alle Punkte sind erfüllt. Bitte prüfen Sie das Dokument und geben Sie die Idee frei.</Note>
              )}
            </div>
          </section>

          <section className="dt-card">
            <div className="dt-card__pad">
              <div className="f-card__head">
                <div>
                  <div className="dt-kicker">Dokument</div>
                  <h3 className="f-h3">
                    <Heading>Stand der Idee</Heading>
                  </h3>
                </div>
                {isDraft && (
                  <button type="button" className="dt-iconbtn" disabled={idea.busy} onClick={() => setEditing(true)} aria-label="Idee bearbeiten" title="Idee bearbeiten">
                    <Icon name="pencil" />
                  </button>
                )}
              </div>
              <DocSection label="Problem und Nutzen">{clean(doc.problem)}</DocSection>
              <DocSection label="Lösungsidee">{clean(doc.solution)}</DocSection>
              <DocSection label="Das gehört dazu">{clean(doc.inScope)}</DocSection>
              <DocSection label="Das gehört nicht dazu">{clean(doc.outOfScope)}</DocSection>
              <DocSection label="Entscheidungen" empty="Noch keine Entscheidungen">
                {doc.decisions.filter((item) => item !== '…')}
              </DocSection>
              <DocSection label="Offene Punkte" empty="Keine offenen Punkte">
                {doc.openPoints}
              </DocSection>

              <button type="button" className="f-disclosure" onClick={() => setShowTechnical(!showTechnical)} aria-expanded={showTechnical}>
                <Icon name={showTechnical ? 'chevronDown' : 'chevronRight'} />
                Auswirkungen auf die Anwendung
              </button>
              {showTechnical && (
                <div className="f-technical">
                  <DocSection label="Anforderungen">{clean(doc.impactSpecs)}</DocSection>
                  <DocSection label="Gespeicherte Daten">{clean(doc.impactData)}</DocSection>
                  <DocSection label="Serverlogik">{clean(doc.impactBackend)}</DocSection>
                  <DocSection label="Programmcode">{clean(doc.impactCode)}</DocSection>
                </div>
              )}

              {doc.transfer.length > 0 && <DocSection label="Überführung">{doc.transfer}</DocSection>}

              {idea.state !== 'Übernommen' && (
                <div className="f-doc__footer">
                  <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" disabled={idea.busy} onClick={() => setConfirm('delete')}>
                    <Icon name="trash" /> Idee verwerfen
                  </button>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {editing && (
        <EditDocument doc={doc} onClose={() => setEditing(false)} onSave={(patch) => api.put(`/api/ideas/${id}/document`, patch).then(reload)} />
      )}
      {confirm === 'approve' && (
        <Confirm
          title="Idee freigeben"
          cta="Idee freigeben"
          onClose={() => setConfirm(null)}
          onConfirm={() => api.post(`/api/ideas/${id}/approve`).then(reload)}
        >
          Sie bestätigen die aktuelle Fassung von »{doc.title}« als final. Danach lässt sich daraus eine Liste von Anforderungen erstellen.
        </Confirm>
      )}
      {confirm === 'transfer' && (
        <Confirm
          title="Anforderungen erstellen"
          cta="Anforderungen erstellen"
          onClose={() => setConfirm(null)}
          onConfirm={startTransfer}
        >
          Die KI formuliert »{doc.title}« in einzelne, prüfbare Anforderungen aus. Das Ergebnis können Sie anschließend prüfen und ergänzen. Umgesetzt wird noch nichts.
        </Confirm>
      )}
      {confirm === 'delete' && (
        <Confirm
          title="Idee verwerfen"
          cta="Verwerfen"
          danger
          onClose={() => setConfirm(null)}
          onConfirm={async () => {
            await api.del(`/api/ideas/${id}`)
            navigate('#/ideen')
          }}
        >
          »{doc.title}« ({idea.id}) wird samt Gesprächsverlauf entfernt. Diese Aktion kann nicht rückgängig gemacht werden.
        </Confirm>
      )}
    </>
  )
}
