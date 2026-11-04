import { AgentError, runAgent } from './agent.js'
import { notify } from './bus.js'
import { conflict, notFound } from './errors.js'
import * as git from './git.js'
import { EMPTY_DOC, nextIdeaNumber, readIdeaDoc, readIdeaDocs, removeIdeaDoc, writeIdeaDoc } from './ideas.js'
import {
  CHECK_SCHEMA,
  CHECK_SYSTEM,
  IDEA_SCHEMA,
  IDEA_SYSTEM,
  STUDIO_SCHEMA,
  STUDIO_SYSTEM,
  checkPrompt,
  ideaPrompt,
  studioPrompt,
} from './prompts.js'
import { createStory, getStory, inventoryText, updateStory } from './specs.js'
import { dataPath, getSettings, listJson, logEvent, readJson, removeFile, writeJson } from './storage.js'

// ---------------------------------------------------------------------------
// Sitzungen: Gesprächsverlauf einer Idee (I…) oder eines Entwurfs des
// Anforderungs-Assistenten (A…). Mehrere Sitzungen laufen parallel, weil die KI
// hier nur lesen darf.
// ---------------------------------------------------------------------------
const MAX_PARALLEL_TURNS = 4
const running = new Map()
const waiting = []
let activeTurns = 0

const sessionFile = (id) => dataPath('sessions', `${id}.json`)

function newSession(id, kind, extra = {}) {
  return {
    id,
    kind,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    messages: [],
    pendingQuestions: [],
    readiness: {},
    busy: false,
    activity: [],
    error: null,
    costUsd: 0,
    ...extra,
  }
}

function loadSession(id) {
  // Die Kennung stammt aus der Adresse und wird Teil eines Dateipfads.
  if (!/^[IA]\d+$/.test(id)) return null
  return readJson(sessionFile(id))
}

function saveSession(session) {
  session.updatedAt = new Date().toISOString()
  writeJson(sessionFile(session.id), session)
  notify(session.kind === 'idea' ? 'ideas' : 'studio', session.id)
}

// Ein Neustart des Dienstes beendet laufende KI-Runden.
export function recoverSessions() {
  for (const session of listJson('sessions')) {
    if (session.busy) {
      session.busy = false
      session.error = 'Die Antwort wurde durch einen Neustart unterbrochen. Bitte versuchen Sie es erneut.'
      writeJson(sessionFile(session.id), session)
    }
  }
}

function acquireSlot() {
  if (activeTurns < MAX_PARALLEL_TURNS) {
    activeTurns++
    return Promise.resolve()
  }
  return new Promise((resolve) => waiting.push(resolve))
}

function releaseSlot() {
  const next = waiting.shift()
  if (next) next()
  else activeTurns--
}

// Führt eine Gesprächsrunde im Hintergrund aus. Der Aufrufer kehrt sofort zurück,
// die Oberfläche verfolgt den Fortschritt live.
async function runTurn(id, { system, buildPrompt, schema, apply }) {
  const session = loadSession(id)
  session.busy = true
  session.error = null
  session.activity = []
  saveSession(session)

  await acquireSlot()
  try {
    const current = loadSession(id)
    if (!current) return
    const handle = runAgent({
      profile: 'read',
      model: getSettings().dialogModel,
      effort: 'medium',
      system,
      schema,
      prompt: buildPrompt(current),
      onEvent(event) {
        if (event.kind !== 'step') return
        const live = loadSession(id)
        if (!live) return
        live.activity = [...live.activity, { ...event, at: new Date().toISOString() }].slice(-30)
        saveSession(live)
      },
    })
    running.set(id, handle)
    const result = await handle.promise
    if (!result.structured) throw new AgentError('Die KI hat keine auswertbare Antwort geliefert.')

    const live = loadSession(id)
    if (!live) return
    apply(live, result.structured)
    live.messages.push({
      role: 'assistant',
      text: result.structured.message,
      questions: result.structured.questions ?? [],
      at: new Date().toISOString(),
    })
    live.pendingQuestions = result.structured.questions ?? []
    live.costUsd += result.costUsd
    live.busy = false
    live.activity = []
    saveSession(live)
  } catch (err) {
    const live = loadSession(id)
    if (live) {
      live.busy = false
      live.error = err.message
      saveSession(live)
    }
  } finally {
    running.delete(id)
    releaseSlot()
  }
}

