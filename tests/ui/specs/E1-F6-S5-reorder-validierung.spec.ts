// specs/E1-F6-S5-reorder-validierung.spec.ts
//
// Story: specs/E1 Personen/F6 Reihenfolge verwalten/S5 Reorder-Validierung im Backend.md
//
// Diese Story beschreibt die Validierung des Reorder-Endpunkts — sie wird über die API
// (Playwright `request`-Fixture) geprüft, da die UI nur vollständige Listen senden kann.
//
// Gruppe 1 „Gültige Reorder-Liste" → AK 1, 2, 3, 4
// Gruppe 2 „Ungültige Listen"      → AK 5, 6, 7

import { test, expect } from '../fixtures/test'

test.describe('S5 Reorder-Validierung im Backend', () => {
  /**
   * Deckt ab:
   * - AK 1: Der Reorder-Endpunkt akzeptiert eine Liste von Id-Werten.
   * - AK 2: Die übergebene Listenreihenfolge wird als neue Anzeigereihenfolge übernommen.
   * - AK 3: Die Personen erhalten Order-Werte von 1 bis n in Listenreihenfolge.
   * - AK 4: Das Backend antwortet mit 204 No Content.
   */
  test('Gültige Reorder-Liste', async ({ request }) => {
    // Die Testdatenbank wird vor jedem Test automatisch auf den Basisdatensatz zurückgesetzt.

    // AK 1 + AK 4: Eine gültige Id-Liste wird angenommen und das Backend antwortet mit 204.
    const ok = await request.patch('/api/persons/reorder', { data: { ids: [2, 1, 4, 3] } })
    expect(ok.status()).toBe(204)

    // AK 2 + AK 3: Die Listenreihenfolge wird als neue Anzeigereihenfolge übernommen
    // (das API-Listing sortiert nach Order und liefert genau diese Id-Reihenfolge zurück).
    const res = await request.get('/api/persons')
    expect(res.status()).toBe(200)
    const persons = await res.json()
    expect(persons.map((p: { id: number }) => p.id)).toEqual([2, 1, 4, 3])
  })

  /**
   * Deckt ab:
   * - AK 5: Bei einer leeren ID-Liste antwortet das Backend mit 400 und „…doppelte oder fehlende…".
   * - AK 6: Bei doppelten Id-Werten antwortet das Backend mit 400 und „…doppelte oder fehlende…".
   * - AK 7: Bei nicht existierenden Id-Werten antwortet das Backend mit 400 und „…unbekannte…".
   */
  test('Ungültige Listen', async ({ request }) => {
    // AK 5: Leere ID-Liste → 400 Bad Request.
    const empty = await request.patch('/api/persons/reorder', { data: { ids: [] } })
    expect(empty.status()).toBe(400)
    const emptyBody = await empty.text()
    expect(emptyBody).toContain('Reihenfolge enthält doppelte oder fehlende Einträge.')

    // AK 6: Doppelte Id-Werte → 400 Bad Request.
    const dup = await request.patch('/api/persons/reorder', { data: { ids: [1, 1, 2, 3] } })
    expect(dup.status()).toBe(400)
    const dupBody = await dup.text()
    expect(dupBody).toContain('Reihenfolge enthält doppelte oder fehlende Einträge.')

    // AK 7: Nicht existierende Id → 400 Bad Request.
    const unknown = await request.patch('/api/persons/reorder', { data: { ids: [1, 2, 3, 99] } })
    expect(unknown.status()).toBe(400)
    const unknownBody = await unknown.text()
    expect(unknownBody).toContain('Reihenfolge enthält unbekannte Personen.')
  })
})
