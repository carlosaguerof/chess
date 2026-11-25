import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { jugar } from './_util.ts'

/**
 * El curso de la captura contra la Escandinava, por estructuras (2026-11-25; `specs/cursos.md` §6): la tarjeta de
 * siempre abre el curso nuevo; la página con sus secciones en orden; una lección de cada sección en sus dos vueltas;
 * "Siguiente variante" al cruzar secciones; una opcional no entra al Repaso. Lo que sale de los datos:
 * `tests/unit/curso-escandinava.test.ts`.
 */
const C = cursoNuevo('escandinava:w')!
const CLAVE = 'ajedrez.v1.curso:escandinava:w'
const URL_CURSO = '/#/curso/escandinava%3Aw'
const HOY = new Date('2026-11-26T10:00:00')

const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const urlDe = (id: string) => `${URL_CURSO}/linea/${encodeURIComponent(id)}`
const leido = (page: Page, clave: string) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), clave)
const uci = (jugadas: string[], ply: number) => {
  const ch = new Chess()
  for (const s of jugadas.slice(0, ply)) ch.move(s)
  const m = ch.move(jugadas[ply]!)
  return m.from + m.to
}

/** Termina una variante: retoma Practicar en su última jugada mía y la juega, hasta el resumen. */
async function terminar(page: Page, info: TestInfo, id: string) {
  const l = lineaPorId(C, `v:${id}`)!
  const ply = Math.max(...misJugadas(l))
  await page.goto('/#/')
  await page.evaluate(
    ([clave, linea, ply]) => {
      const a = JSON.parse(localStorage.getItem(clave as string) ?? '{"piezas":{},"variantes":{},"errores":{}}')
      localStorage.setItem(clave as string, JSON.stringify({ ...a, enCurso: { linea, vuelta: 'practicar', ply, fecha: Date.now() } }))
    },
    [CLAVE, l.id, ply] as const,
  )
  await page.goto(urlDe(l.id))
  await page.reload()
  await momento(page, 'tuTurno')
  await jugar(page, info, uci(l.jugadas, ply))
  if ((await leccion(page).getAttribute('data-momento')) === 'leer') await page.getByTestId('siguiente').click()
  await momento(page, 'fin')
}

