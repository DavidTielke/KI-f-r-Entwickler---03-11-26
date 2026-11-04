import { spawn } from 'node:child_process'
import { AgentError, killTree, runAgent } from './agent.js'
import { notify } from './bus.js'
import { DELIVERY_PATHSPECS, ROOT } from './config.js'
import { conflict, notFound } from './errors.js'
import * as git from './git.js'
import { readIdeaDoc, writeIdeaDoc } from './ideas.js'
import {
  BUILD_SCHEMA,
  BUILD_SYSTEM,
  TRANSFER_SCHEMA,
  TRANSFER_SYSTEM,
  buildPrompt,
  repairPrompt,
  transferPrompt,
} from './prompts.js'
import { allStories, getStory, inventoryText, isStoryPath, setStoryState, storyProblems } from './specs.js'
import { dataPath, getSettings, listJson, logEvent, readJson, writeJson } from './storage.js'

// ---------------------------------------------------------------------------
// Aufträge der Fertigungsstraße: Überführung, Umsetzung, Rücknahme. Sie ändern
// den gemeinsamen Arbeitsstand und laufen deshalb strikt nacheinander.
// ---------------------------------------------------------------------------
const PHASES = {
  transfer: [
    ['vorbereitung', 'Vorbereitung'],
    ['ausformulierung', 'Ausformulierung'],
    ['pruefung', 'Formprüfung'],
    ['sicherung', 'Sicherung'],
  ],
  delivery: [
    ['vorbereitung', 'Vorbereitung'],
    ['umsetzung', 'Umsetzung'],
    ['pruefung', 'Prüfung'],
    ['sicherung', 'Sicherung'],
    ['auslieferung', 'Auslieferung'],
    ['abnahme', 'Betriebsprüfung'],
  ],
  revert: [
    ['vorbereitung', 'Vorbereitung'],
    ['ruecknahme', 'Rücknahme'],
    ['auslieferung', 'Auslieferung'],
    ['abnahme', 'Betriebsprüfung'],
  ],
}

const MAX_REPAIRS = 2
const MAX_ACTIVITY = 1500

const queue = []
let active = null // { run, cancel }

const runFile = (id) => dataPath('runs', `${id}.json`)

function loadRun(id) {
  // Die Kennung stammt aus der Adresse und wird Teil eines Dateipfads.
  if (!/^L\d+$/.test(id)) return null
  return readJson(runFile(id))
}

function saveRun(run) {
  writeJson(runFile(run.id), run)
  notify('runs', run.id)
}

function nextRunId() {
  const max = Math.max(0, ...listJson('runs').map((run) => Number(run.id.slice(1))))
  return `L${max + 1}`
}

function newRun(type, title, extra = {}) {
  return {
    id: nextRunId(),
    type,
    title,
    status: 'queued',
    queuedAt: new Date().toISOString(),
    startedAt: null,
    endedAt: null,
    phases: PHASES[type].map(([key, label]) => ({ key, label, status: 'pending', startedAt: null, endedAt: null })),
    activity: [],
    stories: [],
    summary: '',
    error: null,
    errorDetail: null,
    commit: null,
    baseCommit: null,
    changes: null,
    costUsd: 0,
    repairs: 0,
    canDiscard: false,
    revertedBy: null,
    ...extra,
  }
}

export function recoverRuns() {
  for (const run of listJson('runs')) {
    if (run.status === 'running' || run.status === 'queued') {
      run.status = 'failed'
      run.error = 'Der Auftrag wurde durch einen Neustart des Dienstes unterbrochen.'
      run.endedAt = new Date().toISOString()
      run.phases = run.phases.map((p) => (p.status === 'active' ? { ...p, status: 'failed' } : p))
      // Hat der Auftrag noch nicht gearbeitet, gehören offene Änderungen dem Anwender.
      run.canDiscard = run.type !== 'revert' && Boolean(run.workStarted)
      writeJson(runFile(run.id), run)
    }
  }
}

export function listRuns() {
  return listJson('runs')
    .map(({ activity, ...rest }) => rest)
    .sort((a, b) => Number(b.id.slice(1)) - Number(a.id.slice(1)))
}

export function getRun(id) {
  const run = loadRun(id)
  if (!run) throw notFound('Dieser Auftrag existiert nicht.')
  return { ...run, activity: run.activity.slice(-600) }
}

