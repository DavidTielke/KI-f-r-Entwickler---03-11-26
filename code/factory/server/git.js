import { execFile } from 'node:child_process'
import { ROOT, modelLabel } from './config.js'

function run(args, { literal = false } = {}) {
  const full = ['-c', 'core.quotepath=false', ...(literal ? ['--literal-pathspecs'] : []), ...args]
  return new Promise((resolve, reject) => {
    execFile(
      'git',
      full,
      { cwd: ROOT, maxBuffer: 64 * 1024 * 1024, encoding: 'utf8', windowsHide: true },
      (err, stdout, stderr) => {
        if (err) {
          err.message = stderr?.trim() || err.message
          reject(err)
        } else {
          resolve(stdout)
        }
      },
    )
  })
}

// Schreibende Git-Befehle laufen nacheinander, damit sich nie zwei Vorgänge
// gleichzeitig um den Git-Index streiten.
let lock = Promise.resolve()
function exclusive(fn) {
  const next = lock.then(fn, fn)
  lock = next.catch(() => {})
  return next
}

export async function head() {
  return (await run(['rev-parse', '--short', 'HEAD'])).trim()
}

export async function status(pathspecs, { literal = false } = {}) {
  const out = await run(['status', '--porcelain=v1', '-z', '-uall', '--no-renames', '--', ...pathspecs], { literal })
  return out
    .split('\0')
    .filter(Boolean)
    .map((entry) => ({ code: entry.slice(0, 2), path: entry.slice(3) }))
}

export function commitPaths(paths, subject, { body = '', model = null } = {}) {
  return exclusive(async () => {
    const changed = (await status(paths, { literal: true })).map((entry) => entry.path)
    if (changed.length === 0) return null
    const trailer = `Co-Authored-By: Claude ${model ? modelLabel(model) : 'Opus 5.5'} <noreply@anthropic.com>`
    const message = [subject, body, trailer].filter(Boolean).join('\n\n')
    await run(['add', '-A', '--', ...changed], { literal: true })
    await run(['commit', '-m', message, '--', ...changed], { literal: true })
    return head()
  })
}

export function discard(pathspecs) {
  return exclusive(async () => {
    await run(['restore', '--source=HEAD', '--staged', '--worktree', '--', ...pathspecs])
    await run(['clean', '-fd', '--', ...pathspecs])
  })
}

export function revert(hashes) {
  return exclusive(async () => {
    try {
      await run(['revert', '--no-edit', ...hashes])
    } catch (err) {
      await run(['revert', '--abort']).catch(() => {})
      throw err
    }
    return head()
  })
}

export async function fileHistory(file, limit = 15) {
  const out = await run(['log', `-${limit}`, '--follow', '--format=%h%x1f%aI%x1f%s', '--', file])
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, at, subject] = line.split('\x1f')
      return { hash, at, subject }
    })
}

// Wurde die Datei jemals mit dem Status „Implemented“ eingecheckt?
export async function wasEverImplemented(file) {
  // --follow: Ein Titelwechsel benennt die Datei um, der frühere Stand zählt trotzdem.
  const out = await run(['log', '--follow', '--format=%h', '-S', '**State:** Implemented', '--', file])
  return out.trim().length > 0
}

export async function changeStats(hash) {
  const out = await run(['show', '--numstat', '--format=', '--no-renames', hash])
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [added, removed, ...rest] = line.split('\t')
      return { added: Number(added) || 0, removed: Number(removed) || 0, path: rest.join('\t') }
    })
}

export async function recentCommits(limit = 200) {
  const out = await run(['log', `-${limit}`, '--format=%h%x1f%aI%x1f%an%x1f%s'])
  return out
    .split('\n')
    .filter(Boolean)
    .map((line) => {
      const [hash, at, author, subject] = line.split('\x1f')
      return { hash, at, author, subject }
    })
}

// Änderungen je Tag an Anwendung, Anforderungen und Ideen (ohne die Factory selbst).
export async function dailyActivity(days = 14) {
  const out = await run([
    'log',
    `--since=${days} days ago`,
    '--format=%aI',
    '--',
    'code',
    'specs',
    'ideas',
    ':(exclude)code/factory',
    ':(exclude)specs/E3 Software Factory',
  ])
  const counts = new Map()
  for (const line of out.split('\n').filter(Boolean)) {
    const day = line.slice(0, 10)
    counts.set(day, (counts.get(day) ?? 0) + 1)
  }
  const result = []
  for (let offset = days - 1; offset >= 0; offset--) {
    const date = new Date(Date.now() - offset * 86400000).toISOString().slice(0, 10)
    result.push({ day: date, count: counts.get(date) ?? 0 })
  }
  return result
}

export async function userName() {
  try {
    return (await run(['config', 'user.name'])).trim()
  } catch {
    return ''
  }
}
