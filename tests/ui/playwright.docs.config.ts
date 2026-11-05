import { defineConfig, devices } from '@playwright/test'

// Konfiguration für die Dokumentations-Screenshots von E1 und E2 (kein Test).
// Aufruf: npx playwright test -c playwright.docs.config.ts personen.shots.ts
// Die Screenshots der Software Factory nutzen eigene Konfigurationen (playwright.factory-*.config.ts).
export default defineConfig({
  testDir: './docs',
  testMatch: '**/*.shots.ts',
  testIgnore: '**/factory-*.shots.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list']],
  use: {
    baseURL: process.env.UI_TEST_BASE_URL ?? 'http://localhost:8082',
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
