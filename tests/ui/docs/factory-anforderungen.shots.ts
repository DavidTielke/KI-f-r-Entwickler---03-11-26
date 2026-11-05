import { expect, test, type Locator, type Page } from '@playwright/test'

// Screenshot-Skript für die Anwenderdokumentation E3 (Seiten 07 bis 09).
// Alle Daten kommen aus Beispieldaten, die per Routen-Mocking eingespielt werden.
// Es werden keine KI-Aufträge gestartet und keine echten Anforderungen verändert.

const OUT = '../../docs/user/E3-software-factory/bilder'
const AT = '2026-11-04T10:12:00+01:00'

type Story = Record<string, any>

function story(epic: number, epicName: string, feature: number, featureName: string, n: number, title: string, state: string, userStory: string, criteria: { heading: string | null; items: string[] }[], isTool = false, description = ''): Story {
  return {
    id: `E${epic}-F${feature}-S${n}`,
    title,
    state,
    userStory,
    description,
    criteria,
    criteriaCount: criteria.reduce((sum, g) => sum + g.items.length, 0),
    epicNumber: epic,
    epicName,
    featureNumber: feature,
    featureName,
    number: n,
    isTool,
    path: '',
  }
}

const SORT_CRITERIA = [
  { heading: 'Sortierung', items: ['Die Tabelle enthält die Spalten Nummer, Name und Status und ist nach Name sortierbar.', 'Ein Klick auf die Spaltenüberschrift „Name“ sortiert aufsteigend.', 'Die Liste lädt schnell.'] },
  { heading: 'Anzeige', items: ['Die aktive Sortierung zeigt einen Pfeil neben der Spaltenüberschrift.'] },
]

const STORIES: Story[] = [
  story(1, 'Personen', 1, 'Personen-Übersicht', 1, 'Personenliste', 'Implemented', 'Als Sachbearbeiterin möchte ich alle Personen in einer Liste sehen, damit ich den Überblick behalte.', [{ heading: 'Liste', items: ['Die Seite zeigt eine Tabelle mit allen Personen.', 'Die Tabelle enthält die Spalte „Name“.', 'Ohne Treffer erscheint „Keine Personen gefunden.“.'] }], false, 'Die Seite zeigt alle gespeicherten Personen in einer Tabelle.'),
  story(1, 'Personen', 1, 'Personen-Übersicht', 2, 'Personen suchen', 'Implemented', 'Als Sachbearbeiterin möchte ich Personen nach Namen suchen, damit ich schnell die richtige Person finde.', [{ heading: null, items: ['Das Suchfeld zeigt den Platzhalter „Personen durchsuchen“.', 'Die Suche ignoriert Groß- und Kleinschreibung.'] }]),
  story(1, 'Personen', 1, 'Personen-Übersicht', 3, 'Personen sortieren', 'Modified', 'Als Sachbearbeiterin möchte ich die Liste sortieren, damit ich Personen in meiner Reihenfolge sehe.', SORT_CRITERIA, false, 'Die Spaltenüberschriften der Personenliste lassen sich anklicken und sortieren die Liste.'),
  story(1, 'Personen', 2, 'Person anlegen', 1, 'Person anlegen', 'Implemented', 'Als Sachbearbeiterin möchte ich eine neue Person erfassen, damit sie in der Verwaltung auftaucht.', [{ heading: null, items: ['Der Dialog zeigt den Titel „Person anlegen.“.', 'Der Dialog enthält den Button „Speichern“.'] }]),
  story(1, 'Personen', 2, 'Person anlegen', 2, 'Pflichtfelder prüfen', 'Modified', 'Als Sachbearbeiterin möchte ich bei fehlenden Angaben einen Hinweis erhalten, damit keine unvollständige Person entsteht.', [{ heading: null, items: ['Das Feld Nachname ist ein Pflichtfeld.', 'Ein leeres Pflichtfeld zeigt eine Fehlermeldung.'] }]),
  story(2, 'Haustiere', 1, 'Haustier-Übersicht', 1, 'Haustierliste', 'Implemented', 'Als Sachbearbeiterin möchte ich alle Haustiere sehen, damit ich weiß, wer zu wem gehört.', [{ heading: null, items: ['Die Seite zeigt eine Tabelle mit allen Haustieren.', 'Die Tabelle enthält die Spalte „Tierart“.'] }]),
  story(2, 'Haustiere', 1, 'Haustier-Übersicht', 2, 'Haustiere nach Tierart filtern', 'Modified', 'Als Sachbearbeiterin möchte ich nach Tierart filtern, damit ich nur passende Haustiere sehe.', [{ heading: null, items: ['Die Seite bietet einen Filter „Tierart“.', 'Der Filter schränkt die Tabelle ein.'] }]),
  story(3, 'Software Factory', 7, 'Anforderungen', 1, 'Anforderungsliste', 'Implemented', 'Als Fachbereich möchte ich alle Anforderungen in einer Liste sehen, damit ich ihren Stand überblicke.', [{ heading: 'Seite', items: ['Die Seite zeigt den Titel „Anforderungen.“.'] }], true),
]

