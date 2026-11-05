import { defineConfig, devices } from '@playwright/test'

// Konfiguration für die Dokumentations-Screenshots der Anforderungen (kein Test).
// Aufruf: npx playwright test -c playwright.docs-factory-anforderungen.config.ts
export default defineConfig({
  testDir: './docs',
  testMatch: '**/factory-anforderungen.shots.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  outputDir: './test-results-docs-anforderungen',
  use: {
    ...devices['Desktop Chrome'],
    baseURL: 'http://localhost:4000',
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
    locale: 'de-DE',
    timezoneId: 'Europe/Berlin',
    colorScheme: 'light',
    reducedMotion: 'reduce',
  },
})
