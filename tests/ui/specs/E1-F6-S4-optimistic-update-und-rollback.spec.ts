// specs/E1-F6-S4-optimistic-update-und-rollback.spec.ts
//
// Story: specs/E1 Personen/F6 Reihenfolge verwalten/S4 Optimistic Update und Rollback.md
//
// Gruppe 1 „Optimistic Update"        → AK 1, 2
// Gruppe 2 „Fehler: Rollback + Meldung" → AK 3, 4

import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'

async function rowNames(page: Page): Promise<string[]> {
  const rows = page.getByRole('row')
  const count = await rows.count()
  const names: string[] = []
  for (let i = 1; i < count; i++) {
    names.push((await rows.nth(i).getByRole('cell').nth(2).innerText()).trim())
  }
  return names
}

test.describe('S4 Optimistic Update und Rollback', () => {
  /**
   * Deckt ab:
   * - AK 1: Das Frontend passt die lokale Zeilenreihenfolge vor der Backend-Antwort an.
   * - AK 2: Das Frontend sendet eine PATCH /api/persons/reorder mit der vollständigen ID-Liste.
   */
  test('Optimistic Update', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const patches: unknown[] = []
    let patchDone = false
    await page.route('**/api/persons/reorder', (route) => {
      patches.push(route.request().postDataJSON())
      // Die Antwort wird künstlich verzögert, damit der Optimistic-Update-Zustand beobachtbar bleibt.
      setTimeout(() => {
        patchDone = true
        void route.fulfill({ status: 204 })
      }, 300)
    })
    await page.goto('/')
    await persons.open()

    await persons.moveButton('Jonas Weber', 'oben').click()

    // AK 1: Die lokale Zeilenreihenfolge ist vor der Backend-Antwort angepasst.
    expect(await rowNames(page)).toEqual(['Jonas Weber', 'Anna Berger', 'Maria Schneider', 'Tom Krüger'])

    // AK 2: Die vollständige ID-Liste in der neuen Reihenfolge wird übertragen.
    await expect.poll(() => patches.length).toBe(1)
    expect(patches[0]).toEqual({ ids: [2, 1, 4, 3] })

    // Antwort ausliefern, damit der Test sauber endet.
    await expect.poll(() => patchDone).toBe(true)
  })

  /**
   * Deckt ab:
   * - AK 3: Bei einem Fehler des Reorder-Endpunkts lädt das Frontend die Personenliste neu.
   * - AK 4: Bei einem Fehler zeigt die Seite die Fehlermeldung des Backends an.
   */
  test('Fehler: Rollback und Fehlermeldung', async ({ page }) => {
    const persons = new PersonenListPage(page)
    // Der Fehler wird als Problem-JSON mit einem `title` simuliert: der Endpunkt zeigt
    // genau diese Backend-Meldung an (Kontrakt aus F2 S4: Problem-JSON `title` → Anzeige).
    await page.route('**/api/persons/reorder', (route) =>
      route.fulfill({
        status: 400,
        contentType: 'application/problem+json',
        body: JSON.stringify({ title: 'Reihenfolge enthält doppelte oder fehlende Einträge.' }),
      })
    )
    let getPersons = 0
    page.on('request', (req) => {
      if (req.method() === 'GET' && /\/api\/persons(\?|$)/.test(req.url())) getPersons++
    })
    await page.goto('/')
    await persons.open()
    const initialGets = getPersons

    await persons.moveButton('Jonas Weber', 'oben').click()

    // AK 4: Die Fehlermeldung des Backends wird angezeigt.
    await expect(page.getByText('Reihenfolge enthält doppelte oder fehlende Einträge.')).toBeVisible()

    // AK 3: Die Personenliste wird nach dem Fehler neu geladen.
    await expect.poll(() => getPersons).toBeGreaterThan(initialGets)
  })
})
