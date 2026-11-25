import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import type { DatosCurso, LineaCurso } from '../../src/curso/tipos.ts'
import { jugar } from './_util.ts'

/**
 * Los cursos del Avance contra la Caro-Kann y contra la Francesa, por estructuras (2026-11-25; `specs/cursos.md` §6): su
 * tarjeta abre el curso nuevo; la página con sus secciones en orden; una lección de cada sección, en sus dos vueltas; y
 * la lección cabe en la pantalla del celular. Lo que sale de los datos: `tests/unit/curso-avance.test.ts`.
 */
const CK = cursoNuevo('caro-kann:w')!
const FR = cursoNuevo('francesa:w')!
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 15_000 })
const urlCurso = (c: DatosCurso) => `/#/curso/${encodeURIComponent(c.id)}`
const urlDe = (c: DatosCurso, id: string) => `${urlCurso(c)}/linea/${encodeURIComponent(id)}`
const uci = (l: LineaCurso, ply: number) => {
  const ch = new Chess()
  for (const s of l.jugadas.slice(0, ply)) ch.move(s)
  const m = ch.move(l.jugadas[ply]!)
  return m.from + m.to
}

/** Juega una vuelta entera, desde la introducción: tus jugadas, "Siguiente" cuando hay que leer, hasta `final`. */
async function vuelta(page: Page, info: TestInfo, l: LineaCurso, final: 'plan' | 'fin') {
  await page.getByTestId('empezar-vuelta').click()
  for (const ply of misJugadas(l)) {
    await expect(leccion(page)).toHaveAttribute('data-ply', String(ply), { timeout: 15_000 })
    await momento(page, 'tuTurno')
    await jugar(page, info, uci(l, ply))
    // hay algo que leer: "Siguiente"; si no, la máquina sigue sola
    await expect.poll(async () => leccion(page).getAttribute('data-momento'), { timeout: 15_000 }).not.toBe('tuTurno')
    if ((await leccion(page).getAttribute('data-momento')) === 'leer') await page.getByTestId('siguiente').click()
  }
  await momento(page, final)
}

