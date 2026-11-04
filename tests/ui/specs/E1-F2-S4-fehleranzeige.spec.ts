// specs/E1-F2-S4-fehleranzeige.spec.ts
//
// Story: specs/E1 Personen/F2 Personen-Übersicht/S4 Fehleranzeige.md
//
// Gruppe 1 „Fehlermeldung aus Problem-JSON" → AK 1, 2
// Gruppe 2 „HTTP-Fehler ohne Problem-JSON und Aufräumen" → AK 3, 4

import { expect, test } from '../fixtures/test'

test.describe('S4 Fehleranzeige', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei einem fehlschlagenden API-Request zeigt die Seite die Fehlermeldung des Backends an.
   * - AK 2: Das Backend liefert Validierungs- und Domfehler als Problem-JSON; die Seite zeigt
   *   den Text aus `title` bzw. die zusammengefassten `errors` an.
   *
   * Hinweis: „über der Tabellenkarte" ist eine Layout-Eigenschaft, die nicht per Rolle abgreifbar ist;
   * geprüft wird, dass die Backend-Fehlermeldung im Hauptbereich sichtbar ist.
   */
  test('Fehlermeldung aus Problem-JSON', async ({ page }) => {
    // Sub-Szenario A: Problem-JSON mit `title` → AK 1 (Fehlermeldung wird angezeigt) und AK 2 (title wird angezeigt).
    await page.route('**/api/persons', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/problem+json',
        body: JSON.stringify({ title: 'Interne Fehlermeldung' }),
      })
    )
    await page.goto('/')
    await expect(page.getByText('Interne Fehlermeldung')).toBeVisible()

    // Sub-Szenario B: Problem-JSON mit `errors` → AK 2 (zusammengefasste errors werden angezeigt).
    await page.route('**/api/persons', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/problem+json',
        body: JSON.stringify({ errors: { feld: ['Ursache A', 'Ursache B'] } }),
      })
    )
    await page.goto('/')
    await expect(page.getByText('Ursache A, Ursache B')).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 3: Bei einem HTTP-Fehler ohne Problem-JSON zeigt die Seite „HTTP {Statuscode}" an.
   * - AK 4: Die Fehlermeldung verschwindet, wenn die nächste erfolgreiche Anfrage abgeschlossen ist.
   */
  test('HTTP-Fehler ohne Problem-JSON und Aufräumen', async ({ page }) => {
    // Sub-Szenario C: nackter HTTP-Fehler (kein Problem-JSON) → AK 3.
    await page.route('**/api/persons', (route) => route.fulfill({ status: 500, body: 'Fehler' }))
    await page.goto('/')
    await expect(page.getByText('HTTP 500')).toBeVisible()

    // Sub-Szenario D: nächste erfolgreiche Anfrage → AK 4 (Fehlermeldung verschwindet).
    await page.route('**/api/persons', (route) => route.continue())
    await page.goto('/')
    await expect(page.getByText('HTTP 500')).toHaveCount(0)
  })
})
