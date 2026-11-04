import { useEffect, useRef, useState } from 'react'
import { useSpeechInput } from '../lib/voice.js'
import { Icon } from './icons.jsx'

export function Heading({ children }) {
  return (
    <>
      {children}
      <span className="dt-dot">.</span>
    </>
  )
}

export function Topbar({ kicker, title, back, children }) {
  return (
    <header className="dt-topbar">
      {back && (
        <a className="dt-iconbtn" href={back} aria-label="Zurück">
          <Icon name="chevronLeft" />
        </a>
      )}
      <div className="f-topbar__titles">
        <div className="dt-kicker">{kicker}</div>
        <h1 className="dt-topbar__title f-topbar__title">
          <Heading>{title}</Heading>
        </h1>
      </div>
      <div className="f-topbar__actions">{children}</div>
    </header>
  )
}

export function Card({ title, kicker, actions, children, large, className = '' }) {
  return (
    <section className={`dt-card ${large ? 'dt-card--lg' : ''} ${className}`}>
      <div className="dt-card__pad">
        {(title || actions) && (
          <div className="f-card__head">
            <div>
              {kicker && <div className="dt-kicker">{kicker}</div>}
              {title && (
                <h3 className="f-h3">
                  <Heading>{title}</Heading>
                </h3>
              )}
            </div>
            {actions && <div className="f-card__actions">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    </section>
  )
}

export function Badge({ tone = 'neutral', children }) {
  if (tone === 'error') return <span className="dt-badge f-badge--error">{children}</span>
  return <span className={`dt-badge dt-badge--${tone}`}>{children}</span>
}

export function ErrorNote({ children, action }) {
  if (!children) return null
  return (
    <div className="f-note f-note--error" role="alert">
      <Icon name="alert" />
      <div className="f-note__text">{children}</div>
      {action}
    </div>
  )
}

export function Note({ children, icon = 'alert' }) {
  return (
    <div className="f-note">
      <Icon name={icon} />
      <div className="f-note__text">{children}</div>
    </div>
  )
}

export function Empty({ title, hint, children }) {
  return (
    <div className="dt-empty">
      <div className="dt-empty__title">
        <Heading>{title}</Heading>
      </div>
      {hint && <div className="dt-empty__hint">{hint}</div>}
      {children && <div className="f-empty__actions">{children}</div>}
    </div>
  )
}

export function Working({ children }) {
  return (
    <span className="f-working">
      <span className="f-working__dot" aria-hidden="true" />
      {children}
    </span>
  )
}

export function Modal({ title, kicker, onClose, children, footer, wide }) {
  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="dt-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className={`dt-modal ${wide ? 'f-modal--wide' : ''}`} role="dialog" aria-modal="true" aria-label={title}>
        <div className="dt-modal__head">
          <div>
            {kicker && <div className="dt-kicker">{kicker}</div>}
            <div className="dt-modal__title">
              <Heading>{title}</Heading>
            </div>
          </div>
          <button type="button" className="dt-modal__close" onClick={onClose} aria-label="Schließen">
            <Icon name="close" />
          </button>
        </div>
        <div className="dt-modal__body">{children}</div>
        {footer && <div className="dt-modal__foot">{footer}</div>}
      </div>
    </div>
  )
}

export function Confirm({ title, children, cta, danger, onConfirm, onClose }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function submit() {
    setBusy(true)
    setError('')
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message)
      setBusy(false)
    }
  }

  return (
    <div
      className="dt-backdrop dt-backdrop--center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dt-modal dt-modal--sm" role="dialog" aria-modal="true" aria-label={title}>
        {danger && (
          <div className="dt-danger-tile">
            <Icon name={danger === true ? 'trash' : danger} size={24} />
          </div>
        )}
        <div className="dt-modal__title">
          <Heading>{title}</Heading>
        </div>
        <div className="dt-stat__sub f-confirm__text">{children}</div>
        {error && <div className="dt-field__error">{error}</div>}
        <div className="f-confirm__actions">
          <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={onClose}>
            Abbrechen
          </button>
          <button
            type="button"
            className={`dt-btn ${danger ? 'dt-btn--danger' : 'dt-btn--primary'} dt-btn--modal`}
            onClick={submit}
            disabled={busy}
          >
            {cta}
          </button>
        </div>
      </div>
    </div>
  )
}

// Text mit `Feldnamen` und **Hervorhebung**
export function Inline({ text }) {
  const parts = String(text ?? '').split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
  return parts.map((part, index) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 1) {
      return (
        <code key={index} className="f-code">
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith('**') && part.endsWith('**') && part.length > 3) {
      return <strong key={index}>{part.slice(2, -2)}</strong>
    }
    return <span key={index}>{part}</span>
  })
}

