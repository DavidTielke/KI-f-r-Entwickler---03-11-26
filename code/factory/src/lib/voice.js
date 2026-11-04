import { useCallback, useEffect, useRef, useState } from 'react'

// ---------------------------------------------------------------------------
// Spracheingabe und Sprachausgabe über die im Browser eingebauten Dienste.
// Es gibt immer nur ein aktives Mikrofon; beim Vorlesen bleibt es stumm, damit
// sich die Anwendung nicht selbst zuhört.
// ---------------------------------------------------------------------------
const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition

export const speechInputSupported = Boolean(Recognition)
export const speechOutputSupported = 'speechSynthesis' in window

const ERROR_TEXT = {
  'not-allowed': 'Der Browser hat den Zugriff auf das Mikrofon nicht erlaubt.',
  'service-not-allowed': 'Der Browser hat den Zugriff auf das Mikrofon nicht erlaubt.',
  'audio-capture': 'Es wurde kein Mikrofon gefunden.',
  network: 'Die Spracherkennung des Browsers ist nicht erreichbar.',
  'language-not-supported': 'Der Browser unterstützt die Spracherkennung auf Deutsch nicht.',
}

let stopActiveInput = null

export function useSpeechInput({ onFinal, onUtterance, silenceMs = 1800 } = {}) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState('')

  const recognition = useRef(null)
  const wanted = useRef(false)
  const buffer = useRef('')
  const pendingInterim = useRef('')
  const silenceTimer = useRef(null)
  const callbacks = useRef({})
  callbacks.current = { onFinal, onUtterance }

  const stop = useCallback((discard = false) => {
    wanted.current = false
    clearTimeout(silenceTimer.current)
    const current = recognition.current
    recognition.current = null
    if (current) {
      if (discard) current.abort()
      else current.stop()
    }
    setListening(false)
    setInterim('')
    if (stopActiveInput === stop) stopActiveInput = null
  }, [])

  const start = useCallback(() => {
    if (!Recognition) {
      setError('Dieser Browser unterstützt keine Spracheingabe. Bitte verwenden Sie Chrome oder Edge.')
      return
    }
    if (stopActiveInput && stopActiveInput !== stop) stopActiveInput()
    stopActiveInput = stop
    stopSpeaking()
    wanted.current = true
    buffer.current = ''
    pendingInterim.current = ''
    setError('')

    const launch = () => {
      const instance = new Recognition()
      instance.lang = 'de-DE'
      instance.continuous = true
      instance.interimResults = true

      instance.onresult = (event) => {
        let finals = ''
        let partial = ''
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const text = event.results[i][0].transcript
          if (event.results[i].isFinal) finals += text
          else partial += text
        }
        if (finals.trim()) {
          buffer.current = `${buffer.current} ${finals.trim()}`.trim()
          callbacks.current.onFinal?.(finals.trim())
        }
        pendingInterim.current = partial
        setInterim(partial)

        // Gesprächsmodus: Eine Pause beendet den Redebeitrag.
        if (callbacks.current.onUtterance) {
          clearTimeout(silenceTimer.current)
          silenceTimer.current = setTimeout(() => {
            const spoken = `${buffer.current} ${pendingInterim.current}`.trim()
            if (!spoken) return
            buffer.current = ''
            stop(true)
            callbacks.current.onUtterance(spoken)
          }, silenceMs)
        }
      }
      instance.onerror = (event) => {
        if (event.error === 'no-speech' || event.error === 'aborted') return
        wanted.current = false
        setError(ERROR_TEXT[event.error] ?? 'Die Spracherkennung ist fehlgeschlagen.')
        setListening(false)
      }
      // Der Browser beendet die Erkennung nach Pausen von selbst.
      instance.onend = () => {
        if (wanted.current && recognition.current === instance) {
          try {
            launch()
          } catch {
            setListening(false)
          }
        } else if (recognition.current === instance || recognition.current === null) {
          setListening(false)
        }
      }
      recognition.current = instance
      instance.start()
      setListening(true)
    }
    launch()
  }, [silenceMs, stop])

  useEffect(() => () => stop(true), [stop])

  return { listening, interim, error, start, stop, supported: speechInputSupported }
}

// ---------------------------------------------------------------------------
// Sprachausgabe
// ---------------------------------------------------------------------------
const PREFS_KEY = 'software-factory.voice'

export function readVoicePrefs() {
  try {
    return { voiceName: '', rate: 1.05, ...JSON.parse(localStorage.getItem(PREFS_KEY) ?? '{}') }
  } catch {
    return { voiceName: '', rate: 1.05 }
  }
}

export function saveVoicePrefs(prefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs))
  } catch {
    // Die Einstellung gilt dann nur für diese Sitzung.
  }
}

function germanVoices() {
  if (!speechOutputSupported) return []
  return speechSynthesis.getVoices().filter((voice) => voice.lang?.toLowerCase().startsWith('de'))
}

