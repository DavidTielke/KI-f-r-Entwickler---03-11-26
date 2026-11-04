// specs/E2-F3-S2-bearbeiten-dialog.spec.ts
//
// Story: specs/E2 Haustiere/F3 Haustier bearbeiten/S2 Bearbeiten-Dialog.md
//
// Gruppe 1 „Vorausgefüllter Bearbeiten-Dialog"  → AK 1, 2, 3, 4
// Gruppe 2 „Person-Auswahl"                    → AK 5, 6
// Gruppe 3 „Buttons"                            → AK 7, 8

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S2 Bearbeiten-Dialog', () => {
  /**
   * Deckt ab:
   * - AK 1: Der Dialog zeigt den Titel „Haustier {id} bearbeiten.".
   * - AK 2: Das Feld `Name` ist mit dem aktuellen `Name` des Tiers vorausgefüllt.
   * - AK 3: Das Feld `Spezies` ist mit dem aktuellen `Species`-Wert vorausgefüllt.
   * - AK 4: Das Feld `Person` ist mit der aktuell verknüpften Person vorausgefüllt; bei fehlender Verknüpfung zeigt es „Keine Person".
   */
  test('Vorausgefüllter Bearbeiten-Dialog', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    // Fall mit Personen-Verknüpfung: Fiete (Hund, Anna Berger)
    await list.editButton(1).click()

    // AK 1: Der Dialog zeigt den Titel „Haustier {id} bearbeiten.".
    await expect(form.dialog.getByText('Haustier 1 bearbeiten')).toBeVisible()

    // AK 2: Das Feld `Name` ist mit dem aktuellen `Name` des Tiers vorausgefüllt.
    await expect(form.nameInput).toHaveValue('Fiete')

    // AK 3: Das Feld `Spezies` ist mit dem aktuellen `Species`-Wert vorausgefüllt.
    await expect(form.speciesSelect).toHaveValue('Hund')

    // AK 4 (Fall mit Verknüpfung): Das Feld `Person` ist mit der aktuell verknüpften Person vorausgefüllt.
    await expect(form.personSelect).toHaveValue('1')

    await form.close.click()

    // Fall ohne Personen-Verknüpfung: Rex (Hund, ohne Person)
    await list.editButton(3).click()
    await expect(form.dialog.getByText('Haustier 3 bearbeiten')).toBeVisible()

    // AK 4 (Fall ohne Verknüpfung): ... bei fehlender Verknüpfung zeigt es „Keine Person".
    await expect(form.personSelect).toHaveValue('')
    await expect(form.personSelect.locator('option:checked')).toHaveText('Keine Person')
  })

  /**
   * Deckt ab:
   * - AK 5: Die aktuell verknüpfte Person ist in der Auswahl wählbar.
   * - AK 6: Personen, die bereits ein anderes Haustier haben, sind in der Auswahl ausgegraut und nicht wählbar.
   */
  test('Person-Auswahl', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.editButton(1).click() // Fiete → Anna Berger

    // AK 5: Die aktuell verknüpfte Person ist in der Auswahl wählbar.
    await expect(form.personOption('Anna Berger')).toBeEnabled()

    // AK 6: Personen, die bereits ein anderes Haustier haben, sind in der Auswahl ausgegraut und nicht wählbar.
    // (Maria Schneider hat Minka — ein anderes Haustier als Fiete.)
    await expect(form.personOption('Maria Schneider')).toBeDisabled()
  })

  /**
   * Deckt ab:
   * - AK 7: Der Dialog enthält den Submit-Button „Speichern".
   * - AK 8: „Abbrechen" schließt den Dialog ohne Änderung.
   */
  test('Buttons', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.editButton(2).click() // Minka

    // AK 7: Der Dialog enthält den Submit-Button „Speichern".
    await expect(form.submit).toBeVisible()

    // AK 8: „Abbrechen" schließt den Dialog ohne Änderung.
    await form.cancel.click()
    await expect(form.dialog).toBeHidden()
    await expect(list.row('Minka').getByText('Katze', { exact: true })).toBeVisible() // Bestand unverändert
  })
})
