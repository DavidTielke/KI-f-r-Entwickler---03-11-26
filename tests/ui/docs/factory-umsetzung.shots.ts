import path from 'node:path'
import { expect, test } from '@playwright/test'
import type { Locator, Page } from '@playwright/test'

// Screenshots für docs/user/E3-software-factory/ (Seiten Umsetzung, Auftrag, Verlauf).
// Alle Antworten der Schnittstelle werden simuliert. Es werden keine Aufträge beauftragt,
// abgebrochen oder zurückgenommen. Schreibende Aufrufe werden abgefangen.
const OUT = path.resolve(__dirname, '../../../docs/user/E3-software-factory/bilder')
const out = (name: string) => path.join(OUT, `${name}.png`)

type Mark = { target: Locator; n: number; at?: 'tl' | 'tr' | 'l' | 'r' }

async function snap(page: Page, name: string, opts: { marks?: Mark[]; region?: Locator; pad?: number } = {}) {
  if (opts.region) await opts.region.first().scrollIntoViewIfNeeded()
  const items: { x: number; y: number; n: number }[] = []
  for (const m of opts.marks ?? []) {
    const box = await m.target.first().boundingBox()
    if (!box) throw new Error(`${name}: Markierung ${m.n} nicht sichtbar`)
    const at = m.at ?? 'tl'
    const x = at === 'tr' || at === 'r' ? box.x + box.width : box.x
    const y = at === 'l' || at === 'r' ? box.y + box.height / 2 : box.y
    items.push({ x, y, n: m.n })
  }
  if (items.length) {
    await page.evaluate((list) => {
      const root = document.createElement('div')
      root.id = 'doc-marks'
      root.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:99999;'
      for (const i of list) {
        const c = document.createElement('div')
        c.textContent = String(i.n)
        c.style.cssText = `position:absolute;left:${i.x - 12}px;top:${i.y - 12}px;width:24px;height:24px;border-radius:999px;background:#f38a2c;color:#fff;font:700 13px/24px "Plus Jakarta Sans",sans-serif;text-align:center;`
        root.appendChild(c)
      }
      document.body.appendChild(root)
    }, items)
  }
  let clip
  if (opts.region) {
    const box = await opts.region.first().boundingBox()
    if (!box) throw new Error(`${name}: Bereich nicht sichtbar`)
    const pad = opts.pad ?? 16
    const x = Math.max(0, box.x - pad)
    const y = Math.max(0, box.y - pad)
    clip = {
      x,
      y,
      width: Math.min(1440 - x, box.width + pad * 2),
      height: Math.min(900 - y, box.height + pad * 2),
    }
  }
  await page.screenshot({ path: out(name), animations: 'disabled', clip })
  await page.evaluate(() => document.getElementById('doc-marks')?.remove())
}

// ---------------------------------------------------------------------------
// Beispieldaten
// ---------------------------------------------------------------------------
const iso = (hms: string, day = '2026-11-04') => `${day}T${hms.length === 5 ? `${hms}:00` : hms}+01:00`

const PHASE_KEYS: Record<string, [string, string][]> = {
  delivery: [['vorbereitung', 'Vorbereitung'], ['umsetzung', 'Umsetzung'], ['pruefung', 'Prüfung'], ['sicherung', 'Sicherung'], ['auslieferung', 'Auslieferung'], ['abnahme', 'Betriebsprüfung']],
  revert: [['vorbereitung', 'Vorbereitung'], ['ruecknahme', 'Rücknahme'], ['auslieferung', 'Auslieferung'], ['abnahme', 'Betriebsprüfung']],
  transfer: [['vorbereitung', 'Vorbereitung'], ['ausformulierung', 'Ausformulierung'], ['pruefung', 'Formprüfung'], ['sicherung', 'Sicherung']],
}
const phases = (type: string, states: string[]) =>
  PHASE_KEYS[type].map(([key, label], i) => ({ key, label, status: states[i] ?? 'pending', startedAt: null, endedAt: null }))

const activity = (items: [string, string, string, string?, boolean?][]) =>
  items.map(([time, kind, text, detail, change]) => ({ at: iso(time), kind, text, detail: detail ?? null, change: !!change }))

