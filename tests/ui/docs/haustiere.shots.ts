import * as path from 'path'
import { Locator, Page } from '@playwright/test'
import { test, expect } from '../fixtures/test'
import { AppShell } from '../pages/AppShell'
import { HaustierFormDialog } from '../pages/HaustierFormDialog'
import { HaustierListPage } from '../pages/HaustierListPage'
import { HaustierLoeschDialog } from '../pages/HaustierLoeschDialog'

// Screenshots für docs/user/E2-haustiere/ (siehe harness/_userdocs.md, Abschnitt 5).
// Aufruf aus tests/ui:  npx playwright test -c playwright.docs.config.ts haustiere
// Läuft gegen die Testdatenbank mit Standard-Seed (Reset vor jedem Test durch die Fixture).

const OUT = path.resolve(__dirname, '../../../docs/user/E2-haustiere/bilder')
const ORANGE = '#f38a2c'

type Pos = 'tl' | 'r' | 'l' | 'b' | 't'
interface Mark {
  target: Locator
  n: number
  pos?: Pos
}

/** Blendet nummerierte orange Kreise als Overlay ein (nur für den Screenshot). */
async function markers(page: Page, marks: Mark[]): Promise<void> {
  const items: { x: number; y: number; n: number }[] = []
  for (const m of marks) {
    const box = await m.target.boundingBox()
    if (!box) throw new Error(`Markierung ${m.n}: Element nicht sichtbar`)
    const pos = m.pos ?? 'tl'
    let x = box.x
    let y = box.y
    if (pos === 'r') { x = box.x + box.width + 4; y = box.y + box.height / 2 }
    if (pos === 'l') { x = box.x - 4; y = box.y + box.height / 2 }
    if (pos === 't') { x = box.x + box.width / 2; y = box.y - 4 }
    if (pos === 'b') { x = box.x + box.width / 2; y = box.y + box.height + 4 }
    items.push({ x, y, n: m.n })
  }
  await page.evaluate(
    ({ items, color }) => {
      const root = document.createElement('div')
      root.id = 'doc-markers'
      for (const it of items) {
        const d = document.createElement('div')
        d.textContent = String(it.n)
        d.style.cssText =
          `position:fixed;z-index:99999;left:${it.x - 13}px;top:${it.y - 13}px;width:26px;height:26px;` +
          `border-radius:999px;background:${color};color:#fff;font:700 14px/26px "Plus Jakarta Sans",sans-serif;` +
          'text-align:center;pointer-events:none;box-shadow:0 0 0 2px #fff;'
        root.appendChild(d)
      }
      document.body.appendChild(root)
    },
    { items, color: ORANGE },
  )
}

async function clearMarkers(page: Page): Promise<void> {
  await page.evaluate(() => document.getElementById('doc-markers')?.remove())
}

async function settle(page: Page): Promise<void> {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(250)
}

async function shotPage(page: Page, file: string): Promise<void> {
  await settle(page)
  await page.screenshot({ path: path.join(OUT, file), animations: 'disabled', fullPage: false })
}

/** Ausschnitt um einen Dialog (mit Rand), Markierungen liegen im Ausschnitt. */
async function shotDialog(page: Page, dialog: Locator, file: string, pad = 48): Promise<void> {
  await settle(page)
  const box = await dialog.boundingBox()
  if (!box) throw new Error('Dialog nicht sichtbar')
  await page.screenshot({
    path: path.join(OUT, file),
    animations: 'disabled',
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: Math.min(1440, box.width + pad * 2),
      height: Math.min(900, box.height + pad * 2),
    },
  })
}

async function openPets(page: Page): Promise<HaustierListPage> {
  const list = new HaustierListPage(page)
  await list.open()
  await expect(list.counter('3 Haustiere')).toBeVisible()
  return list
}

