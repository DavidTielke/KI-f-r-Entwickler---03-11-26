// specs/E1-F5-S3-löschen-abwickeln.spec.ts
//
// Story: specs/E1 Personen/F5 Person löschen/S3 Löschen abwickeln.md
//
// Gruppe 1 „Lösch-Flow (Personen)"            → AK 1, 2, 4, 5, 6, 7
// Gruppe 2 „Haustier-Verknüpfung bleibt erhalten" → AK 3, 8, 9, 10

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { PersonLoeschDialog } from '../pages/PersonLoeschDialog'
import { AppShell } from '../pages/AppShell'
import { personsSeed } from '../fixtures/seed'

test.describe('S3 Löschen abwickeln', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei Bestätigung sendet das Frontend eine `DELETE /api/persons/{id}`-Anfrage.
   * - AK 2: Das Backend entfernt die Person aus der Datenbank (sichtbar über AK 6).
   * - AK 4: Nach erfolgreichem Löschen schließt sich der Bestätigungsdialog.
   * - AK 5: Nach erfolgreichem Löschen wird die Personenliste neu geladen (sichtbar über AK 6).
   * - AK 6: Die gelöschte Person ist nicht mehr in der Liste enthalten.
   * - AK 7: Der Zähler am Navigationseintrag zeigt die reduzierte Anzahl.
   */
  test('Lösch-Flow (Personen)', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const loesch = new PersonLoeschDialog(page)
    const app = new AppShell(page)
    const maria = personsSeed[3]
    let delReq!: { url: string; method: string }
    await page.route('**/api/persons/**', (route) => {
      if (route.request().method() === 'DELETE') delReq = { url: route.request().url(), method: route.request().method() }
      return route.continue()
    })
    await page.goto('/')
    await persons.open()
    await persons.openDelete(maria)
    await loesch.confirm()

    // AK 1: DELETE /api/persons/{id}.
    expect(delReq.method).toBe('DELETE')
    expect(delReq.url).toContain('/api/persons/4')

    // AK 4: Nach erfolgreichem Löschen schließt sich der Bestätigungsdialog.
    await expect(loesch.dialog).toHaveCount(0)

    // AK 2 + AK 5 + AK 6: Die gelöschte Person ist nicht mehr in der (neu geladenen) Liste.
    await expect(persons.row(maria.name)).toHaveCount(0)

    // AK 7: Der Zähler am Navigationseintrag zeigt die reduzierte Anzahl.
    await expect(app.personNav.getByText(String(personsSeed.length - 1), { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 3: Das Backend antwortet mit `204 No Content`.
   * - AK 8: Ein zugeordnetes Haustier bleibt in der Datenbank erhalten; nur die Verknüpfung wird gelöst.
   * - AK 9: Nach erfolgreichem Löschen wird die Haustierliste neu geladen.
   * - AK 10: Ein zuvor zugeordnetes Haustier ist weiterhin in der Haustierliste enthalten und zeigt keine verknüpfte Person mehr.
   *
   * Maria (Id 4) ist mit Minka (PetId 2) verknüpft.
   */
  test('Haustier-Verknüpfung bleibt erhalten', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const loesch = new PersonLoeschDialog(page)
    const app = new AppShell(page)
    const maria = personsSeed[3]
    let delStatus!: number
    await page.route('**/api/persons/**', async (route) => {
      if (route.request().method() === 'DELETE') {
        const resp = await route.fetch()
        delStatus = resp.status()
        return route.fulfill({ response: resp })
      }
      return route.continue()
    })
    await page.goto('/')
    await persons.open()
    await persons.openDelete(maria)
    await loesch.confirm()

    // Löschvorgang abwarten (Zeile entfernt = DELETE abgeschlossen).
    await expect(persons.row(maria.name)).toHaveCount(0)

    // AK 3: Das Backend antwortet mit 204 No Content.
    expect(delStatus).toBe(204)

    // Zur Haustiere-Ansicht wechseln.
    await app.openPets()
    const petTable = page.getByRole('table')

    // AK 10: Minka ist weiterhin in der Haustierliste enthalten und zeigt keine verknüpfte Person mehr.
    await expect(petTable.getByRole('row', { name: /Minka/ })).toContainText('—')

    // AK 8 + AK 9: Minka bleibt erhalten (Haustierliste neu geladen, nur die Verknüpfung gelöst).
    await expect(petTable.getByRole('row', { name: /Minka/ })).toBeVisible()
  })
})
