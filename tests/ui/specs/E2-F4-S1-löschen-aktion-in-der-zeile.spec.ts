// specs/E2-F4-S1-löschen-aktion-in-der-zeile.spec.ts
//
// Story: specs/E2 Haustiere/F4 Haustier löschen/S1 Löschen-Aktion in der Zeile.md
//
// Gruppe 1 „Löschen-Aktion in jeder Zeile"  → AK 1, 2, 3, 4
//
// Hinweis: Die Gestaltung in der Danger-Variante (AK 1, 2. Absatz) ist ein reines
// Styling-Kriterium ohne unterscheidbaren Web-First-Ausdruck und wird hier nicht
// per Web-First-Assertion geprüft (Kriterium 11, Abschnitt „Styling").

import { expect, test } from '../fixtures/test'
import { HaustierLoeschDialog } from '../pages/HaustierLoeschDialog'
import { HaustierListPage } from '../pages/HaustierListPage'
import { petsSeed } from '../fixtures/seed'

test.describe('S1 Löschen-Aktion in der Zeile', () => {
  /**
   * Deckt ab:
   * - AK 1: Jede Zeile enthält eine Löschen-Aktion (als Icon-Button in der Danger-Variante;
   *   die Danger-Variante selbst ist Styling und wird nicht separat geprüft).
   * - AK 2: Die Aktion trägt das Accessibility-Label „Haustier {id} löschen".
   * - AK 3: Die Aktion ist ein Icon-Button (Symbol ohne Textbeschriftung).
   * - AK 4: Ein Klick auf die Aktion öffnet den Lösch-Bestätigungsdialog für das Haustier (siehe F4 S2).
   */
  test('Löschen-Aktion in jeder Zeile', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()

    for (const pet of petsSeed) {
      // AK 1: Jede Zeile enthält eine Löschen-Aktion (als Icon-Button in der Danger-Variante;
      //       die Danger-Variante selbst ist Styling und wird nicht separat geprüft).
      // AK 2: Die Aktion trägt das Accessibility-Label „Haustier {id} löschen"
      //       (der Locator wird über genau dieses Accessibility-Label aufgelöst).
      await expect(list.deleteButton(pet.id)).toBeVisible()

      // AK 3: Die Aktion ist ein Icon-Button (Symbol ohne Textbeschriftung).
      await expect(list.deleteButton(pet.id).locator('svg')).toHaveCount(1)
    }

    // AK 4: Ein Klick auf die Aktion öffnet den Lösch-Bestätigungsdialog für das Haustier (siehe F4 S2).
    await list.deleteButton(1).click()
    const loeschen = new HaustierLoeschDialog(page)
    await expect(loeschen.dialog).toBeVisible()
    await expect(loeschen.dialog.getByText('Haustier löschen')).toBeVisible()
  })
})
