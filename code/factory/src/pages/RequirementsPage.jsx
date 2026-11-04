import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/icons.jsx'
import IntakeModal from '../components/IntakeModal.jsx'
import StartDeliveryModal from '../components/StartDeliveryModal.jsx'
import StoryEditor from '../components/StoryEditor.jsx'
import { Badge, Card, Checkbox, Empty, ErrorNote, Heading, Markdown, Modal, Note, Topbar, Working } from '../components/ui.jsx'
import { api, useLive } from '../lib/api.js'
import { plural, STORY_STATUS, storyCode } from '../lib/format.js'
import { navigate } from '../lib/router.js'
import { useSelection } from '../lib/selection.js'

const FILTERS = [
  { key: 'alle', label: 'Alle' },
  { key: 'offen', label: 'Umsetzung offen' },
  { key: 'umgesetzt', label: 'Umgesetzt' },
]

function ChooseWay({ onManual, onAssistant, onClose }) {
  return (
    <Modal kicker="Neue Anforderung" title="Anforderung anlegen" onClose={onClose}>
      <div className="f-choice">
        <button type="button" className="f-choice__item" onClick={onAssistant}>
          <span className="f-choice__icon"><Icon name="mic" size={24} /></span>
          <span>
            <span className="f-choice__title">Mit dem KI-Assistenten entwickeln</span>
            <span className="dt-stat__sub f-choice__text">Sie erzählen per Stimme oder Text, was Sie brauchen. Der Assistent fragt nach und formuliert die Anforderung aus.</span>
          </span>
        </button>
        <button type="button" className="f-choice__item" onClick={onManual}>
          <span className="f-choice__icon"><Icon name="pencil" size={24} /></span>
          <span>
            <span className="f-choice__title">Selbst formulieren</span>
            <span className="dt-stat__sub f-choice__text">Sie schreiben oder diktieren alle Angaben selbst. Die Qualitätsprüfung steht Ihnen trotzdem zur Verfügung.</span>
          </span>
        </button>
      </div>
    </Modal>
  )
}

function AppendixModal({ epic, name, onClose }) {
  const { data, error } = useLive(`/api/appendix/${epic.number}/${encodeURIComponent(name)}`)
  return (
    <Modal wide kicker={epic.name} title={name} onClose={onClose}>
      <ErrorNote>{error}</ErrorNote>
      {data && <Markdown text={data.markdown} />}
    </Modal>
  )
}

