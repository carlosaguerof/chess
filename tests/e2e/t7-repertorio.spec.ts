import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'
import { FAVORITAS_PRENDIDAS } from '../../src/aprender/interruptores.ts'

test.describe('T7 · mi repertorio, visible', () => {
  test('la Caro-Kann (en Con negras; con favoritas, en Mis favoritas): sus variantes de la más común a la más rara, sin etiquetas de dónde sale cada cosa', async ({ page }, info) => {
    await page.addInitScript(() => localStorage.setItem('ajedrez.v1.favoritas', JSON.stringify(['caro-kann:b'])))
    await page.goto(FAVORITAS_PRENDIDAS ? '/#/cursos' : '/#/cursos/negras')
    await captura(page, info, 't7-repertorio-blancas')
    await page.getByTestId('tarjeta-caro-kann:b').locator('a').click()
    // la página del curso (C6): una variante por respuesta de blancas. Desde el 2026-11-25 la tarjeta abre el curso por
    // estructuras: La base va en el orden del mapa (la Cadena, el Cambio, la Clásica, la Tensión), y las opcionales al final
    const filas = page.getByTestId('piezas-curso').locator('[data-testid^="paso-v:"]')
    await expect(filas).toHaveCount(16)
    const nombres = await filas.allTextContents()
    const primero = (familia: string) => nombres.findIndex((n) => n.includes(familia))
    expect(primero('Avance')).toBe(0)
    // la Clásica se llama "3.♘c3" (en figuras, como se ve) desde el cierre de los cursos (2026-11-25): su nombre no adelanta tu captura en e4
    expect(primero('Cambio')).toBeLessThan(primero('3.♘c3'))
    expect(primero('3.♘c3')).toBeLessThan(primero('Dos Caballos'))
    // §3: nada de "de tu guía", "en tu repertorio" ni "redactado por la IA" en la vista
    await expect(page.locator('main')).not.toContainText(/de tu guía|en tu repertorio|solo en la base|redactado por la IA/)
    await captura(page, info, 't7-repertorio-negras')
  })
})
