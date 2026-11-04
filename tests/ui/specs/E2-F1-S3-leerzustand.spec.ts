// specs/E2-F1-S3-leerzustand.spec.ts
//
// Story: specs/E2 Haustiere/F1 Haustier-Übersicht/S3 Leerzustand.md
//
// Gruppe 1 „Leerzustand bei leerem Bestand"             → AK 1, 2, 3
// Gruppe 2 „Tabelle nach Anlegen des ersten Haustiers"  → AK 4

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'
import { petsSeed } from '../fixtures/seed'

test.describe('S3 Leerzustand', () => {
  /**
   * Deckt ab:
   * - AK 1: Die Tabelle wird nicht angezeigt, wenn keine Haustiere persistiert sind.
   * - AK 2: Der Leerzustand zeigt den Titel „Noch keine Haustiere.".
   * - AK 3: Der Leerzustand zeigt den Hinweis „Legen Sie über die Aktion Anlegen das erste Haustier an.".
   */
  test('Leerzustand bei leerem Bestand', async ({ page, request }) => {
    for (const pet of petsSeed) {
      expect((await request.delete(`/api/pets/${pet.id}`)).ok()).toBeTruthy()
    }

    const list = new HaustierListPage(page)
    await list.open()

    // AK 1: Die Tabelle wird nicht angezeigt, wenn keine Haustiere persistiert sind.
    await expect(list.table).toBeHidden()

    // AK 2: Der Leerzustand zeigt den Titel „Noch keine Haustiere.".
    await expect(page.getByText('Noch keine Haustiere')).toBeVisible()

    // AK 3: Der Leerzustand zeigt den Hinweis „Legen Sie über die Aktion Anlegen das erste Haustier an.".
    await expect(page.getByText('Legen Sie über die Aktion Anlegen das erste Haustier an.')).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 4: Nach dem Anlegen des ersten Haustiers zeigt die Karte die Tabelle statt des Leerzustands.
   */
  test('Tabelle nach Anlegen des ersten Haustiers', async ({ page, request }) => {
    for (const pet of petsSeed) {
      expect((await request.delete(`/api/pets/${pet.id}`)).ok()).toBeTruthy()
    }

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await form.nameInput.fill('Simba')
    await form.speciesSelect.selectOption({ label: 'Katze' })
    await form.submit.click()

    // AK 4: Nach dem Anlegen des ersten Haustiers zeigt die Karte die Tabelle statt des Leerzustands.
    await expect(page.getByText('Noch keine Haustiere')).toBeHidden()
    await expect(list.table).toBeVisible()
    await expect(list.row('Simba')).toBeVisible()
  })
})