// Während eines schreibenden Auftrags bleiben Anforderungen gesperrt.
export function assertSpecsUnlocked() {
  if (active) {
    throw conflict('Während eines laufenden Auftrags lassen sich Anforderungen nicht ändern. Bitte warten Sie den Abschluss ab.')
  }
}

export function isBusy() {
  return Boolean(active)
}

export function isIdeaInTransfer(ideaId) {
  return listJson('runs').some(
    (run) => run.type === 'transfer' && run.ideaId === ideaId && ['queued', 'running'].includes(run.status),
  )
}

// ---------------------------------------------------------------------------
// Warteschlange
// ---------------------------------------------------------------------------
function enqueue(run) {
  saveRun(run)
  queue.push(run.id)
  processQueue()
  return run
}

async function processQueue() {
  if (active || queue.length === 0) return
  const id = queue.shift()
  const run = loadRun(id)
  if (!run || run.status !== 'queued') return processQueue()

  const context = createContext(run)
  active = context
  try {
    run.status = 'running'
    run.startedAt = new Date().toISOString()
    context.save()
    if (run.type === 'transfer') await executeTransfer(context)
    else if (run.type === 'delivery') await executeDelivery(context)
    else await executeRevert(context)
  } catch (err) {
    await finishFailed(context, err)
  } finally {
    context.flush()
    active = null
    notify('requirements')
    notify('ideas')
    processQueue()
  }
}

function createContext(run) {
  let saveTimer = null
  const context = {
    run,
    canceled: false,
    currentAgent: null,
    currentChild: null,
    save() {
      saveRun(run)
    },
    flush() {
      clearTimeout(saveTimer)
      saveTimer = null
      saveRun(run)
    },
    // Arbeitsschritte kommen schnell hintereinander und werden gebündelt gespeichert.
    track(event) {
      run.activity.push({ ...event, at: new Date().toISOString() })
      if (run.activity.length > MAX_ACTIVITY) run.activity.splice(0, run.activity.length - MAX_ACTIVITY)
      if (!saveTimer) {
        saveTimer = setTimeout(() => {
          saveTimer = null
          saveRun(run)
        }, 500)
      }
    },
    phase(key) {
      const now = new Date().toISOString()
      for (const phase of run.phases) {
        if (phase.status === 'active') {
          phase.status = 'done'
          phase.endedAt = now
        }
      }
      if (key) {
        const phase = run.phases.find((candidate) => candidate.key === key)
        phase.status = 'active'
        phase.startedAt = now
      }
      saveRun(run)
    },
    checkCanceled() {
      if (context.canceled) throw new AgentError('Der Auftrag wurde abgebrochen.')
    },
    async agent(options) {
      context.checkCanceled()
      const handle = runAgent({ ...options, onEvent: context.track })
      context.currentAgent = handle
      try {
        const result = await handle.promise
        run.costUsd += result.costUsd
        if (result.denials.length) {
          context.track({
            kind: 'hint',
            text: `Die KI wollte ${result.denials.length} nicht freigegebene Aktionen ausführen. Sie wurden blockiert.`,
            detail: [...new Set(result.denials)].join(', '),
          })
        }
        return result
      } finally {
        context.currentAgent = null
      }
    },
    command(file, args, label) {
      context.checkCanceled()
      context.track({ kind: 'step', text: label, detail: `${file} ${args.join(' ')}` })
      return new Promise((resolve, reject) => {
        const child = spawn(file, args, { cwd: ROOT, windowsHide: true })
        context.currentChild = child
        let log = ''
        const onData = (chunk) => {
          log = (log + chunk.toString('utf8')).slice(-20000)
        }
        child.stdout.on('data', onData)
        child.stderr.on('data', onData)
        child.on('error', (err) => {
          context.currentChild = null
          const hint = err.code === 'ENOENT' ? `„${file}“ ist auf diesem Rechner nicht verfügbar.` : err.message
          reject(Object.assign(new Error(hint), { log }))
        })
        child.on('close', (code) => {
          context.currentChild = null
          if (code === 0) resolve(log)
          else reject(Object.assign(new Error(`${label} ist fehlgeschlagen.`), { log }))
        })
      })
    },
  }
  return context
}

