import { useState } from 'react'
import { IconClose } from './icons.jsx'

export default function PersonForm({ initial, initialPet, pets, submitLabel, onSubmit, onClose }) {
  const [name, setName] = useState(initial?.name ?? '')
  const [age, setAge] = useState(initial != null ? String(initial.age) : '')
  const [petId, setPetId] = useState(initialPet ? String(initialPet.id) : '')
  const [nameError, setNameError] = useState('')
  const [ageError, setAgeError] = useState('')
  const [apiError, setApiError] = useState('')
  const [saving, setSaving] = useState(false)

  function validate() {
    const parsedAge = Number(age)
    let ok = true

    if (!name.trim()) {
      setNameError('Name ist erforderlich.')
      ok = false
    } else {
      setNameError('')
    }

    if (age === '' || Number.isNaN(parsedAge)) {
      setAgeError('Alter muss eine Zahl sein.')
      ok = false
    } else if (parsedAge < 0 || parsedAge > 150) {
      setAgeError('Alter muss zwischen 0 und 150 liegen.')
      ok = false
    } else {
      setAgeError('')
    }

    return ok
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setApiError('')
    if (!validate()) return

    setSaving(true)
    try {
      const payload = { name: name.trim(), age: Number(age) }
      if (petId !== '') payload.petId = Number(petId)
      await onSubmit(payload)
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
            {initial ? `Person ${initial.id} bearbeiten` : 'Person anlegen'}
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
          <form id="person-form" className="dt-form" onSubmit={handleSubmit} noValidate>
            <div className="dt-field--6">
              <label className="dt-field__label" htmlFor="person-name">
                Name
              </label>
              <input
                id="person-name"
                className={`dt-input${nameError !== '' ? ' is-error' : ''}`}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="z. B. Alice"
                maxLength={150}
                autoFocus
              />
              {nameError !== '' && <div className="dt-field__error">{nameError}</div>}
            </div>
            <div className="dt-field--6">
              <label className="dt-field__label" htmlFor="person-age">
                Alter
              </label>
              <input
                id="person-age"
                className={`dt-input${ageError !== '' ? ' is-error' : ''}`}
                type="number"
                min={0}
                max={150}
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="z. B. 30"
              />
              {ageError !== '' && <div className="dt-field__error">{ageError}</div>}
            </div>
            <div className="dt-field--12">
              <label className="dt-field__label" htmlFor="person-pet">
                Haustier
              </label>
              <select
                id="person-pet"
                className="dt-select"
                value={petId}
                onChange={(e) => setPetId(e.target.value)}
              >
                <option value="">Kein Haustier</option>
                {(pets ?? []).map((pet) => (
                  <option
                    key={pet.id}
                    value={String(pet.id)}
                    disabled={pet.personId != null && pet.personId !== initial?.id}
                  >
                    {pet.name} ({pet.species})
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
            form="person-form"
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