// Natürlich klingende Stimmen zuerst.
function voiceRank(voice) {
  const name = voice.name.toLowerCase()
  if (name.includes('natural')) return 0
  if (name.includes('online')) return 1
  if (name.includes('google')) return 2
  return 3
}

function pickVoice(name) {
  const voices = germanVoices()
  return voices.find((voice) => voice.name === name) ?? [...voices].sort((a, b) => voiceRank(a) - voiceRank(b))[0] ?? null
}

export function useGermanVoices() {
  const [voices, setVoices] = useState(germanVoices)
  useEffect(() => {
    if (!speechOutputSupported) return undefined
    const update = () => setVoices(germanVoices().sort((a, b) => voiceRank(a) - voiceRank(b)))
    update()
    speechSynthesis.addEventListener('voiceschanged', update)
    return () => speechSynthesis.removeEventListener('voiceschanged', update)
  }, [])
  return voices
}

let speakToken = 0

export function stopSpeaking() {
  speakToken++
  if (speechOutputSupported) speechSynthesis.cancel()
}

// Lange Texte werden satzweise vorgelesen, weil Chrome längere Ausgaben abbricht.
export function speak(text, { onEnd } = {}) {
  if (!speechOutputSupported) {
    onEnd?.()
    return
  }
  stopSpeaking()
  const token = speakToken
  const prefs = readVoicePrefs()
  const voice = pickVoice(prefs.voiceName)
  const cleaned = text.replace(/[`*_#]/g, '').replace(/\s+/g, ' ').trim()
  const sentences = cleaned.match(/[^.!?]+[.!?]*\s*/g) ?? (cleaned ? [cleaned] : [])
  let index = 0

  const next = () => {
    if (token !== speakToken) return
    if (index >= sentences.length) {
      onEnd?.()
      return
    }
    const utterance = new SpeechSynthesisUtterance(sentences[index++].trim())
    utterance.lang = 'de-DE'
    utterance.rate = prefs.rate
    if (voice) utterance.voice = voice
    utterance.onend = next
    utterance.onerror = next
    speechSynthesis.speak(utterance)
  }
  next()
}

// ---------------------------------------------------------------------------
// Gesprochene Antworten den Optionen einer Rückfrage zuordnen
// ---------------------------------------------------------------------------
const ORDINALS = [
  ['1', 'eins', 'erste', 'ersten', 'erster', 'erstes'],
  ['2', 'zwei', 'zweite', 'zweiten', 'zweiter', 'zweites'],
  ['3', 'drei', 'dritte', 'dritten', 'dritter', 'drittes'],
  ['4', 'vier', 'vierte', 'vierten', 'vierter', 'viertes'],
]

const normalize = (text) =>
  text
    .toLowerCase()
    .replace(/[.,;:!?„“"'()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

export function matchSpokenOptions(text, options, multiSelect = false) {
  const spoken = ` ${normalize(text)} `
  const hits = new Set()

  if (multiSelect && /\salle(s)?\s/.test(spoken)) return options.map((_, index) => index)

  options.forEach((option, index) => {
    const label = normalize(option.label)
    if (label && spoken.includes(` ${label} `)) hits.add(index)
  })
  if (hits.size === 0) {
    options.forEach((option, index) => {
      const words = normalize(option.label).split(' ').filter((word) => word.length >= 4)
      if (words.length && words.every((word) => spoken.includes(word))) hits.add(index)
    })
  }
  if (hits.size === 0) {
    ORDINALS.forEach((words, index) => {
      if (index >= options.length) return
      const matched = words.some(
        (word) =>
          spoken.trim() === word ||
          new RegExp(`(^|\\s)(option|nummer|variante|antwort|die|der|das|den)\\s+${word}(\\s|$)`).test(spoken.trim()),
      )
      if (matched) hits.add(index)
    })
  }
  if (hits.size === 0 && /empfehlung|empfohlen|ihr vorschlag|ihrem vorschlag/.test(spoken)) {
    options.forEach((option, index) => {
      if (option.recommended) hits.add(index)
    })
  }
  return [...hits]
}

// Sagt die Antwort mehr als die gewählten Optionen, bleibt der Rest als Ergänzung erhalten.
export function spokenAddition(text, options) {
  const known = new Set(options.flatMap((option) => normalize(option.label).split(' ')))
  const fillers = new Set(['und', 'oder', 'die', 'der', 'das', 'den', 'ich', 'nehme', 'bitte', 'option', 'nummer', 'ihre', 'empfehlung', 'alle'])
  const rest = normalize(text).split(' ').filter((word) => !known.has(word) && !fillers.has(word))
  return rest.length >= 3 ? text : ''
}

export function questionForSpeech(question, position, total) {
  const intro = total > 1 ? `Frage ${position} von ${total}. ` : ''
  const options = question.options
    .map((option, index) => `Option ${index + 1}: ${option.label}${option.recommended ? ', meine Empfehlung' : ''}.`)
    .join(' ')
  return `${intro}${question.question} ${options}`
}