// Eine Überführung schreibt nur Anforderungen. Offene Änderungen an der Anwendung
// stammen dann nicht von ihr und dürfen nicht mit verworfen werden.
function discardScope(run) {
  return run.type === 'transfer' ? ['specs'] : DELIVERY_PATHSPECS
}

function recordCommit(run, hash) {
  if (!hash) return
  run.commits = [...(run.commits ?? []), hash]
  run.commit = hash
}

async function finishFailed(context, err) {
  const { run } = context
  const canceled = context.canceled
  run.status = canceled ? 'canceled' : 'failed'
  run.error = canceled ? 'Der Auftrag wurde abgebrochen.' : err.message
  run.errorDetail = err.detail ?? err.log?.slice(-4000) ?? null
  run.endedAt = new Date().toISOString()
  run.phases = run.phases.map((p) => (p.status === 'active' ? { ...p, status: 'failed', endedAt: run.endedAt } : p))
  // Verwerfbar ist nur, was der Auftrag selbst verändert haben kann. Scheitert er in
  // der Vorbereitung, sind offene Änderungen die Arbeit des Anwenders und tabu.
  if (run.type !== 'revert' && run.workStarted) {
    const pending = await git.status(discardScope(run)).catch(() => [])
    run.canDiscard = pending.length > 0
  }
  logEvent('run', `${runLabel(run)} ${canceled ? 'abgebrochen' : 'fehlgeschlagen'}`, { run: run.id })
}

function runLabel(run) {
  if (run.type === 'transfer') return `Überführung ${run.id} »${run.title}«`
  if (run.type === 'revert') return `Rücknahme ${run.id}`
  return `Umsetzung ${run.id}`
}

// ---------------------------------------------------------------------------
// Überführung einer Idee in Anforderungen
// ---------------------------------------------------------------------------
export async function startTransfer(ideaId) {
  const { doc } = readIdeaDoc(ideaId)
  if (doc.state !== 'Ready') throw conflict('Nur freigegebene Ideen lassen sich in Anforderungen überführen.')
  const duplicate = listJson('runs').some(
    (run) => run.type === 'transfer' && run.ideaId === ideaId && ['queued', 'running'].includes(run.status),
  )
  if (duplicate) throw conflict('Diese Idee wird bereits überführt.')
  const run = enqueue(newRun('transfer', doc.title, { ideaId }))
  logEvent('run', `Überführung ${run.id} für Idee ${ideaId} »${doc.title}« beauftragt`, { run: run.id, idea: ideaId })
  return { id: run.id }
}

async function executeTransfer(context) {
  const { run } = context
  context.phase('vorbereitung')
  const dirty = await git.status(['specs'])
  if (dirty.length) {
    throw new Error('Unter den Anforderungen liegen nicht gesicherte Änderungen. Bitte sichern oder verwerfen Sie diese zuerst.')
  }
  run.baseCommit = await git.head()
  const idea = readIdeaDoc(run.ideaId)
  // Offene Änderungen des Anwenders außerhalb der Anforderungen sind kein Vergehen
  // der KI: Geprüft wird nur, was seit dem Start neu hinzugekommen ist.
  const outsideSpecs = async () =>
    (await git.status(['.', ':(exclude)specs', ':(exclude)ideas', ':(exclude)code/factory'])).map((e) => e.path)
  const outsideBefore = new Set(await outsideSpecs())
  run.workStarted = true

  context.phase('ausformulierung')
  const result = await context.agent({
    profile: 'specs',
    model: getSettings().buildModel,
    effort: 'high',
    system: TRANSFER_SYSTEM,
    schema: TRANSFER_SCHEMA,
    prompt: transferPrompt({ ideaPath: idea.path, inventory: inventoryText() }),
    timeoutMs: 30 * 60000,
  })

  context.phase('pruefung')
  const changed = (await git.status(['specs'])).filter((entry) => !entry.code.includes('D')).map((entry) => entry.path)
  const storyPaths = changed.filter(isStoryPath)
  if (storyPaths.length === 0) throw new Error('Die KI hat keine Anforderungen angelegt.')
  const problems = storyPaths.flatMap((file) => storyProblems(file).map((problem) => `${file}: ${problem}`))
  if (problems.length) {
    throw Object.assign(new Error('Einige Anforderungen entsprechen nicht dem vorgeschriebenen Format.'), {
      log: problems.join('\n'),
    })
  }
  const outside = (await outsideSpecs()).filter((file) => !outsideBefore.has(file))
  if (outside.length) {
    throw Object.assign(new Error('Die KI hat Dateien außerhalb der Anforderungen verändert.'), { log: outside.join('\n') })
  }

  context.phase('sicherung')
  const today = new Date().toISOString().slice(0, 10)
  const current = readIdeaDoc(run.ideaId)
  const links = storyPaths.map((file) => `\`${file}\``).join(', ')
  const ideaPath = writeIdeaDoc(run.ideaId, {
    ...current.doc,
    state: 'Übernommen',
    transfer: [...current.doc.transfer, `${today}: Überführt in ${links}.`],
  })
  recordCommit(
    run,
    await git.commitPaths(['specs', ideaPath], `idee: ${run.ideaId} ${current.doc.title} in anforderungen überführt`, {
      body: storyPaths.map((file) => `- ${file}`).join('\n'),
      model: getSettings().buildModel,
    }),
  )
  run.storyPaths = storyPaths
  run.summary = result.structured?.summary ?? ''
  run.stories = allStories()
    .filter((story) => storyPaths.includes(story.path))
    .map((story) => ({ id: story.id, title: story.title, done: true, note: '' }))
  context.phase(null)
  run.status = 'done'
  run.endedAt = new Date().toISOString()
  logEvent('run', `Idee ${run.ideaId} »${current.doc.title}« in ${storyPaths.length} Anforderungen überführt`, {
    run: run.id,
    idea: run.ideaId,
  })
}

