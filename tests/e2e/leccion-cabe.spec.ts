import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { cursoNuevo, lineaPorId } from '../../src/curso/datos.ts'
import { palabras } from '../../src/curso/textos.ts'
import { jugar, tocar } from './_util.ts'

/**
 * La lección del curso cabe en la pantalla del celular (2026-10-29). En el iPhone de Carlos había dos barras de scroll: la
 * de la narración (se queda) y la de la página (sobraba). Ahora la lección mide lo que se ve: la narración toma el alto que
 * sobra (140 o más) y, solo si no alcanza, el tablero se achica (280 o más). Se prueba en las cinco pantallas que midió la
 * torre, en la Clásica (la variante con la línea más larga) y en sus momentos más altos: "Te toca" con la frase del rival,
 * un error con la nota del motor, la explicación, el plan con sus dos botones y el resumen (Nota 1: también cabe).
 * Las capturas, a 402×874 y 375×667 y a escala CSS, en iterations/v3/capturas/correcciones/<perfil>/; las de antes del
 * cambio salieron de esta misma prueba con CAPTURAS=antes, en Chromium.
 */

const PANTALLAS = [
  { nombre: 'iPhone SE', ancho: 375, alto: 667 },
  { nombre: 'Android chico', ancho: 360, alto: 740 },
  { nombre: 'iPhone 13/14', ancho: 390, alto: 844 },
  { nombre: 'iPhone 16 Pro', ancho: 402, alto: 874 },
  { nombre: 'iPhone Pro Max', ancho: 430, alto: 932 },
]
/** las capturas son del curso de hoy: el curso por estructuras tiene las suyas (`capturas-estructuras.spec.ts`) */
const CON_CAPTURA = ['402x874', '375x667']
const CUANDO = process.env.CAPTURAS === 'antes' ? 'antes' : 'despues'

const enUci = (san: string[]) => {
  const c = new Chess()
  return san.map((s) => {
    const m = c.move(s)
    return m.from + m.to + (m.promotion ?? '')
  })
}
const CURSO = 'caro-kann:b'
const ESTRUCTURAS = 'caro-kann-estructuras:b'
/** la introducción más larga del curso por estructuras: la frase nueva le suma alto */
const MAS_LARGA = [...cursoNuevo(ESTRUCTURAS)!.variantes].sort((a, b) => palabras(b.intro) - palabras(a.intro))[0]!
const CLASICA = lineaPorId(cursoNuevo(CURSO)!, 'v:clasica')!
const UCI = enUci(CLASICA.jugadas)
/** 10...e6, la última jugada mía: la línea ya es la más larga del curso */
const ULTIMA = CLASICA.jugadas.length - 1
/** 10...Cc5?? 11.dxc5: el motor ve que pierde material */
const MALA = 'd7c5'
const URL = (curso: string, linea: string = CLASICA.id) => `/#/curso/${encodeURIComponent(curso)}/linea/${encodeURIComponent(linea)}`
const BOTONES = ['pista', 'respuesta', 'atras', 'reiniciar']

const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
// se toca sin que Playwright desplace la página: si algo no se ve, la medida lo dice
const toca = (page: Page, id: string) => page.getByTestId(id).dispatchEvent('click')

/** Retoma la Clásica en su última jugada, como al volver a la lección a medias. */
async function retomarEnLaUltima(page: Page, vuelta: 'aprender' | 'practicar', curso: string) {
  await page.evaluate(([clave, linea, vuelta, ply]) => localStorage.setItem(clave as string, JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta, ply, fecha: Date.now() } })), [`ajedrez.v1.curso:${curso}`, CLASICA.id, vuelta, ULTIMA] as const)
  await page.goto(URL(curso))
  await page.reload()
  await momento(page, 'tuTurno')
  await expect(leccion(page)).toHaveAttribute('data-ply', String(ULTIMA))
}

