// specs/E2-F2-S2-validierung-des-anlegen-dialogs.spec.ts
//
// Story: specs/E2 Haustiere/F2 Haustier anlegen/S2 Validierung des Anlegen-Dialogs.md
//
// Gruppe 1 „Name-Validierung"                → AK 1, 2, 3
// Gruppe 2 „Spezies- und Person-Validierung"  → AK 4, 5, 6
// Gruppe 3 „Serverfehler im Dialog"           → AK 7, 8

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S2 Validierung des Anlegen-Dialogs', () => {
  /**
   * Deckt ab:
   * - AK 1: Das Feld `Name` ist ein Pflichtfeld.
   * - AK 2: Ein leerer `Name` erzeugt die Fehlermeldung „Name ist erforderlich.".
   * - AK 3: Der übergebene `Name` enthält keine führenden oder nachstehenden Leerzeichen.
   */
  test('Name-Validierung', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    let postCount = 0
    page.on('request', (r) => {
      if (r.method() === 'POST' && r.url().includes('/api/pets')) {
        postCount++
      }
    })

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await form.submit.click() // leeres Absenden

    // AK 1: Das Feld `Name` ist ein Pflichtfeld. → Die leere Eingabe wird clientseitig
    //       abgewiesen, es wird keine `POST /api/pets`-Anfrage gesendet, Dialog bleibt geöffnet.
    await expect(form.dialog).toBeVisible()
    expect(postCount).toBe(0)

    // AK 2: Ein leerer `Name` erzeugt die Fehlermeldung „Name ist erforderlich.".
    await expect(form.error('Name ist erforderlich.')).toBeVisible()

    // AK 3: Der übergebene `Name` enthält keine führenden oder nachstehenden Leerzeichen.
    await form.nameInput.fill(' Bello ')
    await form.speciesSelect.selectOption({ label: 'Hund' })
    const response = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/api/pets'))
    await form.submit.click()
    const post = await response
    const body = post.request().postDataJSON() as { name?: string }
    expect(body?.name).toBe('Bello')
    await expect(list.row('Bello')).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 4: Das Feld `Spezies` ist ein Pflichtfeld.
   * - AK 5: Ein nicht ausgewählter `Spezies`-Wert erzeugt die Fehlermeldung „Spezies ist erforderlich.".
   * - AK 6: Das Feld `Person` ist ein optionales Feld.
   */
  test('Spezies- und Person-Validierung', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await form.nameInput.fill('Bella')
    await form.submit.click() // `Spezies` ist noch nicht ausgewählt

    // AK 4: Das Feld `Spezies` ist ein Pflichtfeld. → Absenden wird abgewiesen, Dialog bleibt geöffnet.
    await expect(form.dialog).toBeVisible()

    // AK 5: Ein nicht ausgewählter `Spezies`-Wert erzeugt die Fehlermeldung „Spezies ist erforderlich.".
    await expect(form.error('Spezies ist erforderlich.')).toBeVisible()

    // AK 6: Das Feld `Person` ist ein optionales Feld. → Anlegen ohne Person gelingt,
    // das neue Tier erscheint in der Liste ohne Personen-Verknüpfung ("—").
    await form.speciesSelect.selectOption({ label: 'Vogel' })
    await form.submit.click()
    await expect(form.dialog).toBeHidden()
    await expect(list.row('Bella').getByText('—', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 7: `Name` und `Species` werden client- und serverseitig validiert.
   * - AK 8: Bei einem serverseitigen Validierungsfehler zeigt der Dialog die Fehlermeldung des Backends an.
   */
  test('Serverfehler im Dialog', async ({ page }) => {
    // Die serverseitige 1:1-Prüfung wird per Interception simuliert:
    // Das Backend antwortet mit 400 und Problem-JSON.
    await page.route('**/api/pets*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 400,
          contentType: 'application/problem+json',
          body: JSON.stringify({ title: 'Die Person hat bereits ein Haustier.' }),
        })
        return
      }
      await route.continue()
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await form.nameInput.fill('Bella')
    await form.speciesSelect.selectOption({ label: 'Hund' })
    const response = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/api/pets'))
    await form.submit.click()
    const post = await response

    // AK 7: `Name` und `Species` werden client- und serverseitig validiert.
    // Die gültige clientseitig validierte Eingabe erreicht das Backend (Anfrage mit Daten gesendet).
    const body = post.request().postDataJSON() as { name?: string; species?: string }
    expect(body).toMatchObject({ name: 'Bella', species: 'Hund' })

    // AK 8: Bei einem serverseitigen Validierungsfehler zeigt der Dialog die Fehlermeldung des Backends an.
    await expect(form.error('Die Person hat bereits ein Haustier.')).toBeVisible()
  })
})
