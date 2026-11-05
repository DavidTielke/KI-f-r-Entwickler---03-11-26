import { test, type Locator, type Page } from '@playwright/test'
import path from 'node:path'

// Erzeugt die Screenshots für Ideen-Tafel, Ideen-Dialog, Sprache und Überführung der Software Factory.
// Alle Antworten des Dienstes werden mit Beispieldaten simuliert; es entstehen keine echten Ideen oder Aufträge.
const OUT = path.resolve(__dirname, '../../../docs/user/E3-software-factory/bilder')

const LABELS = [
  { key: 'problem', label: 'Problem und Nutzen sind klar formuliert' },
  { key: 'audience', label: 'Die Zielgruppe ist benannt' },
  { key: 'scope', label: 'Der Umfang ist abgegrenzt' },
  { key: 'behavior', label: 'Das gewünschte Verhalten ist konkret beschrieben' },
  { key: 'feasibility', label: 'Die Machbarkeit ist gegen den Bestand geprüft' },
  { key: 'noOpenPoints', label: 'Es gibt keine offenen Punkte mehr' },
  { key: 'approved', label: 'Sie haben die finale Fassung bestätigt' },
]

const KEYS = LABELS.map((l) => l.key)
const readiness = (count: number, approved = false) =>
  Object.fromEntries(KEYS.map((k, i) => [k, approved ? true : i < count]))

type Idea = Record<string, any>

function card(o: Idea): Idea {
  const state = o.state ?? 'Draft'
  const count = state === 'Draft' ? o.count ?? 0 : 7
  return {
    id: `I${o.n}`,
    number: o.n,
    path: `ideas/I${o.n} ${o.title}.md`,
    title: o.title,
    state,
    problem: o.problem ?? '',
    readiness: readiness(count, state !== 'Draft'),
    readyCount: count,
    readyTotal: 7,
    busy: Boolean(o.busy),
    error: o.error ?? null,
    waitingForUser: Boolean(o.waiting),
    phase: o.phase ?? null,
    updatedAt: null,
  }
}

const BOARD: Idea[] = [
  card({ n: 3, title: 'Foto zum Haustier', count: 4, waiting: true, phase: 'machbarkeit', problem: 'Haustiere erscheinen nur mit Namen und Tierart. Ein Foto würde die Liste anschaulicher machen.' }),
  card({ n: 4, title: 'Export als Tabelle', count: 2, busy: true, phase: 'hinterfragen', problem: 'Die Personenliste soll sich als Tabelle für Excel herunterladen lassen.' }),
  card({ n: 5, title: 'Geburtstage anzeigen', count: 1, error: 'Die KI konnte den Auftrag nicht abschließen.', phase: 'verstehen', problem: 'Wer demnächst Geburtstag hat, soll auf einen Blick sichtbar sein.' }),
  card({ n: 6, title: 'Notizen zur Person', count: 6, phase: 'abschliessen', problem: 'Zu jeder Person sollen sich kurze Notizen speichern lassen.' }),
  card({ n: 7, title: 'Tierarzt-Termine', state: 'Ready', problem: 'Impf- und Kontrolltermine der Haustiere sollen an einer Stelle stehen.' }),
  card({ n: 2, title: 'Haustier-Impfpass', state: 'Übernommen', problem: 'Impfungen sollen je Haustier festgehalten werden können.' }),
  card({ n: 1, title: 'Haustiere', state: 'Übernommen', problem: 'Die App verwaltet heute ausschließlich Personen. Tiere lassen sich nicht erfassen oder mit Personen verknüpfen.' }),
]

const NOW = '2026-11-04T09:'
const msg = (role: string, text: string, t: string, answers?: unknown) => ({ role, text, at: `${NOW}${t}`, ...(answers ? { answers } : {}) })

const PO_TEXT =
  'Ich habe verstanden, dass jedes Haustier ein Foto erhalten soll. Bevor wir den Umfang festlegen, brauche ich zwei Entscheidungen von Ihnen. Die Rückfragen finden Sie unten.'

const QUESTIONS = [
  {
    header: 'Bildformat',
    question: 'Welche Bildformate sollen für das Foto erlaubt sein?',
    multiSelect: false,
    options: [
      { label: 'Nur JPG und PNG', description: 'Die gängigen Formate genügen für den Alltag.', recommended: true },
      { label: 'Alle gängigen Formate', description: 'Zusätzlich WebP und GIF.' },
      { label: 'Nur JPG', description: 'Einfachste Lösung, aber wenig Auswahl.' },
    ],
  },
  {
    header: 'Anzeige',
    question: 'Wo soll das Foto sichtbar sein?',
    multiSelect: true,
    options: [
      { label: 'In der Haustier-Liste', description: 'Als kleines Bild neben dem Namen.' },
      { label: 'Im Bearbeiten-Dialog', description: 'Mit der Möglichkeit, das Bild zu tauschen.' },
      { label: 'Auf der Seite der Person', description: 'Beim zugeordneten Haustier.', recommended: true },
    ],
  },
]

