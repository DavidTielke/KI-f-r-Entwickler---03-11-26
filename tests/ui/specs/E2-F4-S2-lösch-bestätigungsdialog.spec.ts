// specs/E2-F4-S2-lösch-bestätigungsdialog.spec.ts
//
// Story: specs/E2 Haustiere/F4 Haustier löschen/S2 Lösch-Bestätigungsdialog.md
//
// Gruppe 1 „Inhalt des Lösch-Dialogs"  → AK 1, 2, 3
// Gruppe 2 „Buttons und Abbrechen"    → AK 4, 5, 6, 7
//
// Hinweis: Die Danger-Variante des Bestätigungsbuttons (AK 5, 2. Absatz) ist ein reines
// Styling-Kriterium ohne unterscheidbaren Web-First-Ausdruck und wird nicht separat
// per Web-First-Assertion geprüft (Kriterium 11, Abschnitt „Styling").

import { expect, test } from '../fixtures/test'
import { HaustierLoeschDialog } from '../pages/HaustierLoeschDialog'
import { HaustierListPage } from '../pages/HaustierListPage'
import { petsSeed } from '../fixtures/seed'

test.describe('S2 Lösch-Bestätigungsdialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Der Bestätigungsdialog zeigt eine Danger-Kachel mit dem Mülleimer-Icon.
   * - AK 2: Der Bestätigungsdialog zeigt den Titel „Haustier löschen.".
   * - AK 3: Der Bestätigungsdialog zeigt den Text „«{name}» (#{id}) wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
   */
  test('Inhalt des Lösch-Dialogs', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const loeschen = new HaustierLoeschDialog(page)

    await list.deleteButton(1).click() // Fiete

    // AK 1: Der Bestätigungsdialog zeigt eine Danger-Kachel mit dem Mülleimer-Icon.
    // (das Icon ist `aria-hidden`; genau ein SVG im Dialog ist die web-first Sichtbarkeit der Kachel)
    await expect(loeschen.dialog.locator('svg')).toHaveCount(1)

    // AK 2: Der Bestätigungsdialog zeigt den Titel „Haustier löschen.".
    await expect(loeschen.dialog.getByText('Haustier löschen')).toBeVisible()

    // AK 3: Der Bestätigungsdialog zeigt den Text „«{name}» (#{id}) wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden."
    await expect(loeschen.dialog.getByText('«Fiete» (#1) wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 4: Der Bestätigungsdialog enthält den Button „Abbrechen".
   * - AK 5: Der Bestätigungsdialog enthält den Danger-Button „Löschen" (Danger-Variante = Styling, nicht geprüft).
   * - AK 6: „Abbrechen" schließt den Bestätigungsdialog ohne Löschung.
   * - AK 7: Das Löschen wird erst durch den Button „Löschen" ausgelöst.
   */
  test('Buttons und Abbrechen', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const loeschen = new HaustierLoeschDialog(page)

    let deleteCount = 0
    page.on('request', (r) => {
      if (r.method() === 'DELETE' && r.url().includes('/api/pets')) {
        deleteCount++
      }
    })

    await list.deleteButton(1).click() // Fiete

    // AK 4: Der Bestätigungsdialog enthält den Button „Abbrechen".
    await expect(loeschen.cancel).toBeVisible()

    // AK 5: Der Bestätigungsdialog enthält den Danger-Button „Löschen" (Danger-Variante = Styling, nicht geprüft).
    await expect(loeschen.confirm).toBeVisible()

    // AK 6: „Abbrechen" schließt den Bestätigungsdialog ohne Löschung.
    await loeschen.cancel.click()
    await expect(loeschen.dialog).toBeHidden()
    await expect(list.table.getByRole('row')).toHaveCount(petsSeed.length + 1) // Bestand unverändert

    // AK 7: Das Löschen wird erst durch den Button „Löschen" ausgelöst.
    // Vor „Löschen": kein DELETE-Request; nach „Löschen": genau ein DELETE-Request.
    expect(deleteCount).toBe(0)
    await list.deleteButton(1).click()
    const del = page.waitForResponse((r) => r.request().method() === 'DELETE' && r.url().includes('/api/pets'))
    await loeschen.confirm.click()
    await del
    expect(deleteCount).toBe(1)
  })
})