function addUserMessage(session, text, answers) {
  session.messages.push({ role: 'user', text, answers: answers ?? null, at: new Date().toISOString() })
  session.pendingQuestions = []
}

function assertIdle(session) {
  if (session.busy) throw conflict('Die KI arbeitet noch an der letzten Antwort.')
}

// ---------------------------------------------------------------------------
// Ideen
// ---------------------------------------------------------------------------
export const IDEA_READINESS = [
  { key: 'problem', label: 'Problem und Nutzen sind klar formuliert' },
  { key: 'audience', label: 'Die Zielgruppe ist benannt' },
  { key: 'scope', label: 'Der Umfang ist abgegrenzt' },
  { key: 'behavior', label: 'Das gewünschte Verhalten ist konkret beschrieben' },
  { key: 'feasibility', label: 'Die Machbarkeit ist gegen den Bestand geprüft' },
  { key: 'noOpenPoints', label: 'Es gibt keine offenen Punkte mehr' },
  { key: 'approved', label: 'Sie haben die finale Fassung bestätigt' },
]

function ideaReadiness(doc, session) {
  const ai = session?.readiness ?? {}
  const finished = doc.state !== 'Draft'
  return {
    problem: finished || Boolean(ai.problem),
    audience: finished || Boolean(ai.audience),
    scope: finished || Boolean(ai.scope),
    behavior: finished || Boolean(ai.behavior),
    feasibility: finished || Boolean(ai.feasibility),
    noOpenPoints: finished || (doc.openPoints.length === 0 && Boolean(ai.problem)),
    approved: finished,
  }
}

function ideaSummary({ id, number, path, doc }) {
  const session = loadSession(id)
  const readiness = ideaReadiness(doc, session)
  const last = session?.messages?.at(-1)
  return {
    id,
    number,
    path,
    title: doc.title,
    state: doc.state,
    problem: doc.problem,
    readiness,
    readyCount: Object.values(readiness).filter(Boolean).length,
    readyTotal: IDEA_READINESS.length,
    busy: Boolean(session?.busy),
    error: session?.error ?? null,
    waitingForUser: doc.state === 'Draft' && Boolean(session) && !session.busy && last?.role === 'assistant',
    phase: session?.phase ?? null,
    updatedAt: session?.updatedAt ?? null,
  }
}

export function listIdeas() {
  return readIdeaDocs().map(ideaSummary)
}

export function getIdea(id) {
  const entry = readIdeaDoc(id)
  const session = loadSession(id)
  return {
    ...ideaSummary(entry),
    doc: entry.doc,
    messages: session?.messages ?? [],
    pendingQuestions: session?.pendingQuestions ?? [],
    activity: session?.activity ?? [],
    costUsd: session?.costUsd ?? 0,
    readinessLabels: IDEA_READINESS,
  }
}

const ideaTurn = (id) =>
  runTurn(id, {
    system: IDEA_SYSTEM,
    schema: IDEA_SCHEMA,
    buildPrompt(session) {
      const { doc } = readIdeaDoc(id)
      return ideaPrompt({ doc, messages: session.messages, inventory: inventoryText() })
    },
    apply(session, output) {
      const { doc } = readIdeaDoc(id)
      const today = new Date().toISOString().slice(0, 10)
      const incoming = output.document
      writeIdeaDoc(id, {
        ...doc,
        title: incoming.title?.trim() || doc.title,
        problem: incoming.problem,
        solution: incoming.solution,
        inScope: incoming.inScope,
        outOfScope: incoming.outOfScope,
        impactSpecs: incoming.impactSpecs,
        impactData: incoming.impactData,
        impactBackend: incoming.impactBackend,
        impactCode: incoming.impactCode,
        decisions: [...doc.decisions, ...(incoming.newDecisions ?? []).map((d) => `${today}: ${d}`)],
        openPoints: incoming.openPoints ?? [],
      })
      session.phase = output.phase
      session.readiness = output.readiness
    },
  })

export function createIdea(text) {
  const usedNumbers = listJson('sessions')
    .filter((s) => s.kind === 'idea')
    .map((s) => Number(s.id.slice(1)))
  const id = `I${nextIdeaNumber(usedNumbers)}`
  writeIdeaDoc(id, { ...structuredClone(EMPTY_DOC), title: 'Neue Idee', problem: text })
  const session = newSession(id, 'idea', { phase: 'verstehen' })
  addUserMessage(session, text)
  saveSession(session)
  logEvent('idea', `Idee ${id} erfasst`, { idea: id })
  ideaTurn(id)
  return { id }
}

