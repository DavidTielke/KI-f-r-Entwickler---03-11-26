import path from 'node:path'
import { fileURLToPath } from 'node:url'

const here = path.dirname(fileURLToPath(import.meta.url))

export const FACTORY_DIR = path.resolve(here, '..')

// Alle Pfade lassen sich per Umgebungsvariable umlenken. So kann die Factory
// gegen eine Kopie des Repositories laufen, ohne den echten Stand anzufassen.
export const ROOT = path.resolve(process.env.FACTORY_REPO ?? path.join(FACTORY_DIR, '..', '..'))
export const DATA_DIR = path.resolve(process.env.FACTORY_DATA ?? path.join(FACTORY_DIR, 'data'))
export const PORT = Number(process.env.FACTORY_PORT ?? 4000)

export const SPECS_DIR = path.join(ROOT, 'specs')
export const IDEAS_DIR = path.join(ROOT, 'ideas')
export const HARNESS_DIR = path.join(ROOT, 'harness')

// Themenbereiche, die das Werkzeug selbst beschreiben. Sie erscheinen in der
// Oberfläche, zählen aber nicht in die Kennzahlen und lassen sich nicht über
// die Factory umsetzen: Sie würde sich sonst im laufenden Betrieb selbst ändern.
export const TOOL_EPICS = new Set(['Software Factory'])

// Der Geltungsbereich einer Umsetzung im Repository.
export const DELIVERY_PATHSPECS = ['code', ':(exclude)code/factory', 'specs', 'docker-compose.yml']

export const SETTINGS_DEFAULTS = {
  dialogModel: 'claude-sonnet-5-5',
  buildModel: 'claude-opus-5-5',
  appUrl: process.env.FACTORY_APP_URL ?? 'http://localhost:3000',
  healthPaths: ['/', '/api/persons'],
}

export const MODELS = [
  { id: 'claude-haiku-5-5', label: 'Schnell', detail: 'Haiku 5.5' },
  { id: 'claude-sonnet-5-5', label: 'Ausgewogen', detail: 'Sonnet 5.5' },
  { id: 'claude-opus-5-5', label: 'Gründlich', detail: 'Opus 5.5' },
  { id: 'claude-fable-5-1', label: 'Maximal', detail: 'Fable 5.1' },
]

export function modelLabel(id) {
  return MODELS.find((m) => m.id === id)?.detail ?? id
}
