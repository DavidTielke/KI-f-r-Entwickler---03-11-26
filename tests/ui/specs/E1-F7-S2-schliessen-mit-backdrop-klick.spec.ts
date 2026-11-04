// specs/E1-F7-S2-schliessen-mit-backdrop-klick.spec.ts
//
// Story: specs/E1 Personen/F7 Modal-Verhalten/S2 Schließen mit Backdrop-Klick.md
//
// Gruppe 1 „Backdrop-Klick" → AK 1, 2, 3
//
// Die Backdrop ist position:fixed, inset:0 (volle Viewport-Fläche); der Dialog
// liegt zentriert darin. Ein Klick in die Ecke (20,20) trifft daher ausschließlich
// die Backdrop, ein Klick auf ein Feld im Dialog liegt innerhalb des Dialogs.

import { test, expect } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { PersonLoeschDialog } from '../pages/PersonLoeschDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S2 Schließen mit Backdrop-Klick', () => {
  /**
   * Deckt ab:
   * - AK 1: Ein Klick auf die Backdrop außerhalb des Dialogs schließt den Anlegen-/Bearbeiten-Dialog.
   * - AK 2: Ein Klick auf die Backdrop außerhalb des Dialogs schließt den Lösch-Bestätigungsdialog.
   * - AK 3: Ein Klick innerhalb des Dialogs schließt den Dialog nicht.
   */
  test('Backdrop-Klick', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const del = new PersonLoeschDialog(page)
    const person = personsSeed[0]
    await persons.open()

    // AK 1: Klick auf die Backdrop außerhalb des Dialogs schließt den Anlegen-Dialog.
    await form.openCreate()
    await page.mouse.click(20, 20)
    await expect(form.dialog).toHaveCount(0)

    // AK 2: Klick auf die Backdrop außerhalb des Dialogs schließt den Lösch-Dialog.
    await del.open(person)
    await page.mouse.click(20, 20)
    await expect(del.dialog).toHaveCount(0)

    // AK 3: Ein Klick innerhalb des Dialogs schließt den Dialog nicht.
    await form.openCreate()
    await form.nameField.click()
    await expect(form.dialog).toHaveCount(1)
  })
})
