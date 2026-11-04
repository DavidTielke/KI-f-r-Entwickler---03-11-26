// specs/E1-F2-S3-leerzustand.spec.ts
//
// Story: specs/E1 Personen/F2 Personen-Übersicht/S3 Leerzustand.md
//
// Gruppe 1 „Leerer Bestand" → AK 1, 2, 3, 4

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { PersonLoeschDialog } from '../pages/PersonLoeschDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S3 Leerzustand', () => {
  /**
   * Deckt ab:
   * - AK 1: Die Tabelle wird nicht angezeigt, wenn keine Personen persistiert sind.
   * - AK 2: Der Leerzustand zeigt den Titel „Noch keine Personen.".
   * - AK 3: Der Leerzustand zeigt den Hinweis „Legen Sie über die Aktion Anlegen die erste Person an.".
   * - AK 4: Nach dem Anlegen der ersten Person zeigt die Karte die Tabelle statt des Leerzustands.
   */
  test('Leerer Bestand', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const loesch = new PersonLoeschDialog(page)
    await persons.open()

    // Alle Basis-Personen löschen, um den Leerzustand herzustellen.
    for (const p of personsSeed) {
      await persons.openDelete(p)
      await loesch.confirm()
    }

    // AK 1: Die Tabelle wird nicht angezeigt, wenn keine Personen persistiert sind.
    await expect(page.getByRole('table')).toHaveCount(0)

    // AK 2: Der Leerzustand zeigt den Titel „Noch keine Personen.".
    await expect(page.getByText('Noch keine Personen', { exact: false })).toBeVisible()

    // AK 3: Der Leerzustand zeigt den Hinweis „Legen Sie über die Aktion Anlegen die erste Person an.".
    await expect(page.getByText('Legen Sie über die Aktion Anlegen die erste Person an.')).toBeVisible()

    // AK 4: Nach dem Anlegen der ersten Person zeigt die Karte die Tabelle statt des Leerzustands.
    await form.openCreate()
    await form.fill('P1', '20')
    await form.submit('Anlegen')
    await expect(persons.table).toBeVisible()
    await expect(page.getByText('Noch keine Personen', { exact: false })).toHaveCount(0)
  })
})
