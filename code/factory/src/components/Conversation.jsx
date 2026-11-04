import { useCallback, useEffect, useRef, useState } from 'react'
import { formatTime } from '../lib/format.js'
import {
  matchSpokenOptions,
  questionForSpeech,
  speak,
  speechInputSupported,
  speechOutputSupported,
  spokenAddition,
  stopSpeaking,
  useSpeechInput,
} from '../lib/voice.js'
import { Icon } from './icons.jsx'
import { ErrorNote, Heading, MicButton, Working } from './ui.jsx'

// Einmalige Übergabe: Wer eine Idee einspricht, spricht im Gespräch direkt weiter.
// Beim Neuladen oder späteren Öffnen bleibt das Mikrofon dagegen aus, bis es
// ausdrücklich eingeschaltet wird.
const VOICE_FLAG = 'software-factory.voice-mode'

export function setVoiceModeFlag(on) {
  try {
    sessionStorage.setItem(VOICE_FLAG, on ? '1' : '0')
  } catch {
    // Ohne Speicher startet der Gesprächsmodus manuell.
  }
}

function readVoiceModeFlag() {
  try {
    return sessionStorage.getItem(VOICE_FLAG) === '1'
  } catch {
    return false
  }
}

function clearVoiceModeFlag() {
  try {
    sessionStorage.removeItem(VOICE_FLAG)
  } catch {
    // Dann gibt es auch nichts zu entfernen.
  }
}

const emptyAnswers = (questions) => questions.map(() => ({ selected: [], custom: '' }))

function answerText(question, answer) {
  const labels = answer.selected.map((index) => question.options[index]?.label).filter(Boolean)
  return [labels.join(', '), answer.custom.trim()].filter(Boolean).join(' – ')
}

function composeAnswers(questions, answers) {
  const items = questions.map((question, index) => ({
    header: question.header,
    question: question.question,
    answer: answerText(question, answers[index]),
  }))
  const text = items.map((item) => `Frage: ${item.question}\nAntwort: ${item.answer}`).join('\n\n')
  return { items, text }
}

