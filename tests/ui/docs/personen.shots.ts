import path from 'node:path'
import type { Locator, Page } from '@playwright/test'
import { test } from '../fixtures/test'
import { personsSeed } from '../fixtures/seed'

// Screenshots für docs/user/E1-personen/. Läuft gegen die Testdatenbank mit Standard-Seed.
// Aufruf: npx playwright test -c playwright.docs.config.ts personen.shots.ts
const OUT = path.resolve(__dirname, '../../../docs/user/E1-personen/bilder')
const out = (name: string) => path.join(OUT, `${name}.png`)

type Mark = { target: Locator; n: number; at?: 'tl' | 'tr' | 'l' | 'r'; dx?: number; dy?: number }

/** Zeichnet nummerierte orange Kreise (Akzentfarbe) als Overlay über die Seite. */
async function mark(page: Page, marks: Mark[]) {
  const items: { x: number; y: number; n: number }[] = []
  for (const m of marks) {
    const at = m.at ?? 'tl'
    // Bei 'l' wird der Textbereich (nicht der ganze Block) vermessen und der Kreis links davor gesetzt.
    const box =
      at === 'l'
        ? await m.target.first().evaluate((el) => {
            const r = document.createRange()
            r.selectNodeContents(el)
            const b = r.getBoundingClientRect()
            return { x: b.x - 18, y: b.y, width: 0, height: b.height }
          })
        : await m.target.first().boundingBox()
    if (!box) throw new Error(`Markierung ${m.n}: Element nicht sichtbar`)
    const x = at === 'tr' || at === 'r' ? box.x + box.width : box.x
    const y = at === 'l' || at === 'r' ? box.y + box.height / 2 : box.y
    items.push({ x: x + (m.dx ?? 0), y: y + (m.dy ?? 0), n: m.n })
  }
  await page.evaluate((list) => {
    const root = document.createElement('div')
    root.id = 'doc-marks'
    root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;'
    for (const i of list) {
      const c = document.createElement('div')
      c.textContent = String(i.n)
      c.style.cssText = `position:absolute;left:${i.x - 13}px;top:${i.y - 13}px;width:26px;height:26px;border-radius:50%;background:#f38a2c;color:#fff;font:700 13px "Plus Jakarta Sans",Arial,sans-serif;text-align:center;border:2px solid #fff;box-sizing:border-box;line-height:22px;`
      root.appendChild(c)
    }
    document.body.appendChild(root)
  }, items)
}

async function unmark(page: Page) {
  await page.evaluate(() => document.getElementById('doc-marks')?.remove())
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: out(name), animations: 'disabled' })
}

/** Ausschnitt um einen Dialog herum (inkl. Platz für Markierungen). */
async function shotDialog(page: Page, name: string) {
  const box = await page.locator('.dt-modal').boundingBox()
  if (!box) throw new Error('Dialog nicht sichtbar')
  const pad = 24
  await page.screenshot({
    path: out(name),
    animations: 'disabled',
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + 2 * pad,
      height: box.height + 2 * pad,
    },
  })
}

async function open(page: Page) {
  await page.goto('/')
  await page.getByText('4 Personen').waitFor()
}

const row = (page: Page, id: number) => page.locator('tbody tr').filter({ hasText: `#${id}` })

test('Personenliste', async ({ page }) => {
  await open(page)
  await shot(page, 'personenliste-01-uebersicht')
  await mark(page, [
    { target: page.locator('.dt-nav__item', { hasText: 'Personen' }), n: 1, at: 'tr' },
    { target: page.locator('.dt-topbar__title'), n: 2, at: 'l' },
    { target: page.getByRole('button', { name: 'Anlegen', exact: true }), n: 3 },
    { target: page.locator('.dt-tablecard__head'), n: 4, at: 'l' },
    { target: page.locator('thead th').nth(0), n: 5 },
    { target: page.locator('thead th').nth(1), n: 6 },
    { target: page.locator('thead th').nth(2), n: 7 },
    { target: page.locator('thead th').nth(3), n: 8 },
    { target: row(page, 1).locator('.dt-iconbtn').first(), n: 9 },
    { target: row(page, 1).locator('.dt-iconbtn').nth(1), n: 10 },
    { target: page.locator('.dt-avatar'), n: 11, at: 'tr' },
  ])
  await shot(page, 'personenliste-02-markiert')
})

test('Personenliste - Leerzustand', async ({ page, request }) => {
  for (const p of personsSeed) await request.delete(`/api/persons/${p.id}`)
  await page.goto('/')
  await page.getByText('Noch keine Personen').waitFor()
  await shot(page, 'personenliste-03-leer')
})

test('Personenliste - Fehleranzeige', async ({ page }) => {
  await page.route('**/api/persons', (route) => route.fulfill({ status: 500, body: '' }))
  await page.goto('/')
  await page.getByText('HTTP 500').waitFor()
  await shot(page, 'personenliste-04-fehler')
})