function detail(base: Idea, o: Idea = {}): Idea {
  const doc = {
    title: base.title,
    state: base.state,
    problem: 'Haustiere erscheinen nur mit Namen und Tierart. Wer ein Tier erkennen will, muss sich auf den Namen verlassen. Ein **Foto** würde die Liste anschaulicher machen.',
    solution: 'Zu jedem Haustier lässt sich ein Foto hochladen. Es erscheint in der Liste und im Dialog `Haustier bearbeiten`.',
    inScope: 'Foto hochladen, ersetzen und entfernen; Anzeige in der Haustier-Liste.',
    outOfScope: 'Mehrere Fotos je Tier, Bildbearbeitung, Videos.',
    decisions: ['2026-11-03: Pro Haustier genau ein Foto.', '2026-11-03: Erlaubt sind JPG und PNG.'],
    openPoints: o.openPoints ?? ['Maximale Dateigröße des Fotos klären.'],
    impactSpecs: 'Neue Anforderungen im Themenbereich Haustiere.',
    impactData: 'Je Haustier wird ein Bild gespeichert.',
    impactBackend: 'Neuer Weg zum Hochladen und Abrufen von Bildern.',
    impactCode: 'Neues Bildfeld im Anlegen- und Bearbeiten-Dialog.',
    transfer: o.transfer ?? [],
  }
  return {
    ...base,
    doc,
    messages: o.messages ?? [],
    pendingQuestions: o.questions ?? [],
    activity: o.activity ?? [],
    costUsd: 0,
    readinessLabels: LABELS,
  }
}

const CHAT = [
  msg('user', 'Ich möchte, dass jedes Haustier ein Foto bekommt, damit man die Tiere in der Liste erkennt.', '12:04'),
  msg('assistant', 'Verstanden. Das Foto soll also die Tiere in der Liste unterscheidbar machen. Ich prüfe, was der Bestand schon hergibt, und melde mich gleich mit Rückfragen.', '12:31'),
  msg('assistant', PO_TEXT, '14:02'),
]
const CHAT_PLAIN = [
  CHAT[0],
  CHAT[1],
  msg('assistant', 'Danke, das ist klar. Ich halte fest: Pro Haustier genau ein Foto, erlaubt sind JPG und PNG. Offen ist noch die maximale Dateigröße. Wie groß darf ein Foto höchstens sein?', '14:02'),
]

const MAIN = (o: Idea = {}) => detail({ ...BOARD[0], ...(o.base ?? {}) }, { messages: CHAT_PLAIN, ...o })

// ---------------------------------------------------------------------------
// Simulation der Antworten des Dienstes
// ---------------------------------------------------------------------------
const system = {
  checks: [
    { key: 'ai', label: 'KI-Anbindung', ok: true, detail: '2.1.0 (Claude Code)' },
    { key: 'docker', label: 'Betriebsumgebung', ok: true, detail: 'Docker 27.4.0' },
    { key: 'git', label: 'Versionsverwaltung', ok: true, detail: 'git version 2.47.1' },
    { key: 'app', label: 'Anwendung', ok: true, detail: 'http://localhost:8081' },
  ],
  app: { url: 'http://localhost:8081', online: true },
  user: 'Max Beispiel',
}
const overview = (ideas = 4) => ({
  nav: { ideasOpen: ideas, requirementsOpen: 5, runsActive: 0 },
  totals: { open: 5, implemented: 18, features: 6, deliveries: 4, rate: 78, stories: 23, criteria: 212, epics: 3, avgDurationMs: 1500000 },
  ideas: { draft: 2, ready: 1, transferred: 4 },
  byEpic: [], daily: [], actions: [], activeRuns: [], recent: [],
})

type Mocks = {
  list?: Idea[]
  ideas?: Record<string, Idea>
  runs?: Record<string, Idea>
  post?: (url: string) => { status: number; body: unknown } | undefined
  nav?: number
}