function Message({ message, assistantName }) {
  const isUser = message.role === 'user'
  return (
    <article className={`f-msg ${isUser ? 'f-msg--user' : 'f-msg--assistant'}`}>
      <div className="f-msg__meta">
        <span>{isUser ? 'Sie' : assistantName}</span>
        <span className="dt-cell-mono f-msg__time">{formatTime(message.at)}</span>
        {!isUser && speechOutputSupported && (
          <button type="button" className="f-msg__speak" onClick={() => speak(message.text)} aria-label="Vorlesen" title="Vorlesen">
            <Icon name="speaker" size={14} />
          </button>
        )}
      </div>
      {message.answers?.length ? (
        <dl className="f-msg__answers">
          {message.answers.map((item) => (
            <div key={item.question}>
              <dt>{item.question}</dt>
              <dd>{item.answer}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="f-msg__text">{message.text}</p>
      )}
    </article>
  )
}

// Rückfragen im Assistenten-Modus: immer nur eine Frage, mit Antwortoptionen.
function QuestionWizard({ questions, index, answers, onChange, onBack, onNext, disabled }) {
  const question = questions[index]
  const answer = answers[index]
  const canContinue = answer.selected.length > 0 || answer.custom.trim().length > 0
  const isLast = index === questions.length - 1

  function toggle(optionIndex) {
    const selected = question.multiSelect
      ? answer.selected.includes(optionIndex)
        ? answer.selected.filter((value) => value !== optionIndex)
        : [...answer.selected, optionIndex]
      : [optionIndex]
    onChange(index, { ...answer, selected })
  }

  return (
    <section className="f-wizard" aria-label="Rückfrage">
      <div className="f-wizard__head">
        <span className="dt-kicker">{question.header}</span>
        {questions.length > 1 && (
          <span className="dt-cell-mono">
            {index + 1}/{questions.length}
          </span>
        )}
      </div>
      <div className="f-wizard__question">{question.question}</div>
      <div className="f-options">
        {question.options.map((option, optionIndex) => {
          const selected = answer.selected.includes(optionIndex)
          return (
            <button
              key={option.label}
              type="button"
              disabled={disabled}
              className={`f-option ${selected ? 'is-selected' : ''}`}
              onClick={() => toggle(optionIndex)}
              aria-pressed={selected}
            >
              <span className="f-option__mark">{selected ? <Icon name="check" size={12} strokeWidth={3} /> : optionIndex + 1}</span>
              <span className="f-option__body">
                <span className="f-option__label">
                  {option.label}
                  {option.recommended && <span className="dt-badge dt-badge--green f-option__badge">Empfehlung</span>}
                </span>
                <span className="f-option__description">{option.description}</span>
              </span>
            </button>
          )
        })}
      </div>
      <div className="f-wizard__custom">
        <input
          className="dt-input"
          placeholder="Eigene Antwort oder Ergänzung"
          value={answer.custom}
          disabled={disabled}
          onChange={(event) => onChange(index, { ...answer, custom: event.target.value })}
        />
        <MicButton onText={(text) => onChange(index, { ...answer, custom: `${answer.custom} ${text}`.trim() })} />
      </div>
      <div className="f-wizard__actions">
        {index > 0 && (
          <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={onBack} disabled={disabled}>
            Zurückgehen
          </button>
        )}
        <button type="button" className="dt-btn dt-btn--primary dt-btn--modal" onClick={onNext} disabled={!canContinue || disabled}>
          {isLast ? 'Antworten senden' : 'Weiter'}
        </button>
      </div>
    </section>
  )
}

export default function Conversation({ session, assistantName, readOnly, readOnlyHint, onSend, onRetry, placeholder }) {
  const { messages = [], pendingQuestions = [], busy, activity = [], error } = session
  const [text, setText] = useState('')
  const [sendError, setSendError] = useState('')
  const [sending, setSending] = useState(false)
  const [qIndex, setQIndex] = useState(0)
  const [answers, setAnswers] = useState(() => emptyAnswers(pendingQuestions))
  const [voiceMode, setVoiceMode] = useState(() => readVoiceModeFlag() && speechInputSupported && !readOnly)
  const [voiceState, setVoiceState] = useState('idle')

  const scroller = useRef(null)
  const spokenUpTo = useRef(messages.length - 1)
  const voiceRef = useRef(voiceMode)
  voiceRef.current = voiceMode
  const stateRef = useRef({})
  const hasQuestions = pendingQuestions.length > 0 && !busy && !readOnly

  // Neue Rückfragen starten immer bei der ersten Frage.
  const questionKey = `${messages.length}:${pendingQuestions.length}`
  const lastKey = useRef(questionKey)
  if (lastKey.current !== questionKey) {
    lastKey.current = questionKey
    setQIndex(0)
    setAnswers(emptyAnswers(pendingQuestions))
  }

  useEffect(() => {
    const element = scroller.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages.length, busy, activity.length, qIndex, hasQuestions])

  const send = useCallback(
    async (messageText, messageAnswers) => {
      setSending(true)
      setSendError('')
      try {
        await onSend(messageText, messageAnswers)
        return true
      } catch (err) {
        setSendError(err.message)
        return false
      } finally {
        setSending(false)
      }
    },
    [onSend],
  )

  async function submitText(event) {
    event?.preventDefault()
    const value = text.trim()
    if (!value || busy || sending) return
    if (await send(value)) setText('')
  }

  function submitAnswers(finalAnswers = answers) {
    const { items, text: composed } = composeAnswers(pendingQuestions, finalAnswers)
    return send(composed, items)
  }

  function nextQuestion() {
    if (qIndex < pendingQuestions.length - 1) setQIndex(qIndex + 1)
    else submitAnswers()
  }

  // -------------------------------------------------------------------------
  // Gesprächsmodus: vorlesen, zuhören, antworten
  // -------------------------------------------------------------------------
  const conversation = useSpeechInput({
    onUtterance: (spoken) => stateRef.current.handleUtterance(spoken),
  })

  const listen = useCallback(() => {
    if (!voiceRef.current) return
    setVoiceState('listening')
    conversation.start()
  }, [conversation.start])

  const speakThenListen = useCallback(
    (value) => {
      if (!voiceRef.current) return
      setVoiceState('speaking')
      speak(value, { onEnd: () => setTimeout(listen, 200) })
    },
    [listen],
  )

  stateRef.current.handleUtterance = async (spoken) => {
    if (!voiceRef.current) return
    if (/^(stopp|stop|beenden|gesprächsmodus beenden)\W*$/i.test(spoken.trim())) {
      toggleVoiceMode(false)
      return
    }
    if (hasQuestions) {
      const question = pendingQuestions[qIndex]
      const hits = matchSpokenOptions(spoken, question.options, question.multiSelect)
      const answer = {
        selected: question.multiSelect ? hits : hits.slice(0, 1),
        custom: hits.length === 0 ? spoken : spokenAddition(spoken, question.options),
      }
      const nextAnswers = answers.map((item, index) => (index === qIndex ? answer : item))
      setAnswers(nextAnswers)
      if (qIndex < pendingQuestions.length - 1) {
        setQIndex(qIndex + 1)
        speakThenListen(questionForSpeech(pendingQuestions[qIndex + 1], qIndex + 2, pendingQuestions.length))
      } else {
        setVoiceState('thinking')
        if (!(await submitAnswers(nextAnswers))) listen()
      }
      return
    }
    setVoiceState('thinking')
    if (!(await send(spoken))) listen()
  }

  function toggleVoiceMode(on) {
    setVoiceMode(on)
    voiceRef.current = on
    if (on) {
      // Die letzte Antwort wird beim Einschalten noch einmal vorgelesen.
      spokenUpTo.current = Math.min(spokenUpTo.current, messages.length - 2)
      setVoiceState('thinking')
    } else {
      stopSpeaking()
      conversation.stop(true)
      setVoiceState('idle')
    }
  }

  // Sobald eine neue Antwort vorliegt, liest der Gesprächsmodus sie vor.
  useEffect(() => {
    if (!voiceMode || readOnly) return
    if (busy) {
      // Solange die KI arbeitet, bleibt das Mikrofon aus.
      conversation.stop(true)
      setVoiceState('thinking')
      return
    }
    const lastIndex = messages.length - 1
    const last = messages[lastIndex]
    if (error) {
      speakThenListen(error)
    } else if (last?.role === 'assistant' && spokenUpTo.current < lastIndex) {
      spokenUpTo.current = lastIndex
      const question = pendingQuestions[0]
      const spoken = question
        ? `${last.text} ${questionForSpeech(question, 1, pendingQuestions.length)}`
        : last.text
      speakThenListen(spoken)
    } else if (voiceState === 'thinking' || voiceState === 'idle') {
      listen()
    }
    // voiceState darf diesen Ablauf nicht erneut auslösen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [voiceMode, busy, messages.length, readOnly])

  useEffect(() => {
    clearVoiceModeFlag()
    return () => stopSpeaking()
  }, [])

  const inputBlocked = busy || sending || readOnly

  return (
    <section className="f-chat dt-card">
      <div className="f-chat__head">
        <div>
          <div className="dt-kicker">Dialog</div>
          <h3 className="f-h3">
            <Heading>{assistantName}</Heading>
          </h3>
        </div>
        {!readOnly && speechInputSupported && (
          <button
            type="button"
            className={`dt-btn dt-btn--modal ${voiceMode ? 'dt-btn--primary' : 'dt-btn--secondary'}`}
            onClick={() => toggleVoiceMode(!voiceMode)}
            aria-pressed={voiceMode}
          >
            <Icon name={voiceMode ? 'micOff' : 'mic'} />
            {voiceMode ? 'Gesprächsmodus beenden' : 'Gesprächsmodus starten'}
          </button>
        )}
      </div>

      <div className="f-chat__scroll" ref={scroller}>
        {messages.length === 0 && <div className="f-chat__empty">Noch kein Gesprächsverlauf.</div>}
        {messages.map((message, index) => (
          <Message key={index} message={message} assistantName={assistantName} />
        ))}

        {busy && (
          <div className="f-thinking">
            <Working>{assistantName} arbeitet</Working>
            {activity.length > 0 && (
              <ul className="f-thinking__steps">
                {activity.slice(-4).map((step, index) => (
                  <li key={index}>{step.text}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {hasQuestions && answers[qIndex] && (
          <QuestionWizard
            questions={pendingQuestions}
            index={qIndex}
            answers={answers}
            disabled={sending}
            onChange={(index, value) => setAnswers(answers.map((item, i) => (i === index ? value : item)))}
            onBack={() => setQIndex(qIndex - 1)}
            onNext={nextQuestion}
          />
        )}

        {error && !busy && (
          <ErrorNote
            action={
              onRetry && (
                <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={onRetry}>
                  <Icon name="refresh" /> Erneut versuchen
                </button>
              )
            }
          >
            {error}
          </ErrorNote>
        )}
      </div>

      {voiceMode && (
        <div className={`f-voiceband is-${voiceState}`}>
          <span className="f-voiceband__indicator" aria-hidden="true" />
          <div className="f-voiceband__text">
            {voiceState === 'listening' && (conversation.interim || 'Ich höre Ihnen zu. Eine kurze Pause beendet Ihren Beitrag.')}
            {voiceState === 'speaking' && `${assistantName} spricht`}
            {voiceState === 'thinking' && `${assistantName} denkt nach`}
            {voiceState === 'idle' && 'Bereit'}
          </div>
          {voiceState === 'speaking' && (
            <button
              type="button"
              className="dt-btn dt-btn--secondary dt-btn--modal"
              onClick={() => {
                stopSpeaking()
                listen()
              }}
            >
              Vorlesen überspringen
            </button>
          )}
        </div>
      )}
      {conversation.error && <div className="f-chat__notice"><ErrorNote>{conversation.error}</ErrorNote></div>}
      {sendError && <div className="f-chat__notice"><ErrorNote>{sendError}</ErrorNote></div>}

      {readOnly ? (
        <div className="f-chat__readonly">{readOnlyHint}</div>
      ) : (
        <form className="f-composer" onSubmit={submitText}>
          <textarea
            className="dt-input f-composer__input"
            rows={2}
            value={text}
            disabled={inputBlocked}
            placeholder={hasQuestions ? 'Oder antworten Sie frei in eigenen Worten' : placeholder}
            onChange={(event) => setText(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) submitText(event)
            }}
          />
          {!voiceMode && <MicButton onText={(value) => setText((prev) => `${prev} ${value}`.trim())} />}
          <button
            type="submit"
            className="dt-btn dt-btn--primary dt-btn--modal"
            disabled={inputBlocked || !text.trim()}
            aria-label="Nachricht senden"
          >
            Senden
          </button>
        </form>
      )}
    </section>
  )
}
