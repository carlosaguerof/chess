import { expect, test } from '@playwright/test'
import { writeFileSync, mkdirSync } from 'node:fs'

// Medición (no es prueba de aceptación): `npm run medir`. Carga del motor y tiempo por jugada en cada perfil.
test('medir el motor en este navegador @medicion', async ({ page }, info) => {
  test.setTimeout(180_000)
  await page.goto('/#/medir-motor')
  await expect(page.getByTestId('medicion')).not.toHaveText('midiendo…', { timeout: 170_000 })
  const texto = await page.getByTestId('medicion').textContent()
  console.log(`[${info.project.name}] ${texto}`)
  mkdirSync('iterations/v1/mediciones', { recursive: true })
  writeFileSync(`iterations/v1/mediciones/motor-${info.project.name}.json`, texto ?? '')
  expect(texto).toContain('Stockfish 19')
})
