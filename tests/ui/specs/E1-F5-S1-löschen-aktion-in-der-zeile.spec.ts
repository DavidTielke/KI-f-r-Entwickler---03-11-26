// specs/E1-F5-S1-löschen-aktion-in-der-zeile.spec.ts
//
// Story: specs/E1 Personen/F5 Person löschen/S1 Löschen-Aktion in der Zeile.md
//
// Gruppe 1 „Löschen-Aktion" → AK 1, 2, 3, 4

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonLoeschDialog } from '../pages/PersonLoeschDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S1 Löschen-Aktion in der Zeile', () => {
  /**
   * Deckt ab:
   * - AK 1: Jede Zeile der Liste enthält eine Löschen-Aktion.
   * - AK 2: Die Löschen-Aktion ist ein Icon-Button in der Danger-Variante.
   * - AK 3: Die Löschen-Aktion trägt das Accessibility-Label „Person {id} löschen".
   * - AK 4: Ein Klick auf die Löschen-Aktion öffnet den Lösch-Bestätigungsdialog für die Person.
   */
  test('Löschen-Aktion', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const loesch = new PersonLoeschDialog(page)
    const anna = personsSeed[0]
    await persons.open()

    // AK 1: Jede Zeile enthält eine Löschen-Aktion (4 Personen → 4 Buttons).
    await expect(page.getByRole('button', { name: /lösch/ })).toHaveCount(4)

    // AK 2: Die Löschen-Aktion ist ein Icon-Button in der Danger-Variante.
    await expect(persons.deleteButton(anna).locator('svg')).toHaveCount(1)
    await expect(persons.deleteButton(anna)).toHaveClass(/danger/)

    // AK 3: Die Löschen-Aktion trägt das Accessibility-Label „Person {id} löschen".
    await expect(persons.deleteButton(anna)).toHaveAttribute('aria-label', 'Person 1 löschen')

    // AK 4: Ein Klick öffnet den Lösch-Bestätigungsdialog für die Person.
    await persons.openDelete(anna)
    await expect(loesch.dialog).toBeVisible()
  })
})
