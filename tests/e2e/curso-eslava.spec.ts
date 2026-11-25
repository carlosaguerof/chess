import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import type { DatosCurso } from '../../src/curso/tipos.ts'
import { jugar } from './_util.ts'

/**
 * Los cursos de la Eslava y de "...c6 + ...d5 contra lo demás", por estructuras (2026-11-25; `specs/cursos.md` §6): la
 * tarjeta de siempre abre el curso nuevo; la página con sus secciones en orden; el mapa; una lección de cada sección en sus
 * dos vueltas; "Siguiente variante" al cruzar secciones; una opcional no entra al Repaso; el nombre más largo cabe en
 * "Seguir"; nada se sale en el ancho más chico. Lo que sale de los datos: `tests/unit/curso-eslava.test.ts` y
 * `tests/unit/curso-otros-negras.test.ts`.
 */
const HOY = new Date('2026-11-26T10:00:00')

interface Caso {
  c: DatosCurso
  /** la lección de cada sección que se recorre en sus dos vueltas, con su número arriba */
  recorrer: [string, string][]
  /** la penúltima obligatoria (cruza a la última) y la última (va a Errores y trampas) */
  cruce: [string, string, string]
  /** las dos últimas opcionales */
  opcionalesFin: [string, string]
  /** la frase del mapa */
  mapa: string
}

const CASOS: Caso[] = [
  {
    c: cursoNuevo('eslava:b')!,
    recorrer: [['checa', 'Variante 1 de 4'], ['cc3', 'Variante 4 de 4'], ['geller', 'Opcional 6 de 7']],
    cruce: ['cambio', 'cc3', 'Variante 4 de 4'],
    opcionalesFin: ['geller', 'diemer'],
    mapa: 'Son tres preguntas en fila',
  },
  {
    c: cursoNuevo('otros-negras:b')!,
    recorrer: [['reti-bogoljubow', 'Variante 1 de 6'], ['larsen-clasica', 'Variante 5 de 6'], ['inglesa-gurevich', 'Opcional 2 de 2']],
    cruce: ['otras-hungara', 'inglesa-caro-kann', 'Variante 3 de 6'],
    opcionalesFin: ['inglesa-anglo-eslava-g3', 'inglesa-gurevich'],
    mapa: '¿qué peón de blancas ataca tu peón de d5?',
  },
]

const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const urlCurso = (c: DatosCurso) => `/#/curso/${encodeURIComponent(c.id)}`
const urlDe = (c: DatosCurso, id: string) => `${urlCurso(c)}/linea/${encodeURIComponent(id)}`
const claveDe = (c: DatosCurso) => `ajedrez.v1.curso:${c.id}`
const leido = (page: Page, clave: string) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), clave)
const uci = (jugadas: string[], ply: number) => {
  const ch = new Chess()
  for (const s of jugadas.slice(0, ply)) ch.move(s)
  const m = ch.move(jugadas[ply]!)
  return m.from + m.to
}

/** Termina una variante: retoma Practicar en su última jugada mía y la juega, hasta el resumen. */
async function terminar(page: Page, info: TestInfo, c: DatosCurso, id: string) {
  const l = lineaPorId(c, `v:${id}`)!
  const ply = Math.max(...misJugadas(l))
  await page.goto('/#/')
  await page.evaluate(
    ([clave, linea, ply]) => {
      const a = JSON.parse(localStorage.getItem(clave as string) ?? '{"piezas":{},"variantes":{},"errores":{}}')
      localStorage.setItem(clave as string, JSON.stringify({ ...a, enCurso: { linea, vuelta: 'practicar', ply, fecha: Date.now() } }))
    },
    [claveDe(c), l.id, ply] as const,
  )
  await page.goto(urlDe(c, l.id))
  await page.reload()
  await momento(page, 'tuTurno')
  await jugar(page, info, uci(l.jugadas, ply))
  if ((await leccion(page).getAttribute('data-momento')) === 'leer') await page.getByTestId('siguiente').click()
  await momento(page, 'fin')
}

