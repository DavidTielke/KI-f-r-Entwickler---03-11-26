// specs/E2-F4-S3-löschen-abwickeln.spec.ts
//
// Story: specs/E2 Haustiere/F4 Haustier löschen/S3 Löschen abwickeln.md
//
// Gruppe 1 „Haustier löschen"  → AK 1, 2, 3, 4
// Gruppe 2 „Auswirkungen des Löschens"  → AK 5, 6, 7
// Gruppe 3 „Person bleibt erhalten"  → AK 8

import { expect, test } from '../fixtures/test'
import { HaustierLoeschDialog } from '../pages/HaustierLoeschDialog'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S3 Löschen abwickeln', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei Bestätigung sendet das Frontend eine `DELETE /api/pets/{id}`-Anfrage.
   * - AK 2: Das Backend entfernt das Haustier aus der Datenbank.
   * - AK 3: Das Backend antwortet mit `204 No Content`.
   * - AK 4: Nach erfolgreichem Löschen schließt sich der Bestätigungsdialog.
   */
  test('Haustier löschen', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const loeschen = new HaustierLoeschDialog(page)

    let deleteCount = 0
    page.on('request', (r) => {
      if (r.method() === 'DELETE' && /\/api\/pets\/2$/.test(r.url())) {
        deleteCount++
      }
    })

    await list.deleteButton(2).click() // Minka
    const response = page.waitForResponse((r) => r.request().method() === 'DELETE' && /\/api\/pets\/2$/.test(r.url()))
    await loeschen.confirm.click()
    const del = await response

    // AK 1: Bei Bestätigung sendet das Frontend eine `DELETE /api/pets/{id}`-Anfrage.
    expect(deleteCount).toBe(1)

    // AK 3: Das Backend antwortet mit `204 No Content`.
    expect(del.status()).toBe(204)

    // AK 4: Nach erfolgreichem Löschen schließt sich der Bestätigungsdialog.
    await expect(loeschen.dialog).toBeHidden()

    // AK 2: Das Backend entfernt das Haustier aus der Datenbank
    //       (die neu geladene Liste aus der Datenbank enthält Minka nicht mehr).
    await expect(list.table.getByRole('row', { name: 'Minka' })).toBeHidden()
  })

  /**
   * Deckt ab:
   * - AK 5: Nach erfolgreichem Löschen wird die Haustierliste neu geladen.
   * - AK 6: Das gelöschte Haustier ist nicht mehr in der Liste enthalten.
   * - AK 7: Der Zähler am Navigationseintrag „Haustiere" zeigt die reduzierte Anzahl.
   */
  test('Auswirkungen des Löschens', async ({ page }) => {
    // Vor dem ersten Laden registriert, damit auch der initiale Listen-Request gezählt wird.
    let petsGets = 0
    page.on('response', (r) => {
      if (r.request().method() === 'GET' && r.url().includes('/api/pets')) {
        petsGets++
      }
    })

    const list = new HaustierListPage(page)
    await list.open()
    const loeschen = new HaustierLoeschDialog(page)

    await list.deleteButton(2).click() // Minka
    await loeschen.confirm.click()
    await expect(loeschen.dialog).toBeHidden()

    // AK 5: Nach erfolgreichem Löschen wird die Haustierliste neu geladen.
    expect(petsGets).toBeGreaterThanOrEqual(2) // 1x initialer Load, 1x nach dem Löschen

    // AK 6: Das gelöschte Haustier ist nicht mehr in der Liste enthalten.
    await expect(list.table.getByRole('row', { name: 'Minka' })).toBeHidden()

    // AK 7: Der Zähler am Navigationseintrag „Haustiere" zeigt die reduzierte Anzahl.
    await expect(list.petsNavButton.getByText('2', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 8: Eine verknüpfte Person (falls vorhanden) bleibt erhalten; die Personenliste bleibt unverändert.
   */
  test('Person bleibt erhalten', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const loeschen = new HaustierLoeschDialog(page)

    await list.deleteButton(2).click() // Minka → verknüpft mit Maria Schneider
    await loeschen.confirm.click()
    await expect(loeschen.dialog).toBeHidden()

    await list.personsNavButton.click()

    // AK 8: Eine verknüpfte Person (falls vorhanden) bleibt erhalten; die Personenliste bleibt unverändert.
    await expect(list.table.getByRole('row', { name: 'Maria Schneider' })).toBeVisible()
  })
})