// ---------------------------------------------------------------------------
// Umsetzung ausgewählter Anforderungen
// ---------------------------------------------------------------------------
export function startDelivery(storyIds) {
  if (!Array.isArray(storyIds) || storyIds.length === 0) {
    throw conflict('Bitte wählen Sie mindestens eine Anforderung aus.')
  }
  const stories = storyIds.map(getStory)
  const invalid = stories.find((story) => story.state === 'Implemented')
  if (invalid) throw conflict(`Die Anforderung ${invalid.id} ist bereits umgesetzt.`)
  const tool = stories.find((story) => story.isTool)
  if (tool) throw conflict('Der Themenbereich „Software Factory“ lässt sich nicht über die Factory selbst umsetzen.')
  const pending = new Set(
    listJson('runs')
      .filter((run) => run.type === 'delivery' && ['queued', 'running'].includes(run.status))
      .flatMap((run) => run.stories.map((story) => story.id)),
  )
  const duplicate = stories.find((story) => pending.has(story.id))
  if (duplicate) throw conflict(`Die Anforderung ${duplicate.id} ist bereits beauftragt.`)

  const title = stories.length === 1 ? stories[0].title : `${stories.length} Anforderungen`
  const run = enqueue(
    newRun('delivery', title, {
      stories: stories.map((story) => ({ id: story.id, title: story.title, path: story.path, done: false, note: '' })),
    }),
  )
  logEvent('run', `Umsetzung ${run.id} beauftragt (${stories.length} Anforderungen)`, { run: run.id })
  return { id: run.id }
}

function refreshStoryProgress(run) {
  const states = new Map(allStories().map((story) => [story.id, story]))
  for (const item of run.stories) {
    const current = states.get(item.id)
    if (current) {
      item.done = current.state === 'Implemented'
      item.path = current.path
    }
  }
}

// Dateien, die eine Umsetzung nicht berühren darf. Der Anwender darf dort selbst
// arbeiten, deshalb zählt am Ende nur, was seit dem Start neu hinzugekommen ist.
async function filesOutsideScope() {
  const outside = await git.status([
    '.',
    ':(exclude)code',
    ':(exclude)specs',
    ':(exclude)ideas',
    ':(exclude)docker-compose.yml',
  ])
  const factory = await git.status(['code/factory'])
  return [...outside, ...factory].map((entry) => entry.path)
}

async function composeBuildWithRepair(context) {
  const { run } = context
  for (let attempt = 0; ; attempt++) {
    try {
      await context.command('docker', ['compose', 'build'], 'Baut die neue Version der Anwendung')
      return
    } catch (err) {
      if (attempt >= MAX_REPAIRS || context.canceled) throw err
      run.repairs++
      context.track({ kind: 'hint', text: 'Der Bau ist fehlgeschlagen. Die KI bessert nach.', detail: err.log?.slice(-1500) })
      await context.agent({
        profile: 'build',
        model: getSettings().buildModel,
        effort: 'high',
        system: BUILD_SYSTEM,
        schema: BUILD_SCHEMA,
        prompt: repairPrompt({ problem: 'Der Bau der neuen Version ist fehlgeschlagen.', log: err.log ?? err.message, stories: run.stories }),
        timeoutMs: 30 * 60000,
      })
    }
  }
}

