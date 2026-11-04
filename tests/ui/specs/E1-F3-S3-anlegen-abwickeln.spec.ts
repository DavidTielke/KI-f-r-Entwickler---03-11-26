// specs/E1-F3-S3-anlegen-abwickeln.spec.ts
//
// Story: specs/E1 Personen/F3 Person anlegen/S3 Anlegen abwickeln.md
//
// Gruppe 1 „Anlegen-Flow"        → AK 1, 2, 3, 5, 6, 7
// Gruppe 2 „Speichern-Feedback"  → AK 8, 9
// (AK 4 ist ein Backend-Vertrag „201 + Location-Header" → kein UI-Zustand, siehe _Backend.md)

import { expect, test } from '../fixtures/test'
import { PersonFormDialog } from '../pages/PersonFormDialog'

test.describe('S3 Anlegen abwickeln', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei gültiger Eingabe sendet der Dialog eine `POST /api/persons`-Anfrage mit `Name` und `Age`.
   * - AK 2: Das Backend legt die Person mit dem übergebenen `Name` und `Age` an (sichtbar über AK 7).
   * - AK 3: Die neu angelegte Person erhält den `Order`-Wert „aktuelle Anzahl der Personen + 1".
   * - AK 5: Nach erfolgreichem Anlegen schließt sich der Dialog.
   * - AK 6: Nach erfolgreichem Anlegen wird die Personenliste neu geladen (sichtbar über AK 7).
   * - AK 7: Die neu angelegte Person erscheint in der Liste.
   */
  test('Anlegen-Flow', async ({ page }) => {
    const form = new PersonFormDialog(page)
    let posted: unknown
    await page.route('**/api/persons', (route) => {
      if (route.request().method() === 'POST') posted = route.request().postDataJSON()
      return route.continue()
    })
    await page.goto('/')
    await form.openCreate()
    await form.fill('Neu', '30')
    await form.submit('Anlegen')

    // AK 1: POST /api/persons mit Name und Age.
    expect(posted).toHaveProperty('name', 'Neu')
    expect(posted).toHaveProperty('age', 30)

    // AK 5: Nach erfolgreichem Anlegen schließt sich der Dialog.
    await expect(form.dialog).toHaveCount(0)

    // AK 2 + AK 6 + AK 7: Die neu angelegte Person erscheint (neu geladene Liste).
    await expect(page.getByRole('row', { name: 'Neu' })).toBeVisible()

    // AK 3: Die neue Person erhält Order = Anzahl + 1 und steht damit zuletzt in der Liste.
    await expect(page.getByRole('row').last()).toContainText('Neu')
  })

  /**
   * Deckt ab:
   * - AK 8: Während des Speicherns ist der Submit-Button deaktiviert.
   * - AK 9: Während des Speicherns zeigt der Submit-Button „Wird gespeichert …".
   *
   * (AK 4 „201 Created + Location-Header" ist ein Backend-Vertrag ohne UI-Zustand → nicht im UI-Test geprüft.)
   */
  test('Speichern-Feedback', async ({ page }) => {
    const form = new PersonFormDialog(page)
    // Der POST wird verzögert, damit der Speichern-Zustand abgreifbar ist.
    await page.route('**/api/persons', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((resolve) => setTimeout(resolve, 1200))
        return route.fulfill({ status: 201, contentType: 'application/json', body: 'null' })
      }
      return route.continue()
    })
    await page.goto('/')
    await form.openCreate()
    await form.fill('Neu', '30')
    await form.submit('Anlegen')

    const saveButton = form.dialog.getByRole('button', { name: /Wird gespeichert/ })
    // AK 8: Während des Speicherns ist der Submit-Button deaktiviert.
    await expect(saveButton).toBeDisabled()
    // AK 9: Während des Speicherns zeigt der Submit-Button „Wird gespeichert …".
    await expect(saveButton).toContainText('Wird gespeichert')
  })
})
