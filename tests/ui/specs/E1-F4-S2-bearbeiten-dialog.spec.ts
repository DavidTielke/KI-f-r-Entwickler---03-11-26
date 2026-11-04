// specs/E1-F4-S2-bearbeiten-dialog.spec.ts
//
// Story: specs/E1 Personen/F4 Person bearbeiten/S2 Bearbeiten-Dialog.md
//
// Gruppe 1 „Bearbeiten-Dialog" → AK 1, 2, 3, 4, 5

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S2 Bearbeiten-Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Der Dialog zeigt den Titel „Person {id} bearbeiten.".
   * - AK 2: Das Feld `Name` ist mit dem aktuellen `Name` der Person vorausgefüllt.
   * - AK 3: Das Feld `Alter` ist mit dem aktuellen `Age`-Wert der Person vorausgefüllt.
   * - AK 4: Der Dialog enthält den Submit-Button „Speichern".
   * - AK 5: „Abbrechen" schließt den Dialog ohne Änderung.
   */
  test('Bearbeiten-Dialog', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const anna = personsSeed[0] // Anna Berger, Age 34
    await persons.open()
    await persons.openEdit(anna)

    // AK 1: Der Dialog zeigt den Titel „Person {id} bearbeiten.".
    await expect(form.dialog.getByText('Person 1 bearbeiten', { exact: false })).toBeVisible()

    // AK 2: Das Feld `Name` ist mit dem aktuellen `Name` vorausgefüllt.
    await expect(form.nameField).toHaveValue(anna.name)

    // AK 3: Das Feld `Alter` ist mit dem aktuellen `Age`-Wert vorausgefüllt.
    await expect(form.ageField).toHaveValue(String(anna.age))

    // AK 4: Der Dialog enthält den Submit-Button „Speichern".
    await expect(form.dialog.getByRole('button', { name: 'Speichern' })).toBeVisible()

    // AK 5: „Abbrechen" schließt den Dialog ohne Änderung.
    await form.cancelButton.click()
    await expect(form.dialog).toHaveCount(0)
    await expect(persons.row(anna.name)).toContainText(anna.name)
    await expect(persons.row(anna.name)).toContainText(String(anna.age))
  })
})