// Kleiner Darstellungsbaustein für die Unterlagen der Themenbereiche.
export function Markdown({ text }) {
  const blocks = []
  const lines = String(text ?? '').split('\n')
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (!line.trim()) continue
    if (line.startsWith('```')) {
      const code = []
      i++
      while (i < lines.length && !lines[i].startsWith('```')) code.push(lines[i++])
      blocks.push(<pre key={i} className="f-pre">{code.join('\n')}</pre>)
    } else if (line.startsWith('#')) {
      const level = line.match(/^#+/)[0].length
      const content = line.replace(/^#+\s*/, '')
      blocks.push(
        level <= 1 ? null : (
          <div key={i} className={level === 2 ? 'f-md__h2' : 'f-md__h3'}>
            <Inline text={content} />
          </div>
        ),
      )
    } else if (line.startsWith('|')) {
      const rows = []
      while (i < lines.length && lines[i].startsWith('|')) rows.push(lines[i++])
      i--
      const cells = (row) => row.split('|').slice(1, -1).map((cell) => cell.trim())
      blocks.push(
        <div key={i} className="f-md__table">
          <table className="dt-table">
            <thead>
              <tr>
                {cells(rows[0]).map((cell, c) => (
                  <th key={c}>
                    <Inline text={cell} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(2).map((row, r) => (
                <tr key={r}>
                  {cells(row).map((cell, c) => (
                    <td key={c}>
                      <Inline text={cell} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      )
    } else if (/^\s*- /.test(line)) {
      const items = []
      while (i < lines.length && /^\s*- /.test(lines[i])) items.push(lines[i++])
      i--
      blocks.push(
        <ul key={i} className="f-md__list">
          {items.map((item, n) => (
            <li key={n} style={{ marginLeft: item.match(/^\s*/)[0].length * 6 }}>
              <Inline text={item.replace(/^\s*- /, '')} />
            </li>
          ))}
        </ul>,
      )
    } else {
      blocks.push(
        <p key={i} className="f-md__p">
          <Inline text={line} />
        </p>,
      )
    }
  }
  return <div className="f-md">{blocks}</div>
}

// Mikrofon-Schaltfläche, die gesprochenen Text an ein Feld anhängt.
export function MicButton({ onText, label = 'Diktieren', large = false, onUsed }) {
  const speech = useSpeechInput({ onFinal: onText })
  if (!speech.supported) return null
  return (
    <span className="f-mic">
      <button
        type="button"
        className={`f-mic__btn ${speech.listening ? 'is-listening' : ''} ${large ? 'f-mic__btn--large' : ''}`}
        onClick={() => {
          if (speech.listening) speech.stop()
          else {
            onUsed?.()
            speech.start()
          }
        }}
        aria-pressed={speech.listening}
        aria-label={speech.listening ? 'Diktat beenden' : label}
        title={speech.listening ? 'Diktat beenden' : label}
      >
        <Icon name={speech.listening ? 'stop' : 'mic'} size={large ? 24 : 16} />
      </button>
      {speech.listening && speech.interim && <span className="f-mic__interim">{speech.interim}</span>}
      {speech.error && <span className="dt-field__error">{speech.error}</span>}
    </span>
  )
}

const appendText = (current, addition) => (current ? `${current.replace(/\s+$/, '')} ${addition}` : addition)

// Eingabefeld mit Diktierfunktion: Jeder Text lässt sich auch einsprechen.
export function VoiceField({ label, value, onChange, rows = 0, placeholder, autoFocus, error, hint }) {
  const ref = useRef(null)
  const latest = useRef(value)
  latest.current = value
  const common = {
    ref,
    className: `dt-input f-voicefield__input ${error ? 'is-error' : ''}`,
    value,
    placeholder,
    autoFocus,
    onChange: (event) => onChange(event.target.value),
  }
  return (
    <div className="f-voicefield">
      {label && <label className="dt-field__label">{label}</label>}
      <div className="f-voicefield__row">
        {rows > 0 ? <textarea rows={rows} {...common} /> : <input type="text" {...common} />}
        <MicButton onText={(text) => onChange(appendText(latest.current, text))} />
      </div>
      {hint && <div className="dt-stat__sub">{hint}</div>}
      {error && <div className="dt-field__error">{error}</div>}
    </div>
  )
}

export function Checkbox({ checked, disabled, onChange, label }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`dt-check f-check ${checked ? 'is-checked' : ''}`}
      onClick={(event) => {
        event.stopPropagation()
        onChange(!checked)
      }}
    >
      {checked && <Icon name="check" size={13} strokeWidth={3} />}
    </button>
  )
}

// Fortschritt in Stufen, wahlweise für Ideen und für Aufträge.
export function Stepper({ steps }) {
  return (
    <ol className="f-stepper">
      {steps.map((step, index) => (
        <li key={step.key} className={`f-stepper__item is-${step.status}`}>
          <span className="f-stepper__mark">
            {step.status === 'done' ? (
              <Icon name="check" size={13} strokeWidth={3} />
            ) : step.status === 'failed' ? (
              <Icon name="close" size={13} strokeWidth={3} />
            ) : (
              index + 1
            )}
          </span>
          <span className="f-stepper__label">{step.label}</span>
        </li>
      ))}
    </ol>
  )
}

export function ReadinessList({ labels, values }) {
  return (
    <ul className="f-ready">
      {labels.map((item) => {
        const ok = Boolean(values?.[item.key])
        return (
          <li key={item.key} className={ok ? 'is-ok' : ''}>
            <span className="f-ready__mark">{ok && <Icon name="check" size={12} strokeWidth={3} />}</span>
            {item.label}
          </li>
        )
      })}
    </ul>
  )
}
