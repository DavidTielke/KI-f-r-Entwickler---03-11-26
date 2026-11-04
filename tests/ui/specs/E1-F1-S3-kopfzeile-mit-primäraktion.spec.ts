// specs/E1-F1-S3-kopfzeile-mit-primäraktion.spec.ts
//
// Story: specs/E1 Personen/F1 App-Shell/S3 Kopfzeile mit Primäraktion.md
//
// Gruppe 1 „Kopfzeile zeigt Kicker, Titel und Primäraktion" → AK 1, 2, 3, 4

import { expect, test } from '../fixtures/test'
import { AppShell } from '../pages/AppShell'
import { PersonFormDialog } from '../pages/PersonFormDialog'

test.describe('S3 Kopfzeile mit Primäraktion', () => {
  /**
   * Deckt ab:
   * - AK 1: Die Kopfzeile zeigt den Kicker „Stammdaten" über dem Seitentitel.
   * - AK 2: Die Kopfzeile zeigt den Seitentitel „Personen.".
   * - AK 3: Die Kopfzeile zeigt rechtsbündig die Primäraktion „Anlegen".
   * - AK 4: Ein Klick auf „Anlegen" öffnet den Anlegen-Dialog (siehe F3 S1).
   */
  test('Kopfzeile zeigt Kicker, Titel und Primäraktion', async ({ page }) => {
    const app = new AppShell(page)
    const form = new PersonFormDialog(page)
    await page.goto('/')

    // AK 1: Die Kopfzeile zeigt den Kicker „Stammdaten" über dem Seitentitel.
    const kicker = (await app.kicker().boundingBox())!
    const title = (await app.title.boundingBox())!
    expect(kicker.y).toBeLessThan(title.y)

    // AK 2: Die Kopfzeile zeigt den Seitentitel „Personen.".
    await expect(app.title).toContainText('Personen')

    // AK 3: Die Kopfzeile zeigt rechtsbündig die Primäraktion „Anlegen".
    const button = (await app.primaryAction.boundingBox())!
    expect(button.x).toBeGreaterThan(title.x)

    // AK 4: Ein Klick auf „Anlegen" öffnet den Anlegen-Dialog (siehe F3 S1).
    await app.primaryAction.click()
    await expect(form.dialog).toBeVisible()
    await expect(form.dialog.getByText('Person anlegen')).toBeVisible()
  })
})
