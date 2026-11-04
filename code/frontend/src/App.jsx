import { useEffect, useState } from 'react'
import PersonForm from './components/PersonForm.jsx'
import PersonList from './components/PersonList.jsx'
import PetForm from './components/PetForm.jsx'
import PetList from './components/PetList.jsx'
import { IconTrash } from './components/icons.jsx'
import * as personsApi from './api/persons.js'
import * as petsApi from './api/pets.js'

function App() {
  const [view, setView] = useState('persons')
  const [persons, setPersons] = useState([])
  const [pets, setPets] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formOpen, setFormOpen] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [petFormOpen, setPetFormOpen] = useState(null)
  const [petDeleteTarget, setPetDeleteTarget] = useState(null)

  async function loadAll() {
    try {
      setError('')
      const [personsData, petsData] = await Promise.all([
        personsApi.listPersons(),
        petsApi.listPets(),
      ])
      setPersons(personsData)
      setPets(petsData)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAll()
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        setFormOpen(null)
        setDeleteTarget(null)
        setPetFormOpen(null)
        setPetDeleteTarget(null)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  async function handleCreate(data) {
    await personsApi.createPerson(data)
    setFormOpen(null)
    await loadAll()
  }

  async function handleUpdate(data) {
    await personsApi.updatePerson(formOpen.id, data)
    setFormOpen(null)
    await loadAll()
  }

  async function handleDelete(id) {
    await personsApi.deletePerson(id)
    setDeleteTarget(null)
    await loadAll()
  }

  async function handleReorder(ids) {
    setPersons((prev) => ids.map((id) => prev.find((p) => p.id === id)).filter(Boolean))
    try {
      await personsApi.reorderPersons(ids)
    } catch (err) {
      await loadAll()
      setError(err.message)
    }
  }

  async function handlePetCreate(data) {
    await petsApi.createPet(data)
    setPetFormOpen(null)
    await loadAll()
  }

  async function handlePetUpdate(data) {
    await petsApi.updatePet(petFormOpen.id, data)
    setPetFormOpen(null)
    await loadAll()
  }

  async function handlePetDelete(id) {
    await petsApi.deletePet(id)
    setPetDeleteTarget(null)
    await loadAll()
  }

  const isPersonsView = view === 'persons'

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
            <button
              type="button"
              className={`dt-nav__item${isPersonsView ? ' is-active' : ''}`}
              onClick={() => setView('persons')}
            >
              Personen
              <span className="dt-nav__count">{persons.length}</span>
            </button>
            <button
              type="button"
              className={`dt-nav__item${!isPersonsView ? ' is-active' : ''}`}
              onClick={() => setView('pets')}
            >
              Haustiere
              <span className="dt-nav__count">{pets.length}</span>
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
              {isPersonsView ? 'Personen' : 'Haustiere'}
              <span className="dt-dot">.</span>
            </h1>
          </div>
          <button
            type="button"
            className="dt-btn dt-btn--primary"
            style={{ marginLeft: 'auto' }}
            onClick={() => (isPersonsView ? setFormOpen('create') : setPetFormOpen('create'))}
          >
            Anlegen
          </button>
        </header>

        <div className="dt-content">
          {error !== '' && <div className="dt-field__error">{error}</div>}
          {isPersonsView ? (
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
          ) : (
            <section className="dt-tablecard">
              <div className="dt-tablecard__head">
                <span>
                  {loading
                    ? 'Wird geladen …'
                    : `${pets.length} ${pets.length === 1 ? 'Haustier' : 'Haustiere'}`}
                </span>
              </div>
              {loading ? null : pets.length === 0 ? (
                <div className="dt-empty">
                  <div className="dt-empty__title">
                    Noch keine Haustiere<span className="dt-dot">.</span>
                  </div>
                  <div className="dt-empty__hint">
                    Legen Sie über die Aktion Anlegen das erste Haustier an.
                  </div>
                </div>
              ) : (
                <PetList
                  pets={pets}
                  onEdit={(p) => setPetFormOpen(p)}
                  onDelete={(p) => setPetDeleteTarget(p)}
                />
              )}
            </section>
          )}
        </div>
      </div>

      {formOpen !== null && (
        <PersonForm
          key={formOpen === 'create' ? 'new' : formOpen.id}
          initial={formOpen === 'create' ? null : formOpen}
          initialPet={
            formOpen === 'create'
              ? null
              : pets.find((pet) => pet.personId === formOpen.id) ?? null
          }
          pets={pets}
          submitLabel={formOpen === 'create' ? 'Anlegen' : 'Speichern'}
          onSubmit={formOpen === 'create' ? handleCreate : handleUpdate}
          onClose={() => setFormOpen(null)}
        />
      )}

      {petFormOpen !== null && (
        <PetForm
          key={petFormOpen === 'create' ? 'new' : petFormOpen.id}
          initial={petFormOpen === 'create' ? null : petFormOpen}
          persons={persons}
          pets={pets}
          submitLabel={petFormOpen === 'create' ? 'Anlegen' : 'Speichern'}
          onSubmit={petFormOpen === 'create' ? handlePetCreate : handlePetUpdate}
          onClose={() => setPetFormOpen(null)}
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

      {petDeleteTarget !== null && (
        <div
          className="dt-backdrop dt-backdrop--center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setPetDeleteTarget(null)
          }}
        >
          <div className="dt-modal dt-modal--sm" role="dialog" aria-modal="true">
            <div className="dt-danger-tile">{IconTrash(24)}</div>
            <div className="dt-modal__title">
              Haustier löschen<span className="dt-dot">.</span>
            </div>
            <div className="dt-stat__sub">
              «{petDeleteTarget.name}» (#{petDeleteTarget.id}) wird dauerhaft gelöscht. Diese
              Aktion kann nicht rückgängig gemacht werden.
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                type="button"
                className="dt-btn dt-btn--secondary dt-btn--modal"
                onClick={() => setPetDeleteTarget(null)}
              >
                Abbrechen
              </button>
              <button
                type="button"
                className="dt-btn dt-btn--danger dt-btn--modal"
                onClick={() => handlePetDelete(petDeleteTarget.id)}
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
