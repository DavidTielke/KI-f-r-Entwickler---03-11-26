// specs/E1-F3-S5-tier-zuordnung-im-anlegen-dialog.spec.ts
//
// Story: specs/E1 Personen/F3 Person anlegen/S5 Tier-Zuordnung im Anlegen-Dialog.md
//
// Gruppe 1 „Haustier-Auswahl"  → AK 1, 2, 3, 4
// Gruppe 2 „PetId im Request"  → AK 5, 6

import { expect, test } from '../fixtures/test'
import { PersonFormDialog } from '../pages/PersonFormDialog'

test.describe('S5 Tier-Zuordnung im Anlegen-Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Der Anlegen-Dialog enthält das Feld `Haustier` als Auswahl mit der Option „Kein Haustier" und allen persistierten Haustieren.
   * - AK 2: Die `Haustier`-Optionen zeigen `Name` und `Species` im Format „{Name} ({Species})".
   * - AK 3: Ein mit einer anderen Person verknüpftes Haustier ist ausgegraut und nicht wählbar.
   * - AK 4: Das Feld `Haustier` ist optional; bei Dialog-Öffnung ist „Kein Haustier" angezeigt.
   */
  test('Haustier-Auswahl', async ({ page }) => {
    const form = new PersonFormDialog(page)
    await page.goto('/')
    await form.openCreate()

    // AK 1: Auswahl mit „Kein Haustier" und allen persistierten Haustieren (Fiete, Minka, Rex).
    // Native <select>-Optionen sind im geschlossenen Zustand nicht „visible"; geprüft wird ihre Existenz.
    await expect(form.petField.getByText('Kein Haustier')).toHaveCount(1)
    await expect(form.petField.getByText('Fiete (Hund)')).toHaveCount(1)
    await expect(form.petField.getByText('Minka (Katze)')).toHaveCount(1)
    await expect(form.petField.getByText('Rex (Hund)')).toHaveCount(1)

    // AK 2: Optionen zeigen das Format „{Name} ({Species})".
    await expect(form.petField.getByText('Fiete (Hund)', { exact: true })).toHaveCount(1)
    await expect(form.petField.getByText('Minka (Katze)', { exact: true })).toHaveCount(1)
    await expect(form.petField.getByText('Rex (Hund)', { exact: true })).toHaveCount(1)

    // AK 3: Verknüpfte Haustiere (Fiete→Anna, Minka→Maria) sind nicht wählbar; Rex ist frei.
    await expect(form.petField.locator('option[value="1"]')).toBeDisabled()
    await expect(form.petField.locator('option[value="2"]')).toBeDisabled()
    await expect(form.petField.locator('option[value="3"]')).not.toBeDisabled()

    // AK 4: Optionales Feld; bei Öffnung ist „Kein Haustier" angezeigt.
    await expect(form.petField).toHaveValue('')
  })

  /**
   * Deckt ab:
   * - AK 5: Bei Auswahl eines Haustiers sendet der Dialog die `POST /api/persons`-Anfrage mit dessen `PetId`.
   * - AK 6: Ohne Auswahl sendet der Dialog die Anfrage ohne `PetId`.
   */
  test('PetId im Request', async ({ page }) => {
    const form = new PersonFormDialog(page)
    const posts: unknown[] = []
    await page.route('**/api/persons', (route) => {
      if (route.request().method() === 'POST') posts.push(route.request().postDataJSON())
      return route.continue()
    })
    await page.goto('/')

    // AK 5: Auswahl eines Haustiers (Rex, Id 3) → Anfrage enthält dessen PetId.
    await form.openCreate()
    await form.fill('Neu', '30')
    await form.selectPet('Rex (Hund)')
    await form.submit('Anlegen')
    expect(posts.at(-1)).toHaveProperty('petId', 3)

    // AK 6: Ohne Auswahl → Anfrage ohne PetId.
    await form.openCreate()
    await form.fill('P2', '30')
    await form.clearPet()
    await form.submit('Anlegen')
    expect(posts.at(-1)).not.toHaveProperty('petId')
  })
})
