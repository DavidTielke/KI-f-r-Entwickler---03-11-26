import { Locator, Page } from '@playwright/test'

// Page Object für die Haustiere-Übersicht (Navigation, Top-Bar, Tabelle).
// Keine Assertions — die gehören in die Tests, weil dort die Kriterien stehen.
export class HaustierListPage {
  readonly page: Page
  readonly nav: Locator
  readonly topbar: Locator
  readonly table: Locator
  readonly petsNavButton: Locator
  readonly personsNavButton: Locator

  constructor(page: Page) {
    this.page = page
    this.nav = page.getByRole('navigation', { name: 'Hauptnavigation' })
    this.topbar = page.getByRole('banner')
    this.table = page.getByRole('table')
    this.petsNavButton = this.nav.getByRole('button', { name: 'Haustiere' })
    this.personsNavButton = this.nav.getByRole('button', { name: 'Personen' })
  }

  async open(): Promise<void> {
    await this.page.goto('/')
    await this.openPetsView()
  }

  async openPetsView(): Promise<void> {
    await this.petsNavButton.click()
  }

  row(name: string): Locator {
    return this.table.getByRole('row', { name })
  }

  columnHeader(name: string | RegExp): Locator {
    return this.table.getByRole('columnheader', { name })
  }

  editButton(petId: number): Locator {
    return this.table.getByRole('button', { name: `Haustier ${petId} bearbeiten` })
  }

  deleteButton(petId: number): Locator {
    return this.table.getByRole('button', { name: `Haustier ${petId} löschen` })
  }

  // Zähler im Tabellenkopf: "Wird geladen ..." bzw. "{n} Haustiere" / "{n} Haustier".
  counter(text: string): Locator {
    return this.page.getByText(text, { exact: true })
  }
}
