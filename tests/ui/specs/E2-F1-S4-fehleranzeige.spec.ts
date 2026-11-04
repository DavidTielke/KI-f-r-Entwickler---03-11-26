// specs/E2-F1-S4-fehleranzeige.spec.ts
//
// Story: specs/E2 Haustiere/F1 Haustier-Übersicht/S4 Fehleranzeige.md
//
// Gruppe 1 „Fehlermeldung des Backends beim Laden" → AK 1, 2
// Gruppe 2 „HTTP-Fehler ohne Problem-JSON"        → AK 3, 4

import { expect, test } from '../fixtures/test'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S4 Fehleranzeige', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei einem fehlschlagenden API-Request zeigt die Seite die Fehlermeldung des Backends über der Tabellenkarte an.
   * - AK 2: Das Backend liefert Validierungs- und Domfehler als Problem-JSON; die Seite zeigt den Text aus `title` bzw. die zusammengefassten `errors` an.
   */
  test('Fehlermeldung des Backends beim Laden', async ({ page }) => {
    const list = new HaustierListPage(page)

    // Problem-JSON mit `title`: die Seite zeigt den Text aus `title` an.
    await page.route('**/api/pets*', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/problem+json',
        body: JSON.stringify({ title: 'Fehler beim Laden der Haustierliste.' }),
      })
    })
    await list.open()

    // AK 1: Bei einem fehlschlagenden API-Request zeigt die Seite die Fehlermeldung des Backends über der Tabellenkarte an.
    // AK 2 (title-Fall): ... die Seite zeigt den Text aus `title` an.
    await expect(page.getByText('Fehler beim Laden der Haustierliste.', { exact: true })).toBeVisible()

    // Problem-JSON mit `errors`: die Seite zeigt die zusammengefassten `errors` an.
    await page.route('**/api/pets*', async (route) => {
      await route.fulfill({
        status: 400,
        contentType: 'application/problem+json',
        body: JSON.stringify({ errors: { Name: ['Name darf nicht leer sein.'] } }),
      })
    })
    await page.reload()
    await list.openPetsView()

    // AK 2 (errors-Fall): ... bzw. die zusammengefassten `errors` an.
    await expect(page.getByText('Name darf nicht leer sein.', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 3: Bei einem HTTP-Fehler ohne Problem-JSON zeigt die Seite „HTTP {Statuscode}" an.
   * - AK 4: Die Fehlermeldung verschwindet, wenn die nächste erfolgreiche Anfrage abgeschlossen ist.
   */
  test('HTTP-Fehler ohne Problem-JSON', async ({ page }) => {
    const list = new HaustierListPage(page)

    await page.route('**/api/pets*', async (route) => {
      await route.fulfill({ status: 503, body: 'Service nicht erreichbar' })
    })
    await list.open()

    // AK 3: Bei einem HTTP-Fehler ohne Problem-JSON zeigt die Seite „HTTP {Statuscode}" an.
    await expect(page.getByText('HTTP 503', { exact: true })).toBeVisible()

    // AK 4: Die Fehlermeldung verschwindet, wenn die nächste erfolgreiche Anfrage abgeschlossen ist.
    await page.unroute('**/api/pets*')
    await page.reload()
    await list.openPetsView()
    await expect(page.getByText('HTTP 503', { exact: true })).toBeHidden()
    await expect(list.counter('3 Haustiere')).toBeVisible()
  })
})