function assertDraft(id) {
  const { doc } = readIdeaDoc(id)
  if (doc.state !== 'Draft') {
    throw conflict('Diese Idee ist freigegeben. Öffnen Sie sie erneut, um weiter daran zu arbeiten.')
  }
  return doc
}

function ensureIdeaSession(id) {
  const existing = loadSession(id)
  if (existing) return existing
  return newSession(id, 'idea', { phase: 'verstehen' })
}

export function sendIdeaMessage(id, text, answers) {
  assertDraft(id)
  const session = ensureIdeaSession(id)
  assertIdle(session)
  addUserMessage(session, text, answers)
  saveSession(session)
  ideaTurn(id)
}

export function retryIdea(id) {
  assertDraft(id)
  const session = loadSession(id)
  if (!session) throw notFound('Zu dieser Idee gibt es noch kein Gespräch.')
  assertIdle(session)
  ideaTurn(id)
}

export function updateIdeaDocument(id, patch) {
  const doc = assertDraft(id)
  const session = loadSession(id)
  if (session) assertIdle(session)
  const allowed = ['title', 'problem', 'solution', 'inScope', 'outOfScope', 'openPoints']
  const next = { ...doc }
  for (const key of allowed) if (key in patch) next[key] = patch[key]
  if (!next.title?.trim()) next.title = doc.title
  writeIdeaDoc(id, next)
  notify('ideas', id)
}

export async function approveIdea(id) {
  const doc = assertDraft(id)
  const session = loadSession(id)
  if (session) assertIdle(session)
  const readiness = ideaReadiness(doc, session)
  const missing = IDEA_READINESS.filter((item) => item.key !== 'approved' && !readiness[item.key])
  if (missing.length) {
    throw conflict(`Die Idee ist noch nicht bereit: ${missing.map((m) => m.label).join('; ')}.`)
  }
  const today = new Date().toISOString().slice(0, 10)
  const before = readIdeaDoc(id).path
  const after = writeIdeaDoc(id, {
    ...doc,
    state: 'Ready',
    decisions: [...doc.decisions, `${today}: Der Stakeholder hat die finale Fassung bestätigt.`],
  })
  await git.commitPaths([...new Set([before, after])], `idee: ${id} ${doc.title} freigegeben`)
  logEvent('idea', `Idee ${id} »${doc.title}« freigegeben`, { idea: id })
  notify('ideas', id)
}

export function reopenIdea(id) {
  const { doc } = readIdeaDoc(id)
  if (doc.state !== 'Ready') throw conflict('Nur freigegebene Ideen lassen sich erneut öffnen.')
  writeIdeaDoc(id, { ...doc, state: 'Draft' })
  logEvent('idea', `Idee ${id} »${doc.title}« erneut geöffnet`, { idea: id })
  notify('ideas', id)
}

export async function deleteIdea(id) {
  const { doc, path } = readIdeaDoc(id)
  if (doc.state === 'Übernommen') {
    throw conflict('Eine überführte Idee bleibt als Nachweis erhalten und lässt sich nicht löschen.')
  }
  const session = loadSession(id)
  if (session) assertIdle(session)
  removeIdeaDoc(id)
  removeFile(sessionFile(id))
  await git.commitPaths([path], `idee: ${id} ${doc.title} verworfen`).catch(() => {})
  logEvent('idea', `Idee ${id} »${doc.title}« verworfen`, null)
  notify('ideas', id)
}

// ---------------------------------------------------------------------------
// Anforderungs-Assistent
// ---------------------------------------------------------------------------
const EMPTY_DRAFT = {
  title: '',
  userStory: '',
  description: '',
  criteria: [],
  placement: { epicNumber: null, epicName: '', featureNumber: null, featureName: '' },
}

const STUDIO_READINESS = [
  { key: 'goal', label: 'Rolle, Ziel und Nutzen sind klar' },
  { key: 'criteria', label: 'Das Verhalten ist vollständig abgedeckt' },
  { key: 'testable', label: 'Jedes Kriterium ist eindeutig prüfbar' },
  { key: 'placement', label: 'Die Einordnung steht fest' },
]