/** Sin scroll de la página, lo que se toca completo a la vista, la narración de 140 o más y el tablero cuadrado de 280 o más. */
async function cabe(page: Page, info: TestInfo, cuando: string, aLaVista: string[], texto: string) {
  const m = await page.evaluate(
    ([aLaVista, texto]) => {
      const caja = (s: string) => document.querySelector(s)?.getBoundingClientRect() ?? null
      const dentro = (r: DOMRect | null) => !!r && r.top >= 0 && r.left >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5
      const tablero = caja('[data-testid="tablero"]')!
      return {
        pagina: document.documentElement.scrollHeight,
        ventana: innerHeight,
        ancho: document.documentElement.scrollWidth,
        pantalla: innerWidth,
        fuera: aLaVista.filter((id) => !dentro(caja(`[data-testid="${id}"]`))),
        texto: caja(`[data-testid="${texto}"]`)?.height ?? 0,
        tablero: { ancho: tablero.width, alto: tablero.height },
        derecha: Math.max(...Array.from(document.querySelectorAll('[data-testid="tablero"], .partida-panel, .partida-panel button, .partida-panel a'), (e) => e.getBoundingClientRect().right)),
      }
    },
    [aLaVista, texto] as const,
  )
  const pantalla = `${m.pantalla}x${m.ventana}`
  if (CON_CAPTURA.includes(pantalla) && !info.title.startsWith(ESTRUCTURAS)) await page.screenshot({ path: `iterations/v3/capturas/correcciones/${info.project.name}/leccion-${CUANDO}-${pantalla}-${cuando}.png`, scale: 'css' })
  expect.soft(m.pagina, `${cuando}: sin scroll de la página`).toBeLessThanOrEqual(m.ventana)
  expect.soft(m.fuera, `${cuando}: completos dentro de la ventana`).toEqual([])
  expect.soft(Math.round(m.texto), `${cuando}: la narración`).toBeGreaterThanOrEqual(140)
  expect.soft(Math.abs(m.tablero.ancho - m.tablero.alto), `${cuando}: el tablero, cuadrado`).toBeLessThanOrEqual(1)
  expect.soft(Math.round(m.tablero.ancho), `${cuando}: el tablero`).toBeGreaterThanOrEqual(280)
  expect.soft(m.ancho, `${cuando}: nada se sale a lo ancho (la página)`).toBeLessThanOrEqual(m.pantalla)
  expect.soft(m.derecha, `${cuando}: nada se sale a lo ancho (tablero, panel y botones)`).toBeLessThanOrEqual(m.pantalla + 0.5)
}

