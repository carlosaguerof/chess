import { expect, test } from '@playwright/test'
import { captura, jugar } from './_util.ts'

/** T20: capturas de las pantallas que ninguna otra prueba retrata, para la revisión de UX pantalla por pantalla. */
test('T20 · recorrido de pantallas que faltaban en las capturas', async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem('ajedrez.v1.opciones-partida', JSON.stringify({ guia: false, misLineas: false })))
  // el menú Más, y se cierra al cambiar de pantalla
  await page.goto('/')
  await page.getByRole('button', { name: 'Más' }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  await captura(page, info, 't20-menu-mas')
  await page.goto('/#/bots')
  await expect(page.getByRole('menu')).toHaveCount(0)
  // Mis partidas, vacío
  await page.goto('/#/historial')
  await expect(page.getByText('Todavía no terminas ninguna partida')).toBeVisible()
  await captura(page, info, 't20-historial-vacio')
  // Aprender, con el enlace a la base
  await page.goto('/#/cursos')
  await expect(page.getByTestId('ver-aperturas')).toBeVisible()
  await captura(page, info, 't20-aprender')
  // Repertorio: el menú de opciones (el de cada línea sale en las capturas de la T10)
  await page.goto('/#/repertorio')
  await page.getByTestId('menu-repertorio').click()
  await expect(page.getByTestId('importar-pgn')).toBeVisible()
  await captura(page, info, 't20-repertorio-menu')
  // el motor que no carga: el aviso dice qué pasó y qué hacer (N9)
  await page.route('**/motor/*.wasm', (r) => r.abort())
  await page.route('**/motor/*.js', (r) => r.abort())
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=')
  await jugar(page, info, 'e2e4')
  await expect(page.getByTestId('error-motor')).toBeVisible({ timeout: 20_000 })
  await captura(page, info, 't20-error-motor')
})
