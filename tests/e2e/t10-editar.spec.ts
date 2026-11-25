import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'
import { FAVORITAS_PRENDIDAS } from '../../src/aprender/interruptores.ts'

test.describe('T10 · escoger qué aprendo (Nota 1: con el corazón)', () => {
  test('desde la página de una apertura: la guardo, recargo y sigue; la quito y la vuelvo a poner', async ({ page }, info) => {
    test.skip(!FAVORITAS_PRENDIDAS, 'las favoritas están apagadas (aprender/interruptores.ts): para cuando haya varios usuarios')
    await page.goto('/#/curso/' + encodeURIComponent('otros-1e4:w'))
    const corazon = page.getByTestId('corazon-otros-1e4:w')
    await expect(corazon).toHaveAttribute('aria-pressed', 'false')
    await corazon.click()
    await expect(corazon).toHaveAttribute('aria-pressed', 'true')
    await captura(page, info, 't10-base-abierta')
    await page.reload()
    await expect(page.getByTestId('corazon-otros-1e4:w')).toHaveAttribute('aria-pressed', 'true')
    await page.goto('/#/cursos')
    await expect(page.getByTestId('tarjeta-otros-1e4:w')).toBeVisible()
    // quitarla es un toque, y volver a ponerla también (no hace falta confirmar: no se pierde nada)
    await page.goto('/#/curso/' + encodeURIComponent('otros-1e4:w'))
    await page.getByTestId('corazon-otros-1e4:w').click()
    await expect(page.getByTestId('corazon-otros-1e4:w')).toHaveAttribute('aria-pressed', 'false')
    await captura(page, info, 't10-confirmar-borrar')
    await page.getByTestId('corazon-otros-1e4:w').click()
    await page.reload()
    await expect(page.getByTestId('corazon-otros-1e4:w')).toHaveAttribute('aria-pressed', 'true')
  })
})
