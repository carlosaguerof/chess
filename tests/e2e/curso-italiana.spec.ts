import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId, misJugadas } from '../../src/curso/datos.ts'
import { jugar } from './_util.ts'

/**
 * El curso de la Italiana por estructuras (2026-11-25; `specs/cursos.md` §6). La tarjeta de siempre abre el curso nuevo;
 * la página trae sus secciones en orden; una lección de cada sección se juega en sus dos vueltas; y la lección más larga
 * cabe en las cinco pantallas de celular, en sus momentos más altos. "Seguir" con cada obligatoria, en
 * `boton-seguir.spec.ts`. Lo que sale de los datos: `tests/unit/curso-italiana.test.ts`.
 */
const CURSO = cursoNuevo('italiana:w')!
const URL = '/#/curso/italiana%3Aw'
const urlLinea = (id: string) => `${URL}/linea/${encodeURIComponent(id)}`
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string | RegExp) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const toca = (page: Page, id: string) => page.getByTestId(id).dispatchEvent('click')
const uci = (jugadas: string[], ply: number) => {
  const c = new Chess()
  for (const s of jugadas.slice(0, ply)) c.move(s)
  const m = c.move(jugadas[ply]!)
  return m.from + m.to
}

test.describe('La Italiana por estructuras', () => {
  test('en Aprender, la tarjeta de la Italiana abre el curso nuevo: "0 de 6 variantes"', async ({ page }) => {
    await page.goto('/#/cursos')
    await expect(page.getByTestId('tarjeta-italiana:w')).toContainText('0 de 6 variantes')
    await page.getByTestId('tarjeta-italiana:w').click()
    await expect(page).toHaveURL(/#\/curso\/italiana%3Aw$/)
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Apertura Italiana')
    await expect(page.getByTestId('avance')).toHaveText('0 de 6 variantes')
  })

  test('la página: La idea, La estructura, La base, Las que más te van a salir, Errores y trampas, Repaso y Opcional, en ese orden', async ({ page }) => {
    await page.goto(URL)
    const orden = await page.getByTestId('piezas-curso').locator('[data-testid^="paso-"], [data-testid^="seccion-"]').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-testid')))
    const de = (i: number) => CURSO.secciones![i]!.variantes.map((v) => `paso-v:${v}`)
    expect(orden).toEqual(['paso-idea', 'paso-estructura', 'seccion-base', ...de(0), 'seccion-frecuentes', ...de(1), 'paso-errores', 'paso-repaso', 'seccion-opcional', ...de(2)])
    await expect(page.getByTestId('seccion-base')).toHaveText('La base')
    await expect(page.getByTestId('seccion-frecuentes')).toHaveText('Las que más te van a salir')
    await expect(page.getByTestId('seccion-opcional')).toContainText('No cuentan para terminar el curso.')
    const numeros = await page.locator('.numero-variante').allTextContents()
    expect(numeros.map((n) => Number.parseInt(n))).toEqual([1, 2, 3, 4, 5, 6, 1, 2])
    // la forma de cada lección, en letra chica debajo de su nombre; las dos de fuera del mapa no llevan nada
    for (const v of CURSO.variantes) {
      const fila = page.getByTestId(`paso-v:${v.id}`)
      if (v.estructura) await expect(fila).toContainText(v.estructura)
      else await expect(fila.locator('.estructura-leccion')).toHaveCount(0)
    }
    // el tablero de arriba: 1.e4 e5 2.Cf3 Cc6 3.Ac4, desde el lado de blancas
    await expect(page.getByTestId('pagina-curso').locator('[data-fen]').first()).toHaveAttribute('data-fen', /^r1bqkbnr\/pppp1ppp\/2n5\/4p3\/2B1P3\/5N2\/PPPP1PPP\/RNBQK2R b KQkq/)
  })

  for (const id of ['dos-caballos-d3', 'principal', 'hungara']) {
    test(`una lección de cada sección en sus dos vueltas: ${id}`, async ({ page }, info: TestInfo) => {
      const l = lineaPorId(CURSO, `v:${id}`)!
      const [primera] = misJugadas(l)
      await page.goto(urlLinea(l.id))
      await momento(page, 'intro')
      await toca(page, 'empezar-vuelta')
      await momento(page, 'tuTurno')
      await expect(leccion(page)).toHaveAttribute('data-ply', String(primera))
      // Aprender: "Te toca" con la jugada, y al jugarla, la explicación y "Siguiente"
      await expect(page.getByTestId('narracion')).toContainText('Te toca')
      await jugar(page, info, uci(l.jugadas, primera!))
      await momento(page, 'leer')
      await expect(page.getByTestId('siguiente')).toBeVisible()
      // Practicar, con el interruptor: en tu turno no hay "Te toca"
      await page.getByTestId('vuelta-practicar').click()
      await momento(page, /intro|tuTurno/)
      if ((await leccion(page).getAttribute('data-momento')) === 'intro') await toca(page, 'empezar-vuelta')
      await momento(page, 'tuTurno')
      await expect(page.getByTestId('vuelta-practicar')).toHaveAttribute('aria-checked', 'true')
      await expect(page.getByTestId('narracion')).not.toContainText('Te toca')
      await jugar(page, info, uci(l.jugadas, primera!))
      await momento(page, /leer|rival|tuTurno/)
    })
  }
})

/** La lección más larga del curso (la línea principal del Giuoco Pianissimo, 9.h3), en las cinco pantallas de celular. */
const PANTALLAS = [
  { ancho: 375, alto: 667 },
  { ancho: 360, alto: 740 },
  { ancho: 390, alto: 844 },
  { ancho: 402, alto: 874 },
  { ancho: 430, alto: 932 },
]
const LARGA = lineaPorId(CURSO, 'v:principal')!
const ULTIMA = LARGA.jugadas.length - 1
const BOTONES = ['pista', 'respuesta', 'atras', 'reiniciar']

async function cabe(page: Page, cuando: string, aLaVista: string[]) {
  const m = await page.evaluate((aLaVista) => {
    const caja = (s: string) => document.querySelector(s)?.getBoundingClientRect() ?? null
    const dentro = (r: DOMRect | null) => !!r && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5
    const tablero = caja('[data-testid="tablero"]')!
    return {
      pagina: document.documentElement.scrollHeight,
      ventana: innerHeight,
      ancho: document.documentElement.scrollWidth,
      pantalla: innerWidth,
      fuera: aLaVista.filter((id) => !dentro(caja(`[data-testid="${id}"]`))),
      texto: caja('[data-testid="narracion"]')?.height ?? 0,
      tablero: tablero.width,
    }
  }, aLaVista)
  expect.soft(m.pagina, `${cuando}: sin scroll de la página`).toBeLessThanOrEqual(m.ventana)
  expect.soft(m.fuera, `${cuando}: completos dentro de la ventana`).toEqual([])
  expect.soft(Math.round(m.texto), `${cuando}: la narración`).toBeGreaterThanOrEqual(140)
  expect.soft(Math.round(m.tablero), `${cuando}: el tablero`).toBeGreaterThanOrEqual(280)
  expect.soft(m.ancho, `${cuando}: nada se sale a lo ancho`).toBeLessThanOrEqual(m.pantalla)
}

for (const p of PANTALLAS) {
  test.describe(`La Italiana cabe en ${p.ancho}×${p.alto}`, () => {
    test.use({ viewport: { width: p.ancho, height: p.alto } })
    test('la última jugada de la lección más larga: "Te toca", la explicación y el plan, sin scroll de la página', async ({ page }, info) => {
      await page.goto('/#/')
      await page.evaluate(([linea, ply]) => localStorage.setItem('ajedrez.v1.curso:italiana:w', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta: 'aprender', ply, fecha: Date.now() } })), [LARGA.id, ULTIMA] as const)
      await page.goto(urlLinea(LARGA.id))
      await page.reload()
      await momento(page, 'tuTurno')
      await cabe(page, '1-te-toca', BOTONES)
      await jugar(page, info, uci(LARGA.jugadas, ULTIMA))
      await momento(page, 'leer')
      await cabe(page, '2-explicacion', [...BOTONES, 'siguiente'])
      await toca(page, 'siguiente')
      await momento(page, 'plan')
      // el plan del rival dice de quién es: con blancas, el rival es negras
      await expect(page.getByTestId('narracion')).toContainText('El de negras:')
      await expect(page.getByTestId('narracion')).not.toContainText('El de blancas:')
      await cabe(page, '3-plan', [...BOTONES, 'ver-paso-a-paso', 'a-practicar'])
    })
  })
}