test.describe('Los cursos del Avance', () => {
  test('en Aprender, con blancas, cada tarjeta abre su curso nuevo, con su avance', async ({ page }) => {
    await page.goto('/#/cursos')
    for (const [c, n] of [
      [CK, 2],
      [FR, 3],
    ] as const) {
      // la tarjeta sigue en su lugar y con su nombre de siempre ("Contra la Caro-Kann"); el avance ya es el del curso nuevo
      await expect(page.getByTestId(`tarjeta-${c.id}`)).toContainText(`0 de ${n} variantes`)
    }
    await page.getByTestId('tarjeta-francesa:w').click()
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Avance contra la Francesa')
    await expect(page.getByTestId('avance')).toHaveText('0 de 3 variantes')
    // el tablero de arriba: lo que comparten sus líneas, 1.e4 e6 2.d4 d5 3.e5
    await expect(page.getByTestId('pagina-curso').getByTestId('tablero-mini').first()).toHaveAttribute('data-fen', new Chess('rnbqkbnr/ppp2ppp/4p3/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3').fen())
    await page.goto('/#/cursos')
    await page.getByTestId('tarjeta-caro-kann:w').click()
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Avance contra la Caro-Kann')
  })

  test('la página: La idea, La estructura, sus secciones, Errores y trampas, Repaso y, al final, Opcional', async ({ page }) => {
    for (const c of [CK, FR]) {
      await page.goto(urlCurso(c))
      const orden = await page.getByTestId('piezas-curso').locator('[data-testid^="paso-"], [data-testid^="seccion-"]').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-testid')))
      const obl = c.secciones!.filter((s) => !s.opcional).flatMap((s) => [`seccion-${s.id}`, ...s.variantes.map((v) => `paso-v:${v}`)])
      const opc = c.secciones!.filter((s) => s.opcional).flatMap((s) => [`seccion-${s.id}`, ...s.variantes.map((v) => `paso-v:${v}`)])
      expect(orden, c.id).toEqual(['paso-idea', 'paso-estructura', ...obl, 'paso-errores', 'paso-repaso', ...opc])
      for (const v of c.variantes) await expect(page.getByTestId(`paso-v:${v.id}`).getByTestId('estructura-leccion'), v.id).toHaveText(v.estructura!)
      await expect(page.getByTestId('avance')).toHaveText(`0 de ${obligatorias(c).length} variantes`)
    }
    await expect(page.getByTestId('seccion-opcional')).toContainText('No cuentan para terminar el curso.')
  })

  test('La estructura: el mapa y una página por forma, con su paso a paso', async ({ page }) => {
    for (const c of [CK, FR]) {
      await page.goto(`${urlCurso(c)}/leer/estructura`)
      await expect(page.getByTestId('pieza-estructura')).toContainText('¿qué pasó con d4?')
      // una página a la vez: el mapa y una por forma, cada una con su "Ver paso a paso"
      for (const [i, p] of c.piezas.estructura.paginas.entries()) {
        await expect(page.getByTestId('pagina-n-de-m'), p.subtitulo).toContainText(`${i + 1} de ${c.piezas.estructura.paginas.length}`)
        await expect(page.getByTestId('pieza-estructura'), p.subtitulo).toContainText(p.subtitulo!)
        await expect(page.getByTestId('pieza-estructura').getByTestId('ver-paso-a-paso'), p.subtitulo).toBeVisible()
        if (i < c.piezas.estructura.paginas.length - 1) await page.getByTestId('pagina-siguiente').click()
      }
    }
  })

  test('los tableros de leer y el de la página llevan a–h y 1–8, desde el lado de blancas (correcciones, C1)', async ({ page }) => {
    const revisar = async (sel: string) => {
      const t = page.getByTestId(sel).first()
      await expect(t).toHaveAttribute('data-orientacion', 'white')
      const leer = (s: string) => t.locator(s).evaluateAll((els) => els.map((el) => ({ texto: (el.textContent ?? '').trim(), x: el.getBoundingClientRect().x, y: el.getBoundingClientRect().y })))
      const columnas = await leer('coords.files coord')
      const filas = await leer('coords.ranks coord')
      expect([...columnas].sort((a, b) => a.x - b.x).map((c) => c.texto)).toEqual(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'])
      expect([...filas].sort((a, b) => a.y - b.y).map((f) => f.texto)).toEqual(['8', '7', '6', '5', '4', '3', '2', '1'])
    }
    for (const c of [CK, FR]) {
      await page.goto(`${urlCurso(c)}/leer/idea`)
      await revisar('tablero-leer')
      await page.goto(`${urlCurso(c)}/leer/estructura`)
      await revisar('tablero-leer')
      await page.goto(urlCurso(c))
      await revisar('tablero-mini')
    }
  })

  test('cada plan abre su paso a paso desde el final de su variante (correcciones, C3)', async ({ page }) => {
    test.setTimeout(120_000)
    await page.goto('/#/')
    for (const c of [CK, FR])
      for (const v of c.variantes) {
        const l = lineaPorId(c, `v:${v.id}`)!
        await page.evaluate(([clave, linea, ply]) => localStorage.setItem(clave as string, JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta: 'aprender', ply, fecha: Date.now() } })), [`ajedrez.v1.curso:${c.id}`, l.id, l.jugadas.length] as const)
        await page.goto(urlDe(c, l.id))
        await momento(page, 'plan')
        await page.getByTestId('ver-paso-a-paso').click()
        await expect(page.getByRole('dialog'), v.id).toContainText(`1 de ${v.plan.pasoAPaso!.pasos.length}`)
        await page.keyboard.press('Escape')
      }
  })

  for (const [c, id] of [
    [CK, 'af5'],
    [CK, 'c5'],
    [FR, 'cambio-d4'],
    [FR, 'principal'],
    [FR, 'lputian'],
  ] as const)
    test(`${c.nombre}, ${id}: Aprender hasta el plan y Practicar hasta el resumen`, async ({ page }, info) => {
      test.setTimeout(180_000)
      const l = lineaPorId(c, `v:${id}`)!
      await page.goto(urlDe(c, l.id))
      await momento(page, 'intro')
      await expect(page.getByTestId('narracion')).toContainText(mostrarTexto(l.intro, 'figuras').split('. ')[0]!)
      const grupo = opcionales(c).some((v) => v.id === id) ? 'Opcional' : 'Variante'
      await expect(page.getByTestId('cual-variante')).toContainText(grupo)
      await vuelta(page, info, l, 'plan')
      await expect(page.getByTestId('narracion')).toContainText(mostrarTexto(l.variante!.plan.tuyo, 'figuras').split('. ')[0]!)
      // juegas con blancas: el plan del rival es "El de negras:" (nunca "El de blancas:")
      await expect(page.getByTestId('narracion')).toContainText(`El de negras:${mostrarTexto(l.variante!.plan.rival, 'figuras').split('. ')[0]!}`)
      await expect(page.getByTestId('narracion')).not.toContainText('El de blancas:')
      await page.getByTestId('a-practicar').click()
      await momento(page, 'intro')
      await vuelta(page, info, l, 'fin')
      await expect(page.getByTestId('salida-siguiente')).toBeVisible()
    })
})

const PANTALLAS = [
  { ancho: 375, alto: 667 },
  { ancho: 360, alto: 740 },
  { ancho: 390, alto: 844 },
  { ancho: 402, alto: 874 },
  { ancho: 430, alto: 932 },
]
for (const { ancho, alto } of PANTALLAS)
  test.describe(`Los cursos del Avance caben en ${ancho}×${alto}`, () => {
    test.use({ viewport: { width: ancho, height: alto } })
    for (const c of [CK, FR]) {
      // la lección con la introducción más larga y la de más jugadas
      const larga = [...c.variantes].sort((a, b) => b.intro.length - a.intro.length)[0]!
      test(`${c.nombre}: la introducción más larga sin scroll de la página, y la narración y el tablero a la medida`, async ({ page }) => {
        await page.goto(urlDe(c, `v:${larga.id}`))
        await momento(page, 'intro')
        const m = await page.evaluate(() => ({
          pagina: document.documentElement.scrollHeight,
          ventana: innerHeight,
          ancho: document.documentElement.scrollWidth,
          pantalla: innerWidth,
          narracion: document.querySelector('[data-testid="narracion"]')!.getBoundingClientRect().height,
          tablero: document.querySelector('[data-testid="tablero"]')!.getBoundingClientRect().width,
          boton: (() => {
            const r = document.querySelector('[data-testid="empezar-vuelta"]')!.getBoundingClientRect()
            return r.bottom <= innerHeight + 0.5 && r.top >= 0
          })(),
        }))
        expect.soft(m.pagina, 'sin scroll de la página').toBeLessThanOrEqual(m.ventana)
        expect.soft(m.ancho, 'nada se sale a lo ancho').toBeLessThanOrEqual(m.pantalla)
        expect.soft(Math.round(m.narracion), 'la narración').toBeGreaterThanOrEqual(140)
        expect.soft(Math.round(m.tablero), 'el tablero').toBeGreaterThanOrEqual(280)
        expect.soft(m.boton, 'el botón, a la vista').toBe(true)
      })
    }
  })
