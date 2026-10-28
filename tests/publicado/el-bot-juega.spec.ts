import { expect, test } from '@playwright/test'
import { jugar } from '../e2e/_util.ts'

test('el sitio con la ruta /chess/ abre la app, el motor carga y el bot juega', async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem('ajedrez.v1.opciones-partida', JSON.stringify({ guia: true, misLineas: false })))
  const r = await page.goto('./')
  expect(r?.status()).toBe(200)
  await page.getByTestId('jugar-recomendado').click()
  await jugar(page, info, 'e2e4')
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(2, { timeout: 30_000 })
  await expect(page.getByTestId('partida')).toHaveAttribute('data-motor', /Stockfish 19/)
  // el motor sale con su tipo correcto
  const wasm = await page.request.get('motor/stockfish-19-lite-single.wasm')
  expect(wasm.status()).toBe(200)
  expect(wasm.headers()['content-type']).toContain('application/wasm')
})
