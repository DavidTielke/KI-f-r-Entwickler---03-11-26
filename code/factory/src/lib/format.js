const dateTime = new Intl.DateTimeFormat('de-DE', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const shortDate = new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
const timeOnly = new Intl.DateTimeFormat('de-DE', { hour: '2-digit', minute: '2-digit', second: '2-digit' })

export const formatDateTime = (value) => (value ? `${dateTime.format(new Date(value))} Uhr` : '–')
export const formatDate = (value) => (value ? shortDate.format(new Date(value)) : '–')
export const formatTime = (value) => (value ? timeOnly.format(new Date(value)) : '')

export function formatDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return '–'
  const total = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(total / 60)
  const seconds = total % 60
  if (minutes === 0) return `${seconds} Sek.`
  if (minutes < 60) return `${minutes} Min. ${String(seconds).padStart(2, '0')} Sek.`
  return `${Math.floor(minutes / 60)} Std. ${String(minutes % 60).padStart(2, '0')} Min.`
}

// Kurzform für große Kennzahlen im Cockpit.
export function formatShortDuration(ms) {
  if (ms == null || Number.isNaN(ms)) return '–'
  const minutes = ms / 60000
  if (minutes < 1) return `${Math.round(ms / 1000)} s`
  if (minutes < 60) return `${Math.round(minutes)} min`
  return `${(minutes / 60).toFixed(1).replace('.', ',')} h`
}

export const formatUsd = (value) =>
  new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'USD' }).format(value ?? 0)

export const storyCode = (id) => id.replaceAll('-', ' · ')

export const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`

// Fachliche Bezeichnungen der Statuswerte aus den Dateien.
export const STORY_STATUS = {
  Implemented: { label: 'Umgesetzt', tone: 'green' },
  Modified: { label: 'Umsetzung offen', tone: 'orange' },
}

export const IDEA_STATUS = {
  Draft: { label: 'In Klärung', tone: 'orange' },
  Ready: { label: 'Freigegeben', tone: 'green' },
  Übernommen: { label: 'Überführt', tone: 'neutral' },
}

export const RUN_STATUS = {
  queued: { label: 'Wartet', tone: 'neutral' },
  running: { label: 'Läuft', tone: 'orange' },
  done: { label: 'Abgeschlossen', tone: 'green' },
  partial: { label: 'Teilweise umgesetzt', tone: 'orange' },
  failed: { label: 'Fehlgeschlagen', tone: 'error' },
  canceled: { label: 'Abgebrochen', tone: 'neutral' },
}

export const RUN_TYPE = {
  delivery: 'Umsetzung',
  transfer: 'Überführung',
  revert: 'Rücknahme',
}

export const IDEA_PHASES = [
  { key: 'verstehen', label: 'Verstehen' },
  { key: 'hinterfragen', label: 'Hinterfragen' },
  { key: 'machbarkeit', label: 'Machbarkeit' },
  { key: 'verfeinern', label: 'Verfeinern' },
  { key: 'abschliessen', label: 'Abschließen' },
]