async function mock(page: Page, m: Mocks = {}) {
  await page.addInitScript(() => {
    // Simulierte Spracherkennung und Sprachausgabe, damit die Mikrofon-Schaltflächen erscheinen.
    const w = window as any
    w.__recs = []
    class FakeRec {
      running = false
      onresult: any
      onend: any
      onerror: any
      start() { this.running = true; w.__recs.push(this) }
      stop() { this.running = false }
      abort() { this.running = false }
    }
    w.SpeechRecognition = FakeRec
    w.webkitSpeechRecognition = FakeRec
    w.__say = (text: string, final: boolean) => {
      const r = [...w.__recs].reverse().find((x: any) => x.running)
      const result: any = [{ transcript: text }]
      result.isFinal = final
      r.onresult({ resultIndex: 0, results: [result] })
    }
    const synth = window.speechSynthesis as any
    const voices = [
      { name: 'Microsoft Katja Online (Natural) - German (Germany)', lang: 'de-DE' },
      { name: 'Microsoft Conrad Online (Natural) - German (Germany)', lang: 'de-DE' },
      { name: 'Google Deutsch', lang: 'de-DE' },
    ]
    synth.getVoices = () => voices
    w.SpeechSynthesisUtterance = class { text: string; constructor(t: string) { this.text = t } }
    synth.speak = () => {}
    synth.cancel = () => {}
  })
  await page.route('**/api/events', (r) => r.fulfill({ status: 200, contentType: 'text/event-stream', body: 'retry: 600000\n\n' }))
  await page.route('**/api/overview', (r) => r.fulfill({ json: overview(m.nav ?? 4) }))
  await page.route('**/api/system', (r) => r.fulfill({ json: system }))
  await page.route('**/api/ideas**', async (r) => {
    const req = r.request()
    const url = new URL(req.url())
    if (req.method() !== 'GET') {
      const custom = m.post?.(url.pathname)
      if (custom) return r.fulfill({ status: custom.status, json: custom.body })
      return r.fulfill({ status: 202, json: { id: 'I3', ok: true } })
    }
    const parts = url.pathname.split('/').filter(Boolean)
    if (parts.length === 2) return r.fulfill({ json: m.list ?? BOARD })
    const found = m.ideas?.[parts[2]]
    if (!found) return r.fulfill({ status: 404, json: { error: 'Diese Idee existiert nicht mehr.' } })
    return r.fulfill({ json: found })
  })
  await page.route('**/api/runs/**', (r) => {
    const id = new URL(r.request().url()).pathname.split('/').pop() as string
    const found = m.runs?.[id]
    return found ? r.fulfill({ json: found }) : r.fulfill({ status: 404, json: { error: 'Dieser Auftrag existiert nicht.' } })
  })
}

async function open(page: Page, hash: string) {
  await page.goto('/#' + hash)
  await page.waitForTimeout(900)
}

// ---------------------------------------------------------------------------
// Hilfen für Markierungen und Aufnahmen
// ---------------------------------------------------------------------------
type Place = 'tl' | 'tr' | 'l' | 'r' | 'in' | 'b'
type Item = { loc: Locator; at?: Place }

async function mark(page: Page, items: Item[]) {
  const boxes = []
  for (const it of items) {
    boxes.push({ box: await it.loc.first().boundingBox(), at: it.at ?? 'tl' })
  }
  await page.evaluate((list) => {
    document.querySelectorAll('.doc-mark').forEach((n) => n.remove())
    list.forEach((it: any, i: number) => {
      const b = it.box
      if (!b) throw new Error('Marker-Ziel fehlt: ' + i)
      let x = b.x
      let y = b.y
      if (it.at === 'tr') { x = b.x + b.width; y = b.y }
      if (it.at === 'l') { x = b.x - 16; y = b.y + b.height / 2 }
      if (it.at === 'r') { x = b.x + b.width + 16; y = b.y + b.height / 2 }
      if (it.at === 'in') { x = b.x + 18; y = b.y + 18 }
      if (it.at === 'b') { x = b.x + b.width / 2; y = b.y + b.height + 14 }
      const c = document.createElement('div')
      c.className = 'doc-mark'
      c.textContent = String(i + 1)
      c.style.cssText = `position:fixed;z-index:99999;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:999px;background:#f38a2c;color:#fff;font:700 14px/26px 'Plus Jakarta Sans',sans-serif;text-align:center;left:${x}px;top:${y}px;`
      document.body.appendChild(c)
    })
  }, boxes)
}

async function clear(page: Page) {
  await page.evaluate(() => document.querySelectorAll('.doc-mark').forEach((n) => n.remove()))
}

async function shot(page: Page, name: string) {
  await page.screenshot({ path: path.join(OUT, name + '.png'), animations: 'disabled' })
}

// Ausschnitt um ein Element herum (mit Rand, damit außen stehende Markierungen sichtbar bleiben).
async function crop(page: Page, loc: Locator, name: string, pad = 24) {
  const b = (await loc.first().boundingBox())!
  const vp = page.viewportSize()!
  const x = Math.max(0, b.x - pad)
  const y = Math.max(0, b.y - pad)
  const clip = {
    x,
    y,
    width: Math.min(vp.width - x, b.width + 2 * pad),
    height: Math.min(vp.height - y, b.height + 2 * pad),
  }
  await page.screenshot({ path: path.join(OUT, name + '.png'), animations: 'disabled', clip })
}

const btn = (page: Page, name: string) => page.getByRole('button', { name, exact: true })
const sideCard = (page: Page, title: string) =>
  page.locator('.f-workspace__side .dt-card').filter({ has: page.getByRole('heading', { name: title }) })

