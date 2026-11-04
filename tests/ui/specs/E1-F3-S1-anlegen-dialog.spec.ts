// specs/E1-F3-S1-anlegen-dialog.spec.ts
//
// Story: specs/E1 Personen/F3 Person anlegen/S1 Anlegen-Dialog.md
//
// Gruppe 1 „Dialog-Anzeige und Titel" → AK 1, 2, 7
// Gruppe 2 „Feld Name"               → AK 3, 4
// Gruppe 3 „Feld Alter"              → AK 5, 6
// Gruppe 4 „Buttons und Abbrechen"   → AK 8, 9, 10

import { expect, test } from '../fixtures/test'
import { PersonFormDialog } from '../pages/PersonFormDialog'

test.describe('S1 Anlegen-Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Die Primäraktion „Anlegen" öffnet einen modalen Dialog.
   * - AK 2: Der Dialog zeigt den Titel „Person anlegen.".
   * - AK 7: Beim Öffnen des Dialogs liegt der Fokus im Feld `Name`.
   */
  test('Dialog-Anzeige und Titel', async ({ page }) => {
    const form = new PersonFormDialog(page)
    await page.goto('/')

    // AK 1: Die Primäraktion „Anlegen" öffnet einen modalen Dialog.
    await form.openCreate()
    await expect(form.dialog).toBeVisible()

    // AK 2: Der Dialog zeigt den Titel „Person anlegen.".
    await expect(form.dialog.getByText('Person anlegen', { exact: false })).toBeVisible()

    // AK 7: Beim Öffnen des Dialogs liegt der Fokus im Feld `Name`.
    await expect(form.nameField).toBeFocused()
  })

  /**
   * Deckt ab:
   * - AK 3: Der Dialog enthält das Feld `Name` als Textfeld mit dem Platzhalter „z. B. Alice".
   * - AK 4: Das Feld `Name` akzeptiert max. 150 Zeichen.
   */
  test('Feld Name', async ({ page }) => {
    const form = new PersonFormDialog(page)
    await page.goto('/')
    await form.openCreate()

    // AK 3: Der Dialog enthält das Feld `Name` als Textfeld mit dem Platzhalter „z. B. Alice".
    await expect(form.nameField).toHaveAttribute('type', 'text')
    await expect(form.nameField).toHaveAttribute('placeholder', 'z. B. Alice')

    // AK 4: Das Feld `Name` akzeptiert max. 150 Zeichen.
    await expect(form.nameField).toHaveAttribute('maxlength', '150')
  })

  /**
   * Deckt ab:
   * - AK 5: Der Dialog enthält das Feld `Alter` als Zahlenfeld mit dem Platzhalter „z. B. 30".
   * - AK 6: Das Feld `Alter` ist mit den Grenzen 0 bis 150 angegeben.
   */
  test('Feld Alter', async ({ page }) => {
    const form = new PersonFormDialog(page)
    await page.goto('/')
    await form.openCreate()

    // AK 5: Der Dialog enthält das Feld `Alter` als Zahlenfeld mit dem Platzhalter „z. B. 30".
    await expect(form.ageField).toHaveAttribute('type', 'number')
    await expect(form.ageField).toHaveAttribute('placeholder', 'z. B. 30')

    // AK 6: Das Feld `Alter` ist mit den Grenzen 0 bis 150 angegeben.
    await expect(form.ageField).toHaveAttribute('min', '0')
    await expect(form.ageField).toHaveAttribute('max', '150')
  })

  /**
   * Deckt ab:
   * - AK 8: Der Dialog enthält den Button „Abbrechen".
   * - AK 9: Der Dialog enthält den Submit-Button „Anlegen".
   * - AK 10: „Abbrechen" schließt den Dialog ohne Speicherung.
   */
  test('Buttons und Abbrechen', async ({ page }) => {
    const form = new PersonFormDialog(page)
    await page.goto('/')
    await form.openCreate()

    // AK 8: Der Dialog enthält den Button „Abbrechen".
    await expect(form.cancelButton).toBeVisible()

    // AK 9: Der Dialog enthält den Submit-Button „Anlegen".
    await expect(form.dialog.getByRole('button', { name: 'Anlegen' })).toBeVisible()

    // AK 10: „Abbrechen" schließt den Dialog ohne Speicherung.
    await form.fill('Test', '99')
    await form.cancelButton.click()
    await expect(form.dialog).toHaveCount(0)
    await expect(page.getByRole('row', { name: 'Test' })).toHaveCount(0)
  })
})
