import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { cursoNuevo, jugadasDeVariante } from '../../src/curso/datos.ts'
import { fotosDePasos, soloPeones } from '../../src/curso/pasos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import type { PasoAPaso } from '../../src/curso/tipos.ts'

/**
 * Correcciones de la Caro-Kann, C3 (puntos 2 y 3 del feedback): "Ver paso a paso" en La idea, La estructura, el plan y
 * el repaso, en los dos perfiles. Abrir, avanzar, regresar, Salir y tocar fuera; el tablero cambia con cada paso y
 * coincide con la frase. Las capturas, en iterations/v3/capturas/correcciones/<perfil>/.
 */
const c = cursoNuevo('caro-kann:b')!
const ventana = (page: Page) => page.getByTestId('paso-a-paso')
const frase = (page: Page) => page.getByTestId('paso-a-paso-frase')
const tablero = (page: Page) => page.getByTestId('tablero-paso-a-paso')
const cap = async (page: Page, info: TestInfo, nombre: string) => {
  await page.waitForTimeout(250)
  await page.screenshot({ path: `iterations/v3/capturas/correcciones/${info.project.name}/${nombre}.png` })
}

/** Recorre todos los pasos con Siguiente: en cada uno, la frase y el tablero son los de los datos. Termina en el último. */
async function recorrer(page: Page, pa: PasoAPaso, inicio: string[] = []) {
  const fotos = fotosDePasos(pa, inicio)
  for (let i = 0; i < pa.pasos.length; i++) {
    await expect(ventana(page)).toHaveAttribute('data-paso', String(i + 1))
    await expect(frase(page)).toHaveText(mostrarTexto(pa.pasos[i]!.frase, 'figuras'))
    await expect(tablero(page)).toHaveAttribute('data-fen', pa.soloPeones ? soloPeones(fotos[i]!.fen) : fotos[i]!.fen)
    await expect(ventana(page).getByText(`${i + 1} de ${pa.pasos.length}`, { exact: true })).toBeVisible()
    if (i < pa.pasos.length - 1) {
      await expect(page.getByTestId('pap-siguiente')).toHaveText('Siguiente')
      await page.getByTestId('pap-siguiente').click()
    }
  }
  await expect(page.getByTestId('pap-siguiente')).toHaveText('Salir')
}