function buildTree(stories: Story[]) {
  const tree: any[] = []
  for (const s of stories) {
    let epic = tree.find((e) => e.number === s.epicNumber)
    if (!epic) {
      epic = {
        number: s.epicNumber,
        name: s.epicName,
        isTool: s.isTool,
        appendices: s.epicNumber === 1 ? ['Backend', 'Datenstruktur', 'Menüstruktur'] : s.epicNumber === 3 ? ['Backend', 'Menüstruktur'] : [],
        features: [],
      }
      tree.push(epic)
    }
    let feature = epic.features.find((f: any) => f.number === s.featureNumber)
    if (!feature) {
      feature = { number: s.featureNumber, name: s.featureName, stories: [] }
      epic.features.push(feature)
    }
    feature.stories.push(s)
  }
  return tree
}

const READINESS = [
  { key: 'goal', label: 'Rolle, Ziel und Nutzen sind klar' },
  { key: 'criteria', label: 'Das Verhalten ist vollständig abgedeckt' },
  { key: 'testable', label: 'Jedes Kriterium ist eindeutig prüfbar' },
  { key: 'placement', label: 'Die Einordnung steht fest' },
]

function session(over: Record<string, any> = {}) {
  const base: Record<string, any> = {
    id: 'A1',
    kind: 'studio',
    number: 1,
    status: 'open',
    storyId: null,
    busy: false,
    error: null,
    activity: [],
    draft: {
      title: 'Personen nach Ort filtern',
      userStory: 'Als Sachbearbeiterin möchte ich Personen nach Wohnort filtern, damit ich regionale Gruppen schnell finde.',
      description: 'Die Personenliste erhält einen Filter für den Wohnort.',
      criteria: [
        { heading: 'Filter', items: ['Die Seite bietet die Auswahl „Wohnort“.', 'Die Auswahl „Wohnort“ enthält alle vorhandenen Orte.'] },
        { heading: 'Ergebnis', items: ['Die Liste zeigt nur Personen mit dem gewählten Wohnort.'] },
      ],
      placement: { epicNumber: 1, epicName: 'Personen', featureNumber: null, featureName: 'Personen filtern' },
    },
    readiness: { goal: true, criteria: true, testable: false, placement: false },
    messages: [
      { role: 'user', text: 'Ich möchte, dass man die Personenliste nach dem Wohnort einschränken kann.', at: '2026-11-04T10:10:12+01:00' },
      { role: 'assistant', text: 'Das klingt nach einem Filter für die Personenliste. Ich habe einen ersten Entwurf angelegt. Eine Frage habe ich noch zur Bedienung.', at: '2026-11-04T10:10:40+01:00' },
    ],
    pendingQuestions: [
      {
        header: 'Bedienung',
        question: 'Wie soll der Wohnort ausgewählt werden?',
        multiSelect: false,
        options: [
          { label: 'Auswahlliste', description: 'Alle vorhandenen Orte stehen in einer Liste zur Auswahl.', recommended: true },
          { label: 'Freitext', description: 'Sie tippen den Ort selbst ein.' },
        ],
      },
    ],
    readinessLabels: READINESS,
  }
  const merged = { ...base, ...over }
  merged.readyCount = READINESS.filter((r) => merged.readiness[r.key]).length
  merged.readyTotal = 4
  merged.waitingForUser = !merged.busy && merged.status === 'open' && merged.messages.at(-1)?.role === 'assistant'
  return merged
}

type State = {
  stories: Story[]
  locked: boolean
  drafts: Record<string, any>
  quality: any
  createError: string
  deleteError: string
}

function freshState(): State {
  return { stories: STORIES, locked: false, drafts: { A1: session() }, quality: null, createError: '', deleteError: '' }
}

