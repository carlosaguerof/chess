import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'

test('Aperturas: abro la Caro-Kann, recorro hasta una subvariante, la agrego a mi repertorio y aparece ahí', async ({ page }, info) => {
  // quito antes del repertorio la Variante Tal (para poder agregarla desde la base)
  await page.goto('/#/repertorio/negras')
  const tal = page.locator('.fin-linea', { hasText: 'Variante Tal' })
  const resumenes = tal.locator('xpath=ancestor::details/summary')
  for (let i = 0; i < (await resumenes.count()); i++) {
    const det = tal.locator('xpath=ancestor::details').nth(i)
    if (!(await det.evaluate((d) => (d as HTMLDetailsElement).open))) await resumenes.nth(i).click()
  }
  await page.getByRole('button', { name: 'Opciones de Variante del Avance: Variante Tal' }).click()
  await page.getByTestId('borrar-rama').click()
  await page.getByRole('dialog', { name: '¿Borrar esta rama?' }).getByRole('button', { name: 'Borrar' }).click()
  await expect(page.locator('.fin-linea', { hasText: 'Variante Tal' })).toHaveCount(0)

  // Aperturas → Caro-Kann → Variante del Avance → Variante Tal → Agregar
  await page.goto('/#/aperturas')
  await captura(page, info, 't19-aperturas')
  await page.getByTestId('apertura-caro-kann').click()
  await expect(page.getByRole('heading', { name: 'Defensa Caro-Kann' })).toBeVisible()
  const avance = page.locator('[data-testid="familia-base"][data-familia="Variante del Avance"]')
  await avance.locator('summary').click()
  const variante = avance.locator('[data-testid="variante-base"][data-clave="caro-kann/avance-tal"]')
  await expect(variante).toContainText('4.h4')
  await captura(page, info, 't19-caro-kann')
  await variante.getByTestId('agregar-a-repertorio').filter({ hasText: 'con negras' }).click()
  await expect(variante).toContainText('en tu repertorio (negras)')

  // y aparece en mi repertorio
  await page.goto('/#/repertorio/negras')
  await expect(page.locator('.fin-linea', { hasText: 'Variante Tal' })).toHaveCount(1)
})
