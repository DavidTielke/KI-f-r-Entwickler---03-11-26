// specs/E2-F2-S3-anlegen-abwickeln.spec.ts
//
// Story: specs/E2 Haustiere/F2 Haustier anlegen/S3 Anlegen abwickeln.md
//
// Gruppe 1 „Gültiges Haustier anlegen"  → AK 1, 2, 3, 4, 5, 6
// Gruppe 2 „Person wird verknüpft"     → AK 7
// Gruppe 3 „Zähler wird erhöht"        → AK 8
// Gruppe 4 „Während des Speicherns"    → AK 9, 10

import { expect, test } from '../fixtures/test'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'

test.describe('S3 Anlegen abwickeln', () => {
  /**
   * Deckt ab:
   * - AK 1: Bei gültiger Eingabe sendet der Dialog eine `POST /api/pets`-Anfrage mit `Name`, `Species` und `PersonId`.
   * - AK 2: Das Backend legt das Haustier mit dem übergebenen `Name`, `Species` und `PersonId` an.
   * - AK 3: Das Backend antwortet mit `201 Created` und einem `Location`-Header auf `GET /api/pets/{id}`.
   * - AK 4: Nach erfolgreichem Anlegen schließt sich der Dialog.
   * - AK 5: Nach erfolgreichem Anlegen wird die Haustierliste neu geladen.
   * - AK 6: Das neu angelegte Haustier erscheint in der Liste.
   */
  test('Gültiges Haustier anlegen', async ({ page }) => {
    // Vor dem ersten Laden registriert, damit auch der initiale Listen-Request gezählt wird.
    let petsGets = 0
    page.on('response', (r) => {
      if (r.request().method() === 'GET' && r.url().includes('/api/pets')) {
        petsGets++
      }
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await form.nameInput.fill('Bella')
    await form.speciesSelect.selectOption({ label: 'Katze' })

    const response = page.waitForResponse((r) => r.request().method() === 'POST' && r.url().includes('/api/pets'))
    await form.submit.click()
    const post = await response

    // AK 1: Bei gültiger Eingabe sendet der Dialog eine `POST /api/pets`-Anfrage mit `Name`, `Species` und `PersonId`.
    const body = post.request().postDataJSON() as { name?: string; species?: string; personId?: number | null }
    expect(body).toMatchObject({ name: 'Bella', species: 'Katze', personId: null })

    // AK 3: Das Backend antwortet mit `201 Created` und einem `Location`-Header auf `GET /api/pets/{id}`.
    expect(post.status()).toBe(201)
    expect(post.headers()['location']).toMatch(/\/api\/pets\/\d+$/)

    // AK 4: Nach erfolgreichem Anlegen schließt sich der Dialog.
    await expect(form.dialog).toBeHidden()

    // AK 5: Nach erfolgreichem Anlegen wird die Haustierliste neu geladen.
    expect(petsGets).toBeGreaterThanOrEqual(2) // 1x initialer Load, 1x nach dem Anlegen

    // AK 2: Das Backend legt das Haustier mit dem übergebenen `Name`, `Species` und `PersonId` an.
    // AK 6: Das neu angelegte Haustier erscheint in der Liste.
    const row = list.row('Bella')
    await expect(row).toBeVisible()
    await expect(row.getByText('#4', { exact: true })).toBeVisible()
    await expect(row.getByText('Bella', { exact: true })).toBeVisible()
    await expect(row.getByText('Katze', { exact: true })).toBeVisible()
    await expect(row.getByText('—', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 7: Bei einer übergebenen `PersonId` zeigt die Spalte „Person" den `Name` der verknüpften Person.
   */
  test('Person wird verknüpft', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await form.nameInput.fill('Bella')
    await form.speciesSelect.selectOption({ label: 'Hund' })
    await form.personSelect.selectOption({ label: 'Jonas Weber' })
    await form.submit.click()

    // AK 7: Bei einer übergebenen `PersonId` zeigt die Spalte „Person" den `Name` der verknüpften Person.
    await expect(list.row('Bella').getByText('Jonas Weber', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 8: Der Zähler am Navigationseintrag „Haustiere" zeigt die erhöhte Anzahl.
   */
  test('Zähler wird erhöht', async ({ page }) => {
    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await form.nameInput.fill('Bella')
    await form.speciesSelect.selectOption({ label: 'Katze' })
    await form.submit.click()

    // AK 8: Der Zähler am Navigationseintrag „Haustiere" zeigt die erhöhte Anzahl.
    await expect(list.petsNavButton.getByText('4', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 9: Während des Speicherns ist der Submit-Button deaktiviert.
   * - AK 10: Während des Speicherns zeigt der Submit-Button „Wird gespeichert …".
   */
  test('Während des Speicherns', async ({ page }) => {
    // Die Anlegen-Anfrage wird verzögert, damit der Speichern-Zustand beobachtbar wird.
    await page.route('**/api/pets*', async (route) => {
      if (route.request().method() === 'POST') {
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }
      await route.continue()
    })

    const list = new HaustierListPage(page)
    await list.open()
    const form = new HaustierFormDialog(page)

    await list.topbar.getByRole('button', { name: 'Anlegen' }).click()
    await form.nameInput.fill('Bella')
    await form.speciesSelect.selectOption({ label: 'Katze' })
    await form.submit.click()

    // AK 9: Während des Speicherns ist der Submit-Button deaktiviert.
    await expect(form.submit).toBeDisabled()

    // AK 10: Während des Speicherns zeigt der Submit-Button „Wird gespeichert …".
    await expect(form.submit).toHaveText('Wird gespeichert …')
    await expect(form.dialog).toBeHidden()
  })
})
