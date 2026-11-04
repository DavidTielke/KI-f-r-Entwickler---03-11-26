import { useState } from 'react'
import { api } from '../lib/api.js'
import { plural, storyCode } from '../lib/format.js'
import { navigate } from '../lib/router.js'
import { useSelection } from '../lib/selection.js'
import { ErrorNote, Modal } from './ui.jsx'

const STEPS = [
  'Die KI liest die Anforderungen und passt die Anwendung an.',
  'Die neue Version wird gebaut und geprüft. Fehler bessert die KI selbstständig nach.',
  'Der neue Stand wird als Version gesichert und ausgeliefert.',
  'Die Factory prüft, ob die Anwendung im Betrieb antwortet.',
]

export default function StartDeliveryModal({ stories, onClose }) {
  const selection = useSelection()
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function start() {
    setBusy(true)
    setError('')
    try {
      const { id } = await api.post('/api/runs', { storyIds: stories.map((story) => story.id) })
      selection.clear()
      navigate(`#/umsetzung/${id}`)
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal
      wide
      kicker="Umsetzung"
      title="Umsetzung beauftragen"
      onClose={onClose}
      footer={
        <>
          <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={onClose}>
            Abbrechen
          </button>
          <button type="button" className="dt-btn dt-btn--primary dt-btn--modal" onClick={start} disabled={busy}>
            Umsetzung starten
          </button>
        </>
      }
    >
      <div className="f-stack f-stack--tight">
        <ErrorNote>{error}</ErrorNote>
        <div className="dt-stat__sub f-modal__lead">
          {plural(stories.length, 'Anforderung wird', 'Anforderungen werden')} vollständig umgesetzt und ausgeliefert.
        </div>
        <ul className="f-picklist">
          {stories.map((story) => (
            <li key={story.id}>
              <span className="dt-cell-mono">{storyCode(story.id)}</span>
              <span className="dt-cell-strong">{story.title}</span>
            </li>
          ))}
        </ul>
        <div>
          <div className="dt-field__label">So läuft es ab</div>
          <ol className="f-steps">
            {STEPS.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
        </div>
      </div>
    </Modal>
  )
}
