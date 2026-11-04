import fs from 'node:fs'
import path from 'node:path'
import { DATA_DIR, SETTINGS_DEFAULTS } from './config.js'

// OneDrive und Virenscanner sperren Dateien kurzzeitig. Solche Sperren werden
// abgewartet, statt den Vorgang scheitern zu lassen.
function withRetry(fn) {
  for (let attempt = 0; ; attempt++) {
    try {
      return fn()
    } catch (err) {
      const transient = ['EBUSY', 'EPERM', 'EACCES', 'UNKNOWN'].includes(err.code)
      if (!transient || attempt >= 6) throw err
      Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, 60 * (attempt + 1))
    }
  }
}

export function writeText(file, text) {
  fs.mkdirSync(path.dirname(file), { recursive: true })
  const tmp = `${file}.tmp`
  withRetry(() => fs.writeFileSync(tmp, text, 'utf8'))
  withRetry(() => fs.renameSync(tmp, file))
}

export function readText(file) {
  return withRetry(() => fs.readFileSync(file, 'utf8'))
}

export function removeFile(file) {
  withRetry(() => fs.rmSync(file, { force: true }))
}

export function renameFile(from, to) {
  fs.mkdirSync(path.dirname(to), { recursive: true })
  withRetry(() => fs.renameSync(from, to))
}

export function readJson(file, fallback = null) {
  try {
    return JSON.parse(readText(file))
  } catch (err) {
    if (err.code === 'ENOENT') return fallback
    throw err
  }
}

export function writeJson(file, value) {
  writeText(file, JSON.stringify(value, null, 2))
}

export function dataPath(...parts) {
  return path.join(DATA_DIR, ...parts)
}

export function listJson(dir) {
  const full = dataPath(dir)
  if (!fs.existsSync(full)) return []
  return fs
    .readdirSync(full)
    .filter((name) => name.endsWith('.json'))
    .map((name) => readJson(path.join(full, name)))
    .filter(Boolean)
}

export function getSettings() {
  return { ...SETTINGS_DEFAULTS, ...readJson(dataPath('settings.json'), {}) }
}

export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch }
  writeJson(dataPath('settings.json'), next)
  return next
}

// Protokoll aller fachlichen Ereignisse (Grundlage der Seite „Verlauf“).
export function logEvent(type, title, ref = null) {
  const entry = { at: new Date().toISOString(), type, title, ref }
  const file = dataPath('events.jsonl')
  fs.mkdirSync(path.dirname(file), { recursive: true })
  withRetry(() => fs.appendFileSync(file, `${JSON.stringify(entry)}\n`, 'utf8'))
  return entry
}

export function readEvents() {
  try {
    return readText(dataPath('events.jsonl'))
      .split('\n')
      .filter(Boolean)
      .map((line) => JSON.parse(line))
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}
