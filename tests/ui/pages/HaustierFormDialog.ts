import { Locator, Page } from '@playwright/test'

// Page Object für den Anlegen-/Bearbeiten-Dialog von Haustieren (F2 S1 / F3 S2).
// Keine Assertions — die gehören in die Tests, weil dort die Kriterien stehen.
export class HaustierFormDialog {
  readonly page: Page
  readonly dialog: Locator
  readonly nameInput: Locator
  readonly speciesSelect: Locator
  readonly personSelect: Locator
  readonly close: Locator
  readonly cancel: Locator
  readonly submit: Locator

  constructor(page: Page) {
    this.page = page
    this.dialog = page.getByRole('dialog')
    this.nameInput = this.dialog.getByLabel('Name')
    this.speciesSelect = this.dialog.getByLabel('Spezies')
    this.personSelect = this.dialog.getByLabel('Person')
    this.close = this.dialog.getByRole('button', { name: 'Schließen' })
    this.cancel = this.dialog.getByRole('button', { name: 'Abbrechen' })
    this.submit = this.dialog.getByRole('button', { name: /Anlegen|Speichern|Wird gespeichert/ })
  }

  error(message: string): Locator {
    return this.dialog.getByText(message, { exact: true })
  }

  personOption(name: string): Locator {
    return this.personSelect.locator('option', { hasText: name })
  }

  speciesOption(name: string): Locator {
    return this.speciesSelect.locator('option', { hasText: name })
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  // Das Dialogfenster ist in einem 1280x720-Viewport mittig (Breite max. 520 px)
  // bzw. zentriert; die obere linke Ecke des Viewports liegt auf der Backdrop.
  async clickBackdrop(): Promise<void> {
    await this.page.mouse.click(10, 10)
  }
}