// ===========================================================================
// F3 Ideen-Tafel
// ===========================================================================
test('Ideen-Tafel', async ({ page }) => {
  await mock(page)
  await open(page, '/ideen')
  await shot(page, 'ideen-tafel-01-uebersicht')

  await mark(page, [
    { loc: page.locator('.dt-kicker').first(), at: 'l' },
    { loc: btn(page, 'Idee erfassen'), at: 'tl' },
    { loc: page.locator('.f-board__head').nth(0), at: 'tl' },
    { loc: page.locator('.f-board__head .dt-nav__count').nth(0), at: 'tr' },
    { loc: page.locator('.f-board__hint').nth(0), at: 'l' },
    { loc: page.locator('.f-ideacard').nth(0), at: 'tl' },
  ])
  await shot(page, 'ideen-tafel-02-uebersicht-markiert')
  await clear(page)

  // Karten und ihre Marken
  const column = page.locator('.f-board__column').nth(0)
  const cards = column.locator('.f-ideacard')
  await mark(page, [
    { loc: cards.nth(0).locator('.dt-cell-mono').first(), at: 'l' },
    { loc: cards.nth(0).locator('.f-ideacard__title'), at: 'l' },
    { loc: cards.nth(0).locator('.f-ideacard__text'), at: 'l' },
    { loc: cards.nth(0).locator('.f-ideacard__progress'), at: 'l' },
    { loc: cards.nth(0).locator('.dt-badge'), at: 'tl' },
    { loc: cards.nth(1).locator('.f-working'), at: 'tl' },
    { loc: cards.nth(2).locator('.dt-badge'), at: 'tl' },
    { loc: cards.nth(3).locator('.dt-badge'), at: 'tl' },
  ])
  await crop(page, column, 'ideen-tafel-03-karten-markiert', 30)
  await clear(page)

  await crop(page, page.locator('.f-board'), 'ideen-tafel-04-alle-spalten', 8)

  // Leere Tafel
  const empty = await page.context().newPage()
  await mock(empty, { list: [], nav: 0 })
  await open(empty, '/ideen')
  await shot(empty, 'ideen-tafel-05-leer')
  await empty.close()

  // Dialog Idee erfassen
  await btn(page, 'Idee erfassen').click()
  await page.waitForTimeout(400)
  await mark(page, [
    { loc: page.locator('.dt-modal__head .dt-kicker'), at: 'l' },
    { loc: page.locator('#intake-text'), at: 'tl' },
    { loc: btn(page, 'Abbrechen'), at: 'tl' },
    { loc: btn(page, 'Dialog starten'), at: 'tl' },
  ])
  await crop(page, page.locator('.dt-modal'), 'ideen-tafel-06-dialog-erfassen', 30)
  await clear(page)

  await btn(page, 'Dialog starten').click()
  await page.waitForTimeout(300)
  await crop(page, page.locator('.dt-modal'), 'ideen-tafel-07-dialog-pflichtfeld', 30)

  await page.locator('#intake-text').fill('Jedes Haustier soll ein Foto bekommen, damit man die Tiere in der Liste auseinanderhalten kann.')
  await crop(page, page.locator('.dt-modal'), 'ideen-tafel-08-dialog-ausgefuellt', 30)
})

