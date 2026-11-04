// specs/E1-F1-S2-navigation-stammdaten.spec.ts
//
// Story: specs/E1 Personen/F1 App-Shell/S2 Navigation Stammdaten.md
//
// Gruppe 1 „Navigation zeigt Gruppe und Zähler"   → AK 1, 2, 3, 7, 8
// Gruppe 2 „Standardansicht und aktive Markierung" → AK 4, 6
// Gruppe 3 „Navigation zwischen Personen und Haustieren" → AK 5, 11, 12
// Gruppe 4 „Zähler reagieren auf Anlegen und Löschen" → AK 9, 10

import { expect, test } from '../fixtures/test'
import { AppShell } from '../pages/AppShell'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonFormDialog } from '../pages/PersonFormDialog'
import { PersonLoeschDialog } from '../pages/PersonLoeschDialog'
import { personsSeed, petsSeed } from '../fixtures/seed'

test.describe('S2 Navigation Stammdaten', () => {
  /**
   * Deckt ab:
   * - AK 1: Die Sidebar zeigt die Navigationsgruppe „Stammdaten".
   * - AK 2: Die Navigationsgruppe „Stammdaten" enthält den Eintrag „Personen".
   * - AK 3: Die Navigationsgruppe „Stammdaten" enthält den Eintrag „Haustiere".
   * - AK 7: Der Eintrag „Personen" zeigt einen Zähler mit der Anzahl der geladenen Personen.
   * - AK 8: Der Eintrag „Haustiere" zeigt einen Zähler mit der Anzahl der geladenen Haustiere.
   */
  test('Navigation zeigt Gruppe und Zähler', async ({ page }) => {
    const app = new AppShell(page)
    await page.goto('/')

    // AK 1: Die Sidebar zeigt die Navigationsgruppe „Stammdaten".
    await expect(app.navGroupLabel()).toBeVisible()

    // AK 2: Die Navigationsgruppe „Stammdaten" enthält den Eintrag „Personen".
    await expect(app.personNav).toBeVisible()

    // AK 3: Die Navigationsgruppe „Stammdaten" enthält den Eintrag „Haustiere".
    await expect(app.petNav).toBeVisible()

    // AK 7: Der Eintrag „Personen" zeigt einen Zähler mit der Anzahl der geladenen Personen.
    await expect(app.personNav.getByText(String(personsSeed.length), { exact: true })).toBeVisible()

    // AK 8: Der Eintrag „Haustiere" zeigt einen Zähler mit der Anzahl der geladenen Haustiere.
    await expect(app.petNav.getByText(String(petsSeed.length), { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 4: Der Eintrag „Personen" ist während der Anzeige der Personen-Seite aktiv markiert.
   * - AK 6: Der Eintrag „Personen" ist die Standard-Ansicht nach dem Start der App.
   */
  test('Standardansicht und aktive Markierung', async ({ page }) => {
    const app = new AppShell(page)
    const persons = new PersonenListPage(page)
    await page.goto('/')

    // AK 6: Der Eintrag „Personen" ist die Standard-Ansicht nach dem Start der App.
    await expect(persons.table).toBeVisible()

    // AK 4: Der Eintrag „Personen" ist während der Anzeige der Personen-Seite aktiv markiert.
    await expect(app.personNav).toHaveClass(/is-active/)
  })

  /**
   * Deckt ab:
   * - AK 5: Der Eintrag „Haustiere" ist während der Anzeige der Haustiere-Seite aktiv markiert.
   * - AK 11: Ein Klick auf den Eintrag „Haustiere" zeigt die Haustiere-Seite (siehe E2 F1 S1).
   * - AK 12: Ein Klick auf den Eintrag „Personen" zeigt die Personen-Seite.
   */
  test('Navigation zwischen Personen und Haustieren', async ({ page }) => {
    const app = new AppShell(page)
    const persons = new PersonenListPage(page)
    await page.goto('/')

    await app.openPets()

    // AK 11: Ein Klick auf den Eintrag „Haustiere" zeigt die Haustiere-Seite.
    await expect(app.title).toHaveText(/Haustiere/)
    await expect(page.getByRole('table')).toBeVisible()

    // AK 5: Der Eintrag „Haustiere" ist während der Anzeige der Haustiere-Seite aktiv markiert.
    await expect(app.petNav).toHaveClass(/is-active/)
    await expect(app.personNav).not.toHaveClass(/is-active/)

    await app.openPersons()

    // AK 12: Ein Klick auf den Eintrag „Personen" zeigt die Personen-Seite.
    await expect(app.title).toHaveText(/Personen/)
    await expect(persons.table).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 9: Der Zähler „Personen" zeigt nach dem Anlegen einer Person die erhöhte Anzahl.
   * - AK 10: Der Zähler „Personen" zeigt nach dem Löschen einer Person die reduzierte Anzahl.
   */
  test('Zähler reagieren auf Anlegen und Löschen', async ({ page }) => {
    const app = new AppShell(page)
    const persons = new PersonenListPage(page)
    const form = new PersonFormDialog(page)
    const loesch = new PersonLoeschDialog(page)
    await persons.open()

    // AK 9: Der Zähler „Personen" zeigt nach dem Anlegen einer Person die erhöhte Anzahl.
    await form.openCreate()
    await form.fill('Neu', '30')
    await form.submit('Anlegen')
    await expect(app.personNav.getByText(String(personsSeed.length + 1), { exact: true })).toBeVisible()

    // AK 10: Der Zähler „Personen" zeigt nach dem Löschen einer Person die reduzierte Anzahl.
    const jonas = personsSeed[1]
    await persons.openDelete(jonas)
    await loesch.confirm()
    await expect(app.personNav.getByText(String(personsSeed.length), { exact: true })).toBeVisible()
  })
})
