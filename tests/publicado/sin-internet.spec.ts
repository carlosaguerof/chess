import { expect, test } from '@playwright/test'
import { jugar } from '../e2e/_util.ts'

test('R1 · instalable (manifiesto y service worker) y, sin red, la app carga y el bot juega', async ({ page, context }, info) => {
  await page.addInitScript(() => localStorage.setItem('ajedrez.v1.opciones-partida', JSON.stringify({ guia: false, misLineas: false })))
  await page.goto('./')
  // el manifiesto
  const href = await page.locator('link[rel="manifest"]').getAttribute('href')
  expect(href).toBeTruthy()
  const manifiesto = await (await page.request.get(href!)).json()
  expect(manifiesto.display).toBe('standalone')
  expect(manifiesto.icons.length).toBeGreaterThan(0)
  // el service worker, activo
  await page.waitForFunction(async () => !!(await navigator.serviceWorker.ready).active, null, { timeout: 20_000 })
  // una primera partida para que el motor quede guardado
  await page.getByTestId('jugar-recomendado').click()
  await jugar(page, info, 'e2e4')
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(2, { timeout: 30_000 })
  // sin red
  await context.setOffline(true)
  await page.goto('./')
  await expect(page.getByTestId('jugar-recomendado')).toBeVisible()
  await page.getByTestId('jugar-recomendado').click()
  await page.getByRole('dialog', { name: '¿Empezar otra partida?' }).getByRole('button', { name: 'Empezar otra' }).click()
  // 1.a3 está fuera del libro de Brisa: contesta el motor, cargado sin red
  await jugar(page, info, 'a2a3')
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(2, { timeout: 30_000 })
  await expect(page.getByTestId('partida')).toHaveAttribute('data-motor', /Stockfish/)
  await context.setOffline(false)
})
