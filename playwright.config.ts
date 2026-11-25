import { createHash } from 'node:crypto'
import { defineConfig, devices } from '@playwright/test'

/**
 * El puerto del servidor de pruebas (cierre de los cursos, 2026-11-25, §3.4). En la Air trabajan varias copias del repo a
 * la vez: con el 5174 fijo y `reuseExistingServer`, una copia podía probar sin aviso el servidor de otra
 * (`iterations/v4/learning.md` n.º 8). Fuera de CI, cada copia usa su propio puerto, sacado de su carpeta (del 5200 al
 * 5899), y nunca reutiliza un servidor que no levantó ella: si el puerto ya está ocupado, Playwright se detiene y lo dice.
 * En CI (GitHub) no cambia nada: el 5174, como siempre. `PUERTO_PRUEBAS=<n>` lo fija a mano.
 */
const enCI = !!process.env.CI
const puertoDeLaCopia = () => 5200 + (parseInt(createHash('sha1').update(process.cwd()).digest('hex').slice(0, 8), 16) % 700)
export const PUERTO = Number(process.env.PUERTO_PRUEBAS) || (enCI ? 5174 : puertoDeLaCopia())
const URL_PRUEBAS = `http://localhost:${PUERTO}`

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  // las mediciones (@medicion) se corren aparte con `npm run medir`; las capturas de la v2 (@capturas), con `CAPTURAS=antes|despues`; las de las marcas (@marcas), con `--grep @marcas`
  grepInvert: process.argv.includes('--grep') ? undefined : /@medicion|@capturas|@marcas/,
  outputDir: './test-results',
  use: {
    baseURL: URL_PRUEBAS,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --port ${PUERTO}`,
    url: URL_PRUEBAS,
    reuseExistingServer: enCI,
    timeout: 60_000,
  },
  projects: [
    {
      name: 'iphone',
      use: { ...devices['iPhone 14'], browserName: 'webkit', viewport: { width: 390, height: 844 } },
    },
    {
      name: 'escritorio',
      use: { ...devices['Desktop Chrome'], browserName: 'chromium', viewport: { width: 1440, height: 900 } },
    },
  ],
})