function studioView(session) {
  return {
    ...session,
    readinessLabels: STUDIO_READINESS,
    readyCount: STUDIO_READINESS.filter((item) => session.readiness?.[item.key]).length,
    readyTotal: STUDIO_READINESS.length,
    waitingForUser: !session.busy && session.status === 'open' && session.messages.at(-1)?.role === 'assistant',
  }
}

export function listStudio() {
  return listJson('sessions')
    .filter((s) => s.kind === 'studio' && s.status === 'open')
    .sort((a, b) => a.number - b.number)
    .map(studioView)
}

export function getStudio(id) {
  const session = loadSession(id)
  if (!session || session.kind !== 'studio') throw notFound('Dieser Entwurf existiert nicht mehr.')
  return studioView(session)
}

const studioTurn = (id) =>
  runTurn(id, {
    system: STUDIO_SYSTEM,
    schema: STUDIO_SCHEMA,
    buildPrompt(session) {
      return studioPrompt({
        draft: session.draft,
        messages: session.messages,
        inventory: inventoryText(),
        editing: session.storyId,
      })
    },
    apply(session, output) {
      const placement = session.storyId ? session.draft.placement : output.draft.placement
      session.draft = { ...output.draft, placement }
      session.readiness = output.readiness
    },
  })

export function createStudio(text, storyId = null) {
  const sessions = listJson('sessions').filter((s) => s.kind === 'studio')
  const number = Math.max(0, ...sessions.map((s) => s.number)) + 1
  const id = `A${number}`
  let draft = structuredClone(EMPTY_DRAFT)
  if (storyId) {
    const story = getStory(storyId)
    draft = {
      title: story.title,
      userStory: story.userStory,
      description: story.description,
      criteria: story.criteria,
      placement: {
        epicNumber: story.epicNumber,
        epicName: story.epicName,
        featureNumber: story.featureNumber,
        featureName: story.featureName,
      },
    }
  }
  const session = newSession(id, 'studio', { number, status: 'open', draft, storyId })
  addUserMessage(session, text)
  saveSession(session)
  studioTurn(id)
  return { id }
}

export function sendStudioMessage(id, text, answers) {
  const session = getStudio(id)
  assertIdle(session)
  const raw = loadSession(id)
  addUserMessage(raw, text, answers)
  saveSession(raw)
  studioTurn(id)
}

export function retryStudio(id) {
  assertIdle(getStudio(id))
  studioTurn(id)
}

export function updateStudioDraft(id, draft) {
  const session = loadSession(id)
  if (!session) throw notFound('Dieser Entwurf existiert nicht mehr.')
  assertIdle(session)
  session.draft = { ...session.draft, ...draft }
  saveSession(session)
}

export async function saveStudio(id) {
  const session = loadSession(id)
  if (!session) throw notFound('Dieser Entwurf existiert nicht mehr.')
  assertIdle(session)
  let result
  let subject
  if (session.storyId) {
    result = updateStory(session.storyId, session.draft)
    subject = `anforderung: ${session.storyId} überarbeitet`
    logEvent('requirement', `Anforderung ${session.storyId} »${session.draft.title}« mit dem Assistenten überarbeitet`, { story: session.storyId })
  } else {
    result = createStory(session.draft, session.draft.placement)
    subject = `anforderung: ${result.id} ${session.draft.title} angelegt`
    logEvent('requirement', `Anforderung ${result.id} »${session.draft.title}« mit dem Assistenten angelegt`, { story: result.id })
  }
  await git.commitPaths(['specs'], subject)
  session.status = 'saved'
  session.savedStory = result.id
  saveSession(session)
  notify('requirements')
  return result
}

export function deleteStudio(id) {
  const session = loadSession(id)
  if (!session) return
  assertIdle(session)
  removeFile(sessionFile(id))
  notify('studio', id)
}

export function cancelTurn(id) {
  running.get(id)?.cancel()
}

// ---------------------------------------------------------------------------
// Qualitätsprüfung (wartet direkt auf das Ergebnis)
// ---------------------------------------------------------------------------
export async function checkStory(story) {
  const handle = runAgent({
    profile: 'read',
    model: getSettings().dialogModel,
    effort: 'medium',
    system: CHECK_SYSTEM,
    schema: CHECK_SCHEMA,
    prompt: checkPrompt(story),
  })
  const result = await handle.promise
  if (!result.structured) throw new AgentError('Die KI hat keine auswertbare Antwort geliefert.')
  return result.structured
}
