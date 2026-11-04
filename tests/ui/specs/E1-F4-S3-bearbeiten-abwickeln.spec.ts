// specs/E1-F4-S3-bearbeiten-abwickeln.spec.ts
//
// Story: specs/E1 Personen/F4 Person bearbeiten/S3 Bearbeiten abwickeln.md
//
// Gruppe 1 „Speichern-Flow"                     → AK 1, 2, 4, 5, 6
// Gruppe 2 „Speichern-Feedback und 204-Vertrag" → AK 3, 7
// (AK 8 „404 bei nicht mehr vorhandener Person" ist Backend-Vertrag; UI-Folge wird in F4 S4 geprüft.)

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { personsSeed } from '../fixtures/seed'

test.describe('S3 Bearbeiten abwickeln', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei gültiger Eingabe sendet der Dialog eine `PUT /api/persons/{id}`-Anfrage mit `Name` und `Age`.
   * - AK 2: Das Backend aktualisiert `Name` und `Age` der Person (sichtbar über AK 6).
   * - AK 4: Nach erfolgreichem Speichern schließt sich der Dialog.
   * - AK 5: Nach erfolgreichem Speichern wird die Personenliste neu geladen (sichtbar über AK 6).
   * - AK 6: Die geänderten Werte sind in der Liste sichtbar.
   */
  test('Speichern-Flow', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const anna = personsSeed[0]
    let putReq!: { url: string; method: string; body: unknown }
    await page.route('**/api/persons/**', (route) => {
      if (route.request().method() === 'PUT') {
        putReq = { url: route.request().url(), method: route.request().method(), body: route.request().postDataJSON() }
      }
      return route.continue()
    })
    await page.goto('/')
    await persons.openEdit(anna)
    await form.nameField.fill('Anja Berger')
    await form.submit('Speichern')

    // AK 1: PUT /api/persons/{id} mit Name und Age.
    expect(putReq.method).toBe('PUT')
    expect(putReq.url).toContain('/api/persons/1')
    expect(putReq.body).toHaveProperty('name', 'Anja Berger')
    expect(putReq.body).toHaveProperty('age', anna.age)

    // AK 4: Nach erfolgreichem Speichern schließt sich der Dialog.
    await expect(form.dialog).toHaveCount(0)

    // AK 2 + AK 5 + AK 6: Die geänderten Werte sind in der (neu geladenen) Liste sichtbar.
    await expect(page.getByRole('row', { name: 'Anja Berger' })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 3: Das Backend antwortet mit `204 No Content`.
   * - AK 7: Während des Speicherns ist der Submit-Button deaktiviert und zeigt „Wird gespeichert …".
   */
  test('Speichern-Feedback und 204-Vertrag', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const anna = personsSeed[0]
    let putStatus!: number
    // Der PUT wird verzögert (damit der Speichern-Zustand abgreifbar ist), aber die echte Antwort geladen.
    await page.route('**/api/persons/**', async (route) => {
      if (route.request().method() === 'PUT') {
        await new Promise((resolve) => setTimeout(resolve, 1200))
        const resp = await route.fetch()
        putStatus = resp.status()
        return route.fulfill({ response: resp })
      }
      return route.continue()
    })
    await page.goto('/')
    await persons.openEdit(anna)
    await form.nameField.fill('Anja Berger')
    await form.submit('Speichern')

    const saveButton = form.dialog.getByRole('button', { name: /Wird gespeichert/ })
    // AK 7: Während des Speicherns ist der Submit-Button deaktiviert und zeigt „Wird gespeichert …".
    await expect(saveButton).toBeDisabled()
    await expect(saveButton).toContainText('Wird gespeichert')

    // Speichern abwarten (Zeile zeigt den neuen Namen), dann den Status prüfen.
    await expect(page.getByRole('row', { name: 'Anja Berger' })).toBeVisible()
    // AK 3: Das Backend antwortet mit 204 No Content.
    expect(putStatus).toBe(204)
  })
})
