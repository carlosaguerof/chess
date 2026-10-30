import { defineConfig, devices } from '@playwright/test'

/**
 * Pruebas contra el sitio construido con la ruta /chess/ (notas 6 y 8).
 * Por defecto: `npm run build:pages` servido en local en http://localhost:4174/chess/.
 * Contra la página publicada: SITIO=https://carlosaguerof.github.io/chess/ npm run e2e:pages
 */
const sitio = process.env.SITIO
export default defineConfig({
  testDir: './tests/publicado',
  workers: 1,
  timeout: 90_000,
  expect: { timeout: 20_000 },
  reporter: [['list']],
  outputDir: './test-results-publicado',
  use: { baseURL: sitio ?? 'http://localhost:4174/chess/', trace: 'retain-on-failure' },
  webServer: sitio
    ? undefined
    : { command: 'npm run build:pages && npx vite preview --base=/chess/ --outDir dist-pages --port 4174 --strictPort', url: 'http://localhost:4174/chess/', reuseExistingServer: false, timeout: 120_000 },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 14'], browserName: 'webkit', viewport: { width: 390, height: 844 } } },
    { name: 'escritorio', use: { ...devices['Desktop Chrome'], browserName: 'chromium', viewport: { width: 1440, height: 900 } } },
  ],
})
