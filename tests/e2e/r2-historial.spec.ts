import { expect, test } from '@playwright/test'
import { captura, jugar, tocar } from './_util.ts'

test('R2 · las partidas terminadas quedan en "Mis partidas", con dónde me salgo más', async ({ page }, info) => {
  // mi repertorio (Nota 1): la Caro-Kann en mis favoritas
  await page.addInitScript(() => localStorage.setItem('ajedrez.v1.favoritas', JSON.stringify(['caro-kann:b'])))
  await page.goto('/#/historial')
  await expect(page.getByText('Todavía no terminas ninguna partida')).toBeVisible()
  // 1) una que gano (mate del pastor preparado)
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=e2e4,e7e5,d1h5,b8c6,f1c4,g8f6')
  await jugar(page, info, 'h5f7')
  await expect(page.getByTestId('aviso-final')).toContainText('¡Ganaste!')
  // 2) una donde me salgo de mi Caro-Kann (3...e6 en vez de 3...Af5) y me rindo
  await page.goto('/#/prueba-partida?bot=brisa&color=b&guia=1&mislineas=0&jugadas=e2e4,c7c6,d2d4,d7d5,e4e5')
  await tocar(page, info, 'e7')
  await tocar(page, info, 'e6')
  await page.getByTestId('seguir-desvio').click()
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(7, { timeout: 15_000 })
  await page.getByTestId('rendirse').click()
  await page.getByRole('dialog', { name: '¿Rendirte?' }).getByRole('button', { name: 'Rendirme' }).click()
  await expect(page.getByTestId('aviso-final')).toBeVisible()
  // en el historial (desde el menú Más)
  await page.goto('/#/historial')
  await expect(page.getByTestId('partida-historial')).toHaveCount(2)
  await expect(page.getByTestId('totales')).toContainText('1 ganada · 1 perdida · 0 tablas')
  await expect(page.getByTestId('partida-historial').first()).toHaveAttribute('data-resultado', 'perdi')
  await expect(page.getByTestId('donde-me-salgo')).toContainText('Variante del Avance')
  await expect(page.getByTestId('donde-me-salgo')).toContainText('1 vez')
  await captura(page, info, 'r2-historial')
  // se recuerda al recargar
  await page.reload()
  await expect(page.getByTestId('partida-historial')).toHaveCount(2)
})
