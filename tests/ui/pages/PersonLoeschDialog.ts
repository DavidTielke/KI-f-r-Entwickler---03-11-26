import { Locator, Page } from '@playwright/test'
import { PersonSeed } from '../fixtures/seed'

// Page Object für den Lösch-Bestätigungsdialog einer Person (App.jsx).
// Im Personen-Kontext ist er der einzige offene role="dialog".
// Keine Assertions — die gehören in die Tests.
export class PersonLoeschDialog {
  private readonly page: Page
  readonly dialog: Locator
  readonly cancelButton: Locator
  readonly deleteButton: Locator

  constructor(page: Page) {
    this.page = page
    this.dialog = page.getByRole('dialog').filter({ hasText: /Person löschen/ })
    this.cancelButton = this.dialog.getByRole('button', { name: 'Abbrechen' })
    this.deleteButton = this.dialog.getByRole('button', { name: 'Löschen', exact: true })
  }

  /** Zeilen-Aktion „Löschen" → öffnet den Bestätigungsdialog für die Person. */
  open(person: PersonSeed): Promise<void> {
    return this.page.getByRole('button', { name: `Person ${person.id} löschen` }).click()
  }

  confirm(): Promise<void> {
    return this.deleteButton.click()
  }

  cancel(): Promise<void> {
    return this.cancelButton.click()
  }
}
