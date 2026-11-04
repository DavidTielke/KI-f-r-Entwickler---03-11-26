import fs from 'node:fs'
import path from 'node:path'
import { ROOT, SPECS_DIR, TOOL_EPICS } from './config.js'
import { badRequest, notFound } from './errors.js'
import { readText, removeFile, renameFile, writeText } from './storage.js'

// ---------------------------------------------------------------------------
// Format einer Story (harness/_requirements.md)
// ---------------------------------------------------------------------------

export function parseStory(markdown) {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const story = { title: '', state: 'Modified', userStory: '', description: '', criteria: [] }
  let section = null
  let group = null
  const text = { 'User Story': [], Description: [] }

  for (const line of lines) {
    if (!story.title && line.startsWith('# ')) {
      story.title = line.slice(2).trim()
    } else if (line.startsWith('## ')) {
      section = line.slice(3).trim()
      group = null
    } else if (section === 'Meta') {
      const match = line.match(/\*\*State:\*\*\s*(\w+)/)
      if (match) story.state = match[1]
    } else if (section === 'Akzeptanzkriterien') {
      if (line.startsWith('### ')) {
        group = { heading: line.slice(4).trim(), items: [] }
        story.criteria.push(group)
      } else if (line.startsWith('- ')) {
        if (!group) {
          group = { heading: null, items: [] }
          story.criteria.push(group)
        }
        group.items.push(line.slice(2).trim())
      } else if (line.trim() && group?.items.length) {
        group.items[group.items.length - 1] += `\n${line}`
      }
    } else if (section in text) {
      text[section].push(line)
    }
  }
  story.userStory = text['User Story'].join('\n').trim()
  story.description = text.Description.join('\n').trim()
  return story
}

export function renderStory(story) {
  const parts = [
    `# ${story.title.trim()}`,
    `## Meta\n- **State:** ${story.state}`,
    `## User Story\n${story.userStory.trim()}`,
    `## Description\n${story.description.trim()}`,
  ]
  const criteria = (story.criteria ?? [])
    .map((group) => {
      const items = group.items.map((item) => `- ${item}`).join('\n')
      return group.heading ? `### ${group.heading}\n${items}` : items
    })
    .join('\n\n')
  parts.push(`## Akzeptanzkriterien\n${criteria}`)
  return `${parts.join('\n\n')}\n`
}

export function criteriaCount(story) {
  return (story.criteria ?? []).reduce((sum, group) => sum + group.items.length, 0)
}

export function safeName(name) {
  return name
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, '-')
    .replace(/\s+/g, ' ')
    .replace(/[. ]+$/g, '')
    .trim()
    .slice(0, 90)
}

// ---------------------------------------------------------------------------
// Bestand einlesen
// ---------------------------------------------------------------------------

const numbered = (prefix, entries) =>
  entries
    .map((entry) => {
      const match = entry.name.match(new RegExp(`^${prefix}(\\d+)\\s+(.+?)(\\.md)?$`))
      return match ? { number: Number(match[1]), name: match[2], dirName: entry.name } : null
    })
    .filter(Boolean)
    .sort((a, b) => a.number - b.number)

const relative = (full) => path.relative(ROOT, full).split(path.sep).join('/')

export function readTree() {
  if (!fs.existsSync(SPECS_DIR)) return []
  const epics = numbered(
    'E',
    fs.readdirSync(SPECS_DIR, { withFileTypes: true }).filter((e) => e.isDirectory()),
  )
  return epics.map((epic) => {
    const epicDir = path.join(SPECS_DIR, epic.dirName)
    const entries = fs.readdirSync(epicDir, { withFileTypes: true })
    const features = numbered('F', entries.filter((e) => e.isDirectory())).map((feature) => {
      const featureDir = path.join(epicDir, feature.dirName)
      const files = fs.readdirSync(featureDir, { withFileTypes: true }).filter((e) => e.isFile())
      const stories = numbered('S', files.filter((f) => f.name.endsWith('.md'))).map((file) => {
        const full = path.join(featureDir, file.dirName)
        const parsed = parseStory(readText(full))
        return {
          ...parsed,
          id: `E${epic.number}-F${feature.number}-S${file.number}`,
          number: file.number,
          path: relative(full),
          criteriaCount: criteriaCount(parsed),
          epicNumber: epic.number,
          epicName: epic.name,
          featureNumber: feature.number,
          featureName: feature.name,
          isTool: TOOL_EPICS.has(epic.name),
        }
      })
      return { number: feature.number, name: feature.name, dirName: feature.dirName, stories }
    })
    const appendices = entries
      .filter((e) => e.isFile() && e.name.startsWith('_') && e.name.endsWith('.md'))
      .map((e) => e.name.replace(/^_|\.md$/g, ''))
    return {
      number: epic.number,
      name: epic.name,
      dirName: epic.dirName,
      isTool: TOOL_EPICS.has(epic.name),
      features,
      appendices,
    }
  })
}

export function allStories(tree = readTree()) {
  return tree.flatMap((epic) => epic.features.flatMap((feature) => feature.stories))
}

export function getStory(id) {
  const story = allStories().find((candidate) => candidate.id === id)
  if (!story) throw notFound('Diese Anforderung existiert nicht mehr.')
  return story
}

export function readAppendix(epicNumber, name) {
  const epic = readTree().find((candidate) => candidate.number === Number(epicNumber))
  if (!epic || !epic.appendices.includes(name)) throw notFound('Diese Unterlage existiert nicht.')
  return readText(path.join(SPECS_DIR, epic.dirName, `_${name}.md`)).replace(/\r\n/g, '\n')
}

