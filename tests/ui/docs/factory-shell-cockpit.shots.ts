import { test, type Locator, type Page } from '@playwright/test'
import path from 'node:path'

// Erzeugt die Screenshots für App-Shell, Cockpit und Einstellungen der Software Factory.
// Alle Antworten des Dienstes werden mit Beispieldaten simuliert; es entstehen keine echten Aufträge.
const OUT = path.resolve(__dirname, '../../../docs/user/E3-software-factory/bilder')

const MODELS = [
  { id: 'claude-haiku-5-5', label: 'Schnell', detail: 'Haiku 5.5' },
  { id: 'claude-sonnet-5-5', label: 'Ausgewogen', detail: 'Sonnet 5.5' },
  { id: 'claude-opus-5-5', label: 'Gründlich', detail: 'Opus 5.5' },
  { id: 'claude-fable-5-1', label: 'Maximal', detail: 'Fable 5.1' },
]

const day = (offset: number) => {
  const d = new Date('2026-11-04T12:00:00')
  d.setDate(d.getDate() - offset)
  return d.toISOString().slice(0, 10)
}

const overview = {
  nav: { ideasOpen: 3, requirementsOpen: 5, runsActive: 1 },
  totals: { open: 5, implemented: 18, features: 6, deliveries: 4, rate: 78, stories: 23, criteria: 212, epics: 3, avgDurationMs: 1500000 },
  ideas: { draft: 2, ready: 1, transferred: 4 },
  byEpic: [
    { name: 'Personen', umgesetzt: 8, offen: 1 },
    { name: 'Haustiere', umgesetzt: 6, offen: 2 },
    { name: 'Berichte', umgesetzt: 4, offen: 2 },
  ],
  daily: Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i), count: [0, 2, 1, 0, 4, 3, 0, 0, 5, 2, 1, 6, 3, 2][i] })),
  actions: [
    { title: 'Idee I-003 »Erinnerungen per E-Mail« ist bereit zur Freigabe', href: '#/ideen/I-003', tone: 'orange', cta: 'Idee prüfen' },
    { title: 'Idee I-005 »Jahresbericht als PDF« wartet auf Ihre Antwort', href: '#/ideen/I-005', tone: 'orange', cta: 'Dialog fortsetzen' },
    { title: 'Idee I-002 »Tierarzt-Termine« ist freigegeben', href: '#/ideen/I-002', tone: 'green', cta: 'Anforderungen erstellen' },
    { title: '5 Anforderungen warten auf die Umsetzung', href: '#/anforderungen?filter=offen', tone: 'green', cta: 'Anforderungen auswählen' },
    { title: 'Auftrag A-004 wurde nicht abgeschlossen und benötigt eine Entscheidung', href: '#/umsetzung/A-004', tone: 'error', cta: 'Auftrag öffnen' },
  ],
  activeRuns: [
    { id: 'A-005', type: 'delivery', title: 'Haustiere nach Art filtern', status: 'running', phases: [{ label: 'Umsetzen', status: 'active' }] },
    { id: 'A-006', type: 'delivery', title: 'Jahresbericht als PDF', status: 'queued', phases: [] },
  ],
  recent: [
    { type: 'delivery', title: 'Auslieferung A-003 abgeschlossen', at: '2026-11-04T09:12:00' },
    { type: 'run', title: 'Auftrag A-005 gestartet', at: '2026-11-04T08:40:00' },
    { type: 'requirement', title: 'Anforderung »Haustiere nach Art filtern« angelegt', at: '2026-11-03T16:05:00' },
    { type: 'idea', title: 'Idee »Erinnerungen per E-Mail« angelegt', at: '2026-11-03T11:30:00' },
    { type: 'delivery', title: 'Auslieferung A-002 abgeschlossen', at: '2026-11-02T15:20:00' },
    { type: 'idea', title: 'Idee »Tierarzt-Termine« freigegeben', at: '2026-11-02T10:02:00' },
  ],
}

const emptyOverview = {
  nav: { ideasOpen: 0, requirementsOpen: 0, runsActive: 0 },
  totals: { open: 0, implemented: 0, features: 0, deliveries: 0, rate: 0, stories: 0, criteria: 0, epics: 0, avgDurationMs: null },
  ideas: { draft: 0, ready: 0, transferred: 0 },
  byEpic: [],
  daily: Array.from({ length: 14 }, (_, i) => ({ day: day(13 - i), count: 0 })),
  actions: [],
  activeRuns: [],
  recent: [],
}

