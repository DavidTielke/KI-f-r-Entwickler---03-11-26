import { useEffect, useState } from 'react'
import { Icon } from '../components/icons.jsx'
import IntakeModal from '../components/IntakeModal.jsx'
import { Empty, ErrorNote, Heading, Topbar, Working } from '../components/ui.jsx'
import { api, useLive } from '../lib/api.js'
import { navigate, useRoute } from '../lib/router.js'

const COLUMNS = [
  { state: 'Draft', title: 'In Klärung', hint: 'Der Product Owner schärft die Idee gemeinsam mit Ihnen.' },
  { state: 'Ready', title: 'Freigegeben', hint: 'Bereit, zu Anforderungen ausformuliert zu werden.' },
  { state: 'Übernommen', title: 'Überführt', hint: 'Daraus sind Anforderungen entstanden.' },
]

function IdeaCard({ idea }) {
  const percent = Math.round((idea.readyCount / idea.readyTotal) * 100)
  return (
    <a className="dt-card f-ideacard" href={`#/ideen/${idea.id}`}>
      <div className="f-ideacard__head">
        <span className="dt-cell-mono">{idea.id}</span>
        {idea.busy && <Working>Arbeitet</Working>}
        {!idea.busy && idea.error && <span className="dt-badge f-badge--error">Störung</span>}
        {!idea.busy && !idea.error && idea.state === 'Draft' && idea.readyCount === idea.readyTotal - 1 && (
          <span className="dt-badge dt-badge--green">Bereit zur Freigabe</span>
        )}
        {!idea.busy && !idea.error && idea.waitingForUser && idea.readyCount < idea.readyTotal - 1 && (
          <span className="dt-badge dt-badge--orange">Wartet auf Sie</span>
        )}
      </div>
      <div className="f-ideacard__title">{idea.title}</div>
      <div className="f-ideacard__text">{idea.problem || 'Noch keine Beschreibung.'}</div>
      {idea.state === 'Draft' && (
        <div className="f-ideacard__progress">
          <div className="dt-bar">
            <div className="dt-bar__fill" style={{ width: `${percent}%` }} />
          </div>
          <span className="dt-cell-mono">
            {idea.readyCount}/{idea.readyTotal}
          </span>
        </div>
      )}
    </a>
  )
}

export default function IdeasPage() {
  const { query } = useRoute()
  const { data, error } = useLive('/api/ideas', ['ideas', 'runs'])
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    if (query.get('neu')) {
      setCreating(true)
      navigate('#/ideen')
    }
  }, [query])

  async function create(text) {
    const { id } = await api.post('/api/ideas', { text })
    navigate(`#/ideen/${id}`)
  }

  const ideas = data ?? []

  return (
    <>
      <Topbar kicker="Fertigung" title="Ideen">
        <button type="button" className="dt-btn dt-btn--primary" onClick={() => setCreating(true)}>
          <Icon name="mic" /> Idee erfassen
        </button>
      </Topbar>
      <div className="dt-content">
        <ErrorNote>{error}</ErrorNote>
        {data && ideas.length === 0 ? (
          <div className="dt-card">
            <Empty title="Noch keine Ideen" hint="Erfassen Sie Ihre erste Idee. Sie können sie einfach einsprechen." />
          </div>
        ) : (
          <div className="f-board">
            {COLUMNS.map((column) => {
              const items = ideas.filter((idea) => idea.state === column.state)
              return (
                <section key={column.state} className="f-board__column">
                  <div className="f-board__head">
                    <h3 className="f-h3">
                      <Heading>{column.title}</Heading>
                    </h3>
                    <span className="dt-nav__count">{items.length}</span>
                  </div>
                  <div className="dt-stat__sub f-board__hint">{column.hint}</div>
                  <div className="f-board__cards">
                    {items.map((idea) => (
                      <IdeaCard key={idea.id} idea={idea} />
                    ))}
                  </div>
                </section>
              )
            })}
          </div>
        )}
      </div>
      {creating && (
        <IntakeModal
          kicker="Neue Idee"
          title="Idee erfassen"
          label="Ihre Idee"
          placeholder="Beschreiben Sie, was Sie stört oder was künftig möglich sein soll. Es muss nicht perfekt sein."
          cta="Dialog starten"
          onSubmit={create}
          onClose={() => setCreating(false)}
        />
      )}
    </>
  )
}
