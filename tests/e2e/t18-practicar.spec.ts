import { expect, test } from '@playwright/test'
import { captura, tocar } from './_util.ts'

test('del resumen con una salida de línea a "Practicar esta línea", y la práctica arranca en esa línea', async ({ page }, info) => {
  // con negras: 1.e4 c6 2.d4 d5 3.e5, y me salgo con 3...e6 (mi línea dice 3...Af5); la Caro-Kann en mis favoritas (Nota 1)
  await page.addInitScript(() => localStorage.setItem('ajedrez.v1.favoritas', JSON.stringify(['caro-kann:b'])))
  await page.goto('/#/prueba-partida?bot=brisa&color=b&guia=1&mislineas=0&jugadas=e2e4,c7c6,d2d4,d7d5,e4e5')
  await tocar(page, info, 'e7')
  await tocar(page, info, 'e6')
  await expect(page.getByTestId('mensaje-guia')).toHaveAttribute('data-tipo', 'desvio')
  await page.getByTestId('seguir-desvio').click()
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(7, { timeout: 15_000 })
  await page.getByTestId('rendirse').click()
  await page.getByRole('dialog', { name: '¿Rendirte?' }).getByRole('button', { name: 'Rendirme' }).click()
  await expect(page.getByTestId('resumen-aviso')).toContainText('te saliste tú')
  await captura(page, info, 't18-resumen')
  await page.getByTestId('practicar-linea').click()
  await expect(page.getByTestId('leccion-pantalla')).toBeVisible()
  await expect(page.getByTestId('nombre-linea')).toContainText('Variante del Avance')
  await expect(page.getByTestId('instruccion')).toContainText('Juega 1...c6')
})
