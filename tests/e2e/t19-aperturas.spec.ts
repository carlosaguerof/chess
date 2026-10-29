import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'
import { FAVORITAS_PRENDIDAS } from '../../src/aprender/interruptores.ts'

test('Aperturas: en Con negras abro la Caro-Kann y recorro hasta una subvariante (con favoritas, la guardo y aparece ahí)', async ({ page }, info) => {
  await page.goto(FAVORITAS_PRENDIDAS ? '/#/cursos/todas' : '/#/cursos/negras')
  await captura(page, info, 't19-aperturas')
  await page.getByTestId('tarjeta-caro-kann:b').locator('a').click()
  await expect(page.getByRole('heading', { name: 'Defensa Caro-Kann' })).toBeVisible()
  // la Variante Tal del Avance: su línea, con 4.h4
  await page.getByTestId('variante').filter({ hasText: 'Variante Tal' }).click()
  await expect(page.getByTestId('linea')).toContainText('4.h4')
  await captura(page, info, 't19-caro-kann')
  // de regreso a la apertura
  await page.locator('a.volver').click()
  await expect(page.getByRole('heading', { name: 'Defensa Caro-Kann' })).toBeVisible()
  // y de ahí a Aprender, a la pestaña de su color
  await page.locator('a.volver').click()
  if (!FAVORITAS_PRENDIDAS) {
    await expect(page.getByTestId('pestana-negras')).toHaveAttribute('aria-selected', 'true')
    return
  }
  await page.getByTestId('tarjeta-caro-kann:b').locator('a').click()
  // el corazón la guarda
  await page.getByTestId('corazon-caro-kann:b').click()
  await expect(page.getByTestId('corazon-caro-kann:b')).toHaveAttribute('aria-pressed', 'true')
  // y aparece en mis favoritas
  await page.goto('/#/cursos')
  await expect(page.getByTestId('tarjeta-caro-kann:b')).toBeVisible()
})
