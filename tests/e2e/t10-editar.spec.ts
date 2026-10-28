import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'

test.describe('T10 · escoger qué aprendo', () => {
  test('agrego una línea de la base, recargo y sigue ahí; la borro, deshago y regresa', async ({ page }, info) => {
    await page.goto('/#/repertorio/negras')
    const arbol = page.getByTestId('arbol-negras')
    // la Siciliana con negras está "solo en la base": la abro y agrego una línea
    const siciliana = arbol.locator('li.solo-base', { hasText: 'Defensa Siciliana' }).first()
    await siciliana.locator('summary').first().click()
    const agregar = siciliana.getByTestId('agregar-de-base').first()
    const texto = (await agregar.textContent())!
    const nombre = texto.replace(/^\+ Agregar «/, '').replace(/»$/, '')
    await captura(page, info, 't10-base-abierta')
    await agregar.click()
    await page.reload()
    const linea = page.locator('.fin-linea', { hasText: nombre })
    await expect(linea).toHaveCount(1)
    await expect(page.locator('li.en-repertorio .fin-linea', { hasText: nombre })).toHaveCount(1)
    // abro su rama (las familias se abren al tocarlas) y la borro (con confirmación); luego la deshago
    const resumenes = linea.locator('xpath=ancestor::details/summary')
    for (let i = 0; i < (await resumenes.count()); i++) {
      const det = linea.locator('xpath=ancestor::details').nth(i)
      if (!(await det.evaluate((d) => (d as HTMLDetailsElement).open))) await resumenes.nth(i).click()
    }
    await page.getByRole('button', { name: `Opciones de ${nombre}` }).click()
    await page.getByTestId('borrar-rama').click()
    const dialogo = page.getByRole('dialog', { name: '¿Borrar esta rama?' })
    await expect(dialogo).toBeVisible()
    await captura(page, info, 't10-confirmar-borrar')
    await dialogo.getByRole('button', { name: 'Borrar' }).click()
    await expect(page.locator('.fin-linea', { hasText: nombre })).toHaveCount(0)
    await expect(page.getByTestId('aviso-borrado')).toBeVisible()
    await page.getByTestId('aviso-borrado').getByRole('button', { name: 'Deshacer' }).click()
    await expect(page.locator('.fin-linea', { hasText: nombre })).toHaveCount(1)
    await page.reload()
    await expect(page.locator('.fin-linea', { hasText: nombre })).toHaveCount(1)
  })
})
