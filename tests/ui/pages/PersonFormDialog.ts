import { Locator, Page } from '@playwright/test'
import { PersonSeed } from '../fixtures/seed'

// Page Object für den Anlegen-/Bearbeiten-Dialog (PersonForm).
// Der Dialog ist im Personen-Kontext der einzige offene role="dialog"; er wird
// daher über die Rolle angesprochen (sein accessible Name ist leer, der Titel
// ist ein dt-modal__title-Div, kein ARIA-Label).
// Keine Assertions — die gehören in die Tests.
export class PersonFormDialog {
  private readonly page: Page
  readonly dialog: Locator
  readonly nameField: Locator
  readonly ageField: Locator
  readonly petField: Locator
  readonly closeButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.dialog = page.getByRole('dialog')
    this.nameField = this.dialog.getByLabel('Name')
    this.ageField = this.dialog.getByLabel('Alter')
    this.petField = this.dialog.getByLabel('Haustier')
    this.closeButton = this.dialog.getByRole('button', { name: 'Schließen' })
    this.cancelButton = this.dialog.getByRole('button', { name: 'Abbrechen' })
  }

  /** Primäraktion „Anlegen" in der Kopfzeile → öffnet den Anlegen-Dialog. */
  async openCreate(): Promise<void> {
    await this.page.getByRole('button', { name: 'Anlegen', exact: true }).click()
  }

  /** Zeilen-Aktion „Bearbeiten" → öffnet den Bearbeiten-Dialog für die Person. */
  async openEdit(person: PersonSeed): Promise<void> {
    await this.page.getByRole('button', { name: `Person ${person.id} bearbeiten` }).click()
  }

  async fill(name: string, age: string): Promise<void> {
    await this.nameField.fill(name)
    await this.ageField.fill(age)
  }

  /** Haustier-Option anhand ihres Beschriftungstextes „Name (Species)" wählen. */
  async selectPet(option: string): Promise<void> {
    await this.petField.selectOption({ label: option })
  }

  /** Option „Kein Haustier" (Value leer) wählen. */
  async clearPet(): Promise<void> {
    await this.petField.selectOption({ index: 0 })
  }

  /** Submit-Button des Dialogs („Anlegen" oder „Speichern") drücken. */
  submit(label: string): Promise<void> {
    return this.dialog.getByRole('button', { name: label }).click()
  }
}
