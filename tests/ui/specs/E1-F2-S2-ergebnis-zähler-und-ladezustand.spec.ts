// specs/E1-F2-S2-ergebnis-zähler-und-ladezustand.spec.ts
//
// Story: specs/E1 Personen/F2 Personen-Übersicht/S2 Ergebnis-Zähler und Ladezustand.md
//
// Gruppe 1 „Ladezustand und Zähleranzeige"  → AK 1, 2
// Gruppe 2 „Zähler-Numeralform"             → AK 3, 4, 5

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { PersonLoeschDialog } from '../pages/PersonLoeschDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S2 Ergebnis-Zähler und Ladezustand', () => {
  /**
   * Deckt ab:
   * - AK 1: Der Tabellenkopf zeigt während des Ladens „Wird geladen …".
   * - AK 2: Nach dem Laden zeigt der Tabellenkopf die Anzahl der geladenen Personen.
   */
  test('Ladezustand und Zähleranzeige', async ({ page }) => {
    // Das Laden wird künstlich verzögert, damit der Ladezustand abgreifbar ist.
    await page.route('**/api/**', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.continue()
    })
    await page.goto('/')

    // AK 1: Der Tabellenkopf zeigt während des Ladens „Wird geladen …".
    await expect(page.getByText('Wird geladen')).toBeVisible()

    // AK 2: Nach dem Laden zeigt der Tabellenkopf die Anzahl der geladenen Personen.
    await expect(page.getByText(`${personsSeed.length} Personen`, { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 3: Bei null Personen lautet der Zähler „0 Personen".
   * - AK 4: Bei einer Person lautet der Zähler „1 Person".
   * - AK 5: Bei mehreren Personen lautet der Zähler „{n} Personen".
   */
  test('Zähler-Numeralform', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const loesch = new PersonLoeschDialog(page)
    await persons.open()

    // Ausgangszustand: mehrere Personen → Pluralform.
    // AK 5: Bei mehreren Personen lautet der Zähler „{n} Personen".
    await expect(page.getByText(`${personsSeed.length} Personen`, { exact: true })).toBeVisible()

    // Auf null Personen reduzieren (alle Basis-Personen löschen).
    for (const p of personsSeed) {
      await persons.openDelete(p)
      await loesch.confirm()
    }

    // AK 3: Bei null Personen lautet der Zähler „0 Personen".
    await expect(page.getByText('0 Personen', { exact: true })).toBeVisible()

    // Auf eine Person anlegen → Singularform.
    await form.openCreate()
    await form.fill('P1', '20')
    await form.submit('Anlegen')
    // AK 4: Bei einer Person lautet der Zähler „1 Person".
    await expect(page.getByText('1 Person', { exact: true })).toBeVisible()

    // Auf mehrere Personen anlegen → Pluralform.
    await form.openCreate()
    await form.fill('P2', '21')
    await form.submit('Anlegen')
    await expect(page.getByText('2 Personen', { exact: true })).toBeVisible()
  })
})
