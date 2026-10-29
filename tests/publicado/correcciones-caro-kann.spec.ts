import { expect, test } from '@playwright/test'
import { jugar } from '../e2e/_util.ts'

/**
 * Correcciones de la Caro-Kann (C4, 2026-10-29): en la página publicada, lo de C1 a C3. Las coordenadas en el tablero
 * de leer, "Ver paso a paso", y Practicar sin texto de tu jugada, con la explicación después de jugarla.
 */
test('La idea: coordenadas en el tablero y "Ver paso a paso"', async ({ page }) => {
  const r = await page.goto('./#/curso/caro-kann%3Ab/leer/idea')
  expect(r?.status()).toBe(200)
  const tablero = page.getByTestId('tablero-leer')
  await expect(tablero.locator('coords.files coord')).toHaveCount(8)
  await expect(tablero.locator('coords.ranks coord')).toHaveCount(8)
  await page.getByTestId('ver-paso-a-paso').click()
  await expect(page.getByTestId('paso-a-paso-frase')).toHaveText('Blancas abre con 1.e4: ocupa el centro.')
  await expect(page.getByTestId('tablero-paso-a-paso')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/4P3\//)
  await page.getByTestId('pap-siguiente').click()
  await expect(page.getByTestId('paso-a-paso')).toHaveAttribute('data-paso', '2')
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('paso-a-paso')).toHaveCount(0)
})

test('Practicar: en tu turno solo la jugada del rival; la explicación, después de jugar', async ({ page }, info) => {
  await page.goto('./#/')
  await page.evaluate(() => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea: 'v:avance-tal', vuelta: 'practicar', ply: 5, fecha: Date.now() } })))
  await page.goto('./#/curso/caro-kann%3Ab/linea/' + encodeURIComponent('v:avance-tal'))
  const leccion = page.getByTestId('leccion-curso')
  await expect(leccion).toHaveAttribute('data-momento', 'tuTurno')
  await expect(leccion).toHaveAttribute('data-vuelta', 'practicar')
  const narracion = page.getByTestId('narracion')
  await expect(narracion.locator('.mensaje-curso')).toHaveCount(1)
  await expect(narracion.locator('[data-tipo="rival"]')).toContainText('3.e5')
  await jugar(page, info, 'c8f5')
  await expect(leccion).toHaveAttribute('data-momento', 'leer')
  await expect(narracion.locator('[data-tipo="explica"]').first()).toContainText('Sacas tu alfil')
  await expect(page.getByTestId('siguiente')).toBeVisible()
})
