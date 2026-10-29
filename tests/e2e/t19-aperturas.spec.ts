import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'
import { FAVORITAS_PRENDIDAS } from '../../src/aprender/interruptores.ts'

// la Caro-Kann tiene su página nueva (C6, tests/e2e/c6-pantallas.spec.ts); aquí, la página de antes con la Eslava
test('Aperturas: en Con negras abro la Eslava y recorro hasta una subvariante (con favoritas, la guardo y aparece ahí)', async ({ page }, info) => {
  await page.goto(FAVORITAS_PRENDIDAS ? '/#/cursos/todas' : '/#/cursos/negras')
  await captura(page, info, 't19-aperturas')
  await page.getByTestId('tarjeta-eslava:b').locator('a').click()
  await expect(page.getByRole('heading', { name: 'Defensa Eslava' })).toBeVisible()
  // la Variante Checa: su línea, con 5.a4
  await page.getByTestId('variante').filter({ hasText: 'Variante Checa' }).first().click()
  await expect(page.getByTestId('linea')).toContainText('5.a4')
  await captura(page, info, 't19-eslava')
  // de regreso a la apertura
  await page.locator('a.volver').click()
  await expect(page.getByRole('heading', { name: 'Defensa Eslava' })).toBeVisible()
  // y de ahí a Aprender, a la pestaña de su color
  await page.locator('a.volver').click()
  if (!FAVORITAS_PRENDIDAS) {
    await expect(page.getByTestId('pestana-negras')).toHaveAttribute('aria-selected', 'true')
    return
  }
  await page.getByTestId('tarjeta-eslava:b').locator('a').click()
  // el corazón la guarda
  await page.getByTestId('corazon-eslava:b').click()
  await expect(page.getByTestId('corazon-eslava:b')).toHaveAttribute('aria-pressed', 'true')
  // y aparece en mis favoritas
  await page.goto('/#/cursos')
  await expect(page.getByTestId('tarjeta-eslava:b')).toBeVisible()
})