// ===========================================================================
// F4 Ideen-Dialog
// ===========================================================================
test('Ideen-Dialog', async ({ page }) => {
  const withQuestions = MAIN({ questions: QUESTIONS, messages: CHAT })
  await mock(page, { ideas: { I3: withQuestions } })
  await open(page, '/ideen/I3')
  await shot(page, 'ideen-dialog-01-uebersicht')

  await mark(page, [
    { loc: page.locator('.dt-topbar a.dt-iconbtn'), at: 'tr' },
    { loc: page.locator('.dt-topbar .dt-badge'), at: 'tl' },
    { loc: btn(page, 'Idee freigeben'), at: 'tl' },
    { loc: page.locator('.f-phaseband'), at: 'in' },
    { loc: page.locator('.f-chat'), at: 'tl' },
    { loc: page.locator('.f-wizard'), at: 'tl' },
    { loc: page.locator('.f-composer'), at: 'tl' },
    { loc: sideCard(page, 'Reifegrad'), at: 'tl' },
    { loc: sideCard(page, 'Stand der Idee'), at: 'tl' },
  ])
  await shot(page, 'ideen-dialog-02-uebersicht-markiert')
  await clear(page)

  // Rückfragen (Assistent)
  await page.locator('.f-option').nth(0).click()
  await mark(page, [
    { loc: page.locator('.f-wizard__head .dt-kicker'), at: 'l' },
    { loc: page.locator('.f-wizard__head .dt-cell-mono'), at: 'tr' },
    { loc: page.locator('.f-option').nth(0), at: 'tl' },
    { loc: page.locator('.f-option__badge'), at: 'tr' },
    { loc: page.locator('.f-wizard__custom'), at: 'tl' },
    { loc: btn(page, 'Weiter'), at: 'tl' },
  ])
  await crop(page, page.locator('.f-wizard'), 'ideen-dialog-03-rueckfrage-markiert', 28)
  await clear(page)

  await btn(page, 'Weiter').click()
  await page.locator('.f-option').nth(0).click()
  await page.locator('.f-option').nth(2).click()
  await crop(page, page.locator('.f-wizard'), 'ideen-dialog-04-rueckfrage-letzte', 20)

  // KI arbeitet
  const busy = MAIN({
    messages: CHAT.slice(0, 2),
    base: { busy: true },
    activity: [
      { text: 'Liest die Anforderungen der Haustiere' },
      { text: 'Prüft, wie Haustiere heute gespeichert werden' },
      { text: 'Vergleicht die Idee mit dem Bestand' },
      { text: 'Formuliert die Rückfragen' },
    ],
  })
  const p2 = await page.context().newPage()
  await mock(p2, { ideas: { I3: busy } })
  await open(p2, '/ideen/I3')
  await mark(p2, [
    { loc: p2.locator('.f-thinking .f-working'), at: 'tl' },
    { loc: p2.locator('.f-thinking__steps'), at: 'tl' },
    { loc: p2.locator('.f-composer__input'), at: 'tl' },
  ])
  await crop(p2, p2.locator('.f-chat'), 'ideen-dialog-05-ki-arbeitet', 12)
  await p2.close()

  // Fehler
  const failed = MAIN({ messages: CHAT.slice(0, 2), base: { error: 'Die KI hat die Zeitvorgabe überschritten.' } })
  failed.error = 'Die KI hat die Zeitvorgabe überschritten.'
  const p3 = await page.context().newPage()
  await mock(p3, { ideas: { I3: failed } })
  await open(p3, '/ideen/I3')
  await mark(p3, [
    { loc: p3.locator('.f-note--error .f-note__text'), at: 'tl' },
    { loc: btn(p3, 'Erneut versuchen'), at: 'tl' },
  ])
  await crop(p3, p3.locator('.f-chat'), 'ideen-dialog-06-fehler', 12)
  await p3.close()

  // Phasen und Reifegrad
  const p4 = await page.context().newPage()
  await mock(p4, { ideas: { I3: MAIN() } })
  await open(p4, '/ideen/I3')
  await mark(p4, [
    { loc: p4.locator('.f-stepper__item').nth(0), at: 'tl' },
    { loc: p4.locator('.f-stepper__item').nth(2), at: 'tl' },
    { loc: p4.locator('.f-stepper__item').nth(4), at: 'tl' },
  ])
  await crop(p4, p4.locator('.f-phaseband'), 'ideen-dialog-07-phasen', 14)
  await clear(p4)
  await mark(p4, [
    { loc: sideCard(p4, 'Reifegrad').locator('.f-score'), at: 'l' },
    { loc: sideCard(p4, 'Reifegrad').locator('.f-ready li').nth(0), at: 'l' },
    { loc: sideCard(p4, 'Reifegrad').locator('.f-ready li').nth(4), at: 'l' },
  ])
  await crop(p4, sideCard(p4, 'Reifegrad'), 'ideen-dialog-08-reifegrad', 26)
  await clear(p4)

  // Stand der Idee
  await p4.locator('.f-workspace__side').evaluate((el) => (el.scrollTop = el.scrollHeight))
  await p4.waitForTimeout(200)
  await mark(p4, [
    { loc: sideCard(p4, 'Stand der Idee').locator('button[aria-label="Idee bearbeiten"]'), at: 'tl' },
    { loc: sideCard(p4, 'Stand der Idee').locator('.f-doc__section').nth(0), at: 'l' },
    { loc: sideCard(p4, 'Stand der Idee').locator('.f-doc__section').nth(4), at: 'l' },
    { loc: sideCard(p4, 'Stand der Idee').locator('.f-doc__section').nth(5), at: 'l' },
    { loc: p4.locator('.f-disclosure'), at: 'l' },
  ])
  await shot(p4, 'ideen-dialog-09-stand-der-idee')
  await clear(p4)
  await p4.locator('.f-disclosure').click()
  await p4.locator('.f-workspace__side').evaluate((el) => (el.scrollTop = el.scrollHeight))
  await p4.waitForTimeout(200)
  await mark(p4, [
    { loc: p4.locator('.f-technical .f-doc__section').nth(0), at: 'l' },
    { loc: p4.locator('.f-doc__footer button'), at: 'tl' },
  ])
  await shot(p4, 'ideen-dialog-10-auswirkungen-verwerfen')
  await clear(p4)

  // Idee bearbeiten
  await p4.locator('.f-workspace__side').evaluate((el) => (el.scrollTop = 0))
  // Der Dialog ist höher als 900 Pixel; nur für diese Aufnahme wird das Fenster höher gestellt.
  await p4.setViewportSize({ width: 1440, height: 1120 })
  await p4.waitForTimeout(300)
  await p4.locator('button[aria-label="Idee bearbeiten"]').click()
  await p4.waitForTimeout(400)
  await mark(p4, [
    { loc: p4.locator('.dt-modal .dt-field__label').nth(0), at: 'l' },
    { loc: p4.locator('.dt-modal .f-mic__btn').nth(1), at: 'tl' },
    { loc: p4.locator('.dt-modal .dt-field__label').nth(5), at: 'l' },
    { loc: btn(p4, 'Speichern'), at: 'tl' },
  ])
  await crop(p4, p4.locator('.dt-modal'), 'ideen-dialog-11-bearbeiten', 30)
  await clear(p4)
  await p4.close()

  // Freigeben
  const ready6 = MAIN({ base: { count: 6, phase: 'abschliessen' }, openPoints: [] })
  ready6.readiness = readiness(6)
  ready6.readyCount = 6
  const p5 = await page.context().newPage()
  await mock(p5, { ideas: { I3: ready6 } })
  await open(p5, '/ideen/I3')
  await mark(p5, [
    { loc: btn(p5, 'Idee freigeben'), at: 'tl' },
    { loc: p5.locator('.f-note').first(), at: 'tl' },
  ])
  await shot(p5, 'ideen-dialog-12-freigabe-moeglich')
  await clear(p5)
  await btn(p5, 'Idee freigeben').click()
  await p5.waitForTimeout(400)
  await mark(p5, [
    { loc: p5.locator('.dt-modal'), at: 'tl' },
    { loc: p5.locator('.f-confirm__actions button').nth(1), at: 'tl' },
  ])
  await crop(p5, p5.locator('.dt-modal'), 'ideen-dialog-13-freigabe-bestaetigen', 30)
  await clear(p5)
  await p5.close()

  // Freigegebene Idee
  const ready = detail(BOARD[4], { messages: CHAT_PLAIN, openPoints: [] })
  const p6 = await page.context().newPage()
  await mock(p6, { ideas: { I7: ready } })
  await open(p6, '/ideen/I7')
  await mark(p6, [
    { loc: p6.locator('.dt-topbar .dt-badge'), at: 'tl' },
    { loc: btn(p6, 'Erneut öffnen'), at: 'tl' },
    { loc: btn(p6, 'Anforderungen erstellen'), at: 'tl' },
    { loc: p6.locator('.f-chat__readonly'), at: 'tl' },
  ])
  await shot(p6, 'ideen-dialog-14-freigegeben')
  await clear(p6)
  await p6.close()

  // Verwerfen
  const p7 = await page.context().newPage()
  await mock(p7, { ideas: { I3: MAIN() } })
  await open(p7, '/ideen/I3')
  await p7.locator('.f-workspace__side').evaluate((el) => (el.scrollTop = el.scrollHeight))
  await p7.locator('.f-doc__footer button').click()
  await p7.waitForTimeout(400)
  await crop(p7, p7.locator('.dt-modal'), 'ideen-dialog-15-verwerfen', 30)
  await p7.close()
})