const json = (route: any, body: unknown, status = 200) =>
  route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(body) })

async function mock(page: Page, state: State) {
  await page.route('**/api/**', async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const path = url.pathname
    const method = request.method()
    if (path === '/api/events') return route.continue()

    if (path === '/api/overview') {
      const open = state.stories.filter((s) => s.state !== 'Implemented' && !s.isTool).length
      return json(route, { nav: { ideasOpen: 2, requirementsOpen: open, runsActive: state.locked ? 1 : 0 }, ideas: { draft: 1, ready: 1, transferred: 0 }, totals: {}, byEpic: [], daily: [], actions: [], activeRuns: [], openDrafts: 0, recent: [] })
    }
    if (path === '/api/system') {
      return json(route, { checks: [], app: { url: 'http://localhost:3000', online: true }, user: 'Maria Beispiel' })
    }
    if (path === '/api/requirements' && method === 'GET') return json(route, { tree: buildTree(state.stories), locked: state.locked })
    if (path === '/api/requirements' && method === 'POST') {
      return state.createError ? json(route, { error: state.createError }, 400) : json(route, { id: 'E1-F1-S4' }, 201)
    }
    if (path === '/api/requirements/check') return json(route, state.quality)
    const detail = path.match(/^\/api\/requirements\/(E\d+-F\d+-S\d+)$/)
    if (detail) {
      const found = state.stories.find((s) => s.id === detail[1])
      if (!found) return json(route, { error: 'Diese Anforderung existiert nicht mehr.' }, 404)
      if (method === 'DELETE') return state.deleteError ? json(route, { error: state.deleteError }, 409) : json(route, { ok: true })
      if (method === 'PUT') return json(route, { id: found.id, changed: true })
      const implemented = found.state === 'Implemented'
      return json(route, {
        ...found,
        history: [
          { hash: '3f9a1c2', at: '2026-11-03T16:20:00+01:00', subject: `anforderung: ${found.id} geändert` },
          { hash: '81b7d40', at: '2026-11-02T09:05:00+01:00', subject: `anforderung: ${found.id} ${found.title} angelegt` },
        ],
        origin: found.id === 'E1-F1-S3' ? { id: 'I3', title: 'Personenliste sortierbar machen' } : null,
        runs: implemented && !found.isTool ? [{ id: 'R2', status: 'done', endedAt: '2026-11-03T14:40:00+01:00' }] : [],
      })
    }
    if (/^\/api\/appendix\/(\d+)\/(.+)$/.test(path)) {
      return json(route, {
        markdown: '# Datenstruktur\n\n## Person\n\nEine Person hat einen Namen und einen Wohnort.\n\n| Feld | Bedeutung |\n|---|---|\n| Vorname | Vorname der Person |\n| Nachname | Nachname der Person |\n| Wohnort | Ort, an dem die Person wohnt |\n\n## Hinweise\n\n- Der Nachname ist ein Pflichtfeld.\n- Der Wohnort ist freiwillig.\n',
      })
    }

    if (path === '/api/studio' && method === 'GET') return json(route, Object.values(state.drafts).filter((d: any) => d.status === 'open'))
    const studio = path.match(/^\/api\/studio\/(A\d+)$/)
    if (studio && method === 'GET') {
      return state.drafts[studio[1]] ? json(route, state.drafts[studio[1]]) : json(route, { error: 'Dieser Entwurf existiert nicht mehr.' }, 404)
    }
    if (studio && method === 'DELETE') return json(route, { ok: true })
    if (/^\/api\/studio\/A\d+\/(draft|message|save|retry)$/.test(path)) return json(route, { id: 'E1-F1-S4' })
    return route.continue()
  })
}

async function open(page: Page, hash: string, ready: string | RegExp) {
  await page.goto(`/#${hash}`)
  await page.reload()
  await expect(page.getByText(ready).first()).toBeVisible()
  await page.waitForTimeout(500)
}

async function shot(page: Page | Locator, name: string) {
  await page.screenshot({ path: `${OUT}/${name}.png`, animations: 'disabled' })
}

type Mark = { loc: Locator; n: number; at?: 'tl' | 'tr' | 'l' | 'r' }

