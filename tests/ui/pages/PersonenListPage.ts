import { Locator, Page } from '@playwright/test'
import { PersonSeed } from '../fixtures/seed'

// Page Object für die Personen-Übersicht (Tabelle + Top-Bar).
// Keine Assertions — die gehören in die Tests, weil dort die Kriterien stehen.
export class PersonenListPage {
  private readonly page: Page
  readonly table: Locator
  readonly createButton: Locator

  constructor(page: Page) {
    this.page = page
    this.table = page.getByRole('table')
    this.createButton = page.getByRole('button', { name: 'Anlegen' })
  }

  async open(): Promise<void> {
    await this.page.goto('/')
  }

  row(name: string): Locator {
    return this.table.getByRole('row', { name })
  }

  columnHeader(name: string | RegExp): Locator {
    return this.table.getByRole('columnheader', { name })
  }

  openCreateDialog(): Promise<void> {
    return this.createButton.click()
  }

  // --- Ergänzungen für E1 (Bestand-Mitglieder bleiben unverändert) ---

  editButton(person: PersonSeed): Locator {
    return this.row(person.name).getByRole('button', { name: `Person ${person.id} bearbeiten` })
  }

  deleteButton(person: PersonSeed): Locator {
    return this.row(person.name).getByRole('button', { name: `Person ${person.id} löschen` })
  }

  moveButton(name: string, direction: 'oben' | 'unten'): Locator {
    return this.row(name).getByRole('button', { name: `${name} nach ${direction} verschieben` })
  }

  grip(name: string): Locator {
    return this.row(name).getByTitle('Ziehen, um die Reihenfolge zu ändern')
  }

  openEdit(person: PersonSeed): Promise<void> {
    return this.editButton(person).click()
  }

  openDelete(person: PersonSeed): Promise<void> {
    return this.deleteButton(person).click()
  }
}
