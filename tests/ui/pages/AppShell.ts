import { Locator, Page } from '@playwright/test'

// Page Object für die App-Shell: Sidebar (Markierung, Navigation, Nutzer-Chip)
// und Kopfzeile (Kicker, Titel, Primäraktion).
// Keine Assertions — die gehören in die Tests.
export class AppShell {
  private readonly page: Page
  readonly sidebar: Locator
  readonly nav: Locator
  readonly personNav: Locator
  readonly petNav: Locator
  readonly topbar: Locator
  readonly title: Locator
  readonly primaryAction: Locator

  constructor(page: Page) {
    this.page = page
    this.sidebar = page.getByRole('complementary')
    this.nav = page.getByRole('navigation', { name: 'Hauptnavigation' })
    this.personNav = this.nav.getByRole('button', { name: /^Personen/ })
    this.petNav = this.nav.getByRole('button', { name: /^Haustiere/ })
    this.topbar = page.getByRole('banner')
    this.title = page.getByRole('heading', { level: 1 })
    this.primaryAction = this.topbar.getByRole('button', { name: 'Anlegen' })
  }

  async openPersons(): Promise<void> {
    await this.personNav.click()
  }

  async openPets(): Promise<void> {
    await this.petNav.click()
  }

  /** Navigationsgruppe-Label „Stammdaten". */
  navGroupLabel(): Locator {
    return this.nav.getByText('Stammdaten')
  }

  /** Kicker „Stammdaten" über dem Seitentitel. */
  kicker(): Locator {
    return this.topbar.getByText('Stammdaten')
  }

  /** Nutzer-Chip im Sidebar-Fuß. */
  userAvatar(): Locator {
    return this.page.getByText('DT', { exact: true })
  }

  userName(): Locator {
    return this.page.getByText('David Tielke', { exact: true })
  }

  userRole(): Locator {
    return this.page.getByText('Administration', { exact: true })
  }
}
