import { useEffect, useRef, useState } from 'react'
import { useNow } from '../lib/api.js'
import { formatDuration, formatTime, storyCode } from '../lib/format.js'
import { Icon } from './icons.jsx'
import { Heading, Stepper, Working } from './ui.jsx'

export function RunProgress({ run }) {
  const now = useNow(run.status === 'running')
  const elapsed = run.startedAt ? (run.endedAt ? new Date(run.endedAt) : new Date(now)) - new Date(run.startedAt) : 0
  const done = run.stories.filter((story) => story.done).length
  const changes = run.activity.filter((item) => item.change).length
  const showStories = run.type === 'delivery'
  return (
    <section className="dt-card dt-card--lg">
      <div className="dt-card__pad">
        <Stepper steps={run.phases} />
        <div className="f-runstats">
          <div>
            <div className="dt-stat__label">Laufzeit</div>
            <div className="f-runstats__value">{formatDuration(elapsed)}</div>
          </div>
          {showStories && (
            <div>
              <div className="dt-stat__label">Anforderungen</div>
              <div className="f-runstats__value">
                {done} von {run.stories.length}
              </div>
            </div>
          )}
          <div>
            <div className="dt-stat__label">Änderungen</div>
            <div className="f-runstats__value">{run.changes ? run.changes.files.length : changes}</div>
          </div>
          {run.repairs > 0 && (
            <div>
              <div className="dt-stat__label">Nachbesserungen</div>
              <div className="f-runstats__value">{run.repairs}</div>
            </div>
          )}
          {run.commit && (
            <div>
              <div className="dt-stat__label">Version</div>
              <div className="f-runstats__value">{run.commit}</div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function RunStories({ run }) {
  if (run.stories.length === 0) return null
  const running = run.status === 'running'
  return (
    <section className="dt-card">
      <div className="dt-card__pad">
        <div className="dt-kicker">Auftragsumfang</div>
        <h3 className="f-h3 f-h3--spaced">
          <Heading>Anforderungen</Heading>
        </h3>
        <ul className="f-runstories">
          {run.stories.map((story) => (
            <li key={story.id} className={story.done ? 'is-done' : ''}>
              <span className="f-ready__mark">{story.done && <Icon name="check" size={12} strokeWidth={3} />}</span>
              <div>
                <a href={`#/anforderungen/${story.id}`} className="dt-cell-strong">
                  {story.title}
                </a>
                <div className="dt-cell-mono">{storyCode(story.id)}</div>
                {story.note && <div className="dt-stat__sub">{story.note}</div>}
              </div>
              {running && !story.done && <span className="dt-stat__sub">In Arbeit</span>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}

export function RunFeed({ run }) {
  const [technical, setTechnical] = useState(false)
  const scroller = useRef(null)
  const running = run.status === 'running'

  useEffect(() => {
    if (running && scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight
  }, [run.activity.length, running])

  return (
    <section className="dt-card f-feed">
      <div className="f-feed__head">
        <div>
          <div className="dt-kicker">Nachvollziehbarkeit</div>
          <h3 className="f-h3">
            <Heading>Arbeitsprotokoll</Heading>
          </h3>
        </div>
        <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={() => setTechnical(!technical)} aria-pressed={technical}>
          {technical ? 'Technische Details ausblenden' : 'Technische Details einblenden'}
        </button>
      </div>
      <div className="f-feed__scroll" ref={scroller}>
        {run.activity.length === 0 && <div className="dt-stat__sub">{run.status === 'queued' ? 'Der Auftrag wartet auf seinen Start.' : 'Noch keine Einträge.'}</div>}
        <ol className="f-feed__list">
          {run.activity.map((item, index) => (
            <li key={index} className={`f-feed__item is-${item.kind}`}>
              <span className="dt-cell-mono f-feed__time">{formatTime(item.at)}</span>
              <div>
                <div className="f-feed__text">{item.text}</div>
                {technical && item.detail && <code className="f-feed__detail">{item.detail}</code>}
              </div>
            </li>
          ))}
        </ol>
        {running && (
          <div className="f-feed__working">
            <Working>Die Arbeit läuft</Working>
          </div>
        )}
      </div>
    </section>
  )
}