function run(over: Record<string, unknown>) {
  return {
    id: 'L1', type: 'delivery', title: 'Beispielauftrag', status: 'done', queuedAt: iso('13:00'), startedAt: iso('13:01'), endedAt: iso('13:20'),
    phases: phases('delivery', ['done', 'done', 'done', 'done', 'done', 'done']), activity: [], stories: [], summary: '', error: null, errorDetail: null,
    commit: null, baseCommit: 'f00ba12', changes: null, costUsd: 0, repairs: 0, canDiscard: false, revertedBy: null, ...over,
  }
}

const S = [
  { id: 'E1-F2-S1', title: 'Person anlegen' },
  { id: 'E1-F2-S2', title: 'Person bearbeiten' },
  { id: 'E1-F2-S3', title: 'Person löschen' },
]

const CHANGES = {
  areas: { Oberfläche: 2, Serverlogik: 1, Anforderungen: 1 },
  files: [
    { path: 'code/frontend/src/pages/PersonForm.tsx', added: 86, removed: 12 },
    { path: 'code/frontend/src/pages/PersonList.tsx', added: 14, removed: 3 },
    { path: 'code/backend/Services/PersonService.cs', added: 41, removed: 7 },
    { path: 'specs/E1 Personen/F2 Personenliste/S1 Person anlegen.md', added: 6, removed: 2 },
  ],
}

const FEED_RUNNING = activity([
  ['14:18:05', 'step', 'Prüft den Arbeitsstand', 'git status'],
  ['14:18:21', 'hint', 'Die Vorbereitung ist abgeschlossen. Die KI beginnt mit der Umsetzung.'],
  ['14:18:40', 'step', 'Liest die Projektregeln', 'Read AGENTS.md'],
  ['14:18:52', 'step', 'Liest die Anforderung »Person anlegen«', 'Read specs/E1 Personen/F2 Personenliste/S1 Person anlegen.md'],
  ['14:19:30', 'narration', 'Ich beginne mit dem Formular zum Anlegen einer Person und ergänze danach die Serverlogik.'],
  ['14:20:11', 'step', 'Bearbeitet die Oberfläche', 'Edit code/frontend/src/pages/PersonForm.tsx', true],
  ['14:21:02', 'step', 'Bearbeitet die Serverlogik', 'Edit code/backend/Services/PersonService.cs', true],
  ['14:22:15', 'step', 'Prüft die Oberfläche', 'npm --prefix code/frontend run build'],
  ['14:23:40', 'step', 'Prüft die Serverlogik', 'dotnet build code/backend'],
  ['14:24:10', 'step', 'Bearbeitet die Anforderungen', 'Edit specs/E1 Personen/F2 Personenliste/S1 Person anlegen.md', true],
])