async function healthCheck(context) {
  const { appUrl, healthPaths } = getSettings()
  const deadline = Date.now() + 90000
  let failure = ''
  while (Date.now() < deadline) {
    context.checkCanceled()
    failure = ''
    for (const route of healthPaths) {
      try {
        const response = await fetch(new URL(route, appUrl), { signal: AbortSignal.timeout(5000) })
        if (!response.ok) failure = `${route}: Status ${response.status}`
      } catch (err) {
        failure = `${route}: ${err.message}`
      }
    }
    if (!failure) return
    await new Promise((resolve) => setTimeout(resolve, 2500))
  }
  throw Object.assign(new Error('Die Anwendung antwortet nach der Auslieferung nicht fehlerfrei.'), { log: failure })
}

async function bringUpAndVerify(context) {
  context.phase('auslieferung')
  await context.command('docker', ['compose', 'up', '-d', '--build'], 'Liefert die neue Version aus')
  context.phase('abnahme')
  context.track({ kind: 'step', text: 'Prüft, ob die Anwendung im Betrieb antwortet', detail: getSettings().appUrl })
  try {
    await healthCheck(context)
  } catch (err) {
    // Ohne Betriebsprotokoll könnte die KI eine Störung beim Start nicht beheben.
    const logs = await context
      .command('docker', ['compose', 'logs', '--no-color', '--tail=120'], 'Liest das Betriebsprotokoll')
      .catch((logError) => logError.log ?? '')
    err.log = `${err.log ?? ''}\n${logs}`
    throw err
  }
}

async function collectChanges(run) {
  if (!run.commits?.length) return
  // Eine Umsetzung kann aus mehreren Versionen bestehen (Nachbesserungen).
  const byPath = new Map()
  for (const hash of run.commits) {
    for (const file of await git.changeStats(hash)) {
      const known = byPath.get(file.path) ?? { path: file.path, added: 0, removed: 0 }
      known.added += file.added
      known.removed += file.removed
      byPath.set(file.path, known)
    }
  }
  const files = [...byPath.values()]
  const area = (file) => {
    if (file.startsWith('code/frontend')) return 'Oberfläche'
    if (file.startsWith('code/backend/Migrations')) return 'Datenbank'
    if (file.startsWith('code/backend')) return 'Serverlogik'
    if (file.startsWith('specs/')) return 'Anforderungen'
    return 'Betriebsumgebung'
  }
  const areas = {}
  for (const file of files) areas[area(file.path)] = (areas[area(file.path)] ?? 0) + 1
  run.changes = {
    files,
    areas,
    added: files.reduce((sum, file) => sum + file.added, 0),
    removed: files.reduce((sum, file) => sum + file.removed, 0),
  }
}

