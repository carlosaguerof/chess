import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'

test.describe('T7 · mi repertorio, visible', () => {
  test('el árbol de negras muestra las 4 variantes de la Caro-Kann con su frecuencia, y distingue lo de la base', async ({ page }, info) => {
    await page.goto('/#/repertorio')
    await expect(page.getByRole('heading', { name: 'Mi repertorio' })).toBeVisible()
    await captura(page, info, 't7-repertorio-blancas')
    await page.getByTestId('tab-negras').click()
    const arbol = page.getByTestId('arbol-negras')
    await expect(arbol).toBeVisible()
    const familia = (nombre: string) => arbol.locator(`[data-familia="${nombre}"]`).first()
    await expect(familia('Variante del Avance').locator('.rama-fila').first()).toContainText('3.e5')
    await expect(familia('Variante del Avance').locator('[data-frecuencia]').first()).toHaveAttribute('data-frecuencia', '5')
    await expect(familia('Variante Clásica').locator('[data-frecuencia]').first()).toHaveAttribute('data-frecuencia', '4')
    await expect(familia('Variante del Cambio').locator('[data-frecuencia]').first()).toHaveAttribute('data-frecuencia', '3')
    await expect(familia('Ataque de los Dos Caballos').locator('[data-frecuencia]').first()).toHaveAttribute('data-frecuencia', '2')
    // lo mío contra lo de la base
    await expect(arbol.locator('.chip-rep').first()).toHaveText('en tu repertorio')
    await expect(arbol.locator('.solo-base .chip-base').first()).toHaveText('solo en la base')
    // el texto de mi guía donde coincide con la teoría, y el plan de la base marcado como de la IA
    await expect(arbol.locator('.plan').first()).toContainText('de tu guía')
    await expect(familia('Variante del Avance').locator('.plan').first()).toContainText('redactado por la IA')
    await captura(page, info, 't7-repertorio-negras')
  })
})
