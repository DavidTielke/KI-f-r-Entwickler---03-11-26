// specs/E1-F3-S4-api-fehler-im-dialog.spec.ts
//
// Story: specs/E1 Personen/F3 Person anlegen/S4 API-Fehler im Dialog.md
//
// Gruppe 1 „Fehlschlagendes Anlegen" → AK 1, 2, 3

import { expect, test } from '../fixtures/test'
import { PersonFormDialog } from '../pages/PersonFormDialog'

test.describe('S4 API-Fehler im Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei einem fehlschlagenden Anlegen bleibt der Dialog geöffnet.
   * - AK 2: Der Dialog zeigt die Fehlermeldung des Backends unter den Formularfeldern an.
   * - AK 3: Nach der Fehlermeldung ist das Formular erneut absendbar.
   */
  test('Fehlschlagendes Anlegen', async ({ page }) => {
    const form = new PersonFormDialog(page)

    // POST schlägt erst einmal fehl (500 Problem-JSON).
    await page.route('**/api/persons', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 500,
          contentType: 'application/problem+json',
          body: JSON.stringify({ title: 'Speichern nicht möglich' }),
        })
      }
      return route.continue()
    })
    await page.goto('/')
    await form.openCreate()
    await form.fill('Neu', '30')
    await form.submit('Anlegen')

    // AK 1: Bei einem fehlschlagenden Anlegen bleibt der Dialog geöffnet.
    await expect(form.dialog).toHaveCount(1)

    // AK 2: Der Dialog zeigt die Fehlermeldung des Backends unter den Formularfeldern an.
    await expect(form.dialog.getByText('Speichern nicht möglich')).toBeVisible()

    // AK 3: Nach der Fehlermeldung ist das Formular erneut absendbar (nächster POST erfolgreich).
    await page.route('**/api/persons', (route) => {
      route.continue()
    })
    await form.submit('Anlegen')
    await expect(form.dialog).toHaveCount(0)
  })
})