async function executeDelivery(context) {
  const { run } = context
  context.phase('vorbereitung')
  context.track({ kind: 'step', text: 'Prüft den Arbeitsstand', detail: 'git status' })
  const dirty = await git.status(DELIVERY_PATHSPECS)
  if (dirty.length) {
    throw Object.assign(
      new Error('Im Arbeitsstand liegen nicht gesicherte Änderungen. Bitte sichern oder verwerfen Sie diese, bevor eine Umsetzung startet.'),
      { log: dirty.map((entry) => entry.path).join('\n') },
    )
  }
  await context.command('docker', ['info', '--format', '{{.ServerVersion}}'], 'Prüft die Betriebsumgebung').catch(() => {
    throw new Error('Die Betriebsumgebung ist nicht erreichbar. Bitte starten Sie Docker Desktop.')
  })
  run.baseCommit = await git.head()
  const scopeBefore = new Set(await filesOutsideScope())
  run.workStarted = true

  context.phase('umsetzung')
  const stories = run.stories.map((story) => ({ id: story.id, path: getStory(story.id).path }))
  const progress = setInterval(() => {
    try {
      const before = run.stories.filter((story) => story.done).length
      refreshStoryProgress(run)
      if (run.stories.filter((story) => story.done).length !== before) context.save()
    } catch {
      // Dateien können während des Schreibens kurz fehlen. Der nächste Durchlauf korrigiert das.
    }
  }, 3000)
  let result
  try {
    result = await context.agent({
      profile: 'build',
      model: getSettings().buildModel,
      effort: 'high',
      system: BUILD_SYSTEM,
      schema: BUILD_SCHEMA,
      prompt: buildPrompt(stories),
      timeoutMs: 90 * 60000,
    })
  } finally {
    clearInterval(progress)
  }

  context.phase('pruefung')
  const newOutside = (await filesOutsideScope()).filter((file) => !scopeBefore.has(file))
  if (newOutside.length) {
    throw Object.assign(new Error('Die KI hat Dateien außerhalb des erlaubten Bereichs verändert.'), {
      log: newOutside.join('\n'),
    })
  }
  await composeBuildWithRepair(context)

  // Die Aussage der KI und der Status in der Datei müssen übereinstimmen.
  const reported = new Map((result.structured?.stories ?? []).map((story) => [story.id, story]))
  for (const item of run.stories) {
    const report = reported.get(item.id)
    const current = getStory(item.id)
    if (report) {
      item.note = report.note
      const target = report.done ? 'Implemented' : 'Modified'
      if (current.state !== target) setStoryState(item.id, target)
    }
  }
  refreshStoryProgress(run)
  run.summary = result.structured?.summary ?? ''

  context.phase('sicherung')
  const doneIds = run.stories.filter((story) => story.done).map((story) => story.id)
  const subject = doneIds.length
    ? `umsetzung: ${doneIds.join(', ')}`
    : `umsetzung: ${run.id} teilweise, keine anforderung abgeschlossen`
  const changedPaths = (await git.status(DELIVERY_PATHSPECS)).map((entry) => entry.path)
  recordCommit(
    run,
    await git.commitPaths(changedPaths, subject, {
      body: run.summary,
      model: getSettings().buildModel,
    }),
  )
  await collectChanges(run)

  // Bleibt die Anwendung nach der Auslieferung gestört, bessert die KI nach.
  for (let attempt = 0; ; attempt++) {
    try {
      await bringUpAndVerify(context)
      break
    } catch (err) {
      if (attempt >= MAX_REPAIRS || context.canceled) throw err
      run.repairs++
      context.phase('pruefung')
      context.track({ kind: 'hint', text: 'Die Auslieferung war nicht erfolgreich. Die KI bessert nach.', detail: err.log?.slice(-1500) })
      await context.agent({
        profile: 'build',
        model: getSettings().buildModel,
        effort: 'high',
        system: BUILD_SYSTEM,
        schema: BUILD_SCHEMA,
        prompt: repairPrompt({ problem: err.message, log: err.log ?? err.message, stories: run.stories }),
        timeoutMs: 30 * 60000,
      })
      await composeBuildWithRepair(context)
      const fixed = (await git.status(DELIVERY_PATHSPECS)).map((entry) => entry.path)
      if (fixed.length) {
        recordCommit(run, await git.commitPaths(fixed, `umsetzung: ${run.id} nachbesserung`, { model: getSettings().buildModel }))
        await collectChanges(run)
      }
    }
  }

  context.phase(null)
  run.status = run.stories.every((story) => story.done) ? 'done' : 'partial'
  run.endedAt = new Date().toISOString()
  logEvent(
    'delivery',
    `Umsetzung ${run.id} ausgeliefert (${doneIds.length} von ${run.stories.length} Anforderungen)`,
    { run: run.id },
  )
}

