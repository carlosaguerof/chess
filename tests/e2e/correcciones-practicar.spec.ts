import { expect, test, type Page } from '@playwright/test'
import { cursoNuevo } from '../../src/curso/datos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { jugar } from './_util.ts'

/**
 * Correcciones de la Caro-Kann, C2 (punto 5 del feedback): "Practicar" sin ayudas que no pediste, en los dos perfiles.
 * En la Tal (3...Af5 4.h4 h5 5.Ad3 Axd3 6.Dxd3 e6), desde la primera jugada mía de Practicar.
 */
const c = cursoNuevo('caro-kann:b')!
const mia = c.mias['e4 c6 d4 d5 e5 Bf5']!
const TAL = '/#/curso/caro-kann%3Ab/linea/' + encodeURIComponent('v:avance-tal')
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const narracion = (page: Page) => page.getByTestId('narracion')
const flechas = (page: Page) => page.locator('[data-testid="tablero"] svg.cg-shapes line')
const circulos = (page: Page) => page.locator('[data-testid="tablero"] svg.cg-shapes circle')
const ver = (t: string) => mostrarTexto(t, 'figuras')

async function practicarTal(page: Page) {
  await page.goto('/#/')
  await page.evaluate(() => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea: 'v:avance-tal', vuelta: 'practicar', ply: 5, fecha: Date.now() } })))
  await page.goto(TAL)
  await momento(page, 'tuTurno')
  await expect(leccion(page)).toHaveAttribute('data-vuelta', 'practicar')
  await expect(leccion(page)).toHaveAttribute('data-ply', '5')
}

test.describe('Correcciones · C2 · Practicar sin ayudas que no pediste', () => {
  test('en mi turno, solo la jugada del rival; la Pista da la meta y, a la segunda, marca la pieza; la Respuesta es solo la flecha; después de jugar, la explicación', async ({ page }, info) => {
    await practicarTal(page)
    // en mi turno: la narración solo explica la jugada del rival; nada de la mía, ni la pregunta por la meta
    await expect(narracion(page).locator('[data-tipo="rival"]')).toContainText('3.e5')
    await expect(narracion(page).locator('.mensaje-curso')).toHaveCount(1)
    await expect(narracion(page)).not.toContainText(ver(mia.pregunta))
    await expect(narracion(page)).not.toContainText(ver(mia.hace))
    await expect(narracion(page)).not.toContainText('Te toca')
    await expect(narracion(page)).not.toContainText('♗f5')
    await expect(flechas(page)).toHaveCount(0)
    await expect(circulos(page)).toHaveCount(0)

    // Pista: la meta en palabras (lo que antes era la pregunta), sin marcas
    await page.getByTestId('pista').click()
    const pista = narracion(page).locator('[data-tipo="pista"]')
    await expect(pista).toHaveCount(1)
    await expect(pista).toContainText('Pista: ' + ver(mia.pregunta))
    await expect(circulos(page)).toHaveCount(0)
    await expect(flechas(page)).toHaveCount(0)

    // otra vez: se marca la pieza (el alfil de c8), sin más texto
    await expect(page.getByTestId('pista')).toContainText('Otra pista')
    await page.getByTestId('pista').click()
    await expect(circulos(page)).toHaveCount(1)
    await expect(narracion(page).locator('[data-tipo="pista"]')).toHaveCount(1)
    await expect(narracion(page)).not.toContainText('alfil de c8.')

    // Respuesta: solo la flecha, sin repetir texto
    await page.getByTestId('respuesta').click()
    await expect(flechas(page)).toHaveCount(1)
    await expect(circulos(page)).toHaveCount(0)
    await expect(narracion(page).locator('[data-tipo="respuesta"], [data-tipo="pista"]')).toHaveCount(0)
    await expect(narracion(page)).not.toContainText('Respuesta')
    await expect(narracion(page)).not.toContainText('♗f5')

    // después de mi jugada: "Correcto" y la explicación (qué hace, por qué ahora, qué prepara), y espera a "Siguiente"
    await jugar(page, info, 'c8f5')
    await momento(page, 'leer')
    await expect(narracion(page).locator('[data-tipo="correcta"]')).toContainText('Correcto')
    const explica = narracion(page).locator('[data-tipo="explica"]')
    await expect(explica.nth(0)).toHaveText(ver(mia.hace))
    await expect(explica.nth(1)).toHaveText(ver(mia.porque!))
    await expect(explica.nth(2)).toHaveText(ver(mia.prepara!))
    await page.waitForTimeout(1500)
    await momento(page, 'leer')
    await page.getByTestId('siguiente').click()
    // la máquina contesta 4.h4 y me vuelve a tocar, otra vez sin texto de mi jugada
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-ply', '7')
    await expect(narracion(page).locator('.mensaje-curso')).toHaveCount(1)
    await expect(narracion(page).locator('[data-tipo="rival"]')).toContainText('4.h4')
  })

  test('sin pedir ayuda, la explicación llega igual después de jugar', async ({ page }, info) => {
    await practicarTal(page)
    await jugar(page, info, 'c8f5')
    await momento(page, 'leer')
    await expect(narracion(page).locator('[data-tipo="explica"]').first()).toHaveText(ver(mia.hace))
    await expect(page.getByTestId('siguiente')).toBeVisible()
  })

  test('"Aprender" no cambia: dice la jugada y lo que hace', async ({ page }) => {
    await page.goto(TAL)
    await page.getByTestId('empezar-vuelta').click()
    await momento(page, 'tuTurno')
    await expect(narracion(page).locator('[data-tipo="pregunta"]')).toHaveText('Te toca: 3...♗f5. ' + ver(mia.hace))
  })
})
