import { defineConfig, devices } from '@playwright/test'

// Konfiguration für die Screenshots der Anwenderdokumentation (Software Factory: Umsetzung und Verlauf).
// Aufruf: npx playwright test -c playwright.docs-factory-umsetzung.config.ts
export default defineConfig({
  testDir: './docs',
  testMatch: '**/factory-umsetzung.shots.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4000',
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    colorScheme: 'light',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
    },
  ],
})
