// specs/E2-F3-S4-speichern-fehler-im-dialog.spec.ts
//
// Story: specs/E2 Haustiere/F3 Haustier bearbeiten/S4 Speichern-Fehler im Dialog.md
//
// Gruppe 1 „Fehler beim Speichern"            → AK 1, 2
// Gruppe 2 „1:1-Konflikt"                    → AK 3
// Gruppe 3 „Haustier nicht mehr vorhanden"   → AK 4

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S4 Speichern-Fehler im Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei einem fehlschlagenden Speichern bleibt der Dialog geöffnet.
   * - AK 2: Der Dialog zeigt die Fehlermeldung des Backends an.
   */
  test('Fehler beim Speichern', async ({ page }) => {
    // Ein nackter 500-Fehler ohne Problem-JSON wird per Interception simuliert;
    // die Seite zeigt dann die Rückfalloption „HTTP 500" an.
    await page.route('**/api/pets/1*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 500, body: 'Internal Server Error' })
        return
      }
      await route.continue()
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.editButton(1).click() // Fiete
    await form.nameInput.fill('Fiete II')
    const response = page.waitForResponse((r) => r.request().method() === 'PUT' && /\/api\/pets\/1$/.test(r.url()))
    await form.submit.click()
    const put = await response

    // AK 1: Bei einem fehlschlagenden Speichern bleibt der Dialog geöffnet.
    await expect(form.dialog).toBeVisible()

    // AK 2: Der Dialog zeigt die Fehlermeldung des Backends an.
    // (nackter 500-Fehler ohne Problem-JSON → Rückfallmeldung „HTTP 500".)
    expect(put.status()).toBe(500)
    await expect(form.error('HTTP 500')).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 3: Bei einem 1:1-Konflikt (die Person hat bereits ein anderes Haustier) antwortet das Backend mit `400 Bad Request`.
   */
  test('1:1-Konflikt', async ({ page }) => {
    // Ein 1:1-Konflikt (eine Person mit bereits anderem Haustier) kann im Bearbeiten-Dialog
    // clientseitig nicht ausgewählt werden, weil die Person ausgegraut ist (siehe F3 S2).
    // Der serverseitige Konfliktfall wird daher per Interception simuliert:
    // Das Backend antwortet mit `400 Bad Request` (Problem-JSON wie bei der echten 1:1-Verletzung).
    await page.route('**/api/pets/1*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({
          status: 400,
          contentType: 'application/problem+json',
          body: JSON.stringify({ title: 'Die Person hat bereits ein Haustier.' }),
        })
        return
      }
      await route.continue()
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.editButton(1).click() // Fiete
    await form.nameInput.fill('Fiete II')
    const response = page.waitForResponse((r) => r.request().method() === 'PUT' && /\/api\/pets\/1$/.test(r.url()))
    await form.submit.click()
    const put = await response

    // AK 3: Bei einem 1:1-Konflikt (die Person hat bereits ein anderes Haustier)
    //       antwortet das Backend mit `400 Bad Request` (sichtbare Wirkung: Fehlermeldung im Dialog).
    expect(put.status()).toBe(400)
    await expect(form.error('Die Person hat bereits ein Haustier.')).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 4: Bei einem nicht mehr vorhandenen Haustier antwortet das Backend mit `404 Not Found`.
   */
  test('Haustier nicht mehr vorhanden', async ({ page }) => {
    // Das Szenario „Haustier wurde parallel gelöscht" wird per Interception simuliert:
    // Die `PUT`-Anfrage erhält einen nackten 404-Antwort ohne Problem-JSON.
    await page.route('**/api/pets/2*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 404, body: 'Not Found' })
        return
      }
      await route.continue()
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.editButton(2).click() // Minka
    const response = page.waitForResponse((r) => r.request().method() === 'PUT' && /\/api\/pets\/2$/.test(r.url()))
    await form.submit.click()
    const put = await response

    // AK 4: Bei einem nicht mehr vorhandenen Haustier antwortet das Backend mit `404 Not Found`
    //       (sichtbare Wirkung: Dialog bleibt geöffnet, Fehlermeldung „HTTP 404").
    expect(put.status()).toBe(404)
    await expect(form.dialog).toBeVisible()
    await expect(form.error('HTTP 404')).toBeVisible()
  })
})
