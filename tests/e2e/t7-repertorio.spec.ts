import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'
import { FAVORITAS_PRENDIDAS } from '../../src/aprender/interruptores.ts'

test.describe('T7 · mi repertorio, visible', () => {
  test('la Caro-Kann (en Con negras; con favoritas, en Mis favoritas): sus variantes de la más común a la más rara, sin etiquetas de dónde sale cada cosa', async ({ page }, info) => {
    await page.addInitScript(() => localStorage.setItem('ajedrez.v1.favoritas', JSON.stringify(['caro-kann:b'])))
    await page.goto(FAVORITAS_PRENDIDAS ? '/#/cursos' : '/#/cursos/negras')
    await captura(page, info, 't7-repertorio-blancas')
    await page.getByTestId('tarjeta-caro-kann:b').locator('a').click()
    // la página del curso (C6): las variantes, una por respuesta de blancas, de la más común a la más rara
    const filas = page.getByTestId('piezas-curso').locator('[data-testid^="paso-v:"]')
    await expect(filas).toHaveCount(16)
    const nombres = await filas.allTextContents()
    const primero = (familia: string) => nombres.findIndex((n) => n.includes(familia))
    // el Avance (5), luego la Clásica (4), el Cambio (3) y los Dos Caballos (2)
    expect(primero('Avance')).toBe(0)
    expect(primero('Clásica')).toBeLessThan(primero('Cambio'))
    expect(primero('Cambio')).toBeLessThan(primero('Dos Caballos'))
    // §3: nada de "de tu guía", "en tu repertorio" ni "redactado por la IA" en la vista
    await expect(page.locator('main')).not.toContainText(/de tu guía|en tu repertorio|solo en la base|redactado por la IA/)
    await captura(page, info, 't7-repertorio-negras')
  })
})