const system = (ok = true) => ({
  checks: [
    { key: 'ai', label: 'KI-Anbindung', ok: true, detail: '2.1.0 (Claude Code)' },
    { key: 'docker', label: 'Betriebsumgebung', ok, detail: ok ? 'Docker 27.4.0' : 'Docker Desktop ist nicht gestartet' },
    { key: 'git', label: 'Versionsverwaltung', ok: true, detail: 'git version 2.47.1' },
    { key: 'app', label: 'Anwendung', ok, detail: ok ? 'http://localhost:8081' : 'Nicht erreichbar' },
  ],
  app: { url: 'http://localhost:8081', online: ok },
  user: 'Max Beispiel',
})

const settings = { dialogModel: 'claude-sonnet-5-5', buildModel: 'claude-opus-5-5', appUrl: 'http://localhost:8081', models: MODELS }

async function mock(page: Page, opts: { overview?: unknown; ok?: boolean; overviewStatus?: number } = {}) {
  await page.route('**/api/events', (route) => route.fulfill({ status: 200, contentType: 'text/event-stream', body: 'retry: 600000\n\n' }))
  await page.route('**/api/overview', (route) =>
    opts.overviewStatus
      ? route.fulfill({ status: opts.overviewStatus, contentType: 'application/json', body: JSON.stringify({ error: 'Die Übersicht konnte nicht geladen werden.' }) })
      : route.fulfill({ json: opts.overview ?? overview }),
  )
  await page.route('**/api/system', (route) => route.fulfill({ json: system(opts.ok ?? true) }))
  await page.route('**/api/settings', (route) => route.fulfill({ json: settings }))
}

async function open(page: Page, hash: string) {
  await page.goto('/#' + hash)
  await page.waitForTimeout(800)
}

type Item = { sel: string; nth?: number; dx?: number; dy?: number; right?: boolean }

// Orange nummerierte Kreise (Overlay) über Elementen; Koordinaten im Ansichtsfenster.
async function mark(page: Page, items: Item[]) {
  for (const it of items) await page.locator(it.sel).nth(it.nth ?? 0).scrollIntoViewIfNeeded()
  await page.evaluate((list) => {
    document.querySelectorAll('.doc-mark').forEach((n) => n.remove())
    list.forEach((it, i) => {
      const el = document.querySelectorAll(it.sel)[it.nth ?? 0]
      if (!el) throw new Error('Marker-Ziel fehlt: ' + it.sel)
      const r = el.getBoundingClientRect()
      const c = document.createElement('div')
      c.className = 'doc-mark'
      c.textContent = String(i + 1)
      c.style.cssText = `position:fixed;z-index:99999;width:26px;height:26px;border-radius:999px;background:#f38a2c;color:#fff;font:700 14px/26px 'Plus Jakarta Sans',sans-serif;text-align:center;left:${(it.right ? r.right - 36 : r.left) + (it.dx ?? 6)}px;top:${r.top + (it.dy ?? 6)}px;`
      document.body.appendChild(c)
    })
  }, items)
}

async function clear(page: Page) {
  await page.evaluate(() => document.querySelectorAll('.doc-mark').forEach((n) => n.remove()))
}

async function shot(target: Page | Locator, name: string) {
  await target.screenshot({ path: path.join(OUT, name + '.png'), animations: 'disabled' })
}

const cardOf = (page: Page, title: string) => page.locator('.dt-card').filter({ has: page.getByRole('heading', { name: title }) }).last()