const RUN_RUNNING = run({
  id: 'L12', title: '3 Anforderungen', status: 'running', queuedAt: iso('14:17'), startedAt: iso('14:18'), endedAt: null,
  phases: phases('delivery', ['done', 'active']), activity: FEED_RUNNING,
  stories: [{ ...S[0], done: true, note: 'Das Formular legt neue Personen an und zeigt Fehler direkt am Feld.' }, { ...S[1], done: false }, { ...S[2], done: false }],
})
const RUN_QUEUED = run({
  id: 'L13', title: 'Person exportieren', status: 'queued', queuedAt: iso('14:25'), startedAt: null, endedAt: null,
  phases: phases('delivery', []), stories: [{ id: 'E1-F3-S1', title: 'Person exportieren', done: false }],
})
const RUN_DONE = run({
  id: 'L11', title: '2 Anforderungen', commit: 'a1b2c3d', changes: CHANGES, costUsd: 4.82, queuedAt: iso('12:00'), startedAt: iso('12:01'), endedAt: iso('12:26'),
  summary: 'Das Anlegen und Bearbeiten von Personen wurde umgesetzt. Die Formulare prüfen Eingaben direkt am Feld. Die Anforderungen sind auf Umgesetzt gesetzt.',
  stories: [{ ...S[0], done: true, note: 'Das Formular legt neue Personen an.' }, { ...S[1], done: true, note: 'Änderungen werden gespeichert und in der Liste angezeigt.' }],
  activity: FEED_RUNNING.slice(0, 6),
})
const RUN_PARTIAL = run({
  id: 'L10', title: '2 Anforderungen', status: 'partial', commit: 'c4d5e6f', costUsd: 3.1, queuedAt: iso('11:00'), startedAt: iso('11:01'), endedAt: iso('11:31'),
  summary: 'Eine Anforderung wurde umgesetzt. Bei der zweiten fehlt noch die Prüfung auf doppelte Einträge.',
  stories: [{ ...S[0], done: true }, { ...S[2], done: false, note: 'Die Prüfung auf doppelte Einträge fehlt noch.' }],
})
const RUN_FAILED = run({
  id: 'L9', title: 'Person löschen', status: 'failed', queuedAt: iso('10:00'), startedAt: iso('10:01'), endedAt: iso('10:09'),
  phases: phases('delivery', ['done', 'done', 'done', 'done', 'failed']), repairs: 2, costUsd: 2.4,
  error: 'Die Anwendung antwortet nach der Auslieferung nicht fehlerfrei.',
  errorDetail: 'GET http://localhost:3000/ -> Zeitüberschreitung nach 5 Sekunden\nGET http://localhost:3000/api/persons -> 502',
  stories: [{ ...S[2], done: false }],
  activity: activity([
    ['10:02:10', 'step', 'Bearbeitet die Oberfläche', 'Edit code/frontend/src/pages/PersonList.tsx', true],
    ['10:05:30', 'hint', 'Der Bau ist fehlgeschlagen. Die KI bessert nach.', 'error TS2304: Cannot find name ...'],
    ['10:07:50', 'hint', 'Die Auslieferung war nicht erfolgreich. Die KI bessert nach.', 'docker compose up -d --build'],
  ]),
})
const RUN_CANCELED = run({
  id: 'L8', title: 'Person bearbeiten', status: 'canceled', queuedAt: iso('09:00'), startedAt: iso('09:01'), endedAt: iso('09:06'),
  phases: phases('delivery', ['done', 'failed']), error: 'Der Auftrag wurde abgebrochen.', canDiscard: true, stories: [{ ...S[1], done: false }],
})
const RUN_REVERT = run({
  id: 'L7', type: 'revert', title: 'Rücknahme von L6', commit: 'e7f8a9b', queuedAt: iso('08:30'), startedAt: iso('08:31'), endedAt: iso('08:40'),
  phases: phases('revert', ['done', 'done', 'done', 'done']), costUsd: 0,
  summary: 'Der Stand vor der Auslieferung L6 ist wiederhergestellt. Die betroffenen Anforderungen gelten wieder als offen.',
  stories: [{ ...S[0], done: false }],
})
const RUN_REVERTED = run({
  id: 'L6', title: 'Person anlegen', commit: 'b9c0d1e', revertedBy: 'L7', changes: CHANGES, costUsd: 1.9, queuedAt: iso('08:00', '2026-11-03'), startedAt: iso('08:01', '2026-11-03'), endedAt: iso('08:21', '2026-11-03'),
  summary: 'Das Anlegen von Personen wurde umgesetzt.', stories: [{ ...S[0], done: true }],
})
const RUN_TRANSFER = run({
  id: 'L5', type: 'transfer', title: 'Idee Terminerinnerung', queuedAt: iso('15:00', '2026-11-03'), startedAt: iso('15:01', '2026-11-03'), endedAt: iso('15:04', '2026-11-03'),
  phases: phases('transfer', ['done', 'done', 'done', 'done']), costUsd: 0.4,
})
const ALL_RUNS = [RUN_QUEUED, RUN_RUNNING, RUN_DONE, RUN_PARTIAL, RUN_FAILED, RUN_CANCELED, RUN_REVERT, RUN_REVERTED, RUN_TRANSFER]

const HISTORY = [
  { at: iso('14:25'), type: 'run', title: 'Umsetzung L13 beauftragt (1 Anforderung)', ref: { run: 'L13' } },
  { at: iso('14:17'), type: 'run', title: 'Umsetzung L12 beauftragt (3 Anforderungen)', ref: { run: 'L12' } },
  { at: iso('12:26'), type: 'delivery', title: 'Umsetzung L11 ausgeliefert (2 von 2 Anforderungen)', ref: { run: 'L11', commit: 'a1b2c3d' } },
  { at: iso('12:25'), type: 'version', title: 'umsetzung: e1-f2-s1, e1-f2-s2', ref: { commit: 'a1b2c3d' } },
  { at: iso('11:40'), type: 'requirement', title: 'Anforderung E1-F2-S3 »Person löschen« geändert', ref: { story: 'E1-F2-S3' } },
  { at: iso('10:15'), type: 'idea', title: 'Idee I2 »Terminerinnerung« freigegeben', ref: { idea: 'I2' } },
  { at: iso('09:06'), type: 'run', title: 'Umsetzung L8 abgebrochen', ref: { run: 'L8' } },
  { at: iso('08:40', '2026-11-03'), type: 'delivery', title: 'Auslieferung L6 zurückgenommen', ref: { run: 'L7' } },
  { at: iso('08:00', '2026-11-03'), type: 'version', title: 'backend: beispieländerung ohne weitere angabe', ref: { commit: '60056fd' } },
  { at: iso('07:30', '2026-11-03'), type: 'run', title: 'Umsetzung L5 fehlgeschlagen', ref: {} },
]

