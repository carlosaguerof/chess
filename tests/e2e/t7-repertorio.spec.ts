import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'

test.describe('T7 · mi repertorio (mis favoritas), visible', () => {
  test('con la Caro-Kann en favoritas: sus variantes de la más común a la más rara, sin etiquetas de dónde sale cada cosa', async ({ page }, info) => {
    await page.addInitScript(() => localStorage.setItem('ajedrez.v1.favoritas', JSON.stringify(['caro-kann:b'])))
    await page.goto('/#/cursos')
    await captura(page, info, 't7-repertorio-blancas')
    await page.getByTestId('tarjeta-caro-kann:b').locator('a').click()
    const filas = page.getByTestId('variante')
    // el orden: el Avance (5), luego la Clásica (4), el Cambio (3) y los Dos Caballos (2)
    const frec = await filas.evaluateAll((fs) => fs.map((f) => Number(f.getAttribute('data-frecuencia'))))
    expect(frec).toEqual([...frec].sort((a, b) => b - a))
    const nombres = await filas.allTextContents()
    const primero = (familia: string) => nombres.findIndex((n) => n.includes(familia))
    expect(primero('Variante del Avance')).toBe(0)
    expect(primero('Variante Clásica')).toBeLessThan(primero('Variante del Cambio'))
    expect(primero('Variante del Cambio')).toBeLessThan(primero('Ataque de los Dos Caballos'))
    // §3: nada de "de tu guía", "en tu repertorio" ni "redactado por la IA" en la vista
    await expect(page.locator('main')).not.toContainText(/de tu guía|en tu repertorio|solo en la base|redactado por la IA/)
    await captura(page, info, 't7-repertorio-negras')
  })
})
