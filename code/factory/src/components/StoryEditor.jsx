import { useMemo, useState } from 'react'
import { api } from '../lib/api.js'
import { Icon } from './icons.jsx'
import QualityResult, { applyFinding } from './QualityCheck.jsx'
import { ErrorNote, MicButton, Modal, Note, VoiceField } from './ui.jsx'

const NEW = '__new__'

function CriteriaEditor({ criteria, onChange }) {
  function setItem(g, i, value) {
    onChange(criteria.map((group, gi) => (gi === g ? { ...group, items: group.items.map((item, ii) => (ii === i ? value : item)) } : group)))
  }
  function removeItem(g, i) {
    onChange(criteria.map((group, gi) => (gi === g ? { ...group, items: group.items.filter((_, ii) => ii !== i) } : group)))
  }
  function addItem(g, value = '') {
    onChange(criteria.map((group, gi) => (gi === g ? { ...group, items: [...group.items, value] } : group)))
  }
  return (
    <div className="f-criteria-editor">
      {criteria.map((group, g) => (
        <div key={g} className="f-criteria-editor__group">
          {group.heading !== null && group.heading !== undefined && (
            <input
              className="dt-input f-criteria-editor__heading"
              value={group.heading}
              placeholder="Thema"
              aria-label="Thema der Kriterien"
              onChange={(event) => onChange(criteria.map((item, gi) => (gi === g ? { ...item, heading: event.target.value } : item)))}
            />
          )}
          {group.items.map((item, i) => (
            <div key={i} className="f-criteria-editor__row">
              <input
                className="dt-input"
                value={item}
                placeholder="Eine prüfbare Aussage, zum Beispiel: Das Feld Name ist ein Pflichtfeld."
                aria-label={`Abnahmekriterium ${i + 1}`}
                onChange={(event) => setItem(g, i, event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addItem(g)
                  }
                }}
              />
              <MicButton onText={(text) => setItem(g, i, `${item} ${text}`.trim())} />
              <button type="button" className="dt-iconbtn dt-iconbtn--danger" onClick={() => removeItem(g, i)} aria-label="Kriterium entfernen">
                <Icon name="close" />
              </button>
            </div>
          ))}
          <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal f-criteria-editor__add" onClick={() => addItem(g)}>
            <Icon name="plus" /> Kriterium hinzufügen
          </button>
        </div>
      ))}
    </div>
  )
}

