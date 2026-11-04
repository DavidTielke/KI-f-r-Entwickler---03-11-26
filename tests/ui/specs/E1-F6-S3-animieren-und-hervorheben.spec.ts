// specs/E1-F6-S3-animieren-und-hervorheben.spec.ts
//
// Story: specs/E1 Personen/F6 Reihenfolge verwalten/S3 Animation und Hervorhebung.md
//
// Gruppe 1 „Pfeil-Button: Hervorhebung"   → AK 3, 5
// Gruppe 2 „Drag & Drop: Hervorhebung"    → AK 4, 5
// (AK 1 „gleiten in ~220 ms" und AK 2 „keine Animation während Drag" sind FLIP-Transforms,
//  die im Headless-Chromium nicht deterministisch messbar sind.)

import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'

test.describe('S3 Animation und Hervorhebung', () => {
  test.skip(
    'Verschiebungs-Animationen (AK 1, AK 2)',
    () => {
      // FLIP-Transform-Animation (220 ms) und deren Unterdrückung während eines Drags lassen
      // sich im Headless-Chromium nicht deterministisch prüfen — kein stabiler Endzustand.
    }
  )

  /**
   * Deckt ab:
   * - AK 3: Nach einem Verschieben per Pfeil-Button wird die verschobene Zeile kurz hervorgehoben.
   * - AK 5: Die Hervorhebung endet automatisch.
   */
  test('Pfeil-Button: Hervorhebung', async ({ page }) => {
    const persons = new PersonenListPage(page)
    await persons.open()

    await persons.moveButton('Jonas Weber', 'oben').click()

    // AK 3: Die verschobene Zeile ist kurz hervorgehoben.
    await expect(persons.row('Jonas Weber')).toHaveClass(/flash/)

    // AK 5: Die Hervorhebung endet automatisch.
    await expect(persons.row('Jonas Weber')).not.toHaveClass(/flash/)
  })

  /**
   * Deckt ab:
   * - AK 4: Nach einem Drag & Drop wird die gezogene Zeile kurz hervorgehoben.
   * - AK 5: Die Hervorhebung endet automatisch.
   */
  test('Drag & Drop: Hervorhebung', async ({ page }) => {
    const persons = new PersonenListPage(page)
    await persons.open()

    await persons.grip('Anna Berger').dispatchEvent('mousedown')
    await persons.row('Anna Berger').evaluate((el) =>
      el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }))
    )
    await persons.row('Maria Schneider').evaluate((el) =>
      el.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }))
    )
    await persons.row('Maria Schneider').evaluate((el) => {
      const dt = new DataTransfer()
      el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }))
      el.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: dt }))
    })

    // AK 4: Die gezogene Zeile ist kurz hervorgehoben.
    await expect(persons.row('Anna Berger')).toHaveClass(/flash/)

    // AK 5: Die Hervorhebung endet automatisch.
    await expect(persons.row('Anna Berger')).not.toHaveClass(/flash/)
  })
})
