// specs/E1-F6-S2-verschieben-per-pfeil-buttons.spec.ts
//
// Story: specs/E1 Personen/F6 Reihenfolge verwalten/S2 Verschieben per Pfeil-Buttons.md
//
// Gruppe 1 „Pfeil-Buttons und Grenzanzeige" → AK 1, 2, 3
// Gruppe 2 „Tausch und Übertragung"          → AK 4, 5, 6

import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { personsSeed } from '../fixtures/seed'

async function rowNames(page: Page): Promise<string[]> {
  const rows = page.getByRole('row')
  const count = await rows.count()
  const names: string[] = []
  for (let i = 1; i < count; i++) {
    names.push((await rows.nth(i).getByRole('cell').nth(2).innerText()).trim())
  }
  return names
}

test.describe('S2 Verschieben per Pfeil-Buttons', () => {
  /**
   * Deckt ab:
   * - AK 1: Jede Zeile zeigt einen Pfeil-Button „nach oben" und einen Pfeil-Button „nach unten".
   * - AK 2: Der Pfeil-Button „nach oben" ist bei der obersten Zeile deaktiviert.
   * - AK 3: Der Pfeil-Button „nach unten" ist bei der untersten Zeile deaktiviert.
   */
  test('Pfeil-Buttons und Grenzanzeige', async ({ page }) => {
    const persons = new PersonenListPage(page)
    await persons.open()

    // AK 1: Jede Zeile zeigt einen Pfeil-Button „nach oben" und einen Pfeil-Button „nach unten".
    for (const p of personsSeed) {
      await expect(persons.moveButton(p.name, 'oben')).toHaveCount(1)
      await expect(persons.moveButton(p.name, 'unten')).toHaveCount(1)
    }

    const order = await rowNames(page)
    const topName = order[0]
    const bottomName = order[order.length - 1]

    // AK 2: „nach oben" ist bei der obersten Zeile deaktiviert.
    await expect(persons.moveButton(topName, 'oben')).toBeDisabled()

    // AK 3: „nach unten" ist bei der untersten Zeile deaktiviert.
    await expect(persons.moveButton(bottomName, 'unten')).toBeDisabled()
  })

  /**
   * Deckt ab:
   * - AK 4: „nach oben" tauscht die Zeile mit der vorherigen Zeile.
   * - AK 5: „nach unten" tauscht die Zeile mit der nächsten Zeile.
   * - AK 6: Nach dem Tausch wird die neue Reihenfolge an das Backend übertragen.
   */
  test('Tausch und Übertragung', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const patches: unknown[] = []
    await page.route('**/api/persons/reorder', (route) => {
      patches.push(route.request().postDataJSON())
      return route.continue()
    })
    await page.goto('/')
    await persons.open()

    // AK 4: „nach oben" tauscht die Zeile mit der vorherigen Zeile.
    await persons.moveButton('Jonas Weber', 'oben').click()
    expect(await rowNames(page)).toEqual(['Jonas Weber', 'Anna Berger', 'Maria Schneider', 'Tom Krüger'])

    // AK 5: „nach unten" tauscht die Zeile mit der nächsten Zeile.
    await persons.moveButton('Anna Berger', 'unten').click()
    expect(await rowNames(page)).toEqual(['Jonas Weber', 'Maria Schneider', 'Anna Berger', 'Tom Krüger'])

    // AK 6: Nach dem Tausch wird die neue Reihenfolge an das Backend übertragen.
    await expect.poll(() => patches.length).toBeGreaterThanOrEqual(2)
    expect(patches.at(-1)).toEqual({ ids: [2, 4, 1, 3] })
  })
})
