// specs/E2-F2-S4-api-fehler-im-dialog.spec.ts
//
// Story: specs/E2 Haustiere/F2 Haustier anlegen/S4 API-Fehler im Dialog.md
//
// Gruppe 1 „Fehler beim Anlegen"  → AK 1, 2, 3

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S4 API-Fehler im Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei einem fehlschlagenden Anlegen bleibt der Dialog geöffnet.
   * - AK 2: Der Dialog zeigt die Fehlermeldung des Backends unter den Formularfeldern an.
   * - AK 3: Nach der Fehlermeldung ist das Formular erneut absendbar.
   */
  test('Fehler beim Anlegen', async ({ page }) => {
    // Die erste Anlegen-Anfrage scheitert mit einem nackten HTTP-Fehler,
    // die zweite (erneutes Absenden) wird an das Backend weitergereicht.
    let postCount = 0
    await page.route('**/api/pets*', async (route) => {
      if (route.request().method() === 'POST') {
        postCount++
        if (postCount === 1) {
          await route.fulfill({ status: 400, body: 'Fehler beim Anlegen' })
          return
        }
      }
      await route.continue()
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await form.nameInput.fill('Bella')
    await form.speciesSelect.selectOption({ label: 'Katze' })
    await form.submit.click()

    // AK 1: Bei einem fehlschlagenden Anlegen bleibt der Dialog geöffnet.
    await expect(form.dialog).toBeVisible()

    // AK 2: Der Dialog zeigt die Fehlermeldung des Backends unter den Formularfeldern an.
    await expect(form.error('HTTP 400')).toBeVisible()

    // AK 3: Nach der Fehlermeldung ist das Formular erneut absendbar.
    await form.submit.click()
    await expect(form.dialog).toBeHidden()
    await expect(list.row('Bella')).toBeVisible()
  })
})
