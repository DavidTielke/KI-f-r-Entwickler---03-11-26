import fs from 'node:fs'
import path from 'node:path'
import { IDEAS_DIR, ROOT } from './config.js'
import { notFound } from './errors.js'
import { safeName } from './specs.js'
import { readText, removeFile, renameFile, writeText } from './storage.js'

// ---------------------------------------------------------------------------
// Format einer Idee (harness/_ideas.md)
// ---------------------------------------------------------------------------

export const EMPTY_DOC = {
  title: '',
  state: 'Draft',
  problem: '',
  solution: '',
  inScope: '',
  outOfScope: '',
  impactSpecs: '',
  impactData: '',
  impactBackend: '',
  impactCode: '',
  decisions: [],
  openPoints: [],
  transfer: [],
}

const IMPACT_LABELS = {
  Specs: 'impactSpecs',
  Datenstruktur: 'impactData',
  Backend: 'impactBackend',
  Quellcode: 'impactCode',
}

function bulletLines(lines) {
  const items = []
  for (const line of lines) {
    if (line.startsWith('- ')) items.push(line.slice(2).trim())
    else if (line.trim() && items.length) items[items.length - 1] += `\n${line}`
  }
  return items
}

// Liest „- **Label:** Text“ inklusive eingerückter Folgezeilen.
function labelledBullets(lines) {
  const result = {}
  let current = null
  for (const line of lines) {
    const match = line.match(/^- \*\*([^*:]+):\*\*\s*(.*)$/)
    if (match) {
      current = match[1].trim()
      result[current] = match[2]
    } else if (current && line.trim()) {
      result[current] += `\n${line}`
    }
  }
  return result
}

export function parseIdea(markdown) {
  const doc = structuredClone(EMPTY_DOC)
  const sections = {}
  let section = null
  for (const line of markdown.replace(/\r\n/g, '\n').split('\n')) {
    if (!doc.title && line.startsWith('# ')) {
      doc.title = line.slice(2).trim()
    } else if (line.startsWith('## ')) {
      section = line.slice(3).trim()
      sections[section] = []
    } else if (section) {
      sections[section].push(line)
    }
  }
  const block = (name) => (sections[name] ?? []).join('\n').trim()

  const state = block('Meta').match(/\*\*State:\*\*\s*(\S+)/)
  if (state) doc.state = state[1]
  doc.problem = block('Problem')
  doc.solution = block('Lösungsidee')

  const scope = labelledBullets(sections.Scope ?? [])
  doc.inScope = scope['In Scope'] ?? ''
  doc.outOfScope = scope['Out of Scope'] ?? ''

  const impact = labelledBullets(sections['Auswirkungen auf den Bestand'] ?? [])
  for (const [label, key] of Object.entries(IMPACT_LABELS)) doc[key] = impact[label] ?? ''

  doc.decisions = bulletLines(sections.Entscheidungen ?? [])
  doc.openPoints = bulletLines(sections['Offene Punkte'] ?? []).filter((item) => item !== '(leer)')
  doc.transfer = bulletLines(sections['Übergang zu Specs'] ?? [])
  return doc
}

// Ein Wert darf direkt nach dem Label oder als eingerückte Unterliste beginnen.
function labelled(label, value) {
  const text = (value ?? '').trimEnd()
  if (!text.trim()) return `- **${label}:** …`
  return text.startsWith('\n') ? `- **${label}:**${text}` : `- **${label}:** ${text.trimStart()}`
}

export function renderIdea(doc) {
  const bullets = (items, empty) => (items.length ? items.map((i) => `- ${i}`).join('\n') : `- ${empty}`)
  const parts = [
    `# ${doc.title.trim()}`,
    `## Meta\n- **State:** ${doc.state}`,
    `## Problem\n${doc.problem.trim() || '…'}`,
    `## Lösungsidee\n${doc.solution.trim() || '…'}`,
    `## Scope\n${labelled('In Scope', doc.inScope)}\n${labelled('Out of Scope', doc.outOfScope)}`,
    `## Auswirkungen auf den Bestand\n${labelled('Specs', doc.impactSpecs)}\n${labelled('Datenstruktur', doc.impactData)}\n${labelled('Backend', doc.impactBackend)}\n${labelled('Quellcode', doc.impactCode)}`,
    `## Entscheidungen\n${bullets(doc.decisions, '…')}`,
    `## Offene Punkte\n${bullets(doc.openPoints, '(leer)')}`,
  ]
  if (doc.transfer.length) parts.push(`## Übergang zu Specs\n${bullets(doc.transfer, '…')}`)
  return `${parts.join('\n\n')}\n`
}

