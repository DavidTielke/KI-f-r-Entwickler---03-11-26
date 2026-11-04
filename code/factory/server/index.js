import fs from 'node:fs'
import path from 'node:path'
import express from 'express'
import { addClient, notify } from './bus.js'
import { FACTORY_DIR, IDEAS_DIR, MODELS, PORT, ROOT, SPECS_DIR } from './config.js'
import { badRequest, HttpError } from './errors.js'
import * as git from './git.js'
import { buildHistory, buildOverview, settingsView, storyDetail, systemStatus } from './overview.js'
import * as runs from './runs.js'
import * as sessions from './sessions.js'
import * as specs from './specs.js'
import { logEvent, saveSettings } from './storage.js'

const app = express()
app.use(express.json({ limit: '4mb' }))

// ---------------------------------------------------------------------------
// Zugriffsschutz: Dieser Dienst kann Programmcode ändern und ausliefern. Er ist
// nur lokal erreichbar. Zusätzlich werden fremde Webseiten abgewiesen, die den
// Dienst aus dem Browser heraus ansprechen wollen (DNS-Rebinding, CSRF).
// ---------------------------------------------------------------------------
const allowedHosts = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`, 'localhost:5174', '127.0.0.1:5174'])
app.use((req, res, next) => {
  if (!allowedHosts.has(req.headers.host)) {
    return res.status(403).json({ error: 'Zugriff nur lokal erlaubt.' })
  }
  const origin = req.headers.origin
  if (origin) {
    let originHost = null
    try {
      originHost = new URL(origin).host
    } catch {
      // Eine ungültige Herkunft wird unten abgewiesen.
    }
    if (!allowedHosts.has(originHost)) return res.status(403).json({ error: 'Zugriff nur lokal erlaubt.' })
  }
  if (!['GET', 'HEAD'].includes(req.method) && !req.is('application/json')) {
    return res.status(415).json({ error: 'Ungültiges Anfrageformat.' })
  }
  next()
})

function requireText(value, message) {
  const text = typeof value === 'string' ? value.trim() : ''
  if (!text) throw badRequest(message)
  return text
}

// ---------------------------------------------------------------------------
// Live-Updates
// ---------------------------------------------------------------------------
app.get('/api/events', (req, res) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  res.write('retry: 2000\n\n')
  addClient(res)
})

// ---------------------------------------------------------------------------
// Übersicht
// ---------------------------------------------------------------------------
app.get('/api/overview', async (req, res) => res.json(await buildOverview()))
app.get('/api/history', async (req, res) => res.json(await buildHistory()))
app.get('/api/system', async (req, res) => res.json(await systemStatus()))
app.get('/api/settings', (req, res) => res.json(settingsView()))
app.put('/api/settings', (req, res) => {
  const known = new Set(MODELS.map((m) => m.id))
  const patch = {}
  for (const key of ['dialogModel', 'buildModel']) {
    if (req.body[key]) {
      if (!known.has(req.body[key])) throw badRequest('Unbekanntes KI-Modell.')
      patch[key] = req.body[key]
    }
  }
  saveSettings(patch)
  notify('settings')
  res.json(settingsView())
})

// ---------------------------------------------------------------------------
// Ideen
// ---------------------------------------------------------------------------
app.get('/api/ideas', (req, res) => res.json(sessions.listIdeas()))
app.get('/api/ideas/:id', (req, res) => res.json(sessions.getIdea(req.params.id)))
app.post('/api/ideas', (req, res) => {
  res.status(201).json(sessions.createIdea(requireText(req.body.text, 'Bitte beschreiben Sie Ihre Idee.')))
})
app.post('/api/ideas/:id/message', (req, res) => {
  sessions.sendIdeaMessage(req.params.id, requireText(req.body.text, 'Bitte geben Sie eine Antwort ein.'), req.body.answers)
  res.status(202).json({ ok: true })
})
app.post('/api/ideas/:id/retry', (req, res) => {
  sessions.retryIdea(req.params.id)
  res.status(202).json({ ok: true })
})
app.put('/api/ideas/:id/document', (req, res) => {
  sessions.updateIdeaDocument(req.params.id, req.body ?? {})
  res.json({ ok: true })
})
app.post('/api/ideas/:id/approve', async (req, res) => {
  await sessions.approveIdea(req.params.id)
  res.json({ ok: true })
})
app.post('/api/ideas/:id/reopen', (req, res) => {
  sessions.reopenIdea(req.params.id)
  res.json({ ok: true })
})
app.post('/api/ideas/:id/transfer', async (req, res) => {
  res.status(202).json(await runs.startTransfer(req.params.id))
})
app.delete('/api/ideas/:id', async (req, res) => {
  await sessions.deleteIdea(req.params.id)
  res.json({ ok: true })
})

// ---------------------------------------------------------------------------
// Anforderungen
// ---------------------------------------------------------------------------
app.get('/api/requirements', (req, res) => {
  const tree = specs.readTree()
  res.json({ tree, locked: runs.isBusy() })
})
app.get('/api/requirements/:id', async (req, res) => res.json(await storyDetail(req.params.id)))
app.get('/api/appendix/:epic/:name', (req, res) => {
  res.json({ markdown: specs.readAppendix(req.params.epic, req.params.name) })
})
app.post('/api/requirements', async (req, res) => {
  runs.assertSpecsUnlocked()
  const created = specs.createStory(req.body, req.body.placement)
  await git.commitPaths([created.path], `anforderung: ${created.id} ${req.body.title.trim()} angelegt`)
  logEvent('requirement', `Anforderung ${created.id} »${req.body.title.trim()}« angelegt`, { story: created.id })
  notify('requirements')
  res.status(201).json(created)
})
app.post('/api/requirements/check', async (req, res) => {
  res.json(await sessions.checkStory(specs.validateStory(req.body)))
})
app.put('/api/requirements/:id', async (req, res) => {
  runs.assertSpecsUnlocked()
  const updated = specs.updateStory(req.params.id, req.body)
  if (updated.changed) {
    await git.commitPaths([updated.path, updated.oldPath].filter(Boolean), `anforderung: ${req.params.id} geändert`)
    logEvent('requirement', `Anforderung ${req.params.id} »${req.body.title.trim()}« geändert`, { story: req.params.id })
    notify('requirements')
  }
  res.json(updated)
})
app.delete('/api/requirements/:id', async (req, res) => {
  runs.assertSpecsUnlocked()
  const story = specs.getStory(req.params.id)
  if (story.isTool || (await git.wasEverImplemented(story.path))) {
    throw new HttpError(409, 'Bereits umgesetzte Anforderungen bleiben als Nachweis erhalten und lassen sich nicht löschen.')
  }
  specs.deleteStory(req.params.id)
  await git.commitPaths([story.path], `anforderung: ${req.params.id} ${story.title} entfernt`)
  logEvent('requirement', `Anforderung ${req.params.id} »${story.title}« entfernt`, null)
  notify('requirements')
  res.json({ ok: true })
})

// ---------------------------------------------------------------------------
// Anforderungs-Assistent
// ---------------------------------------------------------------------------
app.get('/api/studio', (req, res) => res.json(sessions.listStudio()))
app.get('/api/studio/:id', (req, res) => res.json(sessions.getStudio(req.params.id)))
app.post('/api/studio', (req, res) => {
  const text = requireText(req.body.text, 'Bitte beschreiben Sie, was die Anwendung künftig können soll.')
  res.status(201).json(sessions.createStudio(text, req.body.storyId ?? null))
})
app.post('/api/studio/:id/message', (req, res) => {
  sessions.sendStudioMessage(req.params.id, requireText(req.body.text, 'Bitte geben Sie eine Antwort ein.'), req.body.answers)
  res.status(202).json({ ok: true })
})
app.post('/api/studio/:id/retry', (req, res) => {
  sessions.retryStudio(req.params.id)
  res.status(202).json({ ok: true })
})
app.put('/api/studio/:id/draft', (req, res) => {
  sessions.updateStudioDraft(req.params.id, req.body ?? {})
  res.json({ ok: true })
})
app.post('/api/studio/:id/save', async (req, res) => {
  runs.assertSpecsUnlocked()
  res.json(await sessions.saveStudio(req.params.id))
})
app.delete('/api/studio/:id', (req, res) => {
  sessions.deleteStudio(req.params.id)
  res.json({ ok: true })
})

// ---------------------------------------------------------------------------
// Aufträge
// ---------------------------------------------------------------------------
app.get('/api/runs', (req, res) => res.json(runs.listRuns()))
app.get('/api/runs/:id', (req, res) => res.json(runs.getRun(req.params.id)))
app.post('/api/runs', (req, res) => res.status(202).json(runs.startDelivery(req.body.storyIds)))
app.post('/api/runs/:id/cancel', (req, res) => {
  runs.cancelRun(req.params.id)
  res.json({ ok: true })
})
app.post('/api/runs/:id/discard', async (req, res) => {
  await runs.discardRun(req.params.id)
  res.json({ ok: true })
})
app.post('/api/runs/:id/revert', (req, res) => res.status(202).json(runs.startRevert(req.params.id)))
app.post('/api/runs/:id/retry', async (req, res) => res.status(202).json(await runs.retryRun(req.params.id)))

app.use('/api', (req, res) => res.status(404).json({ error: 'Unbekannte Adresse.' }))

// ---------------------------------------------------------------------------
// Oberfläche
// ---------------------------------------------------------------------------
const dist = path.join(FACTORY_DIR, 'dist')
app.use(express.static(dist))
app.get('/', (req, res) => {
  if (fs.existsSync(path.join(dist, 'index.html'))) res.sendFile(path.join(dist, 'index.html'))
  else res.status(503).send('Die Oberfläche ist noch nicht gebaut. Bitte führen Sie „npm run build“ aus.')
})

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)
  if (err instanceof HttpError) return res.status(err.status).json({ error: err.message })
  if (err.status === 400) return res.status(400).json({ error: 'Die Anfrage konnte nicht gelesen werden.' })
  console.error(err)
  res.status(500).json({ error: err.message || 'Es ist ein unerwarteter Fehler aufgetreten.' })
})

// ---------------------------------------------------------------------------
// Änderungen an den Dateien erscheinen sofort in der Oberfläche, auch wenn sie
// von der KI oder außerhalb der Factory stammen.
// ---------------------------------------------------------------------------
function watch(dir, topic) {
  if (!fs.existsSync(dir)) return
  let timer = null
  fs.watch(dir, { recursive: true }, () => {
    clearTimeout(timer)
    timer = setTimeout(() => notify(topic), 300)
  })
}
watch(SPECS_DIR, 'requirements')
watch(IDEAS_DIR, 'ideas')

sessions.recoverSessions()
runs.recoverRuns()

// Nur lokal erreichbar: Der Dienst hat keine Anmeldung.
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Software Factory läuft auf http://localhost:${PORT} (Repository: ${ROOT})`)
})
