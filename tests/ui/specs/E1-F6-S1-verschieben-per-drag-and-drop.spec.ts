// specs/E1-F6-S1-verschieben-per-drag-and-drop.spec.ts
//
// Story: specs/E1 Personen/F6 Reihenfolge verwalten/S1 Verschieben per Drag & Drop.md
//
// Gruppe 1 „Ziehgrip"            → AK 2, 3
// Gruppe 2 „Ziehen und Loslassen" → AK 4, 5, 6, 7
// (AK 1 „bunter Partikelregen" ist eine transiente, vom Cursor folgende Animation → nicht deterministisch testbar)

import type { Page } from '@playwright/test'
import { expect, test } from '../fixtures/test'
import { PersonenListPage } from '../pages/PersonenListPage'
import { personsSeed } from '../fixtures/seed'

// Liest die Name-Zellen der Datenzeilen in DOM-Reihenfolge aus (Read, keine Assertion).
async function rowNames(page: Page): Promise<string[]> {
  const rows = page.getByRole('row')
  const count = await rows.count()
  const names: string[] = []
  for (let i = 1; i < count; i++) {
    names.push((await rows.nth(i).getByRole('cell').nth(2).innerText()).trim())
  }
  return names
}

test.describe('S1 Verschieben per Drag & Drop', () => {
  test.skip(
    'bunter Partikelregen folgt dem Cursor beim Verschieben (AK 1)',
    () => {
      // Transiente Animation, die dem Cursor folgt — kein deterministischer Endzustand.
    }
  )

  /**
   * Deckt ab:
   * - AK 2: Jede Zeile zeigt in der Spalte „Reihenfolge" einen Ziehgrip.
   * - AK 3: Die Zeile ist nur über den Ziehgrip ziehbar (draggable toggelt beim Grip-Mousedown).
   */
  test('Ziehgrip', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const anna = personsSeed[0]
    await persons.open()

    // AK 2: Jede Zeile zeigt in der Spalte „Reihenfolge" einen Ziehgrip.
    for (const p of personsSeed) {
      await expect(persons.grip(p.name)).toHaveCount(1)
    }

    // AK 3: Die Zeile ist nur über den Ziehgrip ziehbar.
    await expect(persons.row(anna.name)).toHaveAttribute('draggable', 'false')
    await persons.grip(anna.name).dispatchEvent('mousedown')
    await expect(persons.row(anna.name)).toHaveAttribute('draggable', 'true')
  })

  /**
   * Deckt ab:
   * - AK 4: Die gezogene Zeile wird während des Ziehens visuell als gezogen markiert.
   * - AK 5: Beim Überfahren einer anderen Zeile weichen die übrigen Zeilen live aus.
   * - AK 6: Nach dem Loslassen wird die aktuelle Zeilenreihenfolge an das Backend übertragen.
   * - AK 7: Nach dem Loslassen ohne Positionswechsel bleibt die Reihenfolge unverändert.
   */
  test('Ziehen und Loslassen', async ({ page }) => {
    const persons = new PersonenListPage(page)
    const anna = personsSeed[0]
    const maria = personsSeed[3]
    const patches: unknown[] = []
    await page.route('**/api/persons/reorder', (route) => {
      patches.push(route.request().postDataJSON())
      return route.continue()
    })
    await page.goto('/')
    await persons.open()

    // Sub-Szenario A: Anna (Index 0) über Maria (Index 2) ziehen.
    await persons.grip(anna.name).dispatchEvent('mousedown')
    await persons.row(anna.name).evaluate((el) =>
      el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }))
    )

    // AK 4: Die gezogene Zeile ist visuell als gezogen markiert.
    await expect(persons.row(anna.name)).toHaveClass(/dragging/)

    // AK 5: Beim Überfahren weichen die übrigen Zeilen live aus (Reihenfolge vor dem Loslassen geändert).
    await persons.row(maria.name).evaluate((el) =>
      el.dispatchEvent(new DragEvent('dragover', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }))
    )
    expect(await rowNames(page)).toEqual(['Jonas Weber', 'Maria Schneider', 'Anna Berger', 'Tom Krüger'])

    // Drop + Dragend → die neue Reihenfolge wird übertragen.
    await persons.row(maria.name).evaluate((el) => {
      const dt = new DataTransfer()
      el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }))
      el.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: dt }))
    })

    // AK 6: Nach dem Loslassen wird die aktuelle Zeilenreihenfolge an das Backend übertragen.
    await expect(patches.at(-1)).toEqual({ ids: [2, 4, 1, 3] })

    // Sub-Szenario B: Ziehen ohne Positionswechsel.
    await persons.grip(anna.name).dispatchEvent('mousedown')
    await persons.row(anna.name).evaluate((el) =>
      el.dispatchEvent(new DragEvent('dragstart', { bubbles: true, cancelable: true, dataTransfer: new DataTransfer() }))
    )
    await persons.row(anna.name).evaluate((el) => {
      const dt = new DataTransfer()
      el.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer: dt }))
      el.dispatchEvent(new DragEvent('dragend', { bubbles: true, cancelable: true, dataTransfer: dt }))
    })

    // AK 7: Nach dem Loslassen ohne Positionswechsel bleibt die Reihenfolge unverändert.
    expect(await rowNames(page)).toEqual(['Jonas Weber', 'Maria Schneider', 'Anna Berger', 'Tom Krüger'])
  })
})