test.describe('Haustiere – Dokumentations-Screenshots', () => {
  test('Haustierliste', async ({ page }) => {
    const list = await openPets(page)
    const shell = new AppShell(page)

    await shotPage(page, 'haustierliste-01-seite.png')

    await markers(page, [
      { target: list.petsNavButton, n: 1, pos: 'r' },
      { target: shell.primaryAction, n: 2, pos: 'l' },
      { target: page.locator('.dt-tablecard__head'), n: 3, pos: 'tl' },
      { target: list.columnHeader('ID'), n: 4, pos: 't' },
      { target: list.columnHeader('Person'), n: 5, pos: 't' },
      { target: list.editButton(3), n: 6, pos: 't' },
      { target: list.deleteButton(3), n: 7, pos: 't' },
    ])
    await shotPage(page, 'haustierliste-02-elemente.png')
    await clearMarkers(page)
  })

  test('Haustierliste – leer', async ({ page, request }) => {
    for (const id of [1, 2, 3]) {
      expect((await request.delete(`/api/pets/${id}`)).ok()).toBeTruthy()
    }
    const list = new HaustierListPage(page)
    await list.open()
    await expect(page.getByText('Noch keine Haustiere')).toBeVisible()
    await shotPage(page, 'haustierliste-03-leer.png')
  })

  test('Haustierliste – Fehler', async ({ page }) => {
    await page.route('**/api/pets', (route) => route.fulfill({ status: 500, body: 'Fehler' }))
    const list = new HaustierListPage(page)
    await list.open()
    await expect(page.getByText('HTTP 500')).toBeVisible()
    await shotPage(page, 'haustierliste-04-fehler.png')
  })

  test('Haustier anlegen', async ({ page }) => {
    const list = await openPets(page)
    const shell = new AppShell(page)
    const dlg = new HaustierFormDialog(page)

    await shell.primaryAction.click()
    await expect(dlg.dialog).toBeVisible()
    await markers(page, [
      { target: dlg.nameInput, n: 1, pos: 'tl' },
      { target: dlg.speciesSelect, n: 2, pos: 'tl' },
      { target: dlg.personSelect, n: 3, pos: 'tl' },
      { target: dlg.cancel, n: 4, pos: 'tl' },
      { target: dlg.submit, n: 5, pos: 'tl' },
    ])
    await shotDialog(page, dlg.dialog, 'haustier-anlegen-01-dialog.png')
    await clearMarkers(page)

    // Pflichtfelder leer absenden
    await dlg.submit.click()
    await expect(dlg.error('Name ist erforderlich.')).toBeVisible()
    await shotDialog(page, dlg.dialog, 'haustier-anlegen-02-pflichtfelder.png')

    // Ausfüllen
    await dlg.nameInput.fill('Bello')
    await dlg.speciesSelect.selectOption('Katze')
    await dlg.personSelect.selectOption({ label: 'Tom Krüger' })
    await shotDialog(page, dlg.dialog, 'haustier-anlegen-03-ausgefuellt.png')

    // Speichern
    await dlg.submit.click()
    await expect(dlg.dialog).toBeHidden()
    await expect(list.counter('4 Haustiere')).toBeVisible()
    await markers(page, [
      { target: list.row('Bello'), n: 1, pos: 'l' },
      { target: list.petsNavButton, n: 2, pos: 'r' },
    ])
    await shotPage(page, 'haustier-anlegen-04-ergebnis.png')
    await clearMarkers(page)
  })

  test('Haustier bearbeiten', async ({ page }) => {
    const list = await openPets(page)
    const dlg = new HaustierFormDialog(page)

    await markers(page, [{ target: list.editButton(3), n: 1, pos: 't' }])
    await shotPage(page, 'haustier-bearbeiten-01-aktion.png')
    await clearMarkers(page)

    await list.editButton(1).click()
    await expect(dlg.dialog).toBeVisible()
    await expect(dlg.nameInput).toHaveValue('Fiete')
    await markers(page, [
      { target: dlg.dialog.locator('.dt-modal__title'), n: 1, pos: 'r' },
      { target: dlg.nameInput, n: 2, pos: 'tl' },
      { target: dlg.speciesSelect, n: 3, pos: 'tl' },
      { target: dlg.personSelect, n: 4, pos: 'tl' },
      { target: dlg.submit, n: 5, pos: 'tl' },
    ])
    await shotDialog(page, dlg.dialog, 'haustier-bearbeiten-02-dialog.png')
    await clearMarkers(page)

    await dlg.nameInput.fill('Fiete der Zweite')
    await dlg.speciesSelect.selectOption('Katze')
    await dlg.submit.click()
    await expect(dlg.dialog).toBeHidden()
    await expect(list.row('Fiete der Zweite')).toBeVisible()
    await markers(page, [{ target: list.row('Fiete der Zweite'), n: 1, pos: 'l' }])
    await shotPage(page, 'haustier-bearbeiten-03-ergebnis.png')
    await clearMarkers(page)
  })

  test('Haustier löschen', async ({ page }) => {
    const list = await openPets(page)
    const del = new HaustierLoeschDialog(page)

    await markers(page, [{ target: list.deleteButton(3), n: 1, pos: 't' }])
    await shotPage(page, 'haustier-loeschen-01-aktion.png')
    await clearMarkers(page)

    await list.deleteButton(3).click()
    await expect(del.dialog).toBeVisible()
    await markers(page, [
      { target: del.dialog.locator('.dt-danger-tile'), n: 1, pos: 'r' },
      { target: del.dialog.locator('.dt-modal__title'), n: 2, pos: 'r' },
      { target: del.dialog.locator('.dt-stat__sub'), n: 3, pos: 'l' },
      { target: del.cancel, n: 4, pos: 't' },
      { target: del.confirm, n: 5, pos: 't' },
    ])
    await shotDialog(page, del.dialog, 'haustier-loeschen-02-bestaetigung.png')
    await clearMarkers(page)

    await del.confirm.click()
    await expect(del.dialog).toBeHidden()
    await expect(list.counter('2 Haustiere')).toBeVisible()
    await shotPage(page, 'haustier-loeschen-03-ergebnis.png')
  })

  test('Dialoge schließen', async ({ page }) => {
    await openPets(page)
    const shell = new AppShell(page)
    const dlg = new HaustierFormDialog(page)

    await shell.primaryAction.click()
    await expect(dlg.dialog).toBeVisible()
    await markers(page, [
      { target: dlg.close, n: 1, pos: 'l' },
      { target: dlg.cancel, n: 2, pos: 'tl' },
      { target: page.locator('.dt-sidebar'), n: 3, pos: 'r' },
    ])
    await settle(page)
    await page.screenshot({ path: path.join(OUT, 'dialoge-schliessen-01-dialog.png'), animations: 'disabled' })
    await clearMarkers(page)
  })
})
