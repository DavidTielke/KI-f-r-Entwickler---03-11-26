// specs/E1-F4-S1-bearbeiten-aktion-in-der-zeile.spec.ts
//
// Story: specs/E1 Personen/F4 Person bearbeiten/S1 Bearbeiten-Aktion in der Zeile.md
//
// Gruppe 1 „Bearbeiten-Aktion" → AK 1, 2, 3, 4

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S1 Bearbeiten-Aktion in der Zeile', () => {
  /**
   * Deckt ab:
   * - AK 1: Jede Zeile der Liste enthält eine Bearbeiten-Aktion.
   * - AK 2: Die Bearbeiten-Aktion ist ein Icon-Button.
   * - AK 3: Die Bearbeiten-Aktion trägt das Accessibility-Label „Person {id} bearbeiten".
   * - AK 4: Ein Klick auf die Bearbeiten-Aktion öffnet den Bearbeiten-Dialog für die Person.
   */
  test('Bearbeiten-Aktion', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const anna = personsSeed[0]
    await persons.open()

    // AK 1: Jede Zeile enthält eine Bearbeiten-Aktion (4 Personen → 4 Buttons).
    await expect(page.getByRole('button', { name: /bearbeiten/ })).toHaveCount(4)

    // AK 2: Die Bearbeiten-Aktion ist ein Icon-Button (enthält ein SVG-Icon).
    await expect(persons.editButton(anna).locator('svg')).toHaveCount(1)

    // AK 3: Die Bearbeiten-Aktion trägt das Accessibility-Label „Person {id} bearbeiten".
    await expect(persons.editButton(anna)).toHaveAttribute('aria-label', 'Person 1 bearbeiten')

    // AK 4: Ein Klick öffnet den Bearbeiten-Dialog für die Person.
    await persons.openEdit(anna)
    await expect(form.dialog).toBeVisible()
    await expect(form.dialog.getByText('Person 1 bearbeiten', { exact: false })).toBeVisible()
  })
})
