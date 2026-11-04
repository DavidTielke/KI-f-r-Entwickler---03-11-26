// specs/E1-F1-S1-sidebar-markierung-und-nutzer-chip.spec.ts
//
// Story: specs/E1 Personen/F1 App-Shell/S1 Sidebar-Markierung und Nutzer-Chip.md
//
// Gruppe 1 „Markierung"   → AK 1, 2
// Gruppe 2 „Nutzer-Chip"  → AK 3, 4, 5

import { expect, test } from '../fixtures/test'
import { AppShell } from '../pages/AppShell'

test.describe('S1 Sidebar-Markierung und Nutzer-Chip', () => {
  /**
   * Deckt ab:
   * - AK 1: Die Sidebar ist links neben dem Inhaltsbereich sichtbar.
   * - AK 2: Die Markenzeile zeigt den App-Namen „Personen" mit orangem „//" und dem Zusatz „Verwaltung".
   */
  test('Markierung', async ({ page }) => {
    const app = new AppShell(page)
    await page.goto('/')

    // AK 1: Die Sidebar ist links neben dem Inhaltsbereich sichtbar.
    const sidebarBox = (await app.sidebar.boundingBox())!
    const topbarBox = (await app.topbar.boundingBox())!
    expect(sidebarBox.x).toBeLessThan(topbarBox.x)

    // AK 2: Die Markenzeile zeigt den App-Namen „Personen" mit orangem „//" und dem Zusatz „Verwaltung".
    // Das „Personen"-Textknoten ist keine eigene Beschriftung (getByText exact = 0); die eindeutigen
    // Markenzeilen-Merkmale „//" und „Verwaltung" belegen die Markenzeile (orange = Gestaltung, nicht geprüft).
    await expect(app.sidebar.getByText('//')).toBeVisible()
    await expect(app.sidebar.getByText('Verwaltung', { exact: true })).toBeVisible()
  })

  /**
   * Deckt ab:
   * - AK 3: Der Nutzer-Chip zeigt das Kürzel „DT" als Avatar.
   * - AK 4: Der Nutzer-Chip zeigt den Namen „David Tielke".
   * - AK 5: Der Nutzer-Chip zeigt die Rolle „Administration".
   */
  test('Nutzer-Chip', async ({ page }) => {
    const app = new AppShell(page)
    await page.goto('/')

    // AK 3: Der Nutzer-Chip zeigt das Kürzel „DT" als Avatar.
    await expect(app.userAvatar()).toBeVisible()

    // AK 4: Der Nutzer-Chip zeigt den Namen „David Tielke".
    await expect(app.userName()).toBeVisible()

    // AK 5: Der Nutzer-Chip zeigt die Rolle „Administration".
    await expect(app.userRole()).toBeVisible()
  })
})
