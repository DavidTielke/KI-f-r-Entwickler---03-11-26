// specs/E1-F7-S1-schliessen-mit-escape.spec.ts
//
// Story: specs/E1 Personen/F7 Modal-Verhalten/S1 Schließen mit Escape.md
//
// Gruppe 1 „Escape schließt Dialoge" → AK 1, 2

import { test, expect } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { PersonLoeschDialog } from '../pages/PersonLoeschDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S1 Schließen mit Escape', () => {
  /**
   * Deckt ab:
   * - AK 1: Ein Drücken von Escape schließt den Anlegen-/Bearbeiten-Dialog.
   * - AK 2: Ein Drücken von Escape schließt den Lösch-Bestätigungsdialog.
   */
  test('Escape schließt Dialoge', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const del = new PersonLoeschDialog(page)
    const person = personsSeed[0]
    await persons.open()

    // AK 1: Escape schließt den Anlegen-Dialog.
    await form.openCreate()
    await expect(form.dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(form.dialog).toHaveCount(0)

    // AK 1: Escape schließt den Bearbeiten-Dialog.
    await form.openEdit(person)
    await expect(form.dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(form.dialog).toHaveCount(0)

    // AK 2: Escape schließt den Lösch-Bestätigungsdialog.
    await del.open(person)
    await expect(del.dialog).toBeVisible()
    await page.keyboard.press('Escape')
    await expect(del.dialog).toHaveCount(0)
  })
})