// ---------------------------------------------------------------------------
// Rücknahme einer Auslieferung
// ---------------------------------------------------------------------------
export function startRevert(id) {
  const target = loadRun(id)
  if (!target) throw notFound('Dieser Auftrag existiert nicht.')
  if (target.type !== 'delivery' || !target.commit) throw conflict('Nur ausgelieferte Umsetzungen lassen sich zurücknehmen.')
  if (target.revertedBy) throw conflict('Diese Auslieferung wurde bereits zurückgenommen.')
  // Die Datenbank bliebe auf dem neuen Stand, während der Programmcode zurückspringt.
  // Das kann die Anwendung lahmlegen und muss deshalb von Hand gelöst werden.
  if (target.changes?.files.some((file) => file.path.startsWith('code/backend/Migrations/'))) {
    throw conflict('Diese Auslieferung enthält eine Datenbankänderung und lässt sich deshalb nicht automatisch zurücknehmen.')
  }
  const pendingRevert = listJson('runs').some(
    (candidate) => candidate.type === 'revert' && candidate.targetRun === id && ['queued', 'running'].includes(candidate.status),
  )
  if (pendingRevert) throw conflict('Diese Auslieferung wird bereits zurückgenommen.')
  // Nachbesserungen gehören dazu. Die jüngste Version wird zuerst zurückgenommen.
  const targetCommits = [...(target.commits ?? [target.commit])].reverse()
  const run = enqueue(newRun('revert', `Rücknahme von ${id}`, { targetRun: id, targetCommits, stories: target.stories }))
  logEvent('run', `Rücknahme ${run.id} der Auslieferung ${id} beauftragt`, { run: run.id })
  return { id: run.id }
}

async function executeRevert(context) {
  const { run } = context
  context.phase('vorbereitung')
  const dirty = await git.status(DELIVERY_PATHSPECS)
  if (dirty.length) throw new Error('Im Arbeitsstand liegen nicht gesicherte Änderungen.')
  run.baseCommit = await git.head()

  context.phase('ruecknahme')
  context.track({ kind: 'step', text: 'Stellt den vorherigen Stand wieder her', detail: `git revert ${run.targetCommits.join(' ')}` })
  try {
    recordCommit(run, await git.revert(run.targetCommits))
  } catch (err) {
    throw Object.assign(
      new Error('Die Auslieferung lässt sich nicht automatisch zurücknehmen, weil spätere Änderungen darauf aufbauen.'),
      { log: err.message },
    )
  }
  const target = loadRun(run.targetRun)
  target.revertedBy = run.id
  writeJson(runFile(target.id), target)

  await bringUpAndVerify(context)
  context.phase(null)
  run.status = 'done'
  run.summary = `Der Stand vor der Auslieferung ${run.targetRun} ist wiederhergestellt. Die betroffenen Anforderungen gelten wieder als offen.`
  run.endedAt = new Date().toISOString()
  notify('runs', target.id)
  logEvent('delivery', `Auslieferung ${run.targetRun} zurückgenommen`, { run: run.id })
}

// ---------------------------------------------------------------------------
// Steuerung
// ---------------------------------------------------------------------------
export function cancelRun(id) {
  const run = loadRun(id)
  if (!run) throw notFound('Dieser Auftrag existiert nicht.')
  if (run.status === 'queued') {
    const index = queue.indexOf(id)
    if (index >= 0) queue.splice(index, 1)
    run.status = 'canceled'
    run.endedAt = new Date().toISOString()
    saveRun(run)
    return
  }
  if (active?.run.id !== id) throw conflict('Dieser Auftrag läuft nicht mehr.')
  active.canceled = true
  active.currentAgent?.cancel()
  if (active.currentChild) killTree(active.currentChild)
}

export async function discardRun(id) {
  const run = loadRun(id)
  if (!run) throw notFound('Dieser Auftrag existiert nicht.')
  if (!run.canDiscard) throw conflict('Zu diesem Auftrag gibt es keine verwerfbaren Änderungen.')
  if (active) throw conflict('Bitte warten Sie, bis der laufende Auftrag abgeschlossen ist.')
  await git.discard(discardScope(run))
  run.canDiscard = false
  run.discarded = true
  saveRun(run)
  logEvent('run', `Änderungen aus ${run.id} verworfen`, { run: run.id })
  notify('requirements')
}

export function retryRun(id) {
  const run = loadRun(id)
  if (!run) throw notFound('Dieser Auftrag existiert nicht.')
  if (run.canDiscard) {
    throw conflict('Bitte verwerfen Sie zuerst die Änderungen des abgebrochenen Laufs.')
  }
  if (run.type === 'delivery') {
    const open = run.stories.filter((s) => getStory(s.id).state !== 'Implemented').map((s) => s.id)
    if (open.length === 0) throw conflict('Alle Anforderungen dieses Auftrags sind bereits umgesetzt.')
    return startDelivery(open)
  }
  if (run.type === 'transfer') return startTransfer(run.ideaId)
  throw conflict('Dieser Auftrag lässt sich nicht wiederholen.')
}
