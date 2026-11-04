// specs/E2-F1-S1-haustier-liste.spec.ts
//
// Story: specs/E2 Haustiere/F1 Haustier-Übersicht/S1 Haustier-Liste.md
//
// Gruppe 1 „Kopfzeile und Tabellenkarte"           → AK 1, 2, 3
// Gruppe 2 „Tabelle zeigt Spalten und Zeilen"     → AK 4, 5, 6, 7, 8
// Gruppe 3 „Person-Spalte zeigt die Verknüpfung"   → AK 9, 10
// Gruppe 4 „Liste folgt der Sortierung des Backends" → AK 11, 12, 13

import { expect, test } from '../fixtures/test'
import { HaustierListPage } from '../pages/HaustierListPage'
import { petsSeed, petsSeedInDisplayOrder } from '../fixtures/seed'

test.describe('S1 Haustier-Liste', () => {
  /**
   * Deckt ab:
   * - AK 1: Die Haustiere-Seite zeigt die Kopfzeile mit dem Kicker „Stammdaten" und der Überschrift „Haustiere".
   * - AK 2: Die Kopfzeile enthält die Primäraktion „Anlegen".
   * - AK 3: Der Hauptbereich zeigt die Haustiere in einer Tabellenkarte.
   */
  test('Kopfzeile und Tabellenkarte', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()

    // AK 1: Die Haustiere-Seite zeigt die Kopfzeile mit dem Kicker „Stammdaten" und der Überschrift „Haustiere".
    await expect(list.topbar.getByText('Stammdaten', { exact: true })).toBeVisible()
    await expect(list.topbar.getByRole('heading', { name: 'Haustiere' })).toBeVisible()

    // AK 2: Die Kopfzeile enthält die Primäraktion „Anlegen".
    await expect(list.topbar.getByRole('button', { name: 'Anlegen' })).toBeVisible()

    // AK 3: Der Hauptbereich zeigt die Haustiere in einer Tabellenkarte.
    await expect(list.table).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 4: Die Tabelle zeigt eine Zeile pro persistiertem Haustier.
   * - AK 5: Die Tabelle enthält die Spalten „ID", „Name", „Spezies", „Person" und die Spalte für die Zeilenaktionen.
   * - AK 6: Die Spalte „ID" zeigt die `Id` im Format `#{id}`.
   * - AK 7: Die Spalte „Name" zeigt den `Name` des Tiers.
   * - AK 8: Die Spalte „Spezies" zeigt den `Species`-Wert des Tiers.
   */
  test('Tabelle zeigt Spalten und Zeilen', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()

    // AK 4: Die Tabelle zeigt eine Zeile pro persistiertem Haustier.
    await expect(list.table.getByRole('row')).toHaveCount(petsSeed.length + 1) // + Headerzeile

    // AK 5: Die Tabelle enthält die Spalten „ID", „Name", „Spezies", „Person" und die Spalte für die Zeilenaktionen.
    await expect(list.columnHeader('ID')).toBeVisible()
    await expect(list.columnHeader('Name')).toBeVisible()
    await expect(list.columnHeader('Spezies')).toBeVisible()
    await expect(list.columnHeader('Person')).toBeVisible()
    await expect(list.columnHeader('Aktionen')).toBeVisible()

    for (const pet of petsSeed) {
      // AK 6: Die Spalte „ID" zeigt die `Id` im Format `#{id}`.
      await expect(list.row(pet.name).getByText(`#${pet.id}`, { exact: true })).toBeVisible()

      // AK 7: Die Spalte „Name" zeigt den `Name` des Tiers.
      await expect(list.row(pet.name).getByText(pet.name, { exact: true })).toBeVisible()

      // AK 8: Die Spalte „Spezies" zeigt den `Species`-Wert des Tiers.
      await expect(list.row(pet.name).getByText(pet.species, { exact: true })).toBeVisible()
    }
  })

  /**
   * Deckt ab:
   * - AK 9: Die Spalte „Person" zeigt den `Name` der verknüpften Person.
   * - AK 10: Die Spalte „Person" zeigt „—", wenn das Tier nicht mit einer Person verknüpft ist.
   */
  test('Person-Spalte zeigt die Verknüpfung', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()

    // AK 9: Die Spalte „Person" zeigt den `Name` der verknüpften Person.
    await expect(list.row('Fiete').getByText('Anna Berger', { exact: true })).toBeVisible()
    await expect(list.row('Minka').getByText('Maria Schneider', { exact: true })).toBeVisible()

    // AK 10: Die Spalte „Person" zeigt „—", wenn das Tier nicht mit einer Person verknüpft ist.
    await expect(list.row('Rex').getByText('—', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 11: Das Backend liefert die Haustiere nach `Name` aufsteigend.
   * - AK 12: Bei gleichem `Name`-Wert liefert das Backend die Haustiere nach `Id` sortiert.
   * - AK 13: Die Tabelle zeigt die Haustiere in der vom Backend gelieferten Reihenfolge.
   *
   * „Zorro" wird zweimal per API angelegt, damit der Gleichstandsfall (gleicher Name,
   * verschiedene Ids) im Basisdatensatz sichtbar wird.
   */
  test('Liste folgt der Sortierung des Backends', async ({ page, request }) => {
    expect((await request.post('/api/pets', { data: { name: 'Zorro', species: 'Vogel', personId: null } })).ok()).toBeTruthy()
    expect((await request.post('/api/pets', { data: { name: 'Zorro', species: 'Dinosaurier', personId: null } })).ok()).toBeTruthy()

    const list = new HaustierListPage(page)
    await list.open()

    // AK 11: Das Backend liefert die Haustiere nach `Name` aufsteigend.
    // AK 13: Die Tabelle zeigt die Haustiere in der vom Backend gelieferten Reihenfolge.
    const displayOrder = [...petsSeedInDisplayOrder.map((p) => p.name), 'Zorro', 'Zorro']
    for (let i = 0; i < displayOrder.length; i++) {
      await expect(list.table.getByRole('row').nth(i + 1)).toContainText(displayOrder[i]) // +1: Zeile 0 ist die Headerzeile
    }

    // AK 12: Bei gleichem `Name`-Wert liefert das Backend die Haustiere nach `Id` sortiert.
    const zorroRows = list.table.getByRole('row', { name: 'Zorro' })
    await expect(zorroRows.nth(0).getByText('#4', { exact: true })).toBeVisible()
    await expect(zorroRows.nth(1).getByText('#5', { exact: true })).toBeVisible()
  })
})
