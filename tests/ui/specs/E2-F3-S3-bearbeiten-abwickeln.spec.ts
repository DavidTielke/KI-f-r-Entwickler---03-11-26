// specs/E2-F3-S3-bearbeiten-abwickeln.spec.ts
//
// Story: specs/E2 Haustiere/F3 Haustier bearbeiten/S3 Bearbeiten abwickeln.md
//
// Gruppe 1 „Änderung speichern"           → AK 1, 2, 3, 4, 5, 6
// Gruppe 2 „Während des Speicherns"       → AK 7
// Gruppe 3 „Haustier wurde parallel gelöscht" → AK 8

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S3 Bearbeiten abwickeln', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei gültiger Eingabe sendet der Dialog eine `PUT /api/pets/{id}`-Anfrage mit `Name`, `Species` und `PersonId`.
   * - AK 2: Das Backend aktualisiert `Name`, `Species` und `PersonId` des Haustiers.
   * - AK 3: Das Backend antwortet mit `204 No Content`.
   * - AK 4: Nach erfolgreichem Speichern schließt sich der Dialog.
   * - AK 5: Nach erfolgreichem Speichern wird die Haustierliste neu geladen.
   * - AK 6: Die geänderten Werte sind in der Liste sichtbar.
   */
  test('Änderung speichern', async ({ page }) => {
    // Vor dem ersten Laden registriert, damit auch der initiale Listen-Request gezählt wird.
    let petsGets = 0
    page.on('response', (r) => {
      if (r.request().method() === 'GET' && r.url().includes('/api/pets')) {
        petsGets++
      }
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.editButton(1).click() // Fiete
    await form.nameInput.fill('Fiete junior')
    await form.speciesSelect.selectOption({ label: 'Katze' })
    await form.personSelect.selectOption({ label: 'Jonas Weber' })

    const response = page.waitForResponse((r) => r.request().method() === 'PUT' && /\/api\/pets\/1$/.test(r.url()))
    await form.submit.click()
    const put = await response

    // AK 1: Bei gültiger Eingabe sendet der Dialog eine `PUT /api/pets/{id}`-Anfrage mit `Name`, `Species` und `PersonId`.
    const body = put.request().postDataJSON() as { name?: string; species?: string; personId?: number | null }
    expect(body).toMatchObject({ name: 'Fiete junior', species: 'Katze', personId: 2 })

    // AK 3: Das Backend antwortet mit `204 No Content`.
    expect(put.status()).toBe(204)

    // AK 4: Nach erfolgreichem Speichern schließt sich der Dialog.
    await expect(form.dialog).toBeHidden()

    // AK 5: Nach erfolgreichem Speichern wird die Haustierliste neu geladen.
    expect(petsGets).toBeGreaterThanOrEqual(2) // 1x initialer Load, 1x nach dem Speichern

    // AK 2: Das Backend aktualisiert `Name`, `Species` und `PersonId` des Haustiers.
    // AK 6: Die geänderten Werte sind in der Liste sichtbar.
    const row = list.table.getByRole('row', { name: 'Fiete junior' })
    await expect(row).toBeVisible()
    await expect(row.getByText('Katze', { exact: true })).toBeVisible()
    await expect(row.getByText('Jonas Weber', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 7: Während des Speicherns ist der Submit-Button deaktiviert und zeigt „Wird gespeichert …".
   */
  test('Während des Speicherns', async ({ page }) => {
    // Die Bearbeiten-Anfrage wird verzögert, damit der Speichern-Zustand beobachtbar wird.
    await page.route('**/api/pets/1*', async (route) => {
      if (route.request().method() === 'PUT') {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
      await route.continue()
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.editButton(1).click() // Fiete, unveränderte Werte
    await form.submit.click()

    // AK 7: Während des Speicherns ist der Submit-Button deaktiviert und zeigt „Wird gespeichert …".
    await expect(form.submit).toBeDisabled()
    await expect(form.submit).toHaveText('Wird gespeichert …')
    await expect(form.dialog).toBeHidden()
  })

  /**
   * Deckt ab:
   * - AK 8: Existiert das Haustier nicht mehr, antwortet das Backend mit `404 Not Found`.
   */
  test('Haustier wurde parallel gelöscht', async ({ page }) => {
    // Das Szenario „Haustier wurde parallel gelöscht" wird per Interception simuliert:
    // Die `PUT`-Anfrage erhält einen nackten 404-Antwort ohne Problem-JSON.
    await page.route('**/api/pets/1*', async (route) => {
      if (route.request().method() === 'PUT') {
        await route.fulfill({ status: 404, body: 'Not Found' })
        return
      }
      await route.continue()
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.editButton(1).click() // Fiete
    const response = page.waitForResponse((r) => r.request().method() === 'PUT' && /\/api\/pets\/1$/.test(r.url()))
    await form.submit.click()
    const put = await response

    // AK 8: Existiert das Haustier nicht mehr, antwortet das Backend mit `404 Not Found`
    //       (sichtbare Wirkung: der Dialog bleibt geöffnet und zeigt den nackten HTTP-Fehler).
    expect(put.status()).toBe(404)
    await expect(form.dialog).toBeVisible()
    await expect(form.error('HTTP 404')).toBeVisible()
  })
})
