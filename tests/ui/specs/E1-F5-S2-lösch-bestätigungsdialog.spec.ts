// specs/E1-F5-S2-lösch-bestätigungsdialog.spec.ts
//
// Story: specs/E1 Personen/F5 Person löschen/S2 Lösch-Bestätigungsdialog.md
//
// Gruppe 1 „Dialog-Anzeige"          → AK 1, 2, 3, 4, 5
// Gruppe 2 „Abbrechen vs. Bestätigen" → AK 6, 7

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonLoeschDialog } from '../pages/PersonLoeschDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S2 Lösch-Bestätigungsdialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Der Bestätigungsdialog zeigt eine Danger-Kachel mit dem Mülleimer-Icon.
   * - AK 2: Der Bestätigungsdialog zeigt den Titel „Person löschen.".
   * - AK 3: Der Bestätigungsdialog zeigt den Text „«{name}» (#{id}) wird dauerhaft gelöscht. Diese Aktion kann nicht rückgängig gemacht werden.".
   * - AK 4: Der Bestätigungsdialog enthält den Button „Abbrechen".
   * - AK 5: Der Bestätigungsdialog enthält den Danger-Button „Löschen".
   */
  test('Dialog-Anzeige', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const loesch = new PersonLoeschDialog(page)
    const anna = personsSeed[0]
    await persons.open()
    await persons.openDelete(anna)

    // AK 1: Danger-Kachel mit dem Mülleimer-Icon.
    await expect(loesch.dialog.locator('svg')).toHaveCount(1)

    // AK 2: Titel „Person löschen.".
    await expect(loesch.dialog.getByText('Person löschen', { exact: false })).toBeVisible()

    // AK 3: Text mit Name, ID und „wird dauerhaft gelöscht".
    await expect(loesch.dialog.getByText(/Anna Berger.*#1.*wird dauerhaft gelöscht/)).toBeVisible()

    // AK 4: Button „Abbrechen".
    await expect(loesch.cancelButton).toBeVisible()

    // AK 5: Danger-Button „Löschen".
    await expect(loesch.deleteButton).toBeVisible()
    await expect(loesch.deleteButton).toHaveClass(/danger/)
  })

  /**
   * Deckt ab:
   * - AK 6: „Abbrechen" schließt den Bestätigungsdialog ohne Löschung.
   * - AK 7: Das Löschen wird erst durch den Button „Löschen" ausgelöst.
   */
  test('Abbrechen vs. Bestätigen', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const loesch = new PersonLoeschDialog(page)
    const anna = personsSeed[0]
    await persons.open()

    // AK 6: „Abbrechen" schließt den Dialog ohne Löschung.
    await persons.openDelete(anna)
    await loesch.cancel()
    await expect(loesch.dialog).toHaveCount(0)
    await expect(persons.row(anna.name)).toBeVisible()

    // AK 7: Das Löschen wird erst durch den Button „Löschen" ausgelöst.
    await persons.openDelete(anna)
    await expect(persons.row(anna.name)).toBeVisible()
    await loesch.confirm()
    await expect(persons.row(anna.name)).toHaveCount(0)
  })
})