// ---------------------------------------------------------------------------
// Simulation der Schnittstelle
// ---------------------------------------------------------------------------
type Mock = { runs?: unknown[]; open?: number; active?: number; history?: unknown[]; postRuns?: { status: number; body: unknown } }

async function setup(page: Page, mock: Mock = {}) {
  await page.clock.setFixedTime(new Date('2026-11-04T14:30:00+01:00'))
  const real = await (await page.request.get('/api/requirements')).json()
  // Einige Anforderungen als „Umsetzung offen“ markieren (nur in der Simulation).
  const open = mock.open ?? 5
  let marked = 0
  for (const epic of real.tree) {
    if (epic.isTool) continue
    for (const feature of epic.features) {
      for (const story of feature.stories) {
        if (marked < open) { story.state = 'Modified'; marked++ }
      }
    }
  }
  const json = (body: unknown, status = 200) => ({ status, contentType: 'application/json', body: JSON.stringify(body) })
  const runs = mock.runs ?? ALL_RUNS
  await page.route('**/api/**', async (route) => {
    const req = route.request()
    const url = new URL(req.url())
    const p = url.pathname
    if (p === '/api/events') return route.abort()
    if (req.method() !== 'GET') {
      if (p === '/api/runs' && mock.postRuns) return route.fulfill(json(mock.postRuns.body, mock.postRuns.status))
      return route.abort()
    }
    if (p === '/api/system') return route.fulfill(json({ checks: [], app: { url: 'http://localhost:3000', online: true }, user: 'Maria Beispiel' }))
    if (p === '/api/overview') {
      return route.fulfill(json({
        ideas: { draft: 0, ready: 0, transferred: 1 },
        totals: { stories: 48, open, implemented: 48 - open, criteria: 346, epics: 4, features: 14, rate: 90, deliveries: 3, avgDurationMs: 1500000, costUsd: 12.4 },
        byEpic: [], daily: [], actions: [], activeRuns: [], openDrafts: 0, recent: [],
        nav: { ideasOpen: 0, requirementsOpen: open, runsActive: mock.active ?? 0 },
      }))
    }
    if (p === '/api/runs') return route.fulfill(json(runs))
    const m = p.match(/^\/api\/runs\/(L\d+)$/)
    if (m) {
      const found = (runs as { id: string }[]).find((r) => r.id === m[1])
      return found ? route.fulfill(json(found)) : route.fulfill(json({ error: 'Dieser Auftrag existiert nicht.' }, 404))
    }
    if (p === '/api/requirements') return route.fulfill(json(real))
    if (/^\/api\/requirements\/E\d+-F\d+-S\d+$/.test(p)) {
      const res = await route.fetch()
      const body = await res.json()
      body.state = 'Modified'
      return route.fulfill(json(body))
    }
    if (p === '/api/history') return route.fulfill(json(mock.history ?? HISTORY))
    return route.continue()
  })
}

const open = async (page: Page, hash: string) => {
  await page.goto(`/#${hash}`)
  await page.waitForLoadState('networkidle')
}

// ---------------------------------------------------------------------------
// Umsetzung (Warteschlange)
// ---------------------------------------------------------------------------
test('Umsetzung – Übersicht', async ({ page }) => {
  await setup(page, { active: 2 })
  await open(page, '/umsetzung')
  await expect(page.getByText('Aktuell in der Fertigung')).toBeVisible()
  await snap(page, 'umsetzung-01-uebersicht', {
    marks: [
      { target: page.locator('.dt-topbar').getByRole('link', { name: /offene Anforderungen auswählen/ }), n: 1, at: 'tl' },
      { target: page.locator('.dt-nav__item', { hasText: 'Umsetzung' }), n: 2, at: 'r' },
      { target: page.getByText('Aktuell in der Fertigung'), n: 3, at: 'tl' },
      { target: page.locator('.dt-tablecard__head'), n: 4, at: 'tl' },
      { target: page.locator('.dt-table th').last(), n: 5, at: 'tl' },
    ],
  })
})

