import { test as base, expect } from '@playwright/test'

// Erweiterter test-Export: vor jedem Test wird die Testdatenbank geleert und
// der Basisdatensatz aus fixtures/seed.ts neu eingespielt (bitgleich, inkl. IDs).
export const test = base.extend<{ seeded: void }>({
  seeded: [
    async ({ request }, use) => {
      const response = await request.post('/api/testdata/reset')
      expect(response.ok(), 'Seed der Testdatenbank fehlgeschlagen').toBeTruthy()
      await use()
    },
    { auto: true },
  ],
})

export { expect }
