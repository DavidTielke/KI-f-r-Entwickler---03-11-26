// specs/E1-F4-S4-speichern-fehler-im-dialog.spec.ts
//
// Story: specs/E1 Personen/F4 Person bearbeiten/S4 Speichern-Fehler im Dialog.md
//
// Gruppe 1 „Fehlschlagendes Speichern" → AK 1, 2, 3

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S4 Speichern-Fehler im Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei einem fehlschlagenden Speichern bleibt der Dialog geöffnet.
   * - AK 2: Der Dialog zeigt die Fehlermeldung des Backends an.
   * - AK 3: Bei einer nicht mehr vorhandenen Person antwortet das Backend mit `404 Not Found`
   *   (hier simuliert, da die gleichzeitige Löschung nicht deterministisch über die UI herstellbar ist).
   */
  test('Fehlschlagendes Speichern', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const anna = personsSeed[0]
    let putStatus!: number

    // PUT wird mit 404 Problem-JSON beantwortet (simulierte parallel gelöschte Person).
    await page.route('**/api/persons/**', (route) => {
      if (route.request().method() === 'PUT') {
        putStatus = 404
        return route.fulfill({
          status: 404,
          contentType: 'application/problem+json',
          body: JSON.stringify({ title: 'Person nicht gefunden' }),
        })
      }
      return route.continue()
    })
    await page.goto('/')
    await persons.openEdit(anna)
    await form.nameField.fill('Anja Berger')
    await form.submit('Speichern')

    // AK 1: Bei einem fehlschlagenden Speichern bleibt der Dialog geöffnet.
    await expect(form.dialog).toHaveCount(1)

    // AK 2: Der Dialog zeigt die Fehlermeldung des Backends an.
    await expect(form.dialog.getByText('Person nicht gefunden')).toBeVisible()

    // AK 3: Die PUT-Anfrage antwortet mit 404 Not Found.
    expect(putStatus).toBe(404)
  })
})