function EpicTree({ tree, scope, onScope, onAppendix }) {
  const counts = (stories) => ({ total: stories.length, open: stories.filter((s) => s.state !== 'Implemented').length })
  const productEpics = tree.filter((epic) => !epic.isTool)
  const toolEpics = tree.filter((epic) => epic.isTool)

  const renderEpic = (epic) => {
    const stories = epic.features.flatMap((feature) => feature.stories)
    const { total, open } = counts(stories)
    const expanded = scope.epic === epic.number
    const percent = total ? Math.round(((total - open) / total) * 100) : 0
    return (
      <li key={epic.number} className="f-tree__epic">
        <button
          type="button"
          className={`f-tree__item ${expanded && !scope.feature ? 'is-active' : ''}`}
          onClick={() => onScope({ epic: epic.number, feature: null })}
          aria-expanded={expanded}
        >
          <Icon name={expanded ? 'chevronDown' : 'chevronRight'} size={14} />
          <span className="f-tree__label">{epic.name}</span>
          <span className="dt-cell-mono">{total - open}/{total}</span>
        </button>
        <div className="dt-bar f-tree__bar">
          <div className="dt-bar__fill" style={{ width: `${percent}%` }} />
        </div>
        {expanded && (
          <>
            <ul className="f-tree__features">
              {epic.features.map((feature) => {
                const featureCounts = counts(feature.stories)
                return (
                  <li key={feature.number}>
                    <button
                      type="button"
                      className={`f-tree__item f-tree__item--feature ${scope.feature === feature.number ? 'is-active' : ''}`}
                      onClick={() => onScope({ epic: epic.number, feature: feature.number })}
                    >
                      <span className="f-tree__label">{feature.name}</span>
                      {featureCounts.open > 0 && <span className="dt-nav__count">{featureCounts.open}</span>}
                    </button>
                  </li>
                )
              })}
            </ul>
            {epic.appendices.length > 0 && (
              <div className="f-tree__appendices">
                <div className="dt-field__label">Unterlagen</div>
                {epic.appendices.map((name) => (
                  <button key={name} type="button" className="f-tree__appendix" onClick={() => onAppendix(epic, name)}>
                    <Icon name="file" size={14} /> {name}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </li>
    )
  }

  return (
    <div className="dt-card f-tree">
      <div className="f-tree__head">
        <div className="dt-kicker">Struktur</div>
        <h3 className="f-h3"><Heading>Themenbereiche</Heading></h3>
      </div>
      <button type="button" className={`f-tree__item ${!scope.epic ? 'is-active' : ''}`} onClick={() => onScope({ epic: null, feature: null })}>
        <span className="f-tree__label">Alle Themenbereiche</span>
      </button>
      <ul className="f-tree__list">{productEpics.map(renderEpic)}</ul>
      {toolEpics.length > 0 && (
        <>
          <div className="dt-field__label f-tree__group">Werkzeug</div>
          <ul className="f-tree__list">{toolEpics.map(renderEpic)}</ul>
        </>
      )}
    </div>
  )
}

export default function RequirementsPage({ query }) {
  const { data, error, reload } = useLive('/api/requirements', ['requirements', 'runs'])
  const drafts = useLive('/api/studio', ['studio'])
  const selection = useSelection()
  const [filter, setFilter] = useState(query.get('filter') ?? 'alle')
  const [search, setSearch] = useState('')
  const [scope, setScope] = useState({ epic: null, feature: null })
  const [dialog, setDialog] = useState(null)
  const [appendix, setAppendix] = useState(null)

  useEffect(() => {
    const next = query.get('filter')
    if (next) setFilter(next)
  }, [query])

  const tree = data?.tree ?? []

  const stories = useMemo(() => {
    const term = search.trim().toLowerCase()
    return tree
      .flatMap((epic) => epic.features.flatMap((feature) => feature.stories))
      .filter((story) => {
        // Das Werkzeug erscheint nur, wenn es ausdrücklich ausgewählt ist.
        if (story.isTool && scope.epic !== story.epicNumber) return false
        if (scope.epic && story.epicNumber !== scope.epic) return false
        if (scope.feature && story.featureNumber !== scope.feature) return false
        if (filter === 'offen' && story.state === 'Implemented') return false
        if (filter === 'umgesetzt' && story.state !== 'Implemented') return false
        if (!term) return true
        return [story.title, story.userStory, story.description, story.featureName, story.epicName, story.id]
          .join(' ')
          .toLowerCase()
          .includes(term)
      })
  }, [tree, scope, filter, search])

  const selectable = stories.filter((story) => story.state !== 'Implemented' && !story.isTool)
  const allSelected = selectable.length > 0 && selectable.every((story) => selection.isSelected(story.id))
  const allStories = tree.flatMap((epic) => epic.features.flatMap((feature) => feature.stories))
  const selectedStories = allStories.filter((story) => selection.isSelected(story.id))

  function toggleAll() {
    const ids = selectable.map((story) => story.id)
    if (allSelected) selection.set(selection.selected.filter((id) => !ids.includes(id)))
    else selection.set([...new Set([...selection.selected, ...ids])])
  }

  async function startAssistant(text) {
    const { id } = await api.post('/api/studio', { text })
    navigate(`#/assistent/${id}`)
  }

  const openDrafts = drafts.data ?? []

  return (
    <>
      <Topbar kicker="Fertigung" title="Anforderungen">
        <button type="button" className="dt-btn dt-btn--primary" onClick={() => setDialog('choose')}>
          <Icon name="plus" /> Anforderung anlegen
        </button>
      </Topbar>
      <div className="dt-content">
        <ErrorNote>{error}</ErrorNote>
        {data?.locked && (
          <Note icon="factory">
            Ein Auftrag läuft gerade. Bis zu seinem Abschluss lassen sich Anforderungen nicht ändern. <a href="#/umsetzung">Fortschritt ansehen</a>
          </Note>
        )}

        {openDrafts.length > 0 && (
          <Card title="Entwürfe im Gespräch" kicker="KI-Assistent" className="f-drafts">
            <ul className="f-actions">
              {openDrafts.map((draft) => (
                <li key={draft.id}>
                  <a href={`#/assistent/${draft.id}`} className="f-action">
                    <span className="dt-cell-mono">{draft.id}</span>
                    <span className="f-action__title">{draft.draft.title || 'Neue Anforderung'}</span>
                    <span className="f-action__cta">
                      {draft.busy ? <Working>Assistent arbeitet</Working> : draft.waitingForUser ? 'Wartet auf Sie' : 'Offen'}
                      <Icon name="chevronRight" size={14} />
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Card>
        )}

        <div className="f-reqs">
          <EpicTree tree={tree} scope={scope} onScope={setScope} onAppendix={(epic, name) => setAppendix({ epic, name })} />

          <section className="dt-tablecard f-reqs__table">
            <div className="dt-tablecard__head f-reqs__head">
              <span>{data ? plural(stories.length, 'Anforderung', 'Anforderungen') : 'Wird geladen …'}</span>
              <div className="f-reqs__controls">
                <input
                  className="dt-input f-reqs__search"
                  placeholder="Anforderungen durchsuchen"
                  aria-label="Anforderungen durchsuchen"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
                <div className="f-segment" role="group" aria-label="Nach Status filtern">
                  {FILTERS.map((item) => (
                    <button
                      key={item.key}
                      type="button"
                      className={`f-segment__item ${filter === item.key ? 'is-active' : ''}`}
                      aria-pressed={filter === item.key}
                      onClick={() => setFilter(item.key)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            {data && stories.length === 0 ? (
              <Empty title="Keine Anforderungen gefunden" hint="Ändern Sie den Filter oder legen Sie eine neue Anforderung an." />
            ) : (
              <table className="dt-table f-table">
                <thead>
                  <tr>
                    <th className="f-table__check">
                      <Checkbox checked={allSelected} disabled={selectable.length === 0} onChange={toggleAll} label="Alle offenen Anforderungen auswählen" />
                    </th>
                    <th>Nummer</th>
                    <th>Anforderung</th>
                    <th>Funktion</th>
                    <th className="dt-table__num">Kriterien</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map((story) => {
                    const status = STORY_STATUS[story.state] ?? STORY_STATUS.Modified
                    const canSelect = story.state !== 'Implemented' && !story.isTool
                    return (
                      <tr key={story.id} className="f-table__row" onClick={() => navigate(`#/anforderungen/${story.id}`)}>
                        <td className="f-table__check">
                          {canSelect && (
                            <Checkbox
                              checked={selection.isSelected(story.id)}
                              onChange={() => selection.toggle(story.id)}
                              label={`${story.title} auswählen`}
                            />
                          )}
                        </td>
                        <td className="dt-cell-mono f-table__nowrap">{storyCode(story.id)}</td>
                        <td>
                          <a className="dt-cell-strong f-table__title" href={`#/anforderungen/${story.id}`} onClick={(event) => event.stopPropagation()}>
                            {story.title}
                          </a>
                          <div className="dt-cell-muted f-table__sub">{story.userStory}</div>
                        </td>
                        <td className="dt-cell-muted">{story.featureName}</td>
                        <td className="dt-table__num dt-cell-mono">{story.criteriaCount}</td>
                        <td className="f-table__nowrap">
                          <Badge tone={status.tone}>{status.label}</Badge>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </section>
        </div>
      </div>

      {selectedStories.length > 0 && (
        <div className="f-selectionbar">
          <span className="dt-cell-strong">
            {plural(selectedStories.length, 'Anforderung', 'Anforderungen')} ausgewählt
          </span>
          <div className="f-selectionbar__actions">
            <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={selection.clear}>
              Auswahl aufheben
            </button>
            <button type="button" className="dt-btn dt-btn--primary dt-btn--modal" onClick={() => setDialog('deliver')}>
              <Icon name="factory" /> Umsetzung starten
            </button>
          </div>
        </div>
      )}

      {dialog === 'choose' && (
        <ChooseWay onClose={() => setDialog(null)} onManual={() => setDialog('manual')} onAssistant={() => setDialog('assistant')} />
      )}
      {dialog === 'manual' && (
        <StoryEditor
          tree={tree}
          defaults={{ epicNumber: scope.epic, featureNumber: scope.feature }}
          onClose={() => setDialog(null)}
          onUseAssistant={() => setDialog('assistant')}
          onSaved={(result) => {
            setDialog(null)
            reload()
            navigate(`#/anforderungen/${result.id}`)
          }}
        />
      )}
      {dialog === 'assistant' && (
        <IntakeModal
          kicker="KI-Assistent"
          title="Anforderung entwickeln"
          label="Was soll die Anwendung künftig können"
          placeholder="Beschreiben Sie in eigenen Worten, was Sie brauchen und wofür."
          cta="Gespräch starten"
          onSubmit={startAssistant}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog === 'deliver' && <StartDeliveryModal stories={selectedStories} onClose={() => setDialog(null)} />}
      {appendix && <AppendixModal epic={appendix.epic} name={appendix.name} onClose={() => setAppendix(null)} />}
    </>
  )
}
