import { useRef, useState } from 'react'
import { speechInputSupported, useSpeechInput } from '../lib/voice.js'
import { setVoiceModeFlag } from './Conversation.jsx'
import { Icon } from './icons.jsx'
import { Modal } from './ui.jsx'

// Einstieg in ein Gespräch: Der Anlass lässt sich einsprechen oder eintippen.
// Wer einspricht, führt das Gespräch danach automatisch per Stimme fort.
export default function IntakeModal({ title, kicker, label, placeholder, cta, onSubmit, onClose }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [usedVoice, setUsedVoice] = useState(false)
  const latest = useRef(text)
  latest.current = text

  const speech = useSpeechInput({
    onFinal: (value) => setText(latest.current ? `${latest.current.trimEnd()} ${value}` : value),
  })

  function toggleMic() {
    if (speech.listening) {
      speech.stop()
    } else {
      setUsedVoice(true)
      speech.start()
    }
  }

  async function submit(event) {
    event.preventDefault()
    if (!text.trim()) {
      setError('Bitte beschreiben Sie Ihr Anliegen.')
      return
    }
    setBusy(true)
    setError('')
    speech.stop(true)
    setVoiceModeFlag(usedVoice)
    try {
      await onSubmit(text.trim())
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <Modal
      title={title}
      kicker={kicker}
      onClose={onClose}
      footer={
        <>
          <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={onClose}>
            Abbrechen
          </button>
          <button type="submit" form="intake-form" className="dt-btn dt-btn--primary dt-btn--modal" disabled={busy}>
            {cta}
          </button>
        </>
      }
    >
      <form id="intake-form" onSubmit={submit}>
        {speechInputSupported && (
          <div className={`f-intake__mic ${speech.listening ? 'is-listening' : ''}`}>
            <button
              type="button"
              className={`f-mic__btn f-mic__btn--large ${speech.listening ? 'is-listening' : ''}`}
              onClick={toggleMic}
              aria-pressed={speech.listening}
              aria-label={speech.listening ? 'Aufnahme beenden' : 'Aufnahme starten'}
            >
              <Icon name={speech.listening ? 'stop' : 'mic'} size={24} />
            </button>
            <div>
              <div className="dt-cell-strong">{speech.listening ? 'Ich höre Ihnen zu' : 'Einsprechen'}</div>
              <div className="dt-stat__sub f-intake__hint">
                {speech.listening
                  ? speech.interim || 'Sprechen Sie frei. Der Text erscheint unten im Feld.'
                  : 'Erzählen Sie in eigenen Worten. Das Gespräch läuft danach ebenfalls per Stimme weiter.'}
              </div>
            </div>
          </div>
        )}
        {speech.error && <div className="dt-field__error f-intake__error">{speech.error}</div>}
        <label className="dt-field__label" htmlFor="intake-text">
          {label}
        </label>
        <textarea
          id="intake-text"
          className={`dt-input f-intake__text ${error ? 'is-error' : ''}`}
          rows={7}
          autoFocus={!speechInputSupported}
          placeholder={placeholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        {error && <div className="dt-field__error">{error}</div>}
      </form>
    </Modal>
  )
}
