// specs/E2-F5-S1-schließen-mit-escape.spec.ts
//
// Story: specs/E2 Haustiere/F5 Modal-Verhalten/S1 Schließen mit Escape.md
//
// Gruppe 1 „Escape schließt die Dialoge"  → AK 1, 2

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierLoeschDialog } from '../pages/HaustierLoeschDialog'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S1 Schließen mit Escape', () => {
  /**
   * Deckt ab:
   * - AK 1: Ein Drücken von Escape schließt den Anlegen-/Bearbeiten-Dialog der Haustiere-Seite.
   * - AK 2: Ein Drücken von Escape schließt den Lösch-Bestätigungsdialog der Haustiere-Seite.
   */
  test('Escape schließt die Dialoge', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)
    const loeschen = new HaustierLoeschDialog(page)

    // AK 1: Ein Drücken von Escape schließt den Anlegen-/Bearbeiten-Dialog der Haustiere-Seite.
    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await expect(form.dialog).toBeVisible()
    await form.pressEscape()
    await expect(form.dialog).toBeHidden()

    // AK 2: Ein Drücken von Escape schließt den Lösch-Bestätigungsdialog der Haustiere-Seite.
    await list.deleteButton(1).click()
    await expect(loeschen.dialog).toBeVisible()
    await loeschen.pressEscape()
    await expect(loeschen.dialog).toBeHidden()
  })
})