// ---------------------------------------------------------------------------
// Dateien
// ---------------------------------------------------------------------------

function ideaFiles() {
  if (!fs.existsSync(IDEAS_DIR)) return []
  return fs
    .readdirSync(IDEAS_DIR)
    .map((name) => {
      const match = name.match(/^I(\d+)\s+(.+)\.md$/)
      return match ? { id: `I${match[1]}`, number: Number(match[1]), name } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.number - b.number)
}

const fileOf = (entry) => path.join(IDEAS_DIR, entry.name)
const relative = (full) => path.relative(ROOT, full).split(path.sep).join('/')

export function readIdeaDocs() {
  return ideaFiles().map((entry) => ({
    id: entry.id,
    number: entry.number,
    path: relative(fileOf(entry)),
    doc: parseIdea(readText(fileOf(entry))),
  }))
}

export function readIdeaDoc(id) {
  const entry = ideaFiles().find((candidate) => candidate.id === id)
  if (!entry) throw notFound('Diese Idee existiert nicht mehr.')
  return { id, number: entry.number, path: relative(fileOf(entry)), doc: parseIdea(readText(fileOf(entry))) }
}

export function nextIdeaNumber(extra = []) {
  return Math.max(0, ...ideaFiles().map((entry) => entry.number), ...extra) + 1
}

export function writeIdeaDoc(id, doc) {
  const number = Number(id.slice(1))
  const target = path.join(IDEAS_DIR, `${id} ${safeName(doc.title) || 'Neue Idee'}.md`)
  const current = ideaFiles().find((candidate) => candidate.number === number)
  // Nummern bleiben stabil, der Dateiname folgt dem Titel.
  if (current && fileOf(current) !== target) renameFile(fileOf(current), target)
  writeText(target, renderIdea(doc))
  return relative(target)
}

export function removeIdeaDoc(id) {
  const entry = ideaFiles().find((candidate) => candidate.id === id)
  if (entry) removeFile(fileOf(entry))
}

// ---------------------------------------------------------------------------
// Rückverfolgung: Aus welcher Idee stammt eine Anforderung?
// ---------------------------------------------------------------------------

// Liest die Spec-Pfade aus dem Abschnitt „Übergang zu Specs“. Unterstützt
// vollständige Pfade sowie die Kurzform `F3 Person anlegen/S5` hinter einem
// zuvor genannten `specs/E1 Personen`.
export function transferTargets(doc) {
  const targets = []
  for (const line of doc.transfer) {
    let base = null
    const full = []
    const short = []
    for (const match of line.matchAll(/`([^`]+)`/g)) {
      const token = match[1]
      if (token.startsWith('specs/')) {
        base = token.split('/').slice(0, 2).join('/')
        if (!/\/_[^/]+$/.test(token)) full.push(token.replace(/\.md$/, ''))
      } else if (base && /^F\d+ /.test(token)) {
        short.push(`${base}/${token}`.replace(/\.md$/, ''))
      }
    }
    // Nennt eine Zeile konkrete Anforderungen, ist nur dieser Teil gemeint und
    // nicht der gesamte zuvor genannte Themenbereich.
    targets.push(...(short.length ? short : full))
  }
  return targets
}

export function originOfStory(storyPath, ideas = readIdeaDocs()) {
  const stem = storyPath.replace(/\.md$/, '')
  // Der längste Treffer gewinnt, damit `.../S5` nicht auf `.../S50` und ein
  // ganzer Themenbereich nicht vor einer konkreten Anforderung greift.
  let best = null
  for (const idea of ideas) {
    for (const target of transferTargets(idea.doc)) {
      const matches = stem === target || stem.startsWith(`${target}/`) || stem.startsWith(`${target} `)
      if (matches && (!best || target.length > best.length)) best = { id: idea.id, title: idea.doc.title, length: target.length }
    }
  }
  return best ? { id: best.id, title: best.title } : null
}
