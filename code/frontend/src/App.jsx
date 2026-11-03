import { useEffect, useState } from 'react'
import PersonForm from './components/PersonForm.jsx'
import PersonList from './components/PersonList.jsx'
import { IconTrash } from './components/icons.jsx'
import * as personsApi from './api/persons.js'

function App() {
  const [persons, setPersons] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)

  async function loadPersons() {
    try {
      setError('')
      const data = await personsApi.listPersons()
      setPersons(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPersons()
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setFormOpen(null)
        setDeleteTarget(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleCreate(data) {
    await personsApi.createPerson(data)
    setFormOpen(null)
    await loadPersons()
  }

  async function handleUpdate(data) {
    await personsApi.updatePerson(formOpen.id, data)
    setFormOpen(null)
    await loadPersons()
  }

  async function handleDelete(id) {
    await personsApi.deletePerson(id)
    setDeleteTarget(null)
    await loadPersons()
  }

  async function handleReorder(ids) {
    setPersons((prev) => ids.map((id) => prev.find((p) => p.id === id)).filter(Boolean))
    try {
      await personsApi.reorderPersons(ids)
    } catch (err) {
      await loadPersons()
      setError(err.message)
    }
  }

  return (
    <div className="dt-app">
      <aside className="dt-sidebar">
        <div className="dt-sidebar__brand">
          <div className="dt-brand">
            Personen<span className="dt-brand__slash">//</span>
            <span className="dt-brand__tag">Verwaltung</span>
          </div>
        </div>
        <div className="dt-sidebar__body">
          <nav className="dt-nav" aria-label="Hauptnavigation">
            <div className="dt-nav__group-label">Stammdaten</div>
            <button type="button" className="dt-nav__item is-active">
              Personen
              <span className="dt-nav__count">{persons.length}</span>
            </button>
          </nav>
        </div>
        <div className="dt-sidebar__foot">
          <div className="dt-avatar">DT</div>
          <div>
            <div className="dt-cell-strong">David Tielke</div>
            <div className="dt-cell-muted">Administration</div>
          </div>
        </div>
      </aside>

      <div className="dt-main">
        <header className="dt-topbar">
          <div>
            <div className="dt-kicker">Stammdaten</div>
            <h1 className="dt-topbar__title">
              Personen<span className="dt-dot">.</span>
            </h1>
          </div>
          <button
            type="button"
            className="dt-btn dt-btn--primary"
            style={{ marginLeft: 'auto' }}
            onClick={() => setFormOpen('create')}
          >
            Anlegen
          </button>
        </header>

        <div className="dt-content">
          {error !== '' && <div className="dt-field__error">{error}</div>}
          <section className="dt-tablecard">
            <div className="dt-tablecard__head">
              <span>
                {loading
                  ? 'Wird geladen …'
                  : `${persons.length} ${persons.length === 1 ? 'Person' : 'Personen'}`}
              </span>
            </div>
            {loading ? null : persons.length === 0 ? (
              <div className="dt-empty">
                <div className="dt-empty__title">
                  Noch keine Personen<span className="dt-dot">.</span>
                </div>
                <div className="dt-empty__hint">
                  Legen Sie über die Aktion Anlegen die erste Person an.
                </div>
              </div>
            ) : (
              <PersonList
                persons={persons}
                onEdit={(p) => setFormOpen(p)}
                onDelete={(p) => setDeleteTarget(p)}
                onReorder={handleReorder}
              />
            )}
          </section>
        </div>
      </div>

      {formOpen !== null && (
        <PersonForm
          key={formOpen === 'create' ? 'new' : formOpen.id}
          initial={formOpen === 'create' ? null : formOpen}
          submitLabel={formOpen === 'create' ? 'Anlegen' : 'Speichern'}
          onSubmit={formOpen === 'create' ? handleCreate : handleUpdate}
          onClose={() => setFormOpen(null)}
        />
      )}

      {deleteTarget !== null && (
        <div
          className="dt-backdrop dt-backdrop--center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setDeleteTarget(null)
          }}
        >
          <div className="dt-modal dt-modal--sm" role="dialog" aria-modal="true">
            <div className="dt-danger-tile">{IconTrash(24)}</div>
            <div className="dt-modal__title">
              Person löschen<span className="dt-dot">.</span>
            </div>
            <div className="dt-stat__sub">
              «{deleteTarget.name}» (#{deleteTarget.id}) wird dauerhaft gelöscht. Diese Aktion
              kann nicht rückgängig gemacht werden.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                type="button"
                className="dt-btn dt-btn--secondary dt-btn--modal"
                onClick={() => setDeleteTarget(null)}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="dt-btn dt-btn--danger dt-btn--modal"
                onClick={() => handleDelete(deleteTarget.id)}
              >
                Löschen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