// Orange Nummernmarkierungen als Overlay (nur im Bild, nicht in der Anwendung).
async function marks(page: Page, items: Mark[]) {
  const boxes: { x: number; y: number; n: number }[] = []
  for (const item of items) {
    const box = await item.loc.first().boundingBox()
    if (!box) throw new Error(`Markierung ${item.n} nicht gefunden`)
    const at = item.at ?? 'tl'
    const x = at === 'tr' || at === 'r' ? box.x + box.width + 4 : box.x - 14
    const y = at === 'l' || at === 'r' ? box.y + box.height / 2 : box.y + 8
    boxes.push({ x, y, n: item.n })
  }
  await page.evaluate((list) => {
    for (const b of list) {
      const el = document.createElement('div')
      el.setAttribute('data-doc-mark', '1')
      el.textContent = String(b.n)
      el.style.cssText = `position:fixed;left:${b.x - 11}px;top:${b.y - 11}px;width:22px;height:22px;border-radius:50%;background:#f38a2c;color:#fff;font:700 12px/22px "Plus Jakarta Sans",sans-serif;text-align:center;z-index:99999;box-shadow:0 0 0 2px #fff;pointer-events:none`
      document.body.appendChild(el)
    }
  }, boxes)
}

async function clearMarks(page: Page) {
  await page.evaluate(() => document.querySelectorAll('[data-doc-mark]').forEach((el) => el.remove()))
}

const QUALITY_BAD = {
  verdict: 'nachbessern',
  summary: 'Zwei Kriterien sollten überarbeitet werden: Eines prüft mehrere Dinge zugleich, eines ist nicht messbar.',
  findings: [
    {
      principle: 'Klein',
      criterion: 'Die Tabelle enthält die Spalten Nummer, Name und Status und ist nach Name sortierbar.',
      problem: 'Das Kriterium prüft zwei Dinge auf einmal: die **Spalten** und die **Sortierung**.',
      suggestions: ['Die Tabelle enthält die Spalten „Nummer“, „Name“ und „Status“.', 'Die Tabelle ist nach der Spalte „Name“ sortierbar.'],
    },
    {
      principle: 'Testbar',
      criterion: 'Die Liste lädt schnell.',
      problem: '„Schnell“ lässt sich nicht prüfen. Ein Zahlenwert fehlt, zum Beispiel in `Sekunden`.',
      suggestions: ['Die Liste erscheint innerhalb von zwei Sekunden nach dem Öffnen der Seite.'],
    },
  ],
}

const QUALITY_GOOD = {
  verdict: 'gut',
  summary: 'Alle Kriterien sind eindeutig, prüfbar und klein genug. Es gibt nichts zu verbessern.',
  findings: [],
}

// Karte an den oberen Rand des Inhaltsbereichs holen und den sichtbaren Teil aufnehmen.
async function shotCard(page: Page, card: Locator, name: string, withMarks: Mark[] = []) {
  await card.evaluate((el) => el.scrollIntoView({ block: 'start' }))
  await page.waitForTimeout(200)
  if (withMarks.length) await marks(page, withMarks)
  const box = (await card.boundingBox())!
  const height = Math.min(box.height, 900 - box.y)
  await page.screenshot({ path: `${OUT}/${name}.png`, animations: 'disabled', clip: { x: box.x, y: box.y, width: box.width, height } })
  await clearMarks(page)
}

const criteriaCard = (page: Page) => page.locator('section.dt-card', { has: page.getByRole('heading', { name: /Abnahmekriterien/ }) }).first()

test.describe.configure({ mode: 'serial' })

