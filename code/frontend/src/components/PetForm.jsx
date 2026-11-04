import { useState } from 'react'
import { IconClose } from './icons.jsx'

const SPECIES = ['Hund', 'Katze', 'Vogel', 'Dinosaurier']

export default function PetForm({ initial, submitLabel, onSubmit, onClose, persons, pets }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [species, setSpecies] = useState(initial?.species ?? '')
  const [personId, setPersonId] = useState(initial?.personId != null ? String(initial.personId) : '')
  const [nameError, setNameError] = useState('')
  const [speciesError, setSpeciesError] = useState('')
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)

  function validate() {
    let ok = true

    if (!name.trim()) {
      setNameError('Name ist erforderlich.')
      ok = false
    } else {
      setNameError('')
    }

    if (species === '') {
      setSpeciesError('Spezies ist erforderlich.')
      ok = false
    } else {
      setSpeciesError('')
    }

    return ok
  }

  function personDisabled(person) {
    return pets.some((pet) => pet.personId === person.id && pet.id !== initial?.id)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setSaving(true)
    try {
      await onSubmit({
        name: name.trim(),
        species,
        personId: personId === '' ? null : Number(personId),
      })
    } catch (err) {
      setApiError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="dt-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="dt-modal" role="dialog" aria-modal="true">
        <div className="dt-modal__head">
          <div className="dt-modal__title">
            {initial ? `Haustier ${initial.id} bearbeiten` : 'Haustier anlegen'}
            <span className="dt-dot">.</span>
          </div>
          <button
            type="button"
            className="dt-modal__close"
            aria-label="Schließen"
            onClick={onClose}
          >
            {IconClose()}
          </button>
        </div>

        <div className="dt-modal__body">
          <form id="pet-form" className="dt-form" onSubmit={handleSubmit} noValidate>
            <div className="dt-field--12">
              <label className="dt-field__label" htmlFor="pet-name">
                Name
              </label>
              <input
                id="pet-name"
                className={`dt-input${nameError !== '' ? ' is-error' : ''}`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Rex"
                maxLength={150}
                autoFocus
              />
              {nameError !== '' && <div className="dt-field__error">{nameError}</div>}
            </div>
            <div className="dt-field--6">
              <label className="dt-field__label" htmlFor="pet-species">
                Spezies
              </label>
              <select
                id="pet-species"
                className={`dt-select${speciesError !== '' ? ' is-error' : ''}`}
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
              >
                <option value="">Bitte wählen</option>
                {SPECIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              {speciesError !== '' && <div className="dt-field__error">{speciesError}</div>}
            </div>
            <div className="dt-field--6">
              <label className="dt-field__label" htmlFor="pet-person">
                Person
              </label>
              <select
                id="pet-person"
                className="dt-select"
                value={personId}
                onChange={(e) => setPersonId(e.target.value)}
              >
                <option value="">Keine Person</option>
                {persons.map((p) => (
                  <option key={p.id} value={String(p.id)} disabled={personDisabled(p)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            {apiError !== '' && (
              <div className="dt-field--12">
                <div className="dt-field__error">{apiError}</div>
              </div>
            )}
          </form>
        </div>

        <div className="dt-modal__foot">
          <button type="button" className="dt-btn dt-btn--secondary dt-btn--modal" onClick={onClose}>
            Abbrechen
          </button>
          <button
            type="submit"
            form="pet-form"
            className="dt-btn dt-btn--primary dt-btn--modal"
            disabled={saving}
          >
            {saving ? 'Wird gespeichert …' : submitLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