// Kompakte Übersicht für die Prompts der KI.
export function inventoryText() {
  return readTree()
    .map((epic) => {
      const features = epic.features.map((feature) => {
        const stories = feature.stories.map((s) => `S${s.number} ${s.title} [${s.state}]`).join('; ')
        return `  F${feature.number} ${feature.name}: ${stories}`
      })
      return [`E${epic.number} ${epic.name}`, ...features].join('\n')
    })
    .join('\n')
}

// ---------------------------------------------------------------------------
// Schreiben
// ---------------------------------------------------------------------------

export function validateStory(input) {
  const title = (input.title ?? '').trim()
  if (!title) throw badRequest('Bitte geben Sie der Anforderung einen Titel.')
  if (title.length > 120) throw badRequest('Der Titel darf höchstens 120 Zeichen lang sein.')
  const userStory = (input.userStory ?? '').trim()
  if (!userStory) throw badRequest('Bitte beschreiben Sie den Nutzen in einem Satz.')
  const criteria = (input.criteria ?? [])
    .map((group) => ({
      heading: group.heading?.trim() || null,
      items: (group.items ?? []).map((item) => item.trim()).filter(Boolean),
    }))
    .filter((group) => group.items.length > 0)
  if (criteria.length === 0) throw badRequest('Bitte erfassen Sie mindestens ein Abnahmekriterium.')
  return { title, userStory, description: (input.description ?? '').trim(), criteria }
}

// Legt Themenbereich und Funktion an, falls sie noch nicht existieren.
function resolvePlacement(placement = {}) {
  const tree = readTree()
  let epic = tree.find((candidate) => candidate.number === Number(placement.epicNumber))
  if (!epic) {
    const name = safeName(placement.epicName ?? '')
    if (!name) throw badRequest('Bitte wählen Sie einen Themenbereich.')
    const existing = tree.find((candidate) => candidate.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      epic = existing
    } else {
      const number = Math.max(0, ...tree.map((candidate) => candidate.number)) + 1
      epic = { number, name, dirName: `E${number} ${name}`, features: [], isTool: TOOL_EPICS.has(name) }
    }
  }
  if (epic.isTool) throw badRequest('Der Themenbereich „Software Factory“ wird nicht über die Factory geändert.')

  let feature = epic.features.find((candidate) => candidate.number === Number(placement.featureNumber))
  if (!feature) {
    const name = safeName(placement.featureName ?? '')
    if (!name) throw badRequest('Bitte wählen Sie eine Funktion.')
    const existing = epic.features.find((candidate) => candidate.name.toLowerCase() === name.toLowerCase())
    if (existing) {
      feature = existing
    } else {
      const number = Math.max(0, ...epic.features.map((candidate) => candidate.number)) + 1
      feature = { number, name, dirName: `F${number} ${name}`, stories: [] }
    }
  }
  return { epic, feature }
}

export function createStory(input, placement) {
  const data = validateStory(input)
  const { epic, feature } = resolvePlacement(placement)
  // Nummern bleiben stabil: neue Anforderungen werden immer hinten angehängt.
  const number = Math.max(0, ...feature.stories.map((story) => story.number)) + 1
  const file = path.join(SPECS_DIR, epic.dirName, feature.dirName, `S${number} ${safeName(data.title)}.md`)
  writeText(file, renderStory({ ...data, state: 'Modified' }))
  return { id: `E${epic.number}-F${feature.number}-S${number}`, path: relative(file) }
}

function sameContent(a, b) {
  const fingerprint = (story) =>
    JSON.stringify({
      title: story.title,
      userStory: story.userStory,
      description: story.description,
      criteria: story.criteria,
    })
  return fingerprint(a) === fingerprint(b)
}

export function updateStory(id, input) {
  const story = getStory(id)
  if (story.isTool) throw badRequest('Der Themenbereich „Software Factory“ wird nicht über die Factory geändert.')
  const data = validateStory(input)
  // Pflege-Regel: Jede inhaltliche Änderung setzt den Status auf „Modified“ zurück.
  if (sameContent(story, data)) return { id, path: story.path, changed: false }
  const oldFull = path.join(ROOT, story.path)
  const newFull = path.join(path.dirname(oldFull), `S${story.number} ${safeName(data.title)}.md`)
  if (oldFull !== newFull) renameFile(oldFull, newFull)
  writeText(newFull, renderStory({ ...data, state: 'Modified' }))
  return { id, path: relative(newFull), oldPath: story.path, changed: true }
}

export function deleteStory(id) {
  const story = getStory(id)
  const full = path.join(ROOT, story.path)
  removeFile(full)
  // Leere Ordner nimmt Git ohnehin nicht auf.
  const dir = path.dirname(full)
  if (fs.readdirSync(dir).length === 0) fs.rmdirSync(dir)
  return story
}

// Setzt ausschließlich den Status; der Inhalt der Datei bleibt unverändert.
export function setStoryState(id, state) {
  const story = getStory(id)
  const full = path.join(ROOT, story.path)
  const text = readText(full).replace(/(\*\*State:\*\*\s*)\w+/, `$1${state}`)
  writeText(full, text)
}

export function isStoryPath(relPath) {
  return /^specs\/E\d+ [^/]+\/F\d+ [^/]+\/S\d+ [^/]+\.md$/.test(relPath)
}

export function storyProblems(relPath) {
  const full = path.join(ROOT, relPath)
  if (!fs.existsSync(full)) return []
  const story = parseStory(readText(full))
  const problems = []
  if (!story.title) problems.push('Titel fehlt')
  if (!['Modified', 'Implemented'].includes(story.state)) problems.push('Status ungültig')
  if (!story.userStory) problems.push('Nutzen fehlt')
  if (criteriaCount(story) === 0) problems.push('Abnahmekriterien fehlen')
  return problems
}
