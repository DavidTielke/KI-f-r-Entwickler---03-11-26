import { useMemo, useState } from 'react'
import { Empty, ErrorNote, Topbar } from '../components/ui.jsx'
import { useLive } from '../lib/api.js'
import { formatDateTime, plural } from '../lib/format.js'

const TYPES = {
  idea: { label: 'Idee', tone: 'orange' },
  requirement: { label: 'Anforderung', tone: 'orange' },
  run: { label: 'Auftrag', tone: 'neutral' },
  delivery: { label: 'Auslieferung', tone: 'green' },
  version: { label: 'Version', tone: 'neutral' },
}

const FILTERS = [
  { key: 'alle', label: 'Alle', match: () => true },
  { key: 'idea', label: 'Ideen', match: (event) => event.type === 'idea' },
  { key: 'requirement', label: 'Anforderungen', match: (event) => event.type === 'requirement' },
  { key: 'run', label: 'Aufträge', match: (event) => event.type === 'run' || event.type === 'delivery' },
  { key: 'version', label: 'Versionen', match: (event) => event.type === 'version' },
]

function linkOf(event) {
  if (event.ref?.run) return `#/umsetzung/${event.ref.run}`
  if (event.ref?.idea) return `#/ideen/${event.ref.idea}`
  if (event.ref?.story) return `#/anforderungen/${event.ref.story}`
  return null
}

export default function HistoryPage() {
  const { data, error } = useLive('/api/history', ['ideas', 'requirements', 'runs'])
  const [filter, setFilter] = useState('alle')
  const active = FILTERS.find((item) => item.key === filter)
  const events = useMemo(() => (data ?? []).filter(active.match), [data, active])

  return (
    <>
      <Topbar kicker="Transparenz" title="Verlauf" />
      <div className="dt-content">
        <ErrorNote>{error}</ErrorNote>
        <section className="dt-tablecard">
          <div className="dt-tablecard__head">
            <span>{data ? plural(events.length, 'Eintrag', 'Einträge') : 'Wird geladen …'}</span>
            <div className="f-segment" role="group" aria-label="Nach Art filtern">
              {FILTERS.map((item) => (
                <button key={item.key} type="button" className={`f-segment__item ${filter === item.key ? 'is-active' : ''}`} aria-pressed={filter === item.key} onClick={() => setFilter(item.key)}>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          {data && events.length === 0 ? (
            <Empty title="Keine Einträge" hint="Für diesen Filter gibt es noch keine Ereignisse." />
          ) : (
            <table className="dt-table">
              <thead>
                <tr>
                  <th>Zeitpunkt</th>
                  <th>Art</th>
                  <th>Ereignis</th>
                  <th>Nachweis</th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => {
                  const type = TYPES[event.type] ?? TYPES.version
                  const link = linkOf(event)
                  return (
                    <tr key={index}>
                      <td className="dt-cell-muted f-table__nowrap">{formatDateTime(event.at)}</td>
                      <td>
                        <span className={`dt-badge dt-badge--${type.tone}`}>{type.label}</span>
                      </td>
                      <td>{link ? <a href={link}>{event.title}</a> : event.title}</td>
                      <td className="dt-cell-mono">{event.ref?.commit ?? event.ref?.run ?? event.ref?.idea ?? event.ref?.story ?? '–'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  )
}
