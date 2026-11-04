// specs/E2-F2-S1-anlegen-dialog.spec.ts
//
// Story: specs/E2 Haustiere/F2 Haustier anlegen/S1 Anlegen-Dialog.md
//
// Gruppe 1 „Dialog öffnen und abbrechen"  → AK 1, 2, 10, 11, 12, 13
// Gruppe 2 „Name-Feld"                   → AK 3, 4
// Gruppe 3 „Spezies-Auswahl"             → AK 5, 6
// Gruppe 4 „Person-Auswahl"             → AK 7, 8, 9

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'
import { personsSeed, petsSeed } from '../fixtures/seed'

test.describe('S1 Anlegen-Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Die Primäraktion „Anlegen" öffnet einen modalen Dialog.
   * - AK 2: Der Dialog zeigt den Titel „Haustier anlegen.".
   * - AK 10: Beim Öffnen des Dialogs liegt der Fokus im Feld `Name`.
   * - AK 11: Der Dialog enthält den Button „Abbrechen".
   * - AK 12: Der Dialog enthält den Submit-Button „Anlegen".
   * - AK 13: „Abbrechen" schließt den Dialog ohne Speicherung.
   */
  test('Dialog öffnen und abbrechen', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()

    // AK 1: Die Primäraktion „Anlegen" öffnet einen modalen Dialog.
    await expect(form.dialog).toBeVisible()
    await expect(form.dialog).toHaveAttribute('aria-modal', 'true')

    // AK 2: Der Dialog zeigt den Titel „Haustier anlegen.".
    await expect(form.dialog.getByText('Haustier anlegen')).toBeVisible()

    // AK 10: Beim Öffnen des Dialogs liegt der Fokus im Feld `Name`.
    await expect(form.nameInput).toBeFocused()

    // AK 11: Der Dialog enthält den Button „Abbrechen".
    await expect(form.cancel).toBeVisible()

    // AK 12: Der Dialog enthält den Submit-Button „Anlegen".
    await expect(form.submit).toBeVisible()

    // AK 13: „Abbrechen" schließt den Dialog ohne Speicherung.
    await form.cancel.click()
    await expect(form.dialog).toBeHidden()
    await expect(list.table.getByRole('row')).toHaveCount(petsSeed.length + 1) // Bestand unverändert
  })

  /**
   * Deckt ab:
   * - AK 3: Der Dialog enthält das Feld `Name` als Textfeld mit dem Platzhalter „z. B. Rex".
   * - AK 4: Das Feld `Name` akzeptiert max. 150 Zeichen.
   */
  test('Name-Feld', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()

    // AK 3: Der Dialog enthält das Feld `Name` als Textfeld mit dem Platzhalter „z. B. Rex".
    await expect(form.nameInput).toHaveAttribute('type', 'text')
    await expect(form.nameInput).toHaveAttribute('placeholder', 'z. B. Rex')

    // AK 4: Das Feld `Name` akzeptiert max. 150 Zeichen.
    await expect(form.nameInput).toHaveAttribute('maxlength', '150')
  })

  /**
   * Deckt ab:
   * - AK 5: Der Dialog enthält das Feld `Spezies` als Auswahl mit den Optionen „Hund", „Katze", „Vogel" und „Dinosaurier".
   * - AK 6: Das Feld `Spezies` zeigt bei Dialog-Öffnung die Option „Bitte wählen" an.
   */
  test('Spezies-Auswahl', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()

    // AK 5: Der Dialog enthält das Feld `Spezies` als Auswahl mit den Optionen „Hund", „Katze", „Vogel" und „Dinosaurier".
    for (const species of ['Hund', 'Katze', 'Vogel', 'Dinosaurier']) {
      await expect(form.speciesOption(species)).toHaveText(species)
    }

    // AK 6: Das Feld `Spezies` zeigt bei Dialog-Öffnung die Option „Bitte wählen" an.
    await expect(form.speciesSelect.locator('option:checked')).toHaveText('Bitte wählen')
  })

  /**
   * Deckt ab:
   * - AK 7: Der Dialog enthält das Feld `Person` als Auswahl mit der Option „Keine Person" und allen persistierten Personen.
   * - AK 8: Die `Person`-Optionen zeigen den `Name` der Person.
   * - AK 9: Personen, die bereits ein Haustier haben, sind in der Auswahl ausgegraut und nicht wählbar.
   */
  test('Person-Auswahl', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()

    // AK 7: Der Dialog enthält das Feld `Person` als Auswahl mit der Option „Keine Person" und allen persistierten Personen.
    await expect(form.personSelect.locator('option')).toHaveCount(personsSeed.length + 1) // + „Keine Person"
    await expect(form.personOption('Keine Person')).toHaveText('Keine Person')

    // AK 8: Die `Person`-Optionen zeigen den `Name` der Person.
    for (const person of personsSeed) {
      await expect(form.personOption(person.name)).toHaveText(person.name)
    }

    // AK 9: Personen, die bereits ein Haustier haben, sind in der Auswahl ausgegraut und nicht wählbar.
    // (Anna Berger hat Fiete, Maria Schneider hat Minka — im Seeddatensatz.)
    await expect(form.personOption('Anna Berger')).toBeDisabled()
    await expect(form.personOption('Maria Schneider')).toBeDisabled()
  })
})
