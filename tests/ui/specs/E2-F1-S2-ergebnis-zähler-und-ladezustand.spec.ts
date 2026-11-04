// specs/E2-F1-S2-ergebnis-zähler-und-ladezustand.spec.ts
//
// Story: specs/E2 Haustiere/F1 Haustier-Übersicht/S2 Ergebnis-Zähler und Ladezustand.md
//
// Gruppe 1 „Wartehinweis während des Ladens"  → AK 1
// Gruppe 2 „Zähler zeigt die Anzahl"          → AK 2, 3, 4, 5

import { expect, test } from '../fixtures/test'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S2 Ergebnis-Zähler und Ladezustand', () => {
  /**
   * Deckt ab:
   * - AK 1: Der Tabellenkopf zeigt während des Ladens „Wird geladen …".
   */
  test('Wartehinweis während des Ladens', async ({ page }) => {
    const list = new HaustierListPage(page)

    // Die Liste-Anfrage wird verzögert, damit der Ladezustand beobachtbar wird.
    await page.route('**/api/pets*', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000))
      await route.continue()
    })
    await list.open()

    // AK 1: Der Tabellenkopf zeigt während des Ladens „Wird geladen …".
    await expect(list.counter('Wird geladen …')).toBeVisible()
    await expect(list.counter('Wird geladen …')).toBeHidden()
  })

  /**
   * Deckt ab:
   * - AK 2: Nach dem Laden zeigt der Tabellenkopf die Anzahl der geladenen Haustiere.
   * - AK 3: Bei null Haustieren lautet der Zähler „0 Haustiere".
   * - AK 4: Bei einem Haustier lautet der Zähler „1 Haustier".
   * - AK 5: Bei mehreren Haustieren lautet der Zähler „{n} Haustiere".
   */
  test('Zähler zeigt die Anzahl', async ({ page, request }) => {
    const list = new HaustierListPage(page)
    await list.open()

    // AK 2: Nach dem Laden zeigt der Tabellenkopf die Anzahl der geladenen Haustiere.
    await expect(list.counter('3 Haustiere')).toBeVisible()

    // AK 5: Bei mehreren Haustieren lautet der Zähler „{n} Haustiere".
    expect((await request.post('/api/pets', { data: { name: 'Mia', species: 'Katze', personId: null } })).ok()).toBeTruthy()
    await page.reload()
    await list.openPetsView()
    await expect(list.counter('4 Haustiere')).toBeVisible()

    // AK 3: Bei null Haustieren lautet der Zähler „0 Haustiere".
    for (const id of [1, 2, 3, 4]) {
      expect((await request.delete(`/api/pets/${id}`)).ok()).toBeTruthy()
    }
    await page.reload()
    await list.openPetsView()
    await expect(list.counter('0 Haustiere')).toBeVisible()

    // AK 4: Bei einem Haustier lautet der Zähler „1 Haustier".
    expect((await request.post('/api/pets', { data: { name: 'Oskar', species: 'Hund', personId: null } })).ok()).toBeTruthy()
    await page.reload()
    await list.openPetsView()
    await expect(list.counter('1 Haustier')).toBeVisible()
  })
})
