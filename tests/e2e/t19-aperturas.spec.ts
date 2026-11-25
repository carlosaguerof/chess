import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'
import { FAVORITAS_PRENDIDAS } from '../../src/aprender/interruptores.ts'

// la Caro-Kann y la Eslava tienen su página nueva (C6, tests/e2e/c6-pantallas.spec.ts); aquí, la página de antes con
// "Otras defensas contra 1.e4"
test('Aperturas: en Con blancas abro Otras defensas contra 1.e4 y recorro hasta una subvariante (con favoritas, la guardo y aparece ahí)', async ({ page }, info) => {
  await page.goto(FAVORITAS_PRENDIDAS ? '/#/cursos/todas' : '/#/cursos')
  await captura(page, info, 't19-aperturas')
  await page.getByTestId('tarjeta-otros-1e4:w').locator('a').click()
  await expect(page.getByRole('heading', { name: 'Otras defensas contra 1.e4' })).toBeVisible()
  // la Pirc: su línea, con 5.♗e2
  await page.getByTestId('variante').filter({ hasText: 'Defensa Pirc' }).first().click()
  await expect(page.getByTestId('linea')).toContainText('5.♗e2')
  await captura(page, info, 't19-otros-1e4')
  // de regreso a la apertura
  await page.locator('a.volver').click()
  await expect(page.getByRole('heading', { name: 'Otras defensas contra 1.e4' })).toBeVisible()
  // y de ahí a Aprender, a la pestaña de su color
  await page.locator('a.volver').click()
  if (!FAVORITAS_PRENDIDAS) {
    await expect(page.getByTestId('pestana-blancas')).toHaveAttribute('aria-selected', 'true')
    return
  }
  await page.getByTestId('tarjeta-otros-1e4:w').locator('a').click()
  // el corazón la guarda
  await page.getByTestId('corazon-otros-1e4:w').click()
  await expect(page.getByTestId('corazon-otros-1e4:w')).toHaveAttribute('aria-pressed', 'true')
  // y aparece en mis favoritas
  await page.goto('/#/cursos')
  await expect(page.getByTestId('tarjeta-otros-1e4:w')).toBeVisible()
})
