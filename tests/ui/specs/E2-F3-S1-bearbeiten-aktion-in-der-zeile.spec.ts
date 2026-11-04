// specs/E2-F3-S1-bearbeiten-aktion-in-der-zeile.spec.ts
//
// Story: specs/E2 Haustiere/F3 Haustier bearbeiten/S1 Bearbeiten-Aktion in der Zeile.md
//
// Gruppe 1 „Bearbeiten-Aktion in jeder Zeile"  → AK 1, 2, 3, 4

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'
import { petsSeed } from '../fixtures/seed'

test.describe('S1 Bearbeiten-Aktion in der Zeile', () => {
  /**
   * Deckt ab:
   * - AK 1: Jede Zeile der Liste enthält eine Bearbeiten-Aktion.
   * - AK 2: Die Bearbeiten-Aktion ist ein Icon-Button.
   * - AK 3: Die Bearbeiten-Aktion trägt das Accessibility-Label „Haustier {id} bearbeiten".
   * - AK 4: Ein Klick auf die Bearbeiten-Aktion öffnet den Bearbeiten-Dialog für das Haustier (siehe F3 S2).
   */
  test('Bearbeiten-Aktion in jeder Zeile', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()

    for (const pet of petsSeed) {
      // AK 1: Jede Zeile der Liste enthält eine Bearbeiten-Aktion.
      // AK 3: Die Bearbeiten-Aktion trägt das Accessibility-Label „Haustier {id} bearbeiten"
      //       (der Locator wird über genau dieses Accessibility-Label aufgelöst).
      await expect(list.editButton(pet.id)).toBeVisible()

      // AK 2: Die Bearbeiten-Aktion ist ein Icon-Button (Symbol ohne Textbeschriftung).
      await expect(list.editButton(pet.id).locator('svg')).toHaveCount(1)
    }

    // AK 4: Ein Klick auf die Bearbeiten-Aktion öffnet den Bearbeiten-Dialog für das Haustier (siehe F3 S2).
    await list.editButton(1).click()
    const form = new HaustierFormDialog(page)
    await expect(form.dialog).toBeVisible()
    await expect(form.dialog.getByText('Haustier 1 bearbeiten')).toBeVisible()
  })
})