// ===========================================================================
// F5 Sprache
// ===========================================================================
test('Sprache', async ({ page }) => {
  test.setTimeout(90000)
  await mock(page, { ideas: { I3: MAIN() } })
  await open(page, '/ideen/I3')

  // Diktieren und Vorlesen im Gespräch
  await mark(page, [
    { loc: page.locator('.f-msg--assistant .f-msg__speak').last(), at: 'tl' },
    { loc: page.locator('.f-composer .f-mic__btn'), at: 'tl' },
    { loc: btn(page, 'Gesprächsmodus starten'), at: 'tl' },
  ])
  await crop(page, page.locator('.f-chat'), 'sprache-01-gespraech-markiert', 12)
  await clear(page)

  await page.locator('.f-composer .f-mic__btn').click()
  await page.evaluate(() => (window as any).__say('Die Fotos sollten höchstens fünf Megabyte groß sein', false))
  await page.waitForTimeout(250)
  await mark(page, [
    { loc: page.locator('.f-composer .f-mic__btn'), at: 'tl' },
    { loc: page.locator('.f-mic__interim'), at: 'tl' },
  ])
  await crop(page, page.locator('.f-composer'), 'sprache-02-diktat-laeuft', 24)
  await clear(page)
  await page.locator('.f-composer .f-mic__btn').click()

  // Einstieg: Idee einsprechen
  const p2 = await page.context().newPage()
  await mock(p2)
  await open(p2, '/ideen?neu=1')
  await mark(p2, [
    { loc: p2.locator('.f-mic__btn--large'), at: 'tl' },
    { loc: p2.locator('.f-intake__mic .dt-cell-strong'), at: 'r' },
    { loc: p2.locator('.f-intake__hint'), at: 'r' },
    { loc: p2.locator('#intake-text'), at: 'tl' },
  ])
  await crop(p2, p2.locator('.dt-modal'), 'sprache-03-einsprechen-bereit', 30)
  await clear(p2)
  await p2.locator('.f-mic__btn--large').click()
  await p2.evaluate(() => (window as any).__say('Jedes Haustier soll ein Foto bekommen', true))
  await p2.evaluate(() => (window as any).__say('damit man die Tiere in der Liste', false))
  await p2.waitForTimeout(250)
  await mark(p2, [
    { loc: p2.locator('.f-mic__btn--large'), at: 'tl' },
    { loc: p2.locator('.f-intake__mic .dt-cell-strong'), at: 'r' },
    { loc: p2.locator('.f-intake__hint'), at: 'r' },
    { loc: p2.locator('#intake-text'), at: 'tl' },
  ])
  await crop(p2, p2.locator('.dt-modal'), 'sprache-04-einsprechen-laeuft', 30)
  await p2.close()

  // Gesprächsmodus
  await btn(page, 'Gesprächsmodus starten').click()
  await page.waitForTimeout(500)
  await mark(page, [
    { loc: btn(page, 'Gesprächsmodus beenden'), at: 'tl' },
    { loc: page.locator('.f-voiceband__text'), at: 'tr' },
    { loc: btn(page, 'Vorlesen überspringen'), at: 'tl' },
  ])
  await crop(page, page.locator('.f-chat'), 'sprache-05-gespraechsmodus-vorlesen', 12)
  await clear(page)

  await btn(page, 'Vorlesen überspringen').click()
  await page.waitForTimeout(300)
  await mark(page, [{ loc: page.locator('.f-voiceband__text'), at: 'tl' }])
  await crop(page, page.locator('.f-voiceband'), 'sprache-06-gespraechsmodus-zuhoeren', 20)
  await clear(page)
  await page.evaluate(() => (window as any).__say('Höchstens fünf Megabyte', false))
  await page.waitForTimeout(200)
  await crop(page, page.locator('.f-voiceband'), 'sprache-07-gespraechsmodus-erkannt', 20)

  // Einstellungen: Stimme und Tempo
  const p3 = await page.context().newPage()
  await mock(p3)
  await p3.route('**/api/settings', (r) =>
    r.fulfill({
      json: {
        dialogModel: 'claude-sonnet-5-5',
        buildModel: 'claude-opus-5-5',
        appUrl: 'http://localhost:8081',
        models: [
          { id: 'claude-sonnet-5-5', label: 'Ausgewogen', detail: 'Sonnet 5.5' },
          { id: 'claude-opus-5-5', label: 'Gründlich', detail: 'Opus 5.5' },
        ],
      },
    }),
  )
  await open(p3, '/einstellungen')
  const sprache = p3.locator('.dt-card').filter({ has: p3.getByRole('heading', { name: 'Sprache' }) }).last()
  await sprache.scrollIntoViewIfNeeded()
  await mark(p3, [
    { loc: p3.locator('#voice'), at: 'tl' },
    { loc: p3.locator('#rate'), at: 'tl' },
    { loc: p3.getByRole('button', { name: 'Stimme testen' }), at: 'tl' },
  ])
  await crop(p3, sprache, 'sprache-08-einstellungen', 26)
  await p3.close()
})

