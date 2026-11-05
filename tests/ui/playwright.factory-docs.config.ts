import { defineConfig, devices } from '@playwright/test'

// Konfiguration für die Dokumentations-Screenshots der Software Factory (kein Test).
// Aufruf: npx playwright test -c playwright.factory-docs.config.ts factory-shell-cockpit.shots.ts
export default defineConfig({
  testDir: './docs',
  testMatch: '**/factory-*.shots.ts',
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