test.describe('Correcciones · C3 · Ver paso a paso', () => {
  test('La idea: abrir, avanzar, regresar, Salir y tocar fuera; el tablero coincide con cada frase', async ({ page }, info) => {
    const pa = c.piezas.idea.paginas[0]!.pasoAPaso!
    await page.goto('/#/curso/caro-kann%3Ab/leer/idea')
    // la página guarda su texto
    await expect(page.getByTestId('texto-pieza')).toContainText('Cuando blancas abre con 1.e4')
    await page.getByTestId('ver-paso-a-paso').click()
    await expect(ventana(page)).toBeVisible()
    await expect(ventana(page)).toHaveAttribute('data-paso', '1')
    // el primer paso: "Blancas abre con 1.e4" y el peón ya se movió; no hay Atrás
    await expect(frase(page)).toHaveText('Blancas abre con 1.e4: ocupa el centro.')
    await expect(tablero(page)).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/4P3\/8\/PPPP1PPP\/RNBQKBNR b /)
    await expect(page.getByTestId('pap-atras')).toHaveCount(0)
    // el tablero de la ventana, con coordenadas y volteado (el curso es con negras)
    await expect(tablero(page)).toHaveAttribute('data-orientacion', 'black')
    await expect(tablero(page).locator('coords.files coord')).toHaveCount(8)
    await expect(tablero(page).locator('coords.ranks coord')).toHaveCount(8)
    await cap(page, info, 'c3-la-idea-paso-1')
    // avanzar y regresar
    await page.getByTestId('pap-siguiente').click()
    await expect(ventana(page)).toHaveAttribute('data-paso', '2')
    await expect(frase(page)).toContainText('1...c6')
    await expect(tablero(page)).toHaveAttribute('data-fen', /^rnbqkbnr\/pp1ppppp\/2p5\/8\/4P3/)
    await page.getByTestId('pap-atras').click()
    await expect(ventana(page)).toHaveAttribute('data-paso', '1')
    await expect(tablero(page)).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/4P3\/8\/PPPP1PPP\/RNBQKBNR b /)
    // todo el recorrido; en el último, Siguiente dice "Salir" y cierra
    await recorrer(page, pa)
    await page.getByTestId('pap-siguiente').click()
    await expect(ventana(page)).toHaveCount(0)
    await expect(page.getByTestId('pieza-idea')).toBeVisible()
    // tocar fuera la cierra
    await page.getByTestId('ver-paso-a-paso').click()
    await page.getByTestId('pap-siguiente').click()
    await page.getByTestId('pap-siguiente').click()
    await page.getByTestId('pap-siguiente').click()
    await expect(frase(page)).toContainText('2...d5')
    await cap(page, info, 'c3-la-idea-paso-4')
    await page.getByTestId('paso-a-paso-fondo').click({ position: { x: 5, y: 5 } })
    await expect(ventana(page)).toHaveCount(0)
    // y Esc también
    await page.getByTestId('ver-paso-a-paso').click()
    await page.keyboard.press('Escape')
    await expect(ventana(page)).toHaveCount(0)
  })

  test('La estructura: sus dos páginas, solo con peones', async ({ page }, info) => {
    await page.goto('/#/curso/caro-kann%3Ab/leer/estructura')
    for (const [k, pagina] of c.piezas.estructura.paginas.entries()) {
      if (k > 0) await page.getByTestId('pagina-siguiente').click()
      await expect(page.getByTestId('texto-pieza')).toContainText(pagina.texto[0]!.slice(0, 20))
      await page.getByTestId('ver-paso-a-paso').click()
      await expect(page.getByTestId('paso-a-paso').getByRole('heading')).toHaveText(mostrarTexto(pagina.subtitulo!, 'figuras'))
      await recorrer(page, pagina.pasoAPaso!)
      if (k === 0) {
        await page.getByTestId('pap-atras').click()
        await page.getByTestId('pap-atras').click()
        await cap(page, info, 'c3-la-estructura-avance-ruptura')
        await page.keyboard.press('Escape')
      } else await page.getByTestId('pap-siguiente').click()
      await expect(ventana(page)).toHaveCount(0)
    }
  })

  test('El repaso: sus dos páginas', async ({ page }, info) => {
    await page.goto('/#/curso/caro-kann%3Ab/leer/repaso')
    for (const [k, pagina] of c.piezas.repaso.paginas.entries()) {
      if (k > 0) await page.getByTestId('pagina-siguiente').click()
      await page.getByTestId('ver-paso-a-paso').click()
      await recorrer(page, pagina.pasoAPaso!)
      if (k === 0) await cap(page, info, 'c3-el-repaso-ultimo-paso')
      await page.getByTestId('pap-siguiente').click()
      await expect(ventana(page)).toHaveCount(0)
    }
  })

  test('El plan: en la lección, desde el final de la variante; Salir regresa al plan', async ({ page }, info) => {
    const v = c.variantes.find((x) => x.id === 'avance-tal')!
    const jugadas = jugadasDeVariante(c, v)
    await page.goto('/#/')
    await page.evaluate((ply) => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea: 'v:avance-tal', vuelta: 'aprender', ply, fecha: Date.now() } })), jugadas.length)
    await page.goto('/#/curso/caro-kann%3Ab/linea/' + encodeURIComponent('v:avance-tal'))
    await expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', 'plan')
    await expect(page.getByTestId('narracion')).toContainText('Tu plan:')
    await page.getByTestId('ver-paso-a-paso').click()
    await expect(page.getByTestId('paso-a-paso').getByRole('heading')).toHaveText('Tu plan')
    await expect(page.getByTestId('paso-a-paso')).toContainText('Solo se mueven las piezas de las que habla cada frase.')
    await page.getByTestId('pap-siguiente').click()
    await cap(page, info, 'c3-el-plan-de-la-tal-paso-2')
    await page.getByTestId('pap-atras').click()
    await recorrer(page, v.plan.pasoAPaso!, jugadas)
    await page.getByTestId('pap-siguiente').click()
    await expect(ventana(page)).toHaveCount(0)
    await expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', 'plan')
    await expect(page.getByTestId('a-practicar')).toBeVisible()
  })

  test('los 16 planes abren su paso a paso desde el final de su variante', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/#/')
    for (const v of c.variantes) {
      const jugadas = jugadasDeVariante(c, v)
      await page.evaluate(([linea, ply]) => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta: 'aprender', ply, fecha: Date.now() } })), [`v:${v.id}`, jugadas.length] as const)
      await page.goto('/#/curso/caro-kann%3Ab/linea/' + encodeURIComponent(`v:${v.id}`))
      await expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', 'plan')
      await page.getByTestId('ver-paso-a-paso').click()
      await recorrer(page, v.plan.pasoAPaso!, jugadas)
      await page.keyboard.press('Escape')
    }
  })
})
