import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { jugar, tocar } from './_util.ts'

/**
 * C3 (curso de la Caro-Kann): la lección nueva, punto por punto del diseño §4, en los dos perfiles. Se usa la Variante
 * Tal (4.h4), la más corta del Avance: 3...Af5 4.h4 h5 5.Ad3 Axd3 6.Dxd3 e6.
 */
const TAL = '/#/curso/caro-kann%3Ab/linea/' + encodeURIComponent('v:avance-tal')
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const narracion = (page: Page) => page.getByTestId('narracion')
// las marcas (correcciones, C5 y C7): la capa propia encima del tablero
const flechas = (page: Page) => page.locator('[data-testid="tablero"] [data-marca="flecha"]')
const circulos = (page: Page) => page.locator('[data-testid="tablero"] [data-marca="casilla"]')

/** Una jugada equivocada: no cambia el tablero (se queda a la vista con su flecha). */
async function jugarMal(page: Page, info: TestInfo, uci: string) {
  await tocar(page, info, uci.slice(0, 2))
  await tocar(page, info, uci.slice(2, 4))
}

/** Aprender completo de la Tal, desde la introducción hasta el plan. */
async function aprenderTal(page: Page, info: TestInfo) {
  await page.getByTestId('empezar-vuelta').click()
  for (const j of ['c8f5', 'h7h5', 'f5d3', 'e7e6']) {
    await momento(page, 'tuTurno')
    await jugar(page, info, j)
    await momento(page, 'leer')
    await page.getByTestId('siguiente').click()
  }
  await momento(page, 'plan')
}

