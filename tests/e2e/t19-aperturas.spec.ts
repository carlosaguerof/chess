import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'

test('Aperturas: en Todas abro la Caro-Kann, recorro hasta una subvariante, la guardo en favoritas y aparece ahí', async ({ page }, info) => {
  await page.goto('/#/cursos/todas')
  await captura(page, info, 't19-aperturas')
  await page.getByTestId('tarjeta-caro-kann:b').locator('a').click()
  await expect(page.getByRole('heading', { name: 'Defensa Caro-Kann' })).toBeVisible()
  // la Variante Tal del Avance: su línea, con 4.h4
  await page.getByTestId('variante').filter({ hasText: 'Variante Tal' }).click()
  await expect(page.getByTestId('linea')).toContainText('4.h4')
  await captura(page, info, 't19-caro-kann')
  // de regreso a la apertura, el corazón la guarda
  await page.locator('a.volver').click()
  await page.getByTestId('corazon-caro-kann:b').click()
  await expect(page.getByTestId('corazon-caro-kann:b')).toHaveAttribute('aria-pressed', 'true')
  // y aparece en mis favoritas
  await page.goto('/#/cursos')
  await expect(page.getByTestId('tarjeta-caro-kann:b')).toBeVisible()
})
