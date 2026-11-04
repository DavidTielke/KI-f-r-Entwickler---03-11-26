// specs/E1-F2-S1-personen-liste.spec.ts
//
// Story: specs/E1 Personen/F2 Personen-Übersicht/S1 Personen-Liste.md
//
// Gruppe 1 „Tabelle zeigt Spalten und Zeilen"      → AK 2, 3, 4, 5, 6
// Gruppe 2 „Altersspalte ist rechtsbündig"        → AK 7
// Gruppe 3 „Liste folgt der Backend-Reihenfolge"  → AK 8, 9, 10
// Gruppe 4 „Dino-Emoji in der ID-Überschrift"     → AK 1

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { personsSeed, personsSeedInDisplayOrder } from '../fixtures/seed'

test.describe('S1 Personen-Liste', () => {
  /**
   * Deckt ab:
   * - AK 2: Die Tabelle zeigt eine Zeile pro persistierter Person.
   * - AK 3: Die Tabelle enthält die Spalten „Reihenfolge", „ID", „Name", „Alter" und die Spalte für die Zeilenaktionen.
   * - AK 4: Die Spalte „ID" zeigt die `Id` im Format `#{id}`.
   * - AK 5: Die Spalte „Name" zeigt den `Name` der Person.
   * - AK 6: Die Spalte „Alter" zeigt den `Age`-Wert der Person.
   */
  test('Tabelle zeigt Spalten und Zeilen', async ({ page }) => {
    const persons = new PersonenListPage(page)
    await persons.open()

    // AK 2: Die Tabelle zeigt eine Zeile pro persistierter Person.
    await expect(persons.table.getByRole('row')).toHaveCount(personsSeed.length + 1) // + Headerzeile

    // AK 3: Die Tabelle enthält die Spalten „Reihenfolge", „ID", „Name", „Alter" und die Spalte für die Zeilenaktionen.
    await expect(persons.columnHeader('Reihenfolge')).toBeVisible()
    await expect(persons.columnHeader('ID 🦖')).toBeVisible()
    await expect(persons.columnHeader('Name')).toBeVisible()
    await expect(persons.columnHeader('Alter')).toBeVisible()
    await expect(persons.columnHeader('Aktionen')).toBeVisible()

    for (const person of personsSeed) {
      // AK 4: Die Spalte „ID" zeigt die `Id` im Format `#{id}`.
      await expect(persons.row(person.name).getByText(`#${person.id}`, { exact: true })).toBeVisible()

      // AK 5: Die Spalte „Name" zeigt den `Name` der Person.
      await expect(persons.row(person.name).getByText(person.name, { exact: true })).toBeVisible()

      // AK 6: Die Spalte „Alter" zeigt den `Age`-Wert der Person.
      await expect(persons.row(person.name).getByText(String(person.age), { exact: true })).toBeVisible()
    }
  })

  /**
   * Deckt ab:
   * - AK 7: Die Spalte „Alter" ist rechtsbündig ausgerichtet.
   */
  test('Altersspalte ist rechtsbündig', async ({ page }) => {
    const persons = new PersonenListPage(page)
    await persons.open()

    // AK 7: Die Spalte „Alter" ist rechtsbündig ausgerichtet.
    // Die Ausrichtung wirkt auf den Spalteninhalt: die Zellen tragen .dt-table__num (text-align: right).
    await expect(persons.row('Anna Berger').getByText('34', { exact: true })).toHaveCSS('text-align', 'right')
  })

  /**
   * Deckt ab (sichtbare Wirkung):
   * - AK 8: Das Backend liefert die Personen nach `Order` aufsteigend.
   * - AK 9: Bei gleichem `Order`-Wert liefert das Backend die Personen nach `Name` sortiert.
   * - AK 10: Die Tabelle zeigt die Personen in der vom Backend gelieferten Reihenfolge.
   *
   * Der Basisdatensatz belegt Order 3 zweimal (Id 3 „Tom Krüger", Id 4 „Maria Schneider")
   * in umgekehrter Id-Reihenfolge, damit eine Id-Sortierung im Backend einen Testbruch
   * verursachen würde.
   */
  test('Liste folgt der Backend-Reihenfolge', async ({ page }) => {
    const persons = new PersonenListPage(page)
    await persons.open()

    // AK 8: Das Backend liefert die Personen nach `Order` aufsteigend.
    // AK 9: Bei gleichem `Order`-Wert liefert das Backend die Personen nach `Name` sortiert.
    // AK 10: Die Tabelle zeigt die Personen in der vom Backend gelieferten Reihenfolge.
    for (let i = 0; i < personsSeedInDisplayOrder.length; i++) {
      await expect(persons.table.getByRole('row').nth(i + 1)).toContainText(
        personsSeedInDisplayOrder[i].name,
      ) // +1: Zeile 0 ist die Headerzeile
    }
  })

  /**
   * Deckt ab:
   * - AK 1: Am Ende der Überschrift der ID Spalte ist ein Dino-Emoji
   */
  test('Dino-Emoji in der ID-Überschrift', async ({ page }) => {
    const persons = new PersonenListPage(page)
    await persons.open()

    // AK 1: Am Ende der Überschrift der ID Spalte ist ein Dino-Emoji
    await expect(persons.columnHeader('ID')).toContainText('🦖')
  })
})
