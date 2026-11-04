import { execFile } from 'node:child_process'
import { MODELS, modelLabel } from './config.js'
import * as git from './git.js'
import { originOfStory, readIdeaDocs } from './ideas.js'
import { listRuns } from './runs.js'
import { listIdeas, listStudio } from './sessions.js'
import { allStories, getStory, readTree } from './specs.js'
import { getSettings, readEvents } from './storage.js'

// ---------------------------------------------------------------------------
// Kennzahlen des Cockpits. Werkzeug-Themenbereiche zählen nicht mit, weil das
// Cockpit den Stand der Anwendung zeigt und nicht den der Factory.
// ---------------------------------------------------------------------------
export async function buildOverview() {
  const tree = readTree()
  const productTree = tree.filter((epic) => !epic.isTool)
  const stories = allStories(productTree)
  const ideas = listIdeas()
  const runs = listRuns()
  const drafts = listStudio()

  const open = stories.filter((story) => story.state !== 'Implemented')
  const implemented = stories.length - open.length

  const deliveries = runs.filter((run) => run.type === 'delivery' && ['done', 'partial'].includes(run.status))
  const durations = deliveries
    .filter((run) => run.startedAt && run.endedAt)
    .map((run) => new Date(run.endedAt) - new Date(run.startedAt))
  const activeRuns = runs.filter((run) => ['queued', 'running'].includes(run.status))

  const ideaCounts = {
    draft: ideas.filter((idea) => idea.state === 'Draft').length,
    ready: ideas.filter((idea) => idea.state === 'Ready').length,
    transferred: ideas.filter((idea) => idea.state === 'Übernommen').length,
  }

  // Was jetzt zu tun ist, abgeleitet aus dem tatsächlichen Stand.
  const actions = []
  for (const idea of ideas) {
    if (idea.state === 'Draft' && idea.readyCount === idea.readyTotal - 1 && !idea.busy) {
      actions.push({ tone: 'orange', title: `Idee ${idea.id} »${idea.title}« ist bereit zur Freigabe`, href: `#/ideen/${idea.id}`, cta: 'Idee prüfen' })
    } else if (idea.waitingForUser) {
      actions.push({ tone: 'orange', title: `Idee ${idea.id} »${idea.title}« wartet auf Ihre Antwort`, href: `#/ideen/${idea.id}`, cta: 'Dialog fortsetzen' })
    }
    if (idea.state === 'Ready') {
      actions.push({ tone: 'green', title: `Idee ${idea.id} »${idea.title}« ist freigegeben`, href: `#/ideen/${idea.id}`, cta: 'Anforderungen erstellen' })
    }
  }
  for (const draft of drafts) {
    if (draft.waitingForUser) {
      actions.push({ tone: 'orange', title: `Entwurf ${draft.id} »${draft.draft.title || 'Neue Anforderung'}« wartet auf Ihre Antwort`, href: `#/assistent/${draft.id}`, cta: 'Gespräch fortsetzen' })
    }
  }
  if (open.length) {
    actions.push({ tone: 'green', title: `${open.length} ${open.length === 1 ? 'Anforderung wartet' : 'Anforderungen warten'} auf die Umsetzung`, href: '#/anforderungen?filter=offen', cta: 'Anforderungen auswählen' })
  }
  for (const run of runs.filter((r) => r.canDiscard)) {
    actions.push({ tone: 'error', title: `Auftrag ${run.id} wurde nicht abgeschlossen und benötigt eine Entscheidung`, href: `#/umsetzung/${run.id}`, cta: 'Auftrag öffnen' })
  }

  return {
    ideas: ideaCounts,
    totals: {
      stories: stories.length,
      open: open.length,
      implemented,
      criteria: stories.reduce((sum, story) => sum + story.criteriaCount, 0),
      epics: productTree.length,
      features: productTree.reduce((sum, epic) => sum + epic.features.length, 0),
      rate: stories.length ? Math.round((implemented / stories.length) * 100) : 0,
      deliveries: deliveries.length,
      avgDurationMs: durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : null,
      costUsd: runs.reduce((sum, run) => sum + (run.costUsd ?? 0), 0),
    },
    byEpic: productTree.map((epic) => {
      const items = epic.features.flatMap((feature) => feature.stories)
      const done = items.filter((story) => story.state === 'Implemented').length
      return { name: epic.name, number: epic.number, umgesetzt: done, offen: items.length - done }
    }),
    daily: await git.dailyActivity(14).catch(() => []),
    actions,
    activeRuns,
    openDrafts: drafts.length,
    recent: readEvents().slice(-12).reverse(),
    nav: {
      ideasOpen: ideaCounts.draft + ideaCounts.ready,
      requirementsOpen: open.length,
      runsActive: activeRuns.length,
    },
  }
}

// Vollständiger Stand einer Anforderung inklusive Herkunft und Verlauf.
export async function storyDetail(id) {
  const story = getStory(id)
  const [history, runs] = await Promise.all([git.fileHistory(story.path).catch(() => []), Promise.resolve(listRuns())])
  return {
    ...story,
    history,
    origin: originOfStory(story.path, readIdeaDocs()),
    runs: runs
      .filter((run) => run.type === 'delivery' && run.stories.some((item) => item.id === id))
      .map((run) => ({ id: run.id, status: run.status, endedAt: run.endedAt, commit: run.commit })),
  }
}

export async function buildHistory() {
  const events = readEvents().map((event) => ({ ...event, source: 'factory' }))
  const commits = await git.recentCommits(100).catch(() => [])
  const merged = [
    ...events,
    ...commits.map((commit) => ({
      at: commit.at,
      type: 'version',
      title: commit.subject,
      ref: { commit: commit.hash },
      source: 'version',
      author: commit.author,
    })),
  ]
  return merged.sort((a, b) => new Date(b.at) - new Date(a.at))
}

function probe(file, args) {
  return new Promise((resolve) => {
    execFile(file, args, { windowsHide: true, timeout: 15000 }, (err, stdout) => {
      resolve({ ok: !err, output: stdout?.trim() ?? '' })
    })
  })
}

export async function systemStatus() {
  const settings = getSettings()
  const [claude, docker, gitVersion, app] = await Promise.all([
    probe('claude', ['--version']),
    probe('docker', ['info', '--format', '{{.ServerVersion}}']),
    probe('git', ['--version']),
    fetch(settings.appUrl, { signal: AbortSignal.timeout(3000) })
      .then((response) => response.ok)
      .catch(() => false),
  ])
  return {
    checks: [
      { key: 'ai', label: 'KI-Anbindung', ok: claude.ok, detail: claude.ok ? claude.output : 'Nicht installiert' },
      { key: 'docker', label: 'Betriebsumgebung', ok: docker.ok, detail: docker.ok ? `Docker ${docker.output}` : 'Docker Desktop ist nicht gestartet' },
      { key: 'git', label: 'Versionsverwaltung', ok: gitVersion.ok, detail: gitVersion.output },
      { key: 'app', label: 'Anwendung', ok: app, detail: app ? settings.appUrl : 'Nicht erreichbar' },
    ],
    app: { url: settings.appUrl, online: app },
    user: await git.userName(),
  }
}

export function settingsView() {
  const settings = getSettings()
  return { ...settings, models: MODELS, dialogLabel: modelLabel(settings.dialogModel), buildLabel: modelLabel(settings.buildModel) }
}
