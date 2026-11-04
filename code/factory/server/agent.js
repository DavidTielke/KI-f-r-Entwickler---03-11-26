import { execFile, spawn } from 'node:child_process'
import path from 'node:path'
import { ROOT } from './config.js'

// ---------------------------------------------------------------------------
// Rechteprofile: Was darf die KI in welchem Arbeitsschritt?
// MCP-Server, globale Einstellungen und Hooks des Anwenders bleiben immer außen
// vor. Die Grenzen werden nach einem Lauf zusätzlich gegen Git geprüft.
// ---------------------------------------------------------------------------
const READ = ['Read', 'Glob', 'Grep']
const fileRules = (...dirs) => dirs.flatMap((dir) => [`Edit(${dir})`, `Write(${dir})`])
const shellRules = (...commands) => commands.map((cmd) => `Bash(${cmd} *)`)

const PROFILES = {
  // Dialoge und Prüfungen: ausschließlich lesen.
  read: { tools: READ, allowed: READ, denied: [] },
  // Überführung einer Idee: nur Anforderungen schreiben.
  specs: {
    tools: [...READ, 'Edit', 'Write'],
    allowed: [...READ, ...fileRules('specs/**')],
    denied: [],
  },
  // Umsetzung: Anwendung und Anforderungen ändern, bauen und prüfen. Sichern und
  // Ausliefern übernimmt der Factory-Dienst selbst. Es gibt bewusst nur eine Shell:
  // Bash zerlegt verkettete Befehle und prüft jeden Teil einzeln gegen die Regeln.
  build: {
    tools: [...READ, 'Edit', 'Write', 'Bash'],
    allowed: [
      ...READ,
      ...fileRules('code/**', 'specs/**', 'docker-compose.yml'),
      ...shellRules('npm', 'npx', 'dotnet'),
    ],
    denied: [...fileRules('code/factory/**'), ...shellRules('git', 'docker')],
  },
}

// Die Factory darf aus einer laufenden Claude-Code-Sitzung gestartet werden,
// deren Markierungen dürfen aber nicht an die Unterprozesse weitergereicht werden.
function cleanEnv() {
  const env = { ...process.env }
  for (const key of Object.keys(env)) {
    if (key === 'CLAUDECODE' || key.startsWith('CLAUDE_CODE_')) delete env[key]
  }
  return env
}

export function killTree(child) {
  if (!child?.pid) return
  if (process.platform === 'win32') {
    execFile('taskkill', ['/PID', String(child.pid), '/T', '/F'], { windowsHide: true }, () => {})
  } else {
    child.kill('SIGTERM')
  }
}

// ---------------------------------------------------------------------------
// Übersetzung technischer Arbeitsschritte in Fachsprache
// ---------------------------------------------------------------------------
function relPath(file = '') {
  const rel = path.isAbsolute(file) ? path.relative(ROOT, file) : file
  return rel.split(path.sep).join('/')
}