test('Shell und Cockpit', async ({ page, context }) => {
  await mock(page)

  // App-Shell
  await open(page, '/')
  await shot(page, 'shell-01-gesamtansicht')
  await mark(page, [
    { sel: '.f-brand', dx: 218, dy: 8 },
    { sel: '.dt-nav__group-label', nth: 0, dx: 200, dy: -4 },
    { sel: '.dt-nav__item', nth: 0, dx: 200, dy: 8 },
    { sel: '.dt-nav__count', nth: 0, dx: -34, dy: -2 },
    { sel: '.f-nav__working', dx: -34, dy: -9 },
    { sel: '.f-appstatus', dx: 200, dy: 12 },
    { sel: '.dt-sidebar__foot', dx: 200, dy: 16 },
  ])
  await shot(page.locator('.dt-sidebar'), 'shell-02-seitenleiste-markiert')
  await clear(page)

  const p2 = await context.newPage()
  await mock(p2, { ok: false })
  await open(p2, '/')
  await shot(p2.locator('.f-appstatus'), 'shell-03-status-nicht-erreichbar')
  await p2.close()

  // Cockpit
  await open(page, '/cockpit')
  await shot(page, 'cockpit-01-uebersicht')

  await mark(page, [
    { sel: 'a.dt-btn--secondary', dx: -13, dy: -12 },
    { sel: 'a.dt-btn--primary', dx: -13, dy: -12 },
    { sel: '.f-station', nth: 0, dx: 8, dy: -13 },
    { sel: '.f-station', nth: 1, dx: 8, dy: -13 },
    { sel: '.f-station', nth: 2, dx: 8, dy: -13 },
    { sel: '.f-station', nth: 3, dx: 8, dy: -13 },
    { sel: '.f-station', nth: 4, dx: 8, dy: -13 },
  ])
  await shot(page, 'cockpit-02-kopf-und-fertigungsstrasse')
  await clear(page)

  const grid2 = page.locator('.f-grid--2')
  await mark(page, [
    { sel: '.f-grid--2 > .dt-card', nth: 0, dx: 0, dy: 10, right: true },
    { sel: '.f-action__cta', nth: 0, dx: -34, dy: -30 },
    { sel: '.f-grid--2 > .dt-card', nth: 1, dx: 0, dy: 10, right: true },
  ])
  await shot(grid2, 'cockpit-03-handlungsbedarf-und-auftraege')
  await clear(page)

  const stats = page.locator('.f-grid--4')
  await mark(page, [0, 1, 2, 3].map((n) => ({ sel: '.f-grid--4 > .dt-card', nth: n, dx: 0, dy: 10, right: true })))
  await shot(stats, 'cockpit-04-kennzahlen')
  await clear(page)

  const charts = page.locator('.f-grid--cockpit')
  await mark(page, [0, 1, 2].map((n) => ({ sel: '.f-grid--cockpit > .dt-card', nth: n, dx: 0, dy: 10, right: true })))
  await shot(charts, 'cockpit-05-diagramme')
  await clear(page)

  const events = page.locator('.f-events').locator('xpath=ancestor::div[contains(@class,"dt-card")][1]')
  await events.scrollIntoViewIfNeeded()
  await shot(events, 'cockpit-06-letzte-ereignisse')

  const p3 = await context.newPage()
  await mock(p3, { overview: emptyOverview })
  await open(p3, '/')
  await shot(p3, 'cockpit-07-leer')
  await p3.close()

  const p4 = await context.newPage()
  await mock(p4, { overviewStatus: 500 })
  await open(p4, '/')
  await shot(p4, 'cockpit-08-fehler')
  await p4.close()
})

test('Einstellungen', async ({ page, context }) => {
  await mock(page)
  await open(page, '/einstellungen')
  await shot(page, 'einstellungen-01-uebersicht')

  await mark(page, [
    { sel: '.f-checks li', nth: 0, dx: -26, dy: 4 },
    { sel: '.f-checks li .f-appstatus__dot', nth: 0, dx: 24, dy: -9 },
    { sel: '.f-checks li .dt-cell-muted', nth: 0, dx: -34, dy: -4 },
  ])
  await shot(cardOf(page, 'Systemzustand'), 'einstellungen-02-systemzustand')
  await clear(page)

  await mark(page, [
    { sel: '#dialog-model', dx: -26, dy: 4 },
    { sel: '#build-model', dx: -26, dy: 4 },
  ])
  await shot(cardOf(page, 'KI-Qualität'), 'einstellungen-03-ki-qualitaet')
  await clear(page)

  await mark(page, [
    { sel: '#voice', dx: -26, dy: 4 },
    { sel: '#rate', dx: -26, dy: 4 },
    { sel: 'button.dt-btn--modal', dx: -26, dy: 4 },
    { sel: '.f-privacy', dx: -26, dy: 4 },
  ])
  await shot(cardOf(page, 'Sprache'), 'einstellungen-04-sprache')
  await clear(page)

  await shot(cardOf(page, 'Sicherheit'), 'einstellungen-05-sicherheit')

  const p2 = await context.newPage()
  await mock(p2, { ok: false })
  await open(p2, '/einstellungen')
  await shot(cardOf(p2, 'Systemzustand'), 'einstellungen-06-systemzustand-stoerung')
  await p2.close()
})
