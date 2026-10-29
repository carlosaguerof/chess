import { expect, test } from '@playwright/test'

/** Ajustes de la app (2026-10-28 y 29): la página publicada ya los trae. */
test('el sitio publicado trae Aprender por color, Respaldo en Ajustes, la guía para instalar y el ⓘ de cómo funciona', async ({ page }) => {
  await page.goto('./#/cursos')
  await expect(page.getByTestId('pestana-blancas')).toHaveText('Con blancas')
  await expect(page.locator('.tarjeta-apertura')).toHaveCount(6)
  await page.getByTestId('pestana-negras').click()
  await expect(page.locator('.tarjeta-apertura')).toHaveCount(3)
  await expect(page.locator('main')).not.toContainText(/Mis favoritas|Londres|Gambito/)
  // Refuerza sin fallos, en una línea
  await page.goto('./#/refuerza')
  await expect(page.getByTestId('refuerza-vacia')).toContainText('Aún no hay jugadas falladas.')
  // el ⓘ de cómo funciona
  await page.getByTestId('info-refuerza').click()
  await page.getByTestId('ver-como-funciona-refuerza').click()
  await expect(page.getByTestId('como-funciona')).toHaveAttribute('data-paso', '1')
  await page.getByTestId('como-funciona-fondo').click({ position: { x: 5, y: 5 } })
  // Más: sin "Tus datos" y con la guía para instalar
  await page.goto('./#/')
  await page.getByRole('button', { name: 'Más' }).click()
  await expect(page.getByRole('menuitem', { name: 'Tus datos' })).toHaveCount(0)
  await page.getByRole('menuitem', { name: 'Instalar en el iPhone' }).click()
  await expect(page.getByTestId('paso-instalar')).toHaveCount(7)
  // Ajustes → Respaldo: exportar baja el archivo
  await page.goto('./#/ajustes')
  await expect(page.getByTestId('respaldo')).toContainText('no hay nube')
  const descarga = page.waitForEvent('download')
  await page.getByTestId('exportar').click()
  expect((await descarga).suggestedFilename()).toMatch(/^mis-aperturas-.*\.json$/)
})