function describeFile(rel) {
  if (/^specs\/.*\/_Datenstruktur\.md$/.test(rel)) return 'das Datenmodell'
  if (/^specs\/.*\/_Backend\.md$/.test(rel)) return 'die Schnittstellenbeschreibung'
  if (/^specs\/.*\/_Menüstruktur\.md$/.test(rel)) return 'die Menüstruktur'
  const story = rel.match(/^specs\/.*\/S\d+ (.+)\.md$/)
  if (story) return `die Anforderung »${story[1]}«`
  if (rel.startsWith('specs/')) return 'die Anforderungen'
  const idea = rel.match(/^ideas\/I\d+ (.+)\.md$/)
  if (idea) return `die Idee »${idea[1]}«`
  if (rel.startsWith('harness/') || rel === 'AGENTS.md') return 'die Projektregeln'
  if (rel.startsWith('code/backend/Migrations')) return 'die Datenbankstruktur'
  if (/^code\/backend\/(Models|Configurations|Data)\//.test(rel)) return 'das Datenmodell der Anwendung'
  if (rel.startsWith('code/backend')) return 'die Serverlogik'
  if (rel.startsWith('code/frontend')) return 'die Oberfläche'
  if (rel === 'docker-compose.yml') return 'die Betriebsumgebung'
  return 'den Bestand'
}

function describeCommand(command = '') {
  if (/\bef\s+(migrations|database)\b/.test(command)) return 'Bereitet die Datenbankänderung vor'
  if (/\bdotnet\b.*\b(build|test)\b/.test(command)) return 'Prüft die Serverlogik'
  if (/\bnpm\b.*\b(build|lint|test)\b/.test(command)) return 'Prüft die Oberfläche'
  if (/\bnpm\b.*\b(ci|install)\b/.test(command)) return 'Stellt benötigte Programmbausteine bereit'
  return 'Führt einen Prüfschritt aus'
}

export function describeTool(name, input = {}) {
  const rel = relPath(input.file_path ?? input.path ?? '')
  switch (name) {
    case 'Read':
      return { text: `Liest ${describeFile(rel)}`, detail: rel }
    case 'Glob':
    case 'Grep':
      return { text: 'Durchsucht den Bestand', detail: `${name}: ${input.pattern ?? ''}` }
    case 'Edit':
    case 'Write':
      return { text: `Bearbeitet ${describeFile(rel)}`, detail: rel, change: true }
    case 'Bash':
      return { text: describeCommand(input.command), detail: input.command }
    default:
      return { text: 'Arbeitet am Auftrag', detail: name }
  }
}

function friendlyError(text = '') {
  if (/not logged in|please run \/login|invalid api key|authentication/i.test(text)) {
    return 'Die KI ist nicht angemeldet. Bitte starten Sie einmal „claude“ in einem Terminal und melden Sie sich an.'
  }
  if (/rate limit|usage limit|out of credits|quota|overloaded/i.test(text)) {
    return 'Das KI-Kontingent ist derzeit ausgeschöpft oder überlastet. Bitte versuchen Sie es später erneut.'
  }
  return 'Die KI konnte den Auftrag nicht abschließen.'
}

export class AgentError extends Error {
  constructor(message, detail = '') {
    super(message)
    this.detail = detail
  }
}

// ---------------------------------------------------------------------------
// Startet die KI und meldet jeden Arbeitsschritt über onEvent.
// ---------------------------------------------------------------------------
export function runAgent({ profile = 'read', model, effort, system, prompt, schema, onEvent, timeoutMs = 5 * 60000 }) {
  const rights = PROFILES[profile]
  const args = [
    '-p',
    '--output-format', 'stream-json',
    '--verbose',
    '--no-session-persistence',
    '--strict-mcp-config',
    '--mcp-config', '{"mcpServers":{}}',
    '--setting-sources', 'project,local',
    '--disable-slash-commands',
    '--permission-mode', 'dontAsk',
    '--permission-prompts', 'none',
    '--tools', rights.tools.join(','),
    '--allowedTools', rights.allowed.join(','),
  ]
  if (rights.denied.length) args.push('--disallowedTools', rights.denied.join(','))
  if (model) args.push('--model', model)
  if (effort) args.push('--effort', effort)
  if (system) args.push('--append-system-prompt', system)
  if (schema) args.push('--json-schema', JSON.stringify(schema))

  const child = spawn('claude', args, {
    cwd: ROOT,
    env: cleanEnv(),
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  })

  let canceled = false
  const promise = new Promise((resolve, reject) => {
    let buffer = ''
    let stderr = ''
    let result = null
    let structured = null

    const timer = setTimeout(() => {
      canceled = 'timeout'
      killTree(child)
    }, timeoutMs)

    function handle(event) {
      if (event.type === 'assistant') {
        for (const block of event.message?.content ?? []) {
          if (block.type === 'text' && block.text.trim()) {
            onEvent?.({ kind: 'narration', text: block.text.trim() })
          } else if (block.type === 'tool_use') {
            if (block.name === 'StructuredOutput') {
              structured = block.input
            } else {
              onEvent?.({ kind: 'step', ...describeTool(block.name, block.input) })
            }
          }
        }
      } else if (event.type === 'result') {
        result = event
      }
    }

    child.stdout.on('data', (chunk) => {
      buffer += chunk.toString('utf8')
      let index
      while ((index = buffer.indexOf('\n')) >= 0) {
        const line = buffer.slice(0, index).trim()
        buffer = buffer.slice(index + 1)
        if (!line) continue
        try {
          handle(JSON.parse(line))
        } catch {
          // Einzelne nicht lesbare Zeilen sind unkritisch: Das Ergebnis kommt separat.
        }
      }
    })
    child.stderr.on('data', (chunk) => {
      stderr = (stderr + chunk.toString('utf8')).slice(-4000)
    })
    child.on('error', (err) => {
      clearTimeout(timer)
      reject(
        new AgentError(
          err.code === 'ENOENT' ? 'Die KI-Anbindung „claude“ ist auf diesem Rechner nicht installiert.' : friendlyError(err.message),
          err.message,
        ),
      )
    })
    child.on('close', () => {
      clearTimeout(timer)
      if (canceled === 'timeout') return reject(new AgentError('Die KI hat die Zeitvorgabe überschritten.'))
      if (canceled) return reject(new AgentError('Der Auftrag wurde abgebrochen.'))
      if (!result) return reject(new AgentError(friendlyError(stderr), stderr))
      if (result.is_error) {
        return reject(new AgentError(friendlyError(`${result.result ?? ''} ${stderr}`), result.result ?? result.subtype))
      }
      resolve({
        structured: result.structured_output ?? structured,
        text: result.result ?? '',
        costUsd: result.total_cost_usd ?? 0,
        durationMs: result.duration_ms ?? 0,
        turns: result.num_turns ?? 0,
        denials: (result.permission_denials ?? []).map((d) => d.tool_name),
      })
    })

    child.stdin.on('error', () => {})
    child.stdin.end(prompt)
  })

  return {
    promise,
    cancel() {
      canceled = true
      killTree(child)
    },
  }
}