test.describe('C3 · la lección nueva', () => {
  test('el ciclo: intro, rival solo, espera de "Siguiente" cuando hay que leer, el error que se queda, Atrás, el plan, Practicar con su explicación y el resumen', async ({ page }, info) => {
    await page.goto(TAL)
    // "Variante N de M" y la introducción, en el espacio fijo de los mensajes
    await expect(page.getByTestId('cual-variante')).toHaveText('Variante 4 de 16')
    await momento(page, 'intro')
    await expect(narracion(page)).toContainText('4.h4')
    const caja = await narracion(page).boundingBox()
    expect(caja!.height).toBeGreaterThanOrEqual(160)
    await page.getByTestId('empezar-vuelta').click()

    // la máquina juega 3.e5 sola; me toca, y en Aprender la lección dice la jugada
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-ply', '5')
    await expect(page.getByTestId('jugada-n-de-m')).toHaveText('Jugada 1 de 4')
    await expect(narracion(page)).toContainText('Te toca: 3...♗f5')
    // la línea en un renglón, sin lo que sigue
    await expect(page.getByTestId('linea')).toHaveText('1.e4 c6 2.d4 d5 3.e5')
    // en mi turno, solo las marcas de las frases (el dibujo de Carlos y el ejemplo 2 de las reglas de las marcas):
    // f6 y la L de g8 a f6 en rojo, y la flecha verde de 3...Af5; ninguna de la siguiente jugada que no sea clave
    await expect(flechas(page)).toHaveCount(2)
    await expect(circulos(page)).toHaveCount(1)

    // mi jugada: correcta, y como hay algo que leer, la máquina espera a "Siguiente"
    await jugar(page, info, 'c8f5')
    await momento(page, 'leer')
    await expect(narracion(page).locator('[data-tipo="correcta"]')).toContainText('Correcto')
    await page.waitForTimeout(2500)
    await momento(page, 'leer')
    await expect(leccion(page)).toHaveAttribute('data-ply', '6')
    await page.getByTestId('siguiente').click()
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('jugada-n-de-m')).toHaveText('Jugada 2 de 4')

    // el error se explica y se queda a la vista, con la flecha de lo que jugué, hasta "Reintentar"
    await jugarMal(page, info, 'e7e6')
    await momento(page, 'error')
    await expect(narracion(page).locator('[data-tipo="incorrecta"]').first()).toContainText('Esa no es: 4...e6')
    await expect(flechas(page)).toHaveCount(1)
    await page.waitForTimeout(3000)
    await momento(page, 'error')
    await expect(narracion(page).locator('[data-tipo="incorrecta"]').first()).toBeVisible()
    await page.getByTestId('reintentar').click()
    await momento(page, 'tuTurno')
    // vuelve "Te toca: 4...h5", jugada clave: solo su flecha
    await expect(flechas(page)).toHaveCount(1)
    await expect(page.locator('[data-marca="flecha"][data-de="h7"][data-a="h5"]')).toHaveCount(1)

    // "Atrás" regresa una jugada mía (a 3...Af5)
    await page.getByTestId('atras').click()
    await expect(leccion(page)).toHaveAttribute('data-ply', '5')
    await expect(page.getByTestId('jugada-n-de-m')).toHaveText('Jugada 1 de 4')
    await jugar(page, info, 'c8f5')
    await page.getByTestId('siguiente').click()

    for (const j of ['h7h5', 'f5d3', 'e7e6']) {
      await momento(page, 'tuTurno')
      await jugar(page, info, j)
      await momento(page, 'leer')
      await page.getByTestId('siguiente').click()
    }
    // el plan, con sus flechas
    await momento(page, 'plan')
    await expect(narracion(page)).toContainText('Ya terminó la apertura')
    await expect(narracion(page)).toContainText('Tu plan:')
    await expect(flechas(page)).not.toHaveCount(0)

    // Practicar: sin decir la jugada; después de jugarla, su explicación y "Siguiente" (correcciones, C2)
    await page.getByTestId('a-practicar').click()
    await expect(leccion(page)).toHaveAttribute('data-vuelta', 'practicar')
    await page.getByTestId('empezar-vuelta').click()
    await momento(page, 'tuTurno')
    await expect(narracion(page)).not.toContainText('Te toca')
    await expect(narracion(page)).not.toContainText('♗f5')
    await jugar(page, info, 'c8f5')
    await momento(page, 'leer')
    await page.getByTestId('siguiente').click()
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-ply', '7')
    for (const j of ['h7h5', 'f5d3', 'e7e6']) {
      await momento(page, 'tuTurno')
      await jugar(page, info, j)
      await momento(page, 'leer')
      await page.getByTestId('siguiente').click()
    }

    // el resumen: la línea, la idea clave, en qué me equivoqué, y tres salidas
    await momento(page, 'fin')
    await expect(page.getByTestId('resumen-linea')).toContainText('1.e4 c6 2.d4 d5 3.e5 ♗f5 4.h4 h5 5.♗d3 ♗xd3 6.♕xd3 e6')
    await expect(page.getByTestId('resumen-idea')).toContainText('4...h5')
    await expect(page.getByTestId('resumen-tropiezos')).toContainText('Sin errores')
    await expect(page.getByTestId('salida-siguiente')).toContainText('Siguiente variante')
    await expect(page.getByTestId('salida-repetir')).toBeVisible()
    await expect(page.getByTestId('salida-curso')).toBeVisible()

    // el avance quedó guardado: la variante, terminada
    await page.getByTestId('salida-curso').click()
    await expect(page.getByTestId('paso-v:avance-tal')).toHaveAttribute('data-estado', 'hecha')
    await expect(page.getByTestId('avance')).toHaveText('1 de 16 variantes')
  })

  test('la ayuda en tres escalones (Pista, Otra pista con la pieza, Respuesta con la flecha) y cuenta en el resumen', async ({ page }, info) => {
    await page.goto(TAL)
    await aprenderTal(page, info)
    await page.getByTestId('a-practicar').click()
    await page.getByTestId('empezar-vuelta').click()
    await momento(page, 'tuTurno')
    await expect(flechas(page)).toHaveCount(0)
    await expect(circulos(page)).toHaveCount(0)
    // 1) Pista: la idea en palabras (en Practicar, la meta: correcciones, C2)
    await page.getByTestId('pista').click()
    await expect(narracion(page).locator('[data-tipo="pista"]')).toHaveCount(1)
    await expect(narracion(page)).not.toContainText('♗f5')
    await expect(circulos(page)).toHaveCount(0)
    // 2) Otra pista: se marca la pieza que se mueve
    await expect(page.getByTestId('pista')).toContainText('Otra pista')
    await page.getByTestId('pista').click()
    await expect(circulos(page)).toHaveCount(1)
    await expect(page.getByTestId('pista')).toBeDisabled()
    // 3) Respuesta: la flecha de la jugada (en Practicar, sin texto)
    await page.getByTestId('respuesta').click()
    await expect(flechas(page)).toHaveCount(1)
    await jugar(page, info, 'c8f5')
    await momento(page, 'leer')
    await page.getByTestId('siguiente').click()
    for (const j of ['h7h5', 'f5d3', 'e7e6']) {
      await momento(page, 'tuTurno')
      await jugar(page, info, j)
      await momento(page, 'leer')
      await page.getByTestId('siguiente').click()
    }
    await momento(page, 'fin')
    await expect(page.getByTestId('resumen-tropiezos')).toContainText('3...♗f5')
    await expect(page.getByTestId('resumen-tropiezos')).toContainText('viste la Respuesta')
  })

  test('una jugada buena de otra línea no sale en rojo: otro color y "Prueba de nuevo"', async ({ page }, info) => {
    await page.goto(TAL)
    await page.getByTestId('empezar-vuelta').click()
    await momento(page, 'tuTurno')
    // 3...c5 (la Botvinnik-Carls) es buena y está en la base, pero esta lección enseña 3...Af5
    await jugarMal(page, info, 'c6c5')
    await momento(page, 'buena')
    const m = narracion(page).locator('[data-tipo="buena"]')
    await expect(m).toContainText('Buena jugada, pero esta lección enseña otra línea')
    await expect(narracion(page).locator('[data-tipo="incorrecta"]')).toHaveCount(0)
    const fondo = await m.evaluate((el) => getComputedStyle(el).backgroundColor)
    expect(fondo).not.toBe('rgb(74, 37, 34)') // no es el rojo del error
    await page.getByTestId('reintentar').click()
    await momento(page, 'tuTurno')
  })

  test('el avance se guarda: al recargar, retomo donde me quedé; la página del curso dice "Seguir"', async ({ page }, info) => {
    await page.goto(TAL)
    await page.getByTestId('empezar-vuelta').click()
    await momento(page, 'tuTurno')
    await jugar(page, info, 'c8f5')
    await page.getByTestId('siguiente').click()
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-ply', '7')
    await page.reload()
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-ply', '7')
    await expect(leccion(page)).toHaveAttribute('data-vuelta', 'aprender')
    await page.goto('/#/curso/caro-kann%3Ab')
    await expect(page.getByTestId('empezar-curso')).toContainText('Seguir: Avance: 4.h4 (Tal)')
    await expect(page.getByTestId('paso-v:avance-tal')).toHaveAttribute('data-estado', 'pendiente')
  })

  test('"Empezar de nuevo" pregunta antes', async ({ page }, info) => {
    await page.goto(TAL)
    await page.getByTestId('empezar-vuelta').click()
    await momento(page, 'tuTurno')
    await jugar(page, info, 'c8f5')
    await page.getByTestId('siguiente').click()
    await momento(page, 'tuTurno')
    await page.getByTestId('empezar-de-nuevo').click()
    const d = page.getByRole('dialog', { name: '¿Empezar de nuevo?' })
    await expect(d).toBeVisible()
    await d.getByRole('button', { name: 'Cancelar' }).click()
    await expect(leccion(page)).toHaveAttribute('data-ply', '7')
    await page.getByTestId('empezar-de-nuevo').click()
    await page.getByRole('dialog', { name: '¿Empezar de nuevo?' }).getByRole('button', { name: 'Empezar de nuevo' }).click()
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-ply', '5')
  })

  test('las flechas de la siguiente jugada se prenden en Ajustes (solo en Aprender)', async ({ page }) => {
    // en 6...e6 de la Tal (no es jugada clave y la frase del rival no lleva marcas), el tablero está limpio
    const en6e6 = async () => {
      await page.evaluate(() => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea: 'v:avance-tal', vuelta: 'aprender', ply: 11, fecha: Date.now() } })))
      await page.goto(TAL)
      await page.reload()
      await momento(page, 'tuTurno')
      await expect(leccion(page)).toHaveAttribute('data-ply', '11')
    }
    await page.goto('/#/ajustes')
    await en6e6()
    await expect(flechas(page)).toHaveCount(0)
    await page.goto('/#/ajustes')
    await expect(page.getByTestId('ajuste-flechas')).not.toBeChecked()
    await page.getByTestId('ajuste-flechas').check({ force: true })
    await en6e6()
    await expect(flechas(page)).toHaveCount(1)
    await expect(page.locator('[data-marca="flecha"][data-de="e7"][data-a="e6"]')).toHaveCount(1)
  })

  test('Errores y trampas: castigo el error yo, con la pieza que castiga', async ({ page }, info) => {
    await page.goto('/#/curso/caro-kann%3Ab/errores')
    await page.getByTestId('error-tal-e6').click()
    await momento(page, 'intro')
    await expect(page.getByTestId('cual-variante')).toHaveText('¿Y si…? 1 de 4')
    await page.getByTestId('empezar-vuelta').click()
    // la máquina juega el error (4...e6) y yo juego con blancas: g4, f3 y h5
    for (const j of ['g2g4', 'f2f3', 'h4h5']) {
      await momento(page, 'tuTurno')
      await jugar(page, info, j)
    }
    await momento(page, 'fin')
    await expect(page.getByTestId('resumen-idea')).toContainText('gana una pieza')
    await page.getByTestId('salida-curso').click()
    await page.goto('/#/curso/caro-kann%3Ab/errores')
    await expect(page.getByTestId('error-tal-e6')).toContainText('Hecho')
  })
})