for (const p of PANTALLAS) {
  test.describe(`La lección cabe en ${p.nombre} (${p.ancho}×${p.alto})`, () => {
    test.use({ viewport: { width: p.ancho, height: p.alto } })

    test(`${ESTRUCTURAS}: la introducción más larga, con su frase nueva, sin scroll de la página`, async ({ page }, info) => {
      await page.goto(URL(ESTRUCTURAS, `v:${MAS_LARGA.id}`))
      await momento(page, 'intro')
      await expect(page.getByTestId('narracion')).toContainText(mostrarTexto(MAS_LARGA.intro, 'figuras'))
      await cabe(page, info, '0-introduccion', [...BOTONES, 'empezar-vuelta'], 'narracion')
    })

    for (const curso of [CURSO, ESTRUCTURAS])
    test(`${curso}: sin scroll de la página en los momentos más altos, y el botón del resumen en un renglón`, async ({ page }, info) => {
      test.setTimeout(120_000)
      await page.goto('/#/')

      // 1. "Te toca", con la frase del rival (10.Dxd3) y lo que hace tu jugada
      await retomarEnLaUltima(page, 'aprender', curso)
      await expect(page.getByTestId('narracion').locator('[data-tipo="rival"]')).toHaveCount(1)
      await cabe(page, info, '1-te-toca', BOTONES, 'narracion')
      // "Reiniciar" (y "Respuesta") caben en un renglón también a 360 de ancho
      const etiquetas = await page.locator('.botones-curso button span').evaluateAll((ss) => ss.map((s) => s.getBoundingClientRect().height / parseFloat(getComputedStyle(s).fontSize)))
      expect.soft(Math.max(...etiquetas), 'las etiquetas de los cuatro botones, en un renglón').toBeLessThan(1.6)

      // 2. un error, con la nota del motor
      await tocar(page, info, MALA.slice(0, 2))
      await tocar(page, info, MALA.slice(2, 4))
      await momento(page, 'error')
      await expect(page.getByTestId('narracion')).toContainText('El motor ve', { timeout: 30_000 })
      await cabe(page, info, '2-error-y-motor', [...BOTONES, 'reintentar'], 'narracion')

      // 3. la explicación después de jugar
      await toca(page, 'reintentar')
      await momento(page, 'tuTurno')
      await jugar(page, info, UCI[ULTIMA]!)
      await momento(page, 'leer')
      await cabe(page, info, '3-explicacion', [...BOTONES, 'siguiente'], 'narracion')

      // 4. el plan, con sus dos botones
      await toca(page, 'siguiente')
      await momento(page, 'plan')
      await expect(page.getByTestId('narracion').getByTestId('ver-paso-a-paso')).toBeVisible()
      await cabe(page, info, '4-plan', [...BOTONES, 'ver-paso-a-paso', 'a-practicar'], 'narracion')

      // 5. el resumen de Practicar, con un tropiezo (Pista y un error): su texto se desliza por dentro y las salidas, abajo
      await retomarEnLaUltima(page, 'practicar', curso)
      await toca(page, 'pista')
      await tocar(page, info, MALA.slice(0, 2))
      await tocar(page, info, MALA.slice(2, 4))
      await momento(page, 'error')
      await toca(page, 'reintentar')
      await momento(page, 'tuTurno')
      await jugar(page, info, UCI[ULTIMA]!)
      await momento(page, 'leer')
      await toca(page, 'siguiente')
      await momento(page, 'fin')
      await expect(page.getByTestId('resumen-tropiezos')).toContainText('pediste Pista')
      await cabe(page, info, '5-resumen', ['salida-siguiente', 'salida-repetir', 'salida-curso'], 'resumen-texto')

      // Nota 1: el botón dice "Siguiente variante", con la letra de un botón normal (como Repetir) y en un solo renglón
      const b = await page.evaluate(() => {
        const medir = (id: string) => {
          const e = document.querySelector<HTMLElement>(`[data-testid="${id}"]`)!
          return { texto: e.textContent, letra: getComputedStyle(e).fontSize, alto: e.getBoundingClientRect().height }
        }
        return { siguiente: medir('salida-siguiente'), repetir: medir('salida-repetir') }
      })
      expect.soft(b.siguiente.texto).toBe('Siguiente variante')
      expect.soft(b.siguiente.letra, 'la letra de un botón normal').toBe(b.repetir.letra)
      expect.soft(b.siguiente.alto, 'en un solo renglón (tan alto como Repetir)').toBeLessThanOrEqual(b.repetir.alto + 0.5)
    })
  })
}

test.describe('Nota 1: los botones con jugadas en su texto no se parten en columnas', () => {
  test.use({ viewport: { width: 402, height: 874 } })

  test('"Seguir" y "Avance: 4.♘f3" en la página del curso van en un solo elemento, no un trozo por figura', async ({ page }) => {
    await page.goto('/#/')
    await page.evaluate(() => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea: 'v:avance-short', vuelta: 'aprender', ply: 1, fecha: Date.now() } })))
    await page.goto('/#/curso/caro-kann%3Ab')
    const boton = page.getByTestId('empezar-curso')
    // dos renglones desde el 2026-10-29: "Seguir" y, abajo, el nombre (tests/e2e/boton-seguir.spec.ts)
    await expect(boton).toContainText('Seguir')
    await expect(page.getByTestId('seguir-nombre')).toHaveText('Avance: 4.♘f3')
    // .boton es inline-flex: si el texto no va en un solo elemento, cada trozo (las letras, la figura ♘, lo demás) es una columna aparte
    const m = await boton.evaluate((e) => ({ hijos: e.childNodes.length, figuras: e.querySelectorAll('.figura').length }))
    expect(m.figuras).toBe(1)
    expect(m.hijos, 'el texto, en un solo elemento').toBe(1)
  })
})