test.describe('Anforderungen (Seite 07)', () => {
  test('Liste', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/anforderungen', 'Personenliste')
    await shot(page, 'anforderungen-01-liste-start')
    await marks(page, [
      { loc: page.getByRole('button', { name: 'Anforderung anlegen' }), n: 1, at: 'tl' },
      { loc: page.locator('.f-tree'), n: 2, at: 'tl' },
      { loc: page.getByPlaceholder('Anforderungen durchsuchen'), n: 3, at: 'tl' },
      { loc: page.getByRole('group', { name: 'Nach Status filtern' }), n: 4, at: 'tl' },
      { loc: page.locator('tbody tr').first().locator('td').nth(2), n: 5, at: 'tl' },
      { loc: page.locator('tbody tr').first().locator('td').nth(5), n: 6, at: 'tl' },
      { loc: page.getByRole('checkbox', { name: 'Alle offenen Anforderungen auswählen' }), n: 7, at: 'tl' },
    ])
    await shot(page, 'anforderungen-02-liste-bereiche')
  })

  test('Struktur und Filter', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/anforderungen', 'Personenliste')
    await page.locator('.f-tree__item', { hasText: /^Personen/ }).first().click()
    await page.waitForTimeout(300)
    await marks(page, [
      { loc: page.locator('.f-tree__item', { hasText: 'Alle Themenbereiche' }), n: 1, at: 'tl' },
      { loc: page.locator('.f-tree__item', { hasText: /^Personen/ }).first(), n: 2, at: 'tl' },
      { loc: page.locator('.f-tree__bar').first(), n: 3, at: 'r' },
      { loc: page.locator('.f-tree__item--feature').first(), n: 4, at: 'tl' },
      { loc: page.locator('.f-tree__appendices'), n: 5, at: 'tl' },
      { loc: page.locator('.f-tree__group'), n: 6, at: 'tl' },
    ])
    await shot(page.locator('.f-tree'), 'anforderungen-03-struktur')
    await clearMarks(page)
    await page.getByRole('button', { name: 'Umsetzung offen' }).click()
    await page.getByPlaceholder('Anforderungen durchsuchen').fill('sortieren')
    await page.waitForTimeout(300)
    await shot(page, 'anforderungen-04-filter')
  })

  test('Unterlage', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/anforderungen', 'Personenliste')
    await page.locator('.f-tree__item', { hasText: /^Personen/ }).first().click()
    await page.locator('.f-tree__appendix', { hasText: 'Datenstruktur' }).click()
    await expect(page.getByRole('dialog')).toContainText('Eine Person hat einen Namen')
    await shot(page.getByRole('dialog'), 'anforderungen-05-unterlage')
  })

  test('Detail', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/anforderungen/E1-F1-S3', 'Nutzen')
    await marks(page, [
      { loc: page.getByRole('link', { name: 'Zurück' }), n: 1, at: 'tl' },
      { loc: page.locator('.f-topbar__actions .dt-badge'), n: 2, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Mit Assistent überarbeiten' }), n: 3, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Bearbeiten', exact: true }), n: 4, at: 'tl' },
      { loc: page.locator('.f-topbar__actions').getByRole('button', { name: 'Umsetzung starten' }), n: 5, at: 'tl' },
      { loc: page.locator('.f-userstory'), n: 6, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Qualität prüfen' }), n: 7, at: 'tl' },
      { loc: page.locator('.f-criteria').first(), n: 8, at: 'tl' },
      { loc: page.locator('.f-facts'), n: 9, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Anforderung entfernen' }), n: 10, at: 'tl' },
      { loc: page.locator('.f-timeline').first(), n: 11, at: 'tl' },
    ])
    await shot(page, 'anforderungen-06-detail')
    await clearMarks(page)
    await open(page, '/anforderungen/E1-F1-S1', 'Nutzen')
    await shot(page, 'anforderungen-07-detail-umgesetzt')
    await open(page, '/anforderungen/E3-F7-S1', 'Nutzen')
    await shot(page, 'anforderungen-08-detail-werkzeug')
  })

  test('Formular anlegen', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/anforderungen', 'Personenliste')
    await page.getByRole('button', { name: 'Anforderung anlegen' }).click()
    await page.getByRole('button', { name: /Selbst formulieren/ }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Anforderung formulieren')
    await page.getByPlaceholder('Kurz und aussagekräftig').fill('Personen nach Ort filtern')
    await page.getByPlaceholder('Als … möchte ich …, damit …').fill('Als Sachbearbeiterin möchte ich Personen nach Wohnort filtern, damit ich regionale Gruppen finde.')
    await page.getByPlaceholder('Eine prüfbare Aussage, zum Beispiel: Das Feld Name ist ein Pflichtfeld.').first().fill('Die Seite bietet die Auswahl „Wohnort“.')
    await marks(page, [
      { loc: dialog.getByRole('button', { name: /Lieber im Gespräch/ }), n: 1, at: 'tl' },
      { loc: dialog.locator('#story-epic'), n: 2, at: 'tl' },
      { loc: dialog.locator('#story-feature'), n: 3, at: 'tl' },
      { loc: dialog.getByPlaceholder('Kurz und aussagekräftig'), n: 4, at: 'tl' },
      { loc: dialog.getByPlaceholder('Als … möchte ich …, damit …'), n: 5, at: 'tl' },
      { loc: dialog.getByPlaceholder('Was soll die Anwendung fachlich tun?'), n: 6, at: 'tl' },
      { loc: dialog.locator('.f-criteria-editor__row').first(), n: 7, at: 'tl' },
      { loc: dialog.getByRole('button', { name: 'Kriterium hinzufügen' }), n: 8, at: 'tl' },
      { loc: dialog.getByRole('button', { name: 'Qualität prüfen' }), n: 9, at: 'tl' },
      { loc: dialog.getByRole('button', { name: 'Anlegen' }), n: 10, at: 'tl' },
    ])
    await shot(dialog, 'anforderungen-09-formular')
    await clearMarks(page)

    await dialog.locator('#story-epic').selectOption({ label: 'Neuer Themenbereich …' })
    await dialog.locator('#story-feature').selectOption({ label: 'Neue Funktion …' })
    await dialog.getByPlaceholder('Name des Themenbereichs').fill('Kontakte')
    await dialog.getByPlaceholder('Name der Funktion').fill('Kontaktliste')
    await shot(dialog, 'anforderungen-10-formular-neu')

    state.createError = 'Bitte beschreiben Sie den Nutzen in einem Satz.'
    await dialog.getByRole('button', { name: 'Anlegen' }).click()
    await expect(dialog.getByRole('alert')).toBeVisible()
    await shot(dialog, 'anforderungen-11-formular-fehler')
  })

  test('Bearbeiten', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/anforderungen/E1-F1-S1', 'Nutzen')
    await page.getByRole('button', { name: 'Bearbeiten', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Anforderung bearbeiten')
    await marks(page, [
      { loc: dialog.locator('.f-note'), n: 1, at: 'tl' },
      { loc: dialog.getByPlaceholder('Kurz und aussagekräftig'), n: 2, at: 'tl' },
      { loc: dialog.getByRole('button', { name: 'Qualität prüfen' }), n: 3, at: 'tl' },
      { loc: dialog.getByRole('button', { name: 'Speichern' }), n: 4, at: 'tl' },
    ])
    await shot(dialog, 'anforderungen-12-bearbeiten')
  })

  test('Entfernen', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/anforderungen/E1-F1-S3', 'Nutzen')
    await page.getByRole('button', { name: 'Anforderung entfernen' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('wird entfernt')
    await shot(dialog, 'anforderungen-13-entfernen')
    state.deleteError = 'Bereits umgesetzte Anforderungen bleiben als Nachweis erhalten und lassen sich nicht löschen.'
    await dialog.getByRole('button', { name: 'Entfernen' }).click()
    await expect(dialog.locator('.dt-field__error')).toBeVisible()
    await shot(dialog, 'anforderungen-14-entfernen-fehler')
  })

  test('Sperre', async ({ page }) => {
    const state = freshState()
    state.locked = true
    await mock(page, state)
    await open(page, '/anforderungen', 'Ein Auftrag läuft gerade')
    await marks(page, [
      { loc: page.locator('.f-note').first(), n: 1, at: 'tl' },
      { loc: page.getByRole('link', { name: 'Fortschritt ansehen' }), n: 2, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Anforderung anlegen' }), n: 3, at: 'tl' },
    ])
    await shot(page, 'anforderungen-15-sperre')
    await clearMarks(page)
    await open(page, '/anforderungen/E1-F1-S3', 'Nutzen')
    await shot(page, 'anforderungen-16-sperre-detail')
  })
})

test.describe('Anforderungs-Assistent (Seite 08)', () => {
  test('Weg wählen und Einstieg', async ({ page }) => {
    const state = freshState()
    state.drafts = {}
    await mock(page, state)
    await open(page, '/anforderungen', 'Personenliste')
    await page.getByRole('button', { name: 'Anforderung anlegen' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Anforderung anlegen')
    await marks(page, [
      { loc: dialog.getByRole('button', { name: /Mit dem KI-Assistenten entwickeln/ }), n: 1, at: 'tl' },
      { loc: dialog.getByRole('button', { name: /Selbst formulieren/ }), n: 2, at: 'tl' },
    ])
    await shot(dialog, 'assistent-01-weg-waehlen')
    await clearMarks(page)
    await dialog.getByRole('button', { name: /Mit dem KI-Assistenten entwickeln/ }).click()
    const intake = page.getByRole('dialog')
    await expect(intake).toContainText('Anforderung entwickeln')
    await intake.locator('#intake-text').fill('Ich möchte, dass man die Personenliste nach dem Wohnort einschränken kann.')
    await shot(intake, 'assistent-02-einstieg')
    await intake.locator('#intake-text').fill('')
    await intake.getByRole('button', { name: 'Gespräch starten' }).click()
    await expect(intake.locator('.dt-field__error')).toBeVisible()
    await shot(intake, 'assistent-03-einstieg-leer')
  })

  test('Entwürfe im Gespräch', async ({ page }) => {
    const state = freshState()
    state.drafts = {
      A1: session(),
      A2: session({ id: 'A2', number: 2, busy: true, draft: { ...session().draft, title: 'Haustiere exportieren' } }),
      A3: session({ id: 'A3', number: 3, draft: { ...session().draft, title: '' }, messages: [{ role: 'user', text: 'Ich brauche eine Auswertung.', at: AT }] }),
    }
    await mock(page, state)
    await open(page, '/anforderungen', 'Entwürfe im Gespräch')
    await marks(page, [
      { loc: page.locator('.f-drafts'), n: 1, at: 'tl' },
      { loc: page.locator('.f-action').nth(0), n: 2, at: 'tl' },
      { loc: page.locator('.f-action').nth(1), n: 3, at: 'tl' },
      { loc: page.locator('.f-action').nth(2), n: 4, at: 'tl' },
    ])
    await shot(page.locator('.f-drafts'), 'assistent-04-entwuerfe')
  })

  test('Gespräch', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/assistent/A1', 'Stand der Anforderung')
    await marks(page, [
      { loc: page.getByRole('link', { name: 'Zurück' }), n: 1, at: 'tl' },
      { loc: page.locator('.f-score'), n: 2, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Anforderung anlegen' }), n: 3, at: 'tl' },
      { loc: page.locator('.f-chat__scroll'), n: 4, at: 'tl' },
      { loc: page.locator('.f-wizard'), n: 5, at: 'tl' },
      { loc: page.getByPlaceholder('Oder antworten Sie frei in eigenen Worten'), n: 6, at: 'tl' },
      { loc: page.locator('.f-ready'), n: 7, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Entwurf selbst bearbeiten' }), n: 8, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Entwurf verwerfen' }), n: 9, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Qualität prüfen' }), n: 10, at: 'tl' },
    ])
    await shot(page, 'assistent-05-gespraech')
    await clearMarks(page)

    state.drafts.A1 = session({ pendingQuestions: [], readiness: { goal: true, criteria: true, testable: true, placement: true }, draft: { ...session().draft, placement: { epicNumber: null, epicName: 'Kontakte', featureNumber: null, featureName: 'Kontaktliste' } } })
    await open(page, '/assistent/A1', 'Stand der Anforderung')
    await shot(page, 'assistent-06-bereit')

    state.drafts.A1 = session({ busy: true, pendingQuestions: [], activity: [{ text: 'Liest den Bestand der Anforderungen' }, { text: 'Formuliert die Abnahmekriterien' }] })
    await open(page, '/assistent/A1', 'arbeitet')
    await shot(page, 'assistent-07-arbeitet')
  })

  test('Entwurf bearbeiten und verwerfen', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/assistent/A1', 'Stand der Anforderung')
    await page.getByRole('button', { name: 'Entwurf selbst bearbeiten' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Entwurf bearbeiten')
    await shot(dialog, 'assistent-08-entwurf-bearbeiten')
    await page.keyboard.press('Escape')
    await page.getByRole('button', { name: 'Entwurf verwerfen' }).click()
    const confirm = page.getByRole('dialog')
    await expect(confirm).toContainText('Der Entwurf und das Gespräch werden entfernt')
    await shot(confirm, 'assistent-09-verwerfen')
  })

  test('Bestehende Anforderung überarbeiten', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await open(page, '/anforderungen/E1-F1-S3', 'Nutzen')
    await page.getByRole('button', { name: 'Mit Assistent überarbeiten' }).click()
    const dialog = page.getByRole('dialog')
    await expect(dialog).toContainText('Mit dem Assistenten überarbeiten')
    await dialog.locator('#intake-text').fill('Die Liste soll zusätzlich nach Status sortierbar sein.')
    await shot(dialog, 'assistent-10-ueberarbeiten-einstieg')
    await page.keyboard.press('Escape')
    state.drafts.A4 = session({
      id: 'A4',
      number: 4,
      storyId: 'E1-F1-S3',
      draft: { ...STORIES[2], placement: { epicNumber: 1, epicName: 'Personen', featureNumber: 1, featureName: 'Personen-Übersicht' } },
      pendingQuestions: [],
      messages: [
        { role: 'user', text: 'Die Liste soll zusätzlich nach Status sortierbar sein.', at: AT },
        { role: 'assistant', text: 'Ich habe ein Kriterium für die Sortierung nach Status ergänzt.', at: AT },
      ],
    })
    await open(page, '/assistent/A4', 'Überarbeitung von')
    await marks(page, [
      { loc: page.locator('.f-topbar__titles .dt-kicker').first(), n: 1, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Änderung speichern' }), n: 2, at: 'tl' },
    ])
    await shot(page, 'assistent-11-ueberarbeitung')
    await clearMarks(page)
    state.drafts.A4 = { ...state.drafts.A4, status: 'saved' }
    await open(page, '/assistent/A4', 'Dieser Entwurf wurde gespeichert.')
    await shot(page, 'assistent-12-gespeichert')
  })
})

test.describe('Qualitätsprüfung (Seite 09)', () => {
  test('Detailseite', async ({ page }) => {
    const state = freshState()
    state.quality = QUALITY_BAD
    await mock(page, state)
    await open(page, '/anforderungen/E1-F1-S3', 'Nutzen')
    await shotCard(page, criteriaCard(page), 'qualitaet-01-kriterien')
    await page.getByRole('button', { name: 'Qualität prüfen' }).click()
    await expect(page.locator('.f-finding').first()).toBeVisible()
    await page.waitForTimeout(300)
    await shotCard(page, criteriaCard(page), 'qualitaet-02-ergebnis', [
      { loc: page.locator('.f-quality .f-note'), n: 1, at: 'tl' },
      { loc: page.locator('.f-finding .dt-badge').first(), n: 2, at: 'tl' },
      { loc: page.locator('.f-finding__criterion').first(), n: 3, at: 'tl' },
      { loc: page.locator('.f-finding .dt-stat__sub').first(), n: 4, at: 'tl' },
      { loc: page.locator('.f-finding__label').first(), n: 5, at: 'tl' },
      { loc: page.getByRole('button', { name: 'Vorschlag übernehmen' }).first(), n: 6, at: 'tl' },
    ])

    await page.getByRole('button', { name: 'Vorschlag übernehmen' }).first().click()
    await expect(page.locator('.f-finding')).toHaveCount(1)
    await shotCard(page, criteriaCard(page), 'qualitaet-03-uebernommen')
  })

  test('Ergebnis gut', async ({ page }) => {
    const state = freshState()
    state.quality = QUALITY_GOOD
    await mock(page, state)
    await open(page, '/anforderungen/E1-F1-S3', 'Nutzen')
    await page.getByRole('button', { name: 'Qualität prüfen' }).click()
    await expect(page.locator('.f-quality .f-note')).toBeVisible()
    await shotCard(page, criteriaCard(page), 'qualitaet-04-gut')
  })

  test('Prüfung läuft und Fehler', async ({ page }) => {
    const state = freshState()
    await mock(page, state)
    await page.route('**/api/requirements/check', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: 'Die KI hat keine Antwort geliefert. Bitte versuchen Sie es erneut.' }) })
    })
    await open(page, '/anforderungen/E1-F1-S3', 'Nutzen')
    await page.getByRole('button', { name: 'Qualität prüfen' }).click()
    await expect(page.getByRole('button', { name: 'Prüfung läuft …' })).toBeDisabled()
    await shotCard(page, criteriaCard(page), 'qualitaet-05-laeuft')
    await expect(page.getByRole('alert')).toBeVisible()
    await page.waitForTimeout(200)
    await shot(page, 'qualitaet-06-fehler')
  })

  test('Im Formular und im Entwurf', async ({ page }) => {
    const state = freshState()
    state.quality = QUALITY_BAD
    await mock(page, state)
    await open(page, '/anforderungen/E1-F1-S3', 'Nutzen')
    await page.getByRole('button', { name: 'Bearbeiten', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByRole('button', { name: 'Qualität prüfen' }).click()
    await expect(dialog.locator('.f-finding').first()).toBeVisible()
    await dialog.locator('.f-quality').scrollIntoViewIfNeeded()
    await shot(dialog, 'qualitaet-07-formular')
    await page.keyboard.press('Escape')

    await open(page, '/assistent/A1', 'Stand der Anforderung')
    await page.getByRole('button', { name: 'Qualität prüfen' }).click()
    await expect(page.locator('.f-finding').first()).toBeVisible()
    await shot(page, 'qualitaet-08-entwurf')
  })
})
