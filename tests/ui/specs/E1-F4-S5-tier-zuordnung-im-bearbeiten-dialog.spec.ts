// specs/E1-F4-S5-tier-zuordnung-im-bearbeiten-dialog.spec.ts
//
// Story: specs/E1 Personen/F4 Person bearbeiten/S5 Tier-Zuordnung im Bearbeiten-Dialog.md
//
// Gruppe 1 „Vorausgefüllte Auswahl"   → AK 1, 2, 3, 4
// Gruppe 2 „PetId im PUT-Request"     → AK 5, 6

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S5 Tier-Zuordnung im Bearbeiten-Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Der Bearbeiten-Dialog enthält das Feld `Haustier` als Auswahl mit der Option „Kein Haustier" und allen persistierten Haustieren.
   * - AK 2: Das Feld `Haustier` ist mit dem aktuell verknüpften Haustier vorausgefüllt.
   * - AK 3: Das aktuell verknüpfte Haustier ist in der Auswahl wählbar und nicht ausgegraut.
   * - AK 4: Ein mit einer anderen Person verknüpftes Haustier ist ausgegraut und nicht wählbar.
   *
   * Anna (Id 1) ist mit Fiete (PetId 1) verknüpft; Minka (PetId 2) gehört zu Maria.
   */
  test('Vorausgefüllte Auswahl', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const anna = personsSeed[0]
    await persons.open()
    await persons.openEdit(anna)

    // AK 1: Auswahl mit „Kein Haustier" und allen persistierten Haustieren (native Optionen: Existenz prüfen).
    await expect(form.petField.getByText('Kein Haustier')).toHaveCount(1)
    await expect(form.petField.getByText('Fiete (Hund)')).toHaveCount(1)
    await expect(form.petField.getByText('Minka (Katze)')).toHaveCount(1)
    await expect(form.petField.getByText('Rex (Hund)')).toHaveCount(1)

    // AK 2: Mit dem aktuell verknüpften Haustier vorausgefüllt (Anna → Fiete, Value 1).
    await expect(form.petField).toHaveValue('1')

    // AK 3: Das verknüpfte Haustier ist wählbar (nicht ausgegraut).
    await expect(form.petField.locator('option[value="1"]')).not.toBeDisabled()

    // AK 4: Minka (verknüpft mit Maria) ist nicht wählbar.
    await expect(form.petField.locator('option[value="2"]')).toBeDisabled()
  })

  /**
   * Deckt ab:
   * - AK 5: Die Auswahl „Kein Haustier" löst die Verknüpfung: die `PUT`-Anfrage wird ohne `PetId` gesendet.
   * - AK 6: Bei Auswahl eines anderen Haustiers wird die `PUT`-Anfrage mit dessen `PetId` gesendet.
   */
  test('PetId im PUT-Request', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const anna = personsSeed[0]
    const maria = personsSeed[3]
    const puts: unknown[] = []
    await page.route('**/api/persons/**', (route) => {
      if (route.request().method() === 'PUT') puts.push(route.request().postDataJSON())
      return route.continue()
    })
    await page.goto('/')

    // AK 6: Auswahl eines anderen Haustiers (Rex, PetId 3) → PUT mit dessen PetId.
    await persons.openEdit(anna)
    await form.selectPet('Rex (Hund)')
    await form.submit('Speichern')
    expect(puts.at(-1)).toHaveProperty('petId', 3)

    // AK 5: „Kein Haustier" löst die Verknüpfung → PUT ohne PetId.
    await persons.openEdit(maria)
    await form.clearPet()
    await form.submit('Speichern')
    expect(puts.at(-1)).not.toHaveProperty('petId')
  })
})