for (const { c, recorrer, cruce, opcionalesFin, mapa } of CASOS) {
  const n = obligatorias(c).length
  test.describe(c.nombre, () => {
    test(`en Aprender, pestaña negras, la tarjeta de siempre abre el curso nuevo, con sus ${n} obligatorias`, async ({ page }) => {
      await page.goto('/#/cursos/negras')
      const tarjeta = page.getByTestId(`tarjeta-${c.id}`)
      await expect(tarjeta).toContainText(c.nombre)
      await expect(tarjeta).toContainText(`0 de ${n} variantes`)
      await tarjeta.locator('a').click()
      await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText(c.nombre)
      await expect(page.getByTestId('avance')).toHaveText(`0 de ${n} variantes`)
    })

    test('la página: La idea, La estructura, sus secciones obligatorias, Errores y trampas, Repaso y Opcional, en ese orden', async ({ page }) => {
      await page.goto(urlCurso(c))
      const orden = await page.getByTestId('piezas-curso').locator('[data-testid^="paso-"], [data-testid^="seccion-"]').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-testid')))
      const seccion = (s: NonNullable<DatosCurso['secciones']>[number]) => [`seccion-${s.id}`, ...s.variantes.map((id) => `paso-v:${id}`)]
      const [antes, despues] = [c.secciones!.filter((s) => !s.opcional), c.secciones!.filter((s) => s.opcional)]
      expect(orden).toEqual(['paso-idea', 'paso-estructura', ...antes.flatMap(seccion), 'paso-errores', 'paso-repaso', ...despues.flatMap(seccion)])
      await expect(page.getByTestId('seccion-opcional')).toContainText('No cuentan para terminar el curso.')
      for (const v of c.variantes) {
        const e = page.getByTestId(`paso-v:${v.id}`).getByTestId('estructura-leccion')
        // el Diemer queda fuera del mapa: va sin etiqueta
        if (v.estructura) await expect(e, v.id).toHaveText(v.estructura)
        else await expect(e, v.id).toHaveCount(0)
      }
      // el tablero de arriba, desde el lado de negras
      await expect(page.getByTestId('pagina-curso').locator('.pagina-apertura-tablero [data-orientacion]').first()).toHaveAttribute('data-orientacion', 'black')
    })

    test('El mapa y una página por forma', async ({ page }) => {
      await page.goto(`${urlCurso(c)}/leer/estructura`)
      const pieza = page.getByTestId('pieza-estructura')
      await expect(pieza).toContainText(mapa)
      // una página a la vez: el mapa y, con "Siguiente", cada forma
      const paginas = c.piezas.estructura.paginas
      for (const [i, p] of paginas.entries()) {
        await expect(pieza, p.subtitulo).toContainText(p.subtitulo!)
        await expect(pieza).toContainText(`${i + 1} de ${paginas.length}`)
        if (i < paginas.length - 1) await page.getByRole('button', { name: 'Siguiente' }).click()
      }
    })

    for (const [id, cual] of recorrer)
      test(`${id}: Aprender y Practicar, con su número arriba ("${cual}")`, async ({ page }, info) => {
        const l = lineaPorId(c, `v:${id}`)!
        const mias = misJugadas(l)
        await page.goto(urlDe(c, l.id))
        await momento(page, 'intro')
        await expect(page.getByTestId('cual-variante')).toHaveText(cual)
        await expect(page.getByTestId('narracion')).toContainText(mostrarTexto(l.intro, 'figuras'))
        await page.getByTestId('empezar-vuelta').click()
        await momento(page, 'tuTurno')
        await expect(leccion(page)).toHaveAttribute('data-ply', String(mias[0]))
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

    test(`"Siguiente variante" sigue la tabla; la última obligatoria va a Errores y trampas, con sus ${c.piezas.errores.lista.length} «¿Y si…?»`, async ({ page }, info) => {
      test.setTimeout(120_000)
      const [penultima, ultima, cual] = cruce
      await terminar(page, info, c, penultima)
      await expect(page.getByTestId('salida-siguiente')).toHaveText('Siguiente variante')
      await page.getByTestId('salida-siguiente').click()
      await expect(page.getByTestId('nombre-linea')).toHaveText(mostrarTexto(lineaPorId(c, `v:${ultima}`)!.nombre, 'figuras'))
      await expect(page.getByTestId('cual-variante')).toHaveText(cual)
      await terminar(page, info, c, obligatorias(c).at(-1)!.id)
      await expect(page.getByTestId('salida-siguiente')).toHaveText('Errores y trampas')
      await page.getByTestId('salida-siguiente').click()
      await expect(page.getByTestId('pieza-errores').locator('[data-testid^="error-"]')).toHaveCount(c.piezas.errores.lista.length)
    })

    test('una opcional lleva a la siguiente opcional; la última, de vuelta al curso; y no entra al Repaso', async ({ page }, info) => {
      test.setTimeout(120_000)
      await page.clock.setFixedTime(HOY)
      const [penultima, ultima] = opcionalesFin
      expect(opcionales(c).slice(-2).map((v) => v.id)).toEqual(opcionalesFin)
      await terminar(page, info, c, penultima)
      await expect(page.getByTestId('salida-siguiente')).toHaveText('Siguiente variante')
      await terminar(page, info, c, ultima)
      await expect(page.getByTestId('salida-siguiente')).toHaveText('Volver al curso')
      expect((await leido(page, claveDe(c))).variantes[ultima].terminada).toBeTruthy()
      expect((await leido(page, 'ajedrez.v1.progreso')) ?? {}).toEqual({})
      await page.goto(urlCurso(c))
      await expect(page.getByTestId('avance')).toHaveText(`0 de ${n} variantes`)
      await expect(page.getByTestId(`paso-v:${ultima}`)).toHaveAttribute('data-estado', 'hecha')
    })

    for (const [ancho, alto] of [[360, 740], [375, 667], [402, 874], [430, 932]] as const)
    test(`con la obligatoria de nombre más largo en curso, "Seguir" lleva el nombre en un renglón, a ${ancho} de ancho`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: alto })
      const larga = obligatorias(c).reduce((a, b) => (mostrarTexto(b.nombre, 'figuras').length > mostrarTexto(a.nombre, 'figuras').length ? b : a))
      await page.goto(urlCurso(c))
      const avance = { piezas: { idea: 1, estructura: 1 }, variantes: {}, errores: {}, enCurso: { linea: `v:${larga.id}`, vuelta: 'aprender', ply: 1, fecha: Date.now() } }
      await page.evaluate(([k, a]) => localStorage.setItem(k, a), [claveDe(c), JSON.stringify(avance)] as const)
      await page.reload()
      const boton = page.getByTestId('empezar-curso')
      await expect(boton).toContainText('Seguir')
      await page.evaluate(() => document.fonts.ready)
      const m = await boton.evaluate((b) => {
        const abajo = (b.firstElementChild as HTMLElement).children[1] as HTMLElement
        const r = abajo.getBoundingClientRect()
        const caja = b.getBoundingClientRect()
        const e = getComputedStyle(b)
        return { texto: abajo.textContent, alto: r.height, renglon: parseFloat(getComputedStyle(abajo).lineHeight), izquierda: r.left, derecha: r.right, dentro: [caja.left + parseFloat(e.paddingLeft), caja.right - parseFloat(e.paddingRight)], pagina: document.documentElement.scrollWidth, pantalla: innerWidth }
      })
      expect(m.texto).toContain(mostrarTexto(larga.nombre, 'figuras'))
      expect(m.alto, larga.nombre).toBeLessThan(m.renglon * 1.5)
      expect(m.izquierda).toBeGreaterThanOrEqual(m.dentro[0]! - 0.5)
      expect(m.derecha).toBeLessThanOrEqual(m.dentro[1]! + 0.5)
      expect(m.pagina).toBeLessThanOrEqual(m.pantalla)
    })

    for (const [ancho, alto] of [[375, 667], [360, 740], [390, 844], [402, 874], [430, 932]] as const)
    test(`la lección cabe a ${ancho}×${alto}: la introducción más larga y el último "Te toca" de la línea más larga, sin scroll de la página`, async ({ page }) => {
      await page.setViewportSize({ width: ancho, height: alto })
      const introLarga = [...c.variantes].sort((a, b) => b.intro.length - a.intro.length)[0]!
      const lineaLarga = lineaPorId(c, `v:${[...c.variantes].sort((a, b) => lineaPorId(c, `v:${b.id}`)!.jugadas.length - lineaPorId(c, `v:${a.id}`)!.jugadas.length)[0]!.id}`)!
      const cabe = async (cuando: string, texto: string) => {
        const m = await page.evaluate((t) => {
          const tablero = document.querySelector('[data-testid="tablero"]')!.getBoundingClientRect()
          return { pagina: document.documentElement.scrollHeight, ventana: innerHeight, ancho: document.documentElement.scrollWidth, pantalla: innerWidth, texto: document.querySelector(`[data-testid="${t}"]`)?.getBoundingClientRect().height ?? 0, tablero: tablero.width }
        }, texto)
        expect.soft(m.pagina, `${cuando}: sin scroll de la página`).toBeLessThanOrEqual(m.ventana)
        expect.soft(m.ancho, `${cuando}: nada se sale a lo ancho`).toBeLessThanOrEqual(m.pantalla)
        expect.soft(Math.round(m.texto), `${cuando}: la narración`).toBeGreaterThanOrEqual(140)
        expect.soft(Math.round(m.tablero), `${cuando}: el tablero`).toBeGreaterThanOrEqual(280)
      }
      await page.goto(urlDe(c, `v:${introLarga.id}`))
      await momento(page, 'intro')
      await cabe(`la introducción de ${introLarga.id}`, 'narracion')
      const ultima = Math.max(...misJugadas(lineaLarga))
      await page.goto('/#/')
      await page.evaluate(([k, linea, ply]) => localStorage.setItem(k as string, JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta: 'aprender', ply, fecha: Date.now() } })), [claveDe(c), lineaLarga.id, ultima] as const)
      await page.goto(urlDe(c, lineaLarga.id))
      await page.reload()
      await momento(page, 'tuTurno')
      await cabe(`"Te toca" en la última de ${lineaLarga.id}`, 'narracion')
    })

    test('en el ancho más chico, nada se sale: la tarjeta, la página y la lección de línea más larga', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 })
      const larga = c.variantes.reduce((a, b) => (b.id && lineaPorId(c, `v:${b.id}`)!.jugadas.length > lineaPorId(c, `v:${a.id}`)!.jugadas.length ? b : a))
      for (const [u, testid] of [['/#/cursos/negras', `tarjeta-${c.id}`], [urlCurso(c), 'pagina-curso'], [urlDe(c, `v:${larga.id}`), 'leccion-curso']] as const) {
        await page.goto(u)
        await expect(page.getByTestId(testid)).toBeVisible()
        const m = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, pantalla: innerWidth }))
        expect(m.pagina, u).toBeLessThanOrEqual(m.pantalla)
      }
    })
  })
}
