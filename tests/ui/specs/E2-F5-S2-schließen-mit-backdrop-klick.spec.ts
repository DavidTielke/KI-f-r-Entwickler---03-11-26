// specs/E2-F5-S2-schließen-mit-backdrop-klick.spec.ts
//
// Story: specs/E2 Haustiere/F5 Modal-Verhalten/S2 Schließen mit Backdrop-Klick.md
//
// Gruppe 1 „Backdrop-Klick schließt die Dialoge"  → AK 1, 2, 3

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierLoeschDialog } from '../pages/HaustierLoeschDialog'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S2 Schließen mit Backdrop-Klick', () => {
  /**
   * Deckt ab:
   * - AK 1: Ein Klick auf die Backdrop außerhalb des Dialogs schließt den Anlegen-/Bearbeiten-Dialog der Haustiere-Seite.
   * - AK 2: Ein Klick auf die Backdrop außerhalb des Dialogs schließt den Lösch-Bestätigungsdialog der Haustiere-Seite.
   * - AK 3: Ein Klick innerhalb des Dialogs schließt den Dialog nicht.
   */
  test('Backdrop-Klick schließt die Dialoge', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)
    const loeschen = new HaustierLoeschDialog(page)

    // AK 1: Ein Klick auf die Backdrop außerhalb des Dialogs schließt den Anlegen-/Bearbeiten-Dialog.
    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await expect(form.dialog).toBeVisible()
    await form.clickBackdrop()
    await expect(form.dialog).toBeHidden()

    // AK 2: Ein Klick auf die Backdrop außerhalb des Dialogs schließt den Lösch-Bestätigungsdialog.
    await list.deleteButton(1).click()
    await expect(loeschen.dialog).toBeVisible()
    await loeschen.clickBackdrop()
    await expect(loeschen.dialog).toBeHidden()

    // AK 3: Ein Klick innerhalb des Dialogs schließt den Dialog nicht.
    await list.editButton(1).click() // Fiete
    await expect(form.dialog).toBeVisible()
    await form.dialog.getByText('Haustier 1 bearbeiten').click() // Klick auf den Titel (innerhalb des Dialogs)
    await expect(form.dialog).toBeVisible()
  })
})