test('Umsetzung – Statusmarken', async ({ page }) => {
  await setup(page, { active: 2 })
  await open(page, '/umsetzung')
  await page.locator('.dt-content').evaluate((el) => (el.scrollTop = el.scrollHeight))
  await snap(page, 'umsetzung-02-tabelle', { region: page.locator('.dt-tablecard') })
})

test('Umsetzung – ohne Aufträge', async ({ page }) => {
  await setup(page, { runs: [], open: 0 })
  await open(page, '/umsetzung')
  await expect(page.getByText('Noch keine Aufträge')).toBeVisible()
  await snap(page, 'umsetzung-03-leer')
})

// ---------------------------------------------------------------------------
// Auswahl und Beauftragung
// ---------------------------------------------------------------------------
test('Auswahl – Liste, Leiste, Dialog', async ({ page }) => {
  await setup(page, { postRuns: { status: 409, body: { error: 'Die Anforderung E1-F1-S1 ist bereits beauftragt.' } } })
  await open(page, '/anforderungen?filter=offen')
  await expect(page.getByRole('checkbox').first()).toBeVisible()
  await snap(page, 'auswahl-01-liste', {
    marks: [
      { target: page.getByRole('checkbox', { name: 'Alle offenen Anforderungen auswählen' }), n: 1, at: 'tl' },
      { target: page.getByRole('checkbox').nth(1), n: 2, at: 'tl' },
    ],
  })
  await page.getByRole('checkbox').nth(1).click()
  await page.getByRole('checkbox').nth(2).click()
  await expect(page.getByText('2 Anforderungen ausgewählt')).toBeVisible()
  await snap(page, 'auswahl-02-leiste', {
    marks: [
      { target: page.getByText('2 Anforderungen ausgewählt'), n: 1, at: 'tl' },
      { target: page.getByRole('button', { name: 'Auswahl aufheben' }), n: 2, at: 'tl' },
      { target: page.getByRole('button', { name: 'Umsetzung starten' }), n: 3, at: 'tl' },
      { target: page.getByRole('checkbox', { name: 'Alle offenen Anforderungen auswählen' }), n: 4, at: 'tl' },
    ],
  })
  await page.getByRole('button', { name: 'Umsetzung starten' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await snap(page, 'auswahl-04-dialog', {
    marks: [
      { target: dialog.getByText('Umsetzung beauftragen'), n: 1, at: 'tl' },
      { target: dialog.locator('.f-modal__lead'), n: 2, at: 'tl' },
      { target: dialog.locator('.f-picklist'), n: 3, at: 'tl' },
      { target: dialog.locator('.f-steps'), n: 4, at: 'tl' },
      { target: dialog.getByRole('button', { name: 'Abbrechen' }), n: 5, at: 'tl' },
      { target: dialog.getByRole('button', { name: 'Umsetzung starten' }), n: 6, at: 'tl' },
    ],
  })
  await dialog.getByRole('button', { name: 'Umsetzung starten' }).click()
  await expect(dialog.getByText('ist bereits beauftragt')).toBeVisible()
  await snap(page, 'auswahl-05-fehler', { region: dialog, pad: 24 })
})

test('Auswahl – Detailseite', async ({ page }) => {
  await setup(page)
  const real = await (await page.request.get('/api/requirements')).json()
  const id = real.tree[0].features[0].stories[0].id
  await open(page, `/anforderungen/${id}`)
  const button = page.getByRole('button', { name: 'Zur Auswahl hinzufügen' })
  await expect(button).toBeVisible()
  await snap(page, 'auswahl-03-detail', {
    marks: [
      { target: button, n: 1, at: 'tl' },
      { target: page.locator('.dt-topbar').getByRole('button', { name: 'Umsetzung starten' }), n: 2, at: 'tl' },
    ],
  })
  await button.click()
  await expect(page.getByRole('button', { name: 'Aus der Auswahl entfernen' })).toBeVisible()
  await snap(page, 'auswahl-06-detail-gewaehlt', { region: page.getByRole('button', { name: 'Aus der Auswahl entfernen' }), pad: 60 })
})

// ---------------------------------------------------------------------------
// Auftrag
// ---------------------------------------------------------------------------
test('Auftrag – läuft', async ({ page }) => {
  await setup(page, { active: 2 })
  await open(page, '/umsetzung/L12')
  await expect(page.getByText('Die Arbeit läuft')).toBeVisible()
  await snap(page, 'auftrag-01-laeuft', {
    marks: [
      { target: page.locator('.dt-topbar h1'), n: 1, at: 'tl' },
      { target: page.locator('.dt-topbar .dt-badge'), n: 2, at: 'tl' },
      { target: page.getByRole('button', { name: 'Auftrag abbrechen' }), n: 3, at: 'tl' },
      { target: page.locator('.f-stepper'), n: 4, at: 'tl' },
      { target: page.locator('.f-runstats'), n: 5, at: 'tl' },
      { target: page.locator('.f-runstories'), n: 6, at: 'tl' },
      { target: page.locator('.f-feed'), n: 7, at: 'tl' },
    ],
  })
  await snap(page, 'auftrag-04-phasen', { region: page.locator('.dt-card--lg').first() })
})

test('Auftrag – wartet', async ({ page }) => {
  await setup(page, { active: 2 })
  await open(page, '/umsetzung/L13')
  await expect(page.getByText('Der Auftrag wartet auf seinen Start.')).toBeVisible()
  await snap(page, 'auftrag-02-wartet')
})

test('Auftrag – abgeschlossen', async ({ page }) => {
  await setup(page)
  await open(page, '/umsetzung/L11')
  await expect(page.getByText('Der Auftrag ist abgeschlossen')).toBeVisible()
  await snap(page, 'auftrag-03-abgeschlossen', {
    marks: [
      { target: page.getByText('Der Auftrag ist abgeschlossen'), n: 1, at: 'tl' },
      { target: page.getByRole('link', { name: 'Anwendung öffnen' }), n: 2, at: 'tl' },
      { target: page.getByText('Geänderte Bereiche'), n: 3, at: 'tl' },
      { target: page.getByText('Rechnerischer KI-Aufwand'), n: 4, at: 'tl' },
      { target: page.getByRole('button', { name: 'Auslieferung zurücknehmen' }), n: 5, at: 'tl' },
    ],
  })
  await snap(page, 'auftrag-05-eckdaten', { region: page.locator('section.dt-card', { hasText: 'Rechnerischer KI-Aufwand' }).last(), pad: 24 })
})

test('Auftrag – teilweise', async ({ page }) => {
  await setup(page)
  await open(page, '/umsetzung/L10')
  await expect(page.getByText('Der Auftrag ist teilweise abgeschlossen')).toBeVisible()
  await snap(page, 'auftrag-06-teilweise')
})

test('Auftrag – fehlgeschlagen', async ({ page }) => {
  await setup(page)
  await open(page, '/umsetzung/L9')
  await expect(page.getByText('Die Anwendung antwortet nach der Auslieferung nicht fehlerfrei.')).toBeVisible()
  await page.locator('summary', { hasText: 'Technische Details' }).click()
  await snap(page, 'auftrag-07-fehler', {
    marks: [
      { target: page.locator('.f-note--error'), n: 1, at: 'tl' },
      { target: page.locator('summary', { hasText: 'Technische Details' }), n: 2, at: 'tl' },
      { target: page.getByRole('button', { name: 'Erneut beauftragen' }), n: 3, at: 'tl' },
    ],
  })
})

test('Auftrag – unbekannt', async ({ page }) => {
  await setup(page)
  await open(page, '/umsetzung/L99')
  await expect(page.getByText('Dieser Auftrag existiert nicht.')).toBeVisible()
  await snap(page, 'auftrag-08-unbekannt')
})

// ---------------------------------------------------------------------------
// Arbeitsprotokoll
// ---------------------------------------------------------------------------
test('Protokoll', async ({ page }) => {
  await setup(page, { active: 2 })
  await open(page, '/umsetzung/L12')
  await expect(page.getByText('Die Arbeit läuft')).toBeVisible()
  const feed = page.locator('.f-feed')
  await snap(page, 'protokoll-01-uebersicht', {
    region: feed,
    marks: [
      { target: feed.getByText('Arbeitsprotokoll'), n: 1, at: 'tl' },
      { target: feed.getByRole('button', { name: 'Technische Details einblenden' }), n: 2, at: 'tl' },
      { target: feed.locator('.f-feed__time').first(), n: 3, at: 'tl' },
      { target: feed.locator('.is-narration').first(), n: 4, at: 'tl' },
      { target: feed.locator('.is-hint').first(), n: 5, at: 'tl' },
      { target: feed.getByText('Die Arbeit läuft'), n: 6, at: 'tl' },
    ],
  })
  await feed.getByRole('button', { name: 'Technische Details einblenden' }).click()
  await snap(page, 'protokoll-02-technisch', { region: feed })
})

// ---------------------------------------------------------------------------
// Abbrechen, Verwerfen, Zurücknehmen, Erneut beauftragen
// ---------------------------------------------------------------------------
test('Abbrechen', async ({ page }) => {
  await setup(page, { active: 2 })
  await open(page, '/umsetzung/L12')
  await page.getByRole('button', { name: 'Auftrag abbrechen' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await snap(page, 'abbrechen-01-dialog', {
    region: dialog, pad: 24,
    marks: [
      { target: dialog.getByRole('button', { name: 'Abbrechen' }), n: 1, at: 'tl' },
      { target: dialog.getByRole('button', { name: 'Auftrag abbrechen' }), n: 2, at: 'tl' },
    ],
  })
})

test('Verwerfen', async ({ page }) => {
  await setup(page)
  await open(page, '/umsetzung/L8')
  await expect(page.getByText('Der Auftrag wurde abgebrochen.')).toBeVisible()
  await snap(page, 'abbrechen-02-abgebrochen', {
    marks: [
      { target: page.locator('.f-note--error'), n: 1, at: 'tl' },
      { target: page.getByRole('button', { name: 'Änderungen verwerfen' }), n: 2, at: 'tl' },
    ],
  })
  await page.getByRole('button', { name: 'Änderungen verwerfen' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await snap(page, 'abbrechen-03-verwerfen-dialog', {
    region: dialog, pad: 24,
    marks: [
      { target: dialog.getByRole('button', { name: 'Abbrechen' }), n: 1, at: 'tl' },
      { target: dialog.getByRole('button', { name: 'Verwerfen' }), n: 2, at: 'tl' },
    ],
  })
})

test('Zurücknehmen', async ({ page }) => {
  await setup(page)
  await open(page, '/umsetzung/L11')
  await page.getByRole('button', { name: 'Auslieferung zurücknehmen' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog).toBeVisible()
  await snap(page, 'ruecknahme-01-dialog', {
    region: dialog, pad: 24,
    marks: [
      { target: dialog.getByRole('button', { name: 'Abbrechen' }), n: 1, at: 'tl' },
      { target: dialog.getByRole('button', { name: 'Zurücknehmen' }), n: 2, at: 'tl' },
    ],
  })
  await page.keyboard.press('Escape')
  await open(page, '/umsetzung/L7')
  await expect(page.getByText('Der Auftrag ist abgeschlossen')).toBeVisible()
  await snap(page, 'ruecknahme-02-auftrag')
  await open(page, '/umsetzung/L6')
  await expect(page.getByText('Diese Auslieferung wurde durch')).toBeVisible()
  await snap(page, 'ruecknahme-03-zurueckgenommen', { marks: [{ target: page.locator('.f-note--error'), n: 1, at: 'tl' }] })
})

test('Zurücknehmen – Datenbankänderung', async ({ page }) => {
  const db = run({
    id: 'L14', title: 'Person archivieren', commit: 'd2e3f4a', stories: [{ ...S[0], done: true }], costUsd: 2.2,
    changes: { areas: { Datenbank: 1, Serverlogik: 1 }, files: [{ path: 'code/backend/Migrations/20261104_PersonArchiv.cs', added: 40, removed: 0 }, { path: 'code/backend/Services/PersonService.cs', added: 12, removed: 2 }] },
    summary: 'Personen lassen sich archivieren.',
  })
  await setup(page, { runs: [db] })
  await open(page, '/umsetzung/L14')
  await expect(page.getByText('enthält eine Datenbankänderung')).toBeVisible()
  await snap(page, 'ruecknahme-04-datenbank', { marks: [{ target: page.locator('.f-note').first(), n: 1, at: 'tl' }] })
})

test('Erneut beauftragen', async ({ page }) => {
  await setup(page)
  await open(page, '/umsetzung/L9')
  await expect(page.getByRole('button', { name: 'Erneut beauftragen' })).toBeVisible()
  await snap(page, 'erneut-01-kopfleiste', {
    region: page.locator('.dt-topbar'), pad: 0,
    marks: [{ target: page.getByRole('button', { name: 'Erneut beauftragen' }), n: 1, at: 'tl' }],
  })
})

// ---------------------------------------------------------------------------
// Geänderte Bereiche und Nachbesserung
// ---------------------------------------------------------------------------
test('Geänderte Bereiche', async ({ page }) => {
  await setup(page)
  await open(page, '/umsetzung/L11')
  const card = page.locator('section.dt-card', { hasText: 'Geänderte Bereiche' }).last()
  await expect(card).toBeVisible()
  await snap(page, 'bereiche-01-karte', {
    region: card, pad: 24,
    marks: [
      { target: card.getByText('Geänderte Bereiche'), n: 1, at: 'tl' },
      { target: card.locator('.f-areas'), n: 2, at: 'tl' },
      { target: card.getByRole('button', { name: 'Technische Details' }), n: 3, at: 'tl' },
    ],
  })
  await card.getByRole('button', { name: 'Technische Details' }).click()
  await snap(page, 'bereiche-02-details', { region: card, pad: 24, marks: [{ target: card.locator('.f-filelist'), n: 1, at: 'tl' }] })
})

test('Nachbesserung', async ({ page }) => {
  const repaired = run({
    id: 'L15', title: 'Person löschen', commit: 'f5a6b7c', repairs: 1, changes: CHANGES, costUsd: 5.3, stories: [{ ...S[2], done: true }],
    summary: 'Das Löschen von Personen wurde umgesetzt. Ein Fehler beim Bau wurde nachgebessert.',
    activity: activity([
      ['15:02:10', 'step', 'Bearbeitet die Oberfläche', 'Edit code/frontend/src/pages/PersonList.tsx', true],
      ['15:05:30', 'hint', 'Der Bau ist fehlgeschlagen. Die KI bessert nach.', 'error TS2304: Cannot find name ...'],
      ['15:07:12', 'step', 'Bearbeitet die Oberfläche', 'Edit code/frontend/src/pages/PersonList.tsx', true],
      ['15:08:40', 'step', 'Prüft die Oberfläche', 'npm --prefix code/frontend run build'],
    ]),
  })
  await setup(page, { runs: [repaired] })
  await open(page, '/umsetzung/L15')
  await expect(page.getByText('Nachbesserungen')).toBeVisible()
  await snap(page, 'nachbesserung-01-kennzahl', {
    marks: [
      { target: page.locator('.f-runstats > div', { hasText: 'Nachbesserungen' }), n: 1, at: 'tl' },
      { target: page.locator('.is-hint').first(), n: 2, at: 'tl' },
    ],
  })
})

// ---------------------------------------------------------------------------
// Verlauf
// ---------------------------------------------------------------------------
test('Verlauf', async ({ page }) => {
  await setup(page)
  await open(page, '/verlauf')
  await expect(page.getByText('10 Einträge')).toBeVisible()
  await snap(page, 'verlauf-01-uebersicht', {
    marks: [
      { target: page.locator('.dt-tablecard__head > span'), n: 1, at: 'tl' },
      { target: page.locator('.f-segment'), n: 2, at: 'tl' },
      { target: page.locator('.dt-table th').nth(0), n: 3, at: 'tl' },
      { target: page.locator('.dt-table th').nth(1), n: 4, at: 'tl' },
      { target: page.locator('.dt-table th').nth(2), n: 5, at: 'tl' },
      { target: page.locator('.dt-table th').nth(3), n: 6, at: 'tl' },
    ],
  })
  await page.getByRole('button', { name: 'Aufträge' }).click()
  await expect(page.getByText('6 Einträge')).toBeVisible()
  await snap(page, 'verlauf-02-filter')
})

test('Verlauf – ohne Treffer', async ({ page }) => {
  await setup(page, { history: HISTORY.filter((e) => e.type !== 'version') })
  await open(page, '/verlauf')
  await page.getByRole('button', { name: 'Versionen' }).click()
  await expect(page.getByText('Keine Einträge')).toBeVisible()
  await snap(page, 'verlauf-03-leer')
})
