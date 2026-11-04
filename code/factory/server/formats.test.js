import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { test } from 'node:test'
import { IDEAS_DIR } from './config.js'
import { originOfStory, parseIdea, renderIdea, transferTargets } from './ideas.js'
import { allStories, parseStory, readTree, renderStory, safeName } from './specs.js'

const normalize = (text) => text.replace(/\r\n/g, '\n').trimEnd()

test('alle vorhandenen Anforderungen lassen sich verlustfrei lesen und schreiben', () => {
  const stories = allStories(readTree())
  assert.ok(stories.length >= 44)
  for (const story of stories) {
    const original = fs.readFileSync(path.resolve(import.meta.dirname, '../../..', story.path), 'utf8')
    assert.equal(normalize(renderStory(parseStory(original))), normalize(original), story.path)
    assert.ok(story.criteriaCount > 0, story.path)
    assert.ok(['Modified', 'Implemented'].includes(story.state), story.path)
  }
})

test('Anforderung: Gruppen, Mehrzeiler und Status werden erkannt', () => {
  const story = parseStory(`# Titel

## Meta
- **State:** Implemented

## User Story
Als Rolle möchte ich etwas.

## Description
Beschreibung.

## Akzeptanzkriterien
### Stammdaten
- Eins
- Zwei
  mit Fortsetzung

### Weiteres
- Drei
`)
  assert.equal(story.state, 'Implemented')
  assert.deepEqual(story.criteria, [
    { heading: 'Stammdaten', items: ['Eins', 'Zwei\n  mit Fortsetzung'] },
    { heading: 'Weiteres', items: ['Drei'] },
  ])
})

test('die vorhandene Idee lässt sich verlustfrei lesen und schreiben', () => {
  const file = fs.readdirSync(IDEAS_DIR).find((name) => name.startsWith('I1 '))
  const original = fs.readFileSync(path.join(IDEAS_DIR, file), 'utf8')
  const doc = parseIdea(original)
  assert.equal(doc.title, 'Haustiere')
  assert.equal(doc.state, 'Übernommen')
  assert.equal(doc.openPoints.length, 0)
  assert.equal(doc.decisions.length, 8)
  assert.equal(normalize(renderIdea(doc)), normalize(original))
})

test('Rückverfolgung: Kurzformen zeigen auf konkrete Anforderungen statt auf den ganzen Themenbereich', () => {
  const doc = parseIdea(`# Haustiere

## Meta
- **State:** Übernommen

## Übergang zu Specs
- 2026-11-04: Überführt in \`specs/E2 Haustiere\` (F1 Übersicht; \`_Datenstruktur.md\`).
- 2026-11-04: \`specs/E1 Personen\` erweitert: \`F3 Person anlegen/S5\`, \`_Menüstruktur.md\`.
`)
  assert.deepEqual(transferTargets(doc), ['specs/E2 Haustiere', 'specs/E1 Personen/F3 Person anlegen/S5'])
  const ideas = [{ id: 'I1', doc }]
  assert.equal(originOfStory('specs/E2 Haustiere/F1 Übersicht/S1 Liste.md', ideas)?.id, 'I1')
  assert.equal(originOfStory('specs/E1 Personen/F3 Person anlegen/S5 Tier.md', ideas)?.id, 'I1')
  assert.equal(originOfStory('specs/E1 Personen/F3 Person anlegen/S50 Anderes.md', ideas), null)
  assert.equal(originOfStory('specs/E1 Personen/F1 Shell/S1 Anderes.md', ideas), null)
})

test('Dateinamen enthalten keine unter Windows verbotenen Zeichen', () => {
  assert.equal(safeName('Export: CSV/Excel?  '), 'Export- CSV-Excel-')
  assert.equal(safeName('Abschluss...'), 'Abschluss')
})