test.describe('El curso de la captura contra la Escandinava', () => {
  test('en Aprender, pestaña blancas, la tarjeta de siempre abre el curso nuevo, con sus 4 obligatorias', async ({ page }) => {
    await page.goto('/#/cursos/blancas')
    const tarjeta = page.getByTestId('tarjeta-escandinava:w')
    await expect(tarjeta).toContainText('Contra la Escandinava')
    await expect(tarjeta).toContainText('0 de 4 variantes')
    await tarjeta.click()
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Contra la Escandinava')
    await expect(page.getByTestId('avance')).toHaveText('0 de 4 variantes')
  })

  test('la página: La idea, La estructura, La base, Las que más te van a salir, Errores y trampas, Repaso y Opcional, en ese orden', async ({ page }) => {
    await page.goto(URL_CURSO)
    const orden = await page.getByTestId('piezas-curso').locator('[data-testid^="paso-"], [data-testid^="seccion-"]').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-testid')))
    const vs = (ids: string[]) => ids.map((id) => `paso-v:${id}`)
    expect(orden).toEqual(['paso-idea', 'paso-estructura', 'seccion-base', ...vs(['clasica', 'valenciana', 'gipslis']), 'seccion-frecuentes', ...vs(['lasker']), 'paso-errores', 'paso-repaso', 'seccion-opcional', ...vs(['bronstein', 'schiller-pytel', 'marshall', 'richter'])])
    await expect(page.getByTestId('seccion-opcional')).toContainText('No cuentan para terminar el curso.')
    for (const v of C.variantes) {
      const e = page.getByTestId(`paso-v:${v.id}`).getByTestId('estructura-leccion')
      // la dama en d6 queda fuera del mapa: sus dos lecciones van sin etiqueta
      if (v.estructura) await expect(e, v.id).toHaveText(v.estructura)
      else await expect(e, v.id).toHaveCount(0)
    }
    // el tablero de arriba, desde el lado de blancas, con lo que comparten todas las líneas: 1.e4 d5 2.exd5
    await expect(page.getByTestId('pagina-curso').locator('.pagina-apertura-tablero [data-fen]').first()).toHaveAttribute('data-fen', /^rnbqkbnr\/ppp1pppp\/8\/3P4\/8\/8\/PPPP1PPP\/RNBQKBNR/)
  })

  test('El mapa y una página por forma, con su paso a paso', async ({ page }) => {
    await page.goto(`${URL_CURSO}/leer/estructura`)
    await expect(page.getByTestId('pieza-estructura')).toContainText('¿a dónde se fue la dama cuando la atacaste?')
    for (const t of ['El mapa', 'La clavada', 'La dama en casa', 'El jaque', 'El centro grande']) await expect(page.getByTestId('pieza-estructura'), t).toContainText(t)
  })

  for (const [id, cual] of [['clasica', 'Variante 1 de 4'], ['lasker', 'Variante 4 de 4'], ['bronstein', 'Opcional 1 de 4']] as const)
    test(`${id}: Aprender y Practicar, con su número arriba ("${cual}")`, async ({ page }, info) => {
      const l = lineaPorId(C, `v:${id}`)!
      const mias = misJugadas(l)
      await page.goto(urlDe(l.id))
      await momento(page, 'intro')
      await expect(page.getByTestId('cual-variante')).toHaveText(cual)
      await expect(page.getByTestId('narracion')).toContainText(mostrarTexto(l.intro, 'figuras'))
      await page.getByTestId('empezar-vuelta').click()
      await momento(page, 'tuTurno')
      await expect(leccion(page)).toHaveAttribute('data-ply', String(mias[0]))
      // Aprender: "Te toca", y la jugada correcta
      await expect(page.getByTestId('narracion')).toContainText('Te toca')
      await jugar(page, info, uci(l.jugadas, mias[0]!))
      await expect(leccion(page)).not.toHaveAttribute('data-momento', 'tuTurno')
      // Practicar, desde su primera jugada: sin texto de tu jugada en tu turno
      await page.getByTestId('vuelta-practicar').click()
      await expect(page.getByTestId('narracion')).toContainText('Ahora, Practicar')
      await page.getByTestId('empezar-vuelta').click()
      await momento(page, 'tuTurno')
      await expect(page.getByTestId('narracion')).not.toContainText('Te toca')
      await jugar(page, info, uci(l.jugadas, mias[0]!))
      await expect(leccion(page)).not.toHaveAttribute('data-momento', 'tuTurno')
    })

  test('"Siguiente variante" sigue la tabla; la última obligatoria va a Errores y trampas, con sus cuatro «¿Y si…?»', async ({ page }, info) => {
    test.setTimeout(120_000)
    await terminar(page, info, 'gipslis')
    await expect(page.getByTestId('salida-siguiente')).toHaveText('Siguiente variante')
    await page.getByTestId('salida-siguiente').click()
    await expect(page.getByTestId('nombre-linea')).toHaveText(mostrarTexto(lineaPorId(C, 'v:lasker')!.nombre, 'figuras'))
    await expect(page.getByTestId('cual-variante')).toHaveText('Variante 4 de 4')
    await terminar(page, info, 'lasker')
    await expect(page.getByTestId('salida-siguiente')).toHaveText('Errores y trampas')
    await page.getByTestId('salida-siguiente').click()
    await expect(page.getByTestId('pieza-errores').locator('[data-testid^="error-"]')).toHaveCount(4)
  })

  test('una opcional lleva a la siguiente opcional; la última, de vuelta al curso; y no entra al Repaso', async ({ page }, info) => {
    test.setTimeout(120_000)
    await page.clock.setFixedTime(HOY)
    await terminar(page, info, 'marshall')
    await expect(page.getByTestId('salida-siguiente')).toHaveText('Siguiente variante')
    await terminar(page, info, 'richter')
    await expect(page.getByTestId('salida-siguiente')).toHaveText('Volver al curso')
    expect((await leido(page, CLAVE)).variantes.richter.terminada).toBeTruthy()
    expect((await leido(page, 'ajedrez.v1.progreso')) ?? {}).toEqual({})
    await page.goto(URL_CURSO)
    await expect(page.getByTestId('avance')).toHaveText('0 de 4 variantes')
    await expect(page.getByTestId('paso-v:richter')).toHaveAttribute('data-estado', 'hecha')
  })

  test('con blancas, todo tablero del curso va desde el lado de blancas, con sus coordenadas: a–h de izquierda a derecha, 1–8 de abajo arriba (correcciones, C1)', async ({ page }) => {
    const revisar = async (tablero: ReturnType<Page['getByTestId']>, donde: string) => {
      await expect(tablero, donde).toHaveAttribute('data-orientacion', 'white')
      const leer = (sel: string) => tablero.locator(sel).evaluateAll((els) => els.map((el) => { const r = el.getBoundingClientRect(); return { t: (el.textContent ?? '').trim(), x: r.x, y: r.y } }))
      const columnas = await leer('coords.files coord')
      const filas = await leer('coords.ranks coord')
      expect([...columnas].sort((a, b) => a.x - b.x).map((c) => c.t), donde).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
      expect([...filas].sort((a, b) => b.y - a.y).map((f) => f.t), donde).toEqual(['1', '2', '3', '4', '5', '6', '7', '8'])
    }
    await page.goto(`${URL_CURSO}/leer/idea`)
    await revisar(page.getByTestId('tablero-leer'), 'La idea')
    await page.goto(`${URL_CURSO}/leer/estructura`)
    await revisar(page.getByTestId('tablero-leer'), 'El mapa')
    await page.getByTestId('ver-paso-a-paso').click()
    await revisar(page.getByTestId('paso-a-paso').locator('[data-orientacion]').first(), 'el paso a paso')
    await page.keyboard.press('Escape')
    await page.goto(urlDe('v:valenciana'))
    await momento(page, 'intro')
    await revisar(page.getByTestId('tablero').first(), 'la lección')
  })

  test('las obligatorias y opcionales del curso son las de la tabla', async () => {
    expect(obligatorias(C).map((v) => v.id)).toEqual(['clasica', 'valenciana', 'gipslis', 'lasker'])
    expect(opcionales(C).map((v) => v.id)).toEqual(['bronstein', 'schiller-pytel', 'marshall', 'richter'])
  })

  test('en el ancho más chico, nada se sale: la tarjeta y la página con sus secciones', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    for (const u of ['/#/cursos/blancas', URL_CURSO]) {
      await page.goto(u)
      await expect(page.getByText('Contra la Escandinava').first()).toBeVisible()
      const m = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, pantalla: innerWidth }))
      expect(m.pagina, u).toBeLessThanOrEqual(m.pantalla)
    }
  })
})
