// specs/E1-F3-S2-validierung-des-anlegen-dialogs.spec.ts
//
// Story: specs/E1 Personen/F3 Person anlegen/S2 Validierung des Anlegen-Dialogs.md
//
// Gruppe 1 „Name-Validierung"   → AK 1, 2, 3
// Gruppe 2 „Alter-Validierung"  → AK 4, 5, 6
// Gruppe 3 „Server-Validierung" → AK 7, 8

import { expect, test } from '../fixtures/test'
import { PersonFormDialog } from '../pages/PersonFormDialog'

test.describe('S2 Validierung des Anlegen-Dialogs', () => {
  /**
   * Deckt ab:
   * - AK 1: Das Feld `Name` ist ein Pflichtfeld.
   * - AK 2: Ein leerer `Name` erzeugt die Fehlermeldung „Name ist erforderlich.".
   * - AK 3: Der übertragene `Name` enthält keine führenden oder nachstehenden Leerzeichen.
   */
  test('Name-Validierung', async ({ page }) => {
    const form = new PersonFormDialog(page)
    await page.goto('/')
    await form.openCreate()

    // AK 1 + AK 2: Name ist Pflicht; leeres Name-Feld erzeugt „Name ist erforderlich.".
    await form.ageField.fill('30')
    await form.submit('Anlegen')
    await expect(form.dialog.getByText('Name ist erforderlich.')).toBeVisible()

    // AK 3: Der übertragene Name wird getrimmt (keine führenden/nachstehenden Leerzeichen).
    // Der Dialog ist aus Sub-Szenario A noch geöffnet; die Felder werden vor Ort gesetzt.
    await form.nameField.fill('  Alice  ')
    await form.submit('Anlegen')
    await expect(page.getByRole('row', { name: 'Alice' })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 4: Das Feld `Alter` ist ein Pflichtfeld.
   * - AK 5: Ein nicht-zahlengleiches `Alter` erzeugt die Fehlermeldung „Alter muss eine Zahl sein.".
   * - AK 6: Ein `Alter` außerhalb des Bereichs 0 bis 150 erzeugt die Fehlermeldung „Alter muss zwischen 0 und 150 liegen.".
   */
  test('Alter-Validierung', async ({ page }) => {
    const form = new PersonFormDialog(page)
    await page.goto('/')
    await form.openCreate()

    // AK 4 + AK 5: Alter ist Pflicht; leeres (nicht-zahlengleiches) Alter erzeugt „Alter muss eine Zahl sein.".
    await form.nameField.fill('Test')
    await form.submit('Anlegen')
    await expect(form.dialog.getByText('Alter muss eine Zahl sein.')).toBeVisible()

    // AK 6: Alter außerhalb 0–150 erzeugt „Alter muss zwischen 0 und 150 liegen.".
    await form.ageField.fill('200')
    await form.submit('Anlegen')
    await expect(form.dialog.getByText('Alter muss zwischen 0 und 150 liegen.')).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 7: `Name` und `Alter` werden client- und serverseitig validiert.
   * - AK 8: Bei einem serverseitigen Validierungsfehler zeigt der Dialog die Fehlermeldung des Backends an.
   *
   * Die clientseitige Validierung ist in den beiden Vorgängertests abgedeckt; hier wird der
   * serverseitige Pfad nachgespielt (POST wird auf 400 Problem-JSON geantwortet).
   */
  test('Server-Validierung', async ({ page }) => {
    const form = new PersonFormDialog(page)
    await page.route('**/api/persons', (route) => {
      if (route.request().method() === 'POST') {
        return route.fulfill({
          status: 400,
          contentType: 'application/problem+json',
          body: JSON.stringify({ title: 'Server: Name zu kurz' }),
        })
      }
      return route.continue()
    })
    await page.goto('/')
    await form.openCreate()

    // Clientseitig gültig, serverseitig abgelehnt.
    await form.fill('Alice', '30')
    await form.submit('Anlegen')
    await expect(form.dialog.getByText('Server: Name zu kurz')).toBeVisible()
  })
})
