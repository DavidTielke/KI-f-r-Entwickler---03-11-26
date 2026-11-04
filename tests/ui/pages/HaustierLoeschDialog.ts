import { Locator, Page } from '@playwright/test'

// Page Object für den Lösch-Bestätigungsdialog von Haustieren (F4 S2).
// Keine Assertions — die gehören in die Tests, weil dort die Kriterien stehen.
export class HaustierLoeschDialog {
  readonly page: Page
  readonly dialog: Locator
  readonly cancel: Locator
  readonly confirm: Locator

  constructor(page: Page) {
    this.page = page
    this.dialog = page.getByRole('dialog')
    this.cancel = this.dialog.getByRole('button', { name: 'Abbrechen' })
    this.confirm = this.dialog.getByRole('button', { name: 'Löschen' })
  }

  async pressEscape(): Promise<void> {
    await this.page.keyboard.press('Escape')
  }

  // Das Dialogfenster ist in einem 1280x720-Viewport zentriert (Breite max. 420 px);
  // die obere linke Ecke des Viewports liegt auf der Backdrop.
  async clickBackdrop(): Promise<void> {
    await this.page.mouse.click(10, 10)
  }
}
