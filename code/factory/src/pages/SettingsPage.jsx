import { useState } from 'react'
import { Icon } from '../components/icons.jsx'
import { Card, ErrorNote, Note, Topbar } from '../components/ui.jsx'
import { api, useLive } from '../lib/api.js'
import {
  readVoicePrefs,
  saveVoicePrefs,
  speak,
  speechInputSupported,
  speechOutputSupported,
  stopSpeaking,
  useGermanVoices,
} from '../lib/voice.js'

function ModelSelect({ id, label, hint, value, models, onChange }) {
  return (
    <div className="dt-field--6">
      <label className="dt-field__label" htmlFor={id}>{label}</label>
      <select id={id} className="dt-select" value={value} onChange={(event) => onChange(event.target.value)}>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.label} ({model.detail})
          </option>
        ))}
      </select>
      <div className="dt-stat__sub">{hint}</div>
    </div>
  )
}

export default function SettingsPage({ system }) {
  const settings = useLive('/api/settings', ['settings'])
  const voices = useGermanVoices()
  const [prefs, setPrefs] = useState(readVoicePrefs)
  const [error, setError] = useState('')

  async function updateSettings(patch) {
    setError('')
    try {
      await api.put('/api/settings', patch)
      settings.reload()
    } catch (err) {
      setError(err.message)
    }
  }

  function updatePrefs(patch) {
    const next = { ...prefs, ...patch }
    setPrefs(next)
    saveVoicePrefs(next)
  }

  const data = settings.data

  return (
    <>
      <Topbar kicker="System" title="Einstellungen" />
      <div className="dt-content">
        <div className="f-stack">
          <ErrorNote>{error || settings.error}</ErrorNote>

          <Card title="Systemzustand" kicker="Betrieb">
            <ul className="f-checks">
              {(system.data?.checks ?? []).map((check) => (
                <li key={check.key}>
                  <span className={`f-appstatus__dot ${check.ok ? 'is-online' : 'is-offline'}`} />
                  <span className="dt-cell-strong">{check.label}</span>
                  <span className="dt-cell-muted">{check.detail}</span>
                </li>
              ))}
              {!system.data && <li className="dt-stat__sub">Wird geprüft …</li>}
            </ul>
          </Card>

          {data && (
            <Card title="KI-Qualität" kicker="Arbeitsweise">
              <div className="dt-form">
                <ModelSelect
                  id="dialog-model"
                  label="Gespräche und Prüfungen"
                  hint="Ideen-Dialog, Anforderungs-Assistent und Qualitätsprüfung. Kurze Antwortzeiten sind hier wichtig."
                  value={data.dialogModel}
                  models={data.models}
                  onChange={(dialogModel) => updateSettings({ dialogModel })}
                />
                <ModelSelect
                  id="build-model"
                  label="Ausformulierung und Umsetzung"
                  hint="Erstellt Anforderungen aus Ideen und setzt sie um. Gründlichkeit ist hier wichtig."
                  value={data.buildModel}
                  models={data.models}
                  onChange={(buildModel) => updateSettings({ buildModel })}
                />
              </div>
            </Card>
          )}

          <Card title="Sprache" kicker="Ein- und Ausgabe">
            {!speechInputSupported && (
              <Note>Dieser Browser unterstützt keine Spracheingabe. Bitte verwenden Sie Chrome oder Edge.</Note>
            )}
            <div className="dt-form">
              <div className="dt-field--6">
                <label className="dt-field__label" htmlFor="voice">Stimme des Assistenten</label>
                <select id="voice" className="dt-select" value={prefs.voiceName} disabled={!speechOutputSupported} onChange={(event) => updatePrefs({ voiceName: event.target.value })}>
                  <option value="">Automatisch die natürlichste Stimme</option>
                  {voices.map((voice) => (
                    <option key={voice.name} value={voice.name}>{voice.name}</option>
                  ))}
                </select>
              </div>
              <div className="dt-field--4">
                <label className="dt-field__label" htmlFor="rate">Sprechtempo</label>
                <select id="rate" className="dt-select" value={prefs.rate} disabled={!speechOutputSupported} onChange={(event) => updatePrefs({ rate: Number(event.target.value) })}>
                  <option value={0.9}>Ruhig</option>
                  <option value={1.05}>Normal</option>
                  <option value={1.2}>Zügig</option>
                </select>
              </div>
              <div className="dt-field--12">
                <button
                  type="button"
                  className="dt-btn dt-btn--secondary dt-btn--modal"
                  disabled={!speechOutputSupported}
                  onClick={() => {
                    stopSpeaking()
                    speak('Guten Tag. So klinge ich, wenn ich Ihnen im Gesprächsmodus antworte.')
                  }}
                >
                  <Icon name="speaker" /> Stimme testen
                </button>
              </div>
            </div>
            <div className="f-privacy">
              <Note>
                Die Spracheingabe nutzt die Spracherkennung Ihres Browsers. In Chrome und Edge wird das Gesprochene dafür an den Cloud-Dienst des Browser-Herstellers übertragen. Sprechen Sie deshalb keine vertraulichen Daten ein, wenn das in Ihrem Haus nicht freigegeben ist.
              </Note>
            </div>
          </Card>

          <Card title="Sicherheit" kicker="Grenzen der KI">
            <ul className="f-doc__list">
              <li>Die Software Factory ist nur auf diesem Rechner erreichbar und hat keine Anmeldung.</li>
              <li>In Gesprächen und Prüfungen darf die KI ausschließlich lesen.</li>
              <li>Bei der Überführung einer Idee darf die KI ausschließlich Anforderungen schreiben.</li>
              <li>Bei der Umsetzung darf die KI die Anwendung und ihre Anforderungen ändern, aber weder Versionen sichern noch ausliefern. Das übernimmt die Factory selbst und prüft vorher jede geänderte Datei.</li>
              <li>Andere angebundene Systeme des Anwenders stehen der KI hier nicht zur Verfügung.</li>
            </ul>
          </Card>
        </div>
      </div>
    </>
  )
}
