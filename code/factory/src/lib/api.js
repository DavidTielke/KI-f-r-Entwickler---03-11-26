import { useCallback, useEffect, useRef, useState } from 'react'

async function request(method, url, body) {
  const options = { method }
  if (method !== 'GET') {
    options.headers = { 'Content-Type': 'application/json' }
    options.body = JSON.stringify(body ?? {})
  }
  let response
  try {
    response = await fetch(url, options)
  } catch {
    throw new Error('Der Factory-Dienst ist nicht erreichbar.')
  }
  const data = await response.json().catch(() => null)
  if (!response.ok) throw new Error(data?.error ?? 'Die Anfrage ist fehlgeschlagen.')
  return data
}

export const api = {
  get: (url) => request('GET', url),
  post: (url, body) => request('POST', url, body),
  put: (url, body) => request('PUT', url, body),
  del: (url) => request('DELETE', url),
}

// ---------------------------------------------------------------------------
// Live-Kanal: eine gemeinsame Verbindung für alle Ansichten
// ---------------------------------------------------------------------------
const listeners = new Set()
let source = null

function ensureSource() {
  if (source) return
  source = new EventSource('/api/events')
  source.onmessage = (event) => {
    const message = JSON.parse(event.data)
    for (const listener of listeners) listener(message)
  }
}

export function subscribe(listener) {
  ensureSource()
  listeners.add(listener)
  return () => listeners.delete(listener)
}

// Lädt eine Ressource und aktualisiert sie, sobald der Dienst eine Änderung an
// einem der angegebenen Themen meldet.
export function useLive(url, topics = []) {
  const [state, setState] = useState({ data: null, error: '', loading: true })
  const topicKey = topics.join(',')
  const timer = useRef(null)
  const latestUrl = useRef(url)
  latestUrl.current = url

  const reload = useCallback(async () => {
    if (!url) return
    try {
      const data = await api.get(url)
      if (latestUrl.current === url) setState({ data, error: '', loading: false })
    } catch (err) {
      if (latestUrl.current === url) setState((prev) => ({ ...prev, error: err.message, loading: false }))
    }
  }, [url])

  useEffect(() => {
    setState((prev) => ({ ...prev, loading: true, data: null, error: '' }))
    reload()
  }, [reload])

  useEffect(() => {
    if (!topicKey) return undefined
    const wanted = topicKey.split(',')
    const unsubscribe = subscribe((message) => {
      if (!wanted.includes(message.topic)) return
      clearTimeout(timer.current)
      timer.current = setTimeout(reload, 200)
    })
    return () => {
      unsubscribe()
      clearTimeout(timer.current)
    }
  }, [topicKey, reload])

  return { ...state, reload }
}

export function useNow(active, intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return undefined
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [active, intervalMs])
  return now
}