// ===========================================================================
// F6 Überführung in Anforderungen
// ===========================================================================
const phases = (states: string[]) =>
  ['Vorbereitung', 'Ausformulierung', 'Formprüfung', 'Sicherung'].map((label, i) => ({ key: label.toLowerCase(), label, status: states[i] }))

const run = (o: Idea): Idea => ({
  id: 'A7',
  type: 'transfer',
  title: 'Tierarzt-Termine',
  ideaId: 'I7',
  status: 'done',
  phases: phases(['done', 'done', 'done', 'done']),
  stories: [],
  activity: [
    { at: '2026-11-04T10:02:11', kind: 'phase', text: 'Vorbereitung abgeschlossen' },
    { at: '2026-11-04T10:09:40', kind: 'info', text: 'Anforderungen ausformuliert' },
    { at: '2026-11-04T10:10:05', kind: 'phase', text: 'Formprüfung bestanden' },
  ],
  changes: null,
  queuedAt: '2026-11-04T10:01:00',
  startedAt: '2026-11-04T10:02:00',
  endedAt: '2026-11-04T10:11:00',
  costUsd: 1.42,
  summary: '',
  error: '',
  repairs: 0,
  commit: null,
  canDiscard: false,
  ...o,
})

test('Überführung', async ({ page }) => {
  const ready = detail(BOARD[4], { messages: CHAT_PLAIN, openPoints: [] })
  const transferred = detail(BOARD[5], {
    messages: CHAT_PLAIN,
    openPoints: [],
    transfer: ['2026-11-04: Überführt in `specs/E2 Haustiere/F5 Impfpass/S1 Impfung erfassen.md`, `specs/E2 Haustiere/F5 Impfpass/S2 Impfungen ansehen.md`.'],
  })
  const runs = {
    A7: run({
      status: 'done',
      summary: 'Zwei neue Anforderungen zum Impfpass wurden angelegt. Offen ist die Umsetzung beider Anforderungen. Festgelegt wurde zusätzlich, dass jede Impfung ein Datum trägt.',
      stories: [
        { id: 'E2-F5-S1', title: 'Impfung erfassen', done: false },
        { id: 'E2-F5-S2', title: 'Impfungen ansehen', done: false },
      ],
      commit: 'a1b2c3d',
      changes: { areas: { Anforderungen: 2 }, files: [{ path: 'specs/E2 Haustiere/F5 Impfpass/S1 Impfung erfassen.md', added: 24, removed: 0 }] },
    }),
    A8: run({
      id: 'A8',
      status: 'running',
      phases: phases(['done', 'active', 'pending', 'pending']),
      activity: [{ at: '2026-11-04T10:02:11', kind: 'phase', text: 'Vorbereitung abgeschlossen' }],
      endedAt: null,
    }),
    A9: run({
      id: 'A9',
      status: 'failed',
      phases: phases(['failed', 'pending', 'pending', 'pending']),
      error: 'Unter den Anforderungen liegen nicht gesicherte Änderungen. Bitte sichern oder verwerfen Sie diese zuerst.',
      activity: [],
    }),
  }

  await mock(page, { ideas: { I7: ready, I2: transferred }, runs, post: (u) => (u.endsWith('/transfer') ? { status: 202, body: { id: 'A8' } } : undefined) })

  await open(page, '/ideen/I7')
  await shot(page, 'ueberfuehrung-01-freigegebene-idee')

  await btn(page, 'Anforderungen erstellen').click()
  await page.waitForTimeout(400)
  await mark(page, [
    { loc: page.locator('.dt-modal'), at: 'tl' },
    { loc: page.locator('.f-confirm__actions button').nth(0), at: 'tl' },
    { loc: page.locator('.f-confirm__actions button').nth(1), at: 'tl' },
  ])
  await crop(page, page.locator('.dt-modal'), 'ueberfuehrung-02-bestaetigen', 30)
  await clear(page)

  // Auftrag läuft, Fehler und Ergebnis
  const p2 = await page.context().newPage()
  await mock(p2, { runs })
  await open(p2, '/umsetzung/A8')
  await mark(p2, [
    { loc: p2.locator('.dt-topbar .dt-badge'), at: 'tl' },
    { loc: p2.locator('.f-stepper'), at: 'tl' },
  ])
  await shot(p2, 'ueberfuehrung-03-auftrag-laeuft')
  await p2.close()

  const p3 = await page.context().newPage()
  await mock(p3, { runs })
  await open(p3, '/umsetzung/A9')
  await mark(p3, [{ loc: p3.locator('.f-note--error'), at: 'tl' }])
  await crop(p3, p3.locator('.f-note--error'), 'ueberfuehrung-04-auftrag-fehler', 40)
  await p3.close()

  const p4 = await page.context().newPage()
  await mock(p4, { runs })
  await open(p4, '/umsetzung/A7')
  const result = p4.locator('section.dt-card--lg').filter({ has: p4.getByRole('heading', { name: 'Der Auftrag ist abgeschlossen' }) })
  await mark(p4, [
    { loc: result.locator('.dt-kicker'), at: 'l' },
    { loc: result.locator('.f-detail__text'), at: 'l' },
    { loc: result.getByRole('link', { name: 'Anforderungen prüfen' }), at: 'tl' },
  ])
  await crop(p4, result, 'ueberfuehrung-05-ergebnis', 30)
  await p4.close()

  // Überführte Idee
  const p5 = await page.context().newPage()
  await mock(p5, { ideas: { I2: transferred } })
  await open(p5, '/ideen/I2')
  await mark(p5, [
    { loc: p5.locator('.dt-topbar .dt-badge'), at: 'tl' },
    { loc: p5.getByRole('link', { name: 'Anforderungen ansehen' }), at: 'tl' },
    { loc: p5.locator('.f-chat__readonly'), at: 'tl' },
    { loc: p5.locator('.f-doc__section').last(), at: 'l' },
  ])
  await shot(p5, 'ueberfuehrung-06-ueberfuehrte-idee')
  await p5.close()

  // Herkunft an der Anforderung (echte, nur lesende Ansicht einer Anforderung des Moduls Haustiere)
  const p6 = await page.context().newPage()
  await open(p6, '/anforderungen/E2-F1-S1')
  const einordnung = p6.locator('.dt-card').filter({ has: p6.getByRole('heading', { name: 'Einordnung' }) }).last()
  await mark(p6, [{ loc: einordnung.locator('dt', { hasText: 'Herkunft' }), at: 'l' }])
  await crop(p6, einordnung, 'ueberfuehrung-07-herkunft', 30)
  await p6.close()
})
