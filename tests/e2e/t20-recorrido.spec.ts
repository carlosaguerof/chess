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
  // Aprender (Nota 1): "Aperturas y defensas", vacía la primera vez, con su botón a Todas
  await page.goto('/#/cursos')
  await expect(page.getByTestId('ir-a-todas')).toBeVisible()
  await captura(page, info, 't20-aprender')
  // Tus datos (exportar e importar, en el menú Más)
  await page.goto('/#/datos')
  await expect(page.getByTestId('exportar')).toBeVisible()
  await captura(page, info, 't20-repertorio-menu')
  // el motor tarda en cargar: se ve que está cargando (N1)
  await page.route('**/motor/*.wasm', async (r) => {
    await new Promise((listo) => setTimeout(listo, 4000))
    await r.continue()
  })
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=')
  await jugar(page, info, 'a2a3')
  await expect(page.getByTestId('barra-rival')).toContainText(/Preparando|cargando/i, { timeout: 3000 })
  await captura(page, info, 't20-motor-cargando')
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(2, { timeout: 20_000 })
  await page.unroute('**/motor/*.wasm')
  // el motor que no carga (en una página nueva, sin el motor ya cargado): el aviso dice qué pasó y qué hacer (N9)
  await page.goto('about:blank')
  await page.route('**/motor/*.wasm', (r) => r.abort())
  await page.route('**/motor/*.js', (r) => r.abort())
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=')
  await jugar(page, info, 'e2e4')
  await expect(page.getByTestId('error-motor')).toBeVisible({ timeout: 20_000 })
  await captura(page, info, 't20-error-motor')
})