test('Person anlegen', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Anlegen', exact: true }).click()
  await page.locator('.dt-modal').waitFor()
  await mark(page, [
    { target: page.locator('.dt-modal__title'), n: 1, at: 'l' },
    { target: page.locator('.dt-modal__close'), n: 2, at: 'tr' },
    { target: page.locator('#person-name'), n: 3 },
    { target: page.locator('#person-age'), n: 4 },
    { target: page.locator('#person-pet'), n: 5 },
    { target: page.getByRole('button', { name: 'Abbrechen' }), n: 6 },
    { target: page.locator('button[type=submit]'), n: 7 },
  ])
  await shotDialog(page, 'person-anlegen-01-dialog')
  await unmark(page)

  await page.locator('#person-name').fill('Lena Hoffmann')
  await page.locator('#person-age').fill('37')
  await shotDialog(page, 'person-anlegen-02-ausgefuellt')

  await page.locator('#person-pet').selectOption({ label: 'Rex (Hund)' })
  await shotDialog(page, 'person-anlegen-03-haustier')

  await page.locator('#person-pet').selectOption({ label: 'Kein Haustier' })
  await page.locator('button[type=submit]').click()
  await page.locator('.dt-modal').waitFor({ state: 'detached' })
  await page.getByText('5 Personen').waitFor()
  await shot(page, 'person-anlegen-05-ergebnis')
})

test('Person anlegen - Fehler', async ({ page }) => {
  await open(page)
  await page.getByRole('button', { name: 'Anlegen', exact: true }).click()
  await page.locator('button[type=submit]').click()
  await page.getByText('Name ist erforderlich.').waitFor()
  await shotDialog(page, 'person-anlegen-04-fehler')
})

test('Person bearbeiten', async ({ page }) => {
  await open(page)
  await mark(page, [{ target: row(page, 2).locator('.dt-iconbtn').first(), n: 1 }])
  await shot(page, 'person-bearbeiten-01-zeile')
  await unmark(page)
  await row(page, 2).locator('.dt-iconbtn').first().click()
  await page.locator('.dt-modal').waitFor()
  await mark(page, [
    { target: page.locator('.dt-modal__title'), n: 1, at: 'l' },
    { target: page.locator('#person-name'), n: 2 },
    { target: page.locator('#person-age'), n: 3 },
    { target: page.locator('#person-pet'), n: 4 },
    { target: page.locator('button[type=submit]'), n: 5 },
  ])
  await shotDialog(page, 'person-bearbeiten-02-dialog')
  await unmark(page)
  await page.locator('#person-age').fill('42')
  await shotDialog(page, 'person-bearbeiten-03-geaendert')
  await page.locator('button[type=submit]').click()
  await page.locator('.dt-modal').waitFor({ state: 'detached' })
  await row(page, 2).getByText('42', { exact: true }).waitFor()
  await shot(page, 'person-bearbeiten-04-ergebnis')
})

test('Person löschen', async ({ page }) => {
  await open(page)
  await mark(page, [{ target: row(page, 3).locator('.dt-iconbtn').nth(1), n: 1 }])
  await shot(page, 'person-loeschen-01-zeile')
  await unmark(page)
  await row(page, 3).locator('.dt-iconbtn').nth(1).click()
  await page.locator('.dt-modal').waitFor()
  await mark(page, [
    { target: page.locator('.dt-danger-tile'), n: 1 },
    { target: page.locator('.dt-modal__title'), n: 2, at: 'l' },
    { target: page.getByRole('button', { name: 'Abbrechen' }), n: 3 },
    { target: page.getByRole('button', { name: 'Löschen', exact: true }), n: 4 },
  ])
  await shotDialog(page, 'person-loeschen-02-bestaetigung')
  await unmark(page)
  await page.getByRole('button', { name: 'Löschen', exact: true }).click()
  await page.getByText('3 Personen').waitFor()
  await shot(page, 'person-loeschen-03-ergebnis')
})

test('Reihenfolge ändern', async ({ page }) => {
  await open(page)
  await mark(page, [
    { target: row(page, 2).locator('.dt-reorder__grip'), n: 1, at: 'l', dx: -6 },
    { target: row(page, 2).locator('.dt-reorder__arrow').first(), n: 2, at: 'r', dx: 22, dy: -12 },
    { target: row(page, 2).locator('.dt-reorder__arrow').nth(1), n: 3, at: 'r', dx: 22, dy: 12 },
    { target: row(page, 1).locator('.dt-reorder__arrow').first(), n: 4, at: 'r', dx: 22, dy: -6 },
  ])
  await shot(page, 'reihenfolge-01-bedienelemente')
  await unmark(page)
  await row(page, 2).locator('.dt-reorder__arrow').first().click()
  await page.waitForTimeout(800)
  await shot(page, 'reihenfolge-02-ergebnis')
})