// Vollständig manuelles Erfassen und Bearbeiten einer Anforderung.
// Jedes Textfeld lässt sich zusätzlich diktieren.
// Mit onSave speichert das Formular nicht direkt, sondern übergibt die Eingaben
// (Entwürfe des Assistenten).
export default function StoryEditor({ story, tree, defaults, showPlacement, onClose, onSaved, onSave, onUseAssistant }) {
  const isEdit = Boolean(story)
  const withPlacement = !isEdit || Boolean(showPlacement)
  const epics = useMemo(() => tree.filter((epic) => !epic.isTool), [tree])
  const [title, setTitle] = useState(story?.title ?? '')
  const [userStory, setUserStory] = useState(story?.userStory ?? '')
  const [description, setDescription] = useState(story?.description ?? '')
  const [criteria, setCriteria] = useState(() =>
    story?.criteria?.length ? structuredClone(story.criteria) : [{ heading: null, items: [''] }],
  )
  // Das Werkzeug-Thema steht hier nicht zur Wahl und wird deshalb nicht vorbelegt.
  const defaultEpic = epics.some((epic) => epic.number === defaults?.epicNumber) ? defaults.epicNumber : null
  const [epicChoice, setEpicChoice] = useState(() => {
    if (defaultEpic) return String(defaultEpic)
    return defaults?.epicName ? NEW : String(epics[0]?.number ?? NEW)
  })
  const [epicName, setEpicName] = useState(defaultEpic ? '' : (defaults?.epicName ?? ''))
  const [featureChoice, setFeatureChoice] = useState(defaultEpic && defaults?.featureNumber ? String(defaults.featureNumber) : NEW)
  const [featureName, setFeatureName] = useState(defaults?.featureNumber ? '' : (defaults?.featureName ?? ''))
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [checking, setChecking] = useState(false)
  const [quality, setQuality] = useState(null)

  const features = epics.find((epic) => String(epic.number) === epicChoice)?.features ?? []

  const placement = () => {
    const epic = epics.find((candidate) => String(candidate.number) === epicChoice)
    const feature = epic?.features.find((candidate) => String(candidate.number) === featureChoice)
    return {
      epicNumber: epic?.number ?? null,
      epicName: epic?.name ?? epicName,
      featureNumber: feature?.number ?? null,
      featureName: feature?.name ?? featureName,
    }
  }

  const payload = () => ({
    title,
    userStory,
    description,
    criteria,
    ...(withPlacement ? { placement: placement() } : {}),
  })

  async function save() {
    setBusy(true)
    setError('')
    try {
      if (onSave) {
        await onSave(payload())
        return
      }
      const result = isEdit
        ? await api.put(`/api/requirements/${story.id}`, payload())
        : await api.post('/api/requirements', payload())
      onSaved(result)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  async function check() {
    setChecking(true)
    setError('')
    setQuality(null)
    try {
      setQuality(await api.post('/api/requirements/check', payload()))
    } catch (err) {
      setError(err.message)
    } finally {
      setChecking(false)
    }
  }

  return (
    <Modal
      wide
      kicker={isEdit ? `${onSave ? 'Entwurf' : 'Anforderung'} ${story.id.replaceAll('-', ' · ')}` : 'Neue Anforderung'}
      title={onSave ? 'Entwurf bearbeiten' : isEdit ? 'Anforderung bearbeiten' : 'Anforderung formulieren'}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={onClose}>
            Abbrechen
          </button>
          <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={check} disabled={checking}>
            <Icon name="quality" /> {checking ? 'Prüfung läuft …' : 'Qualität prüfen'}
          </button>
          <button type="button" className="dt-btn dt-btn--primary dt-btn--modal" onClick={save} disabled={busy}>
            {isEdit || onSave ? 'Speichern' : 'Anlegen'}
          </button>
        </>
      }
    >
      <div className="f-stack f-stack--tight">
        <ErrorNote>{error}</ErrorNote>
        {isEdit && story.state === 'Implemented' && (
          <Note>Diese Anforderung ist umgesetzt. Sobald Sie den Inhalt ändern, gilt sie wieder als offen und muss erneut umgesetzt werden.</Note>
        )}
        {onUseAssistant && (
          <button type="button" className="f-switch" onClick={onUseAssistant}>
            <Icon name="mic" /> Lieber im Gespräch mit dem KI-Assistenten entwickeln
          </button>
        )}

        {withPlacement && (
          <div className="dt-form">
            <div className="dt-field--6">
              <label className="dt-field__label" htmlFor="story-epic">Themenbereich</label>
              <select
                id="story-epic"
                className="dt-select"
                value={epicChoice}
                onChange={(event) => {
                  setEpicChoice(event.target.value)
                  setFeatureChoice(NEW)
                }}
              >
                {epics.map((epic) => (
                  <option key={epic.number} value={epic.number}>{epic.name}</option>
                ))}
                <option value={NEW}>Neuer Themenbereich …</option>
              </select>
              {epicChoice === NEW && (
                <input
                  className="dt-input f-field__extra"
                  placeholder="Name des Themenbereichs"
                  aria-label="Name des neuen Themenbereichs"
                  value={epicName}
                  onChange={(event) => setEpicName(event.target.value)}
                />
              )}
            </div>
            <div className="dt-field--6">
              <label className="dt-field__label" htmlFor="story-feature">Funktion</label>
              <select id="story-feature" className="dt-select" value={featureChoice} onChange={(event) => setFeatureChoice(event.target.value)}>
                {features.map((feature) => (
                  <option key={feature.number} value={feature.number}>{feature.name}</option>
                ))}
                <option value={NEW}>Neue Funktion …</option>
              </select>
              {featureChoice === NEW && (
                <input
                  className="dt-input f-field__extra"
                  placeholder="Name der Funktion"
                  aria-label="Name der neuen Funktion"
                  value={featureName}
                  onChange={(event) => setFeatureName(event.target.value)}
                />
              )}
            </div>
          </div>
        )}

        <VoiceField label="Titel" value={title} onChange={setTitle} placeholder="Kurz und aussagekräftig" autoFocus />
        <VoiceField
          label="Nutzen"
          rows={2}
          value={userStory}
          onChange={setUserStory}
          placeholder="Als … möchte ich …, damit …"
        />
        <VoiceField label="Beschreibung" rows={3} value={description} onChange={setDescription} placeholder="Was soll die Anwendung fachlich tun?" />
        <div>
          <div className="dt-field__label">Abnahmekriterien</div>
          <CriteriaEditor criteria={criteria} onChange={setCriteria} />
        </div>
        <QualityResult
          result={quality}
          onApply={(finding) => {
            setCriteria(applyFinding(criteria, finding))
            setQuality({ ...quality, findings: quality.findings.filter((item) => item !== finding) })
          }}
        />
      </div>
    </Modal>
  )
}
