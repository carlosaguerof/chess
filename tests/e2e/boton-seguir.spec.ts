import { expect, test, type Page } from '@playwright/test'
import { cursoNuevo } from '../../src/curso/datos.ts'

/**
 * El botón "Seguir" de la página del curso, con jerarquía (2026-10-29). Decía "Seguir: Avance: 4.♘c3 (Van der Wiel)" todo
 * con la letra de `grande` (22 px) y el nombre se partía: "Wiel)" quedaba solo en el segundo renglón. Ahora "Seguir" va
 * arriba, grande, y el nombre de la variante abajo, chico y de peso normal, en un solo renglón: dice dónde retomo.
 * Se prueba con cada una de las 16 variantes en curso, a 360, 375, 402 y 430 de ancho. "Empezar" y "Repasar el curso" se
 * quedan como estaban. Las capturas, a 402×874 y 360×740 y a escala CSS, en iterations/v3/capturas/correcciones/<perfil>/;
 * las de antes del cambio salieron de esta misma prueba con CAPTURAS=antes, en Chromium.
 */

const ANCHOS = [
  { ancho: 360, alto: 740 },
  { ancho: 375, alto: 667 },
  { ancho: 402, alto: 874 },
  { ancho: 430, alto: 932 },
]
const CON_CAPTURA = [
  { ancho: 402, alto: 874 },
  { ancho: 360, alto: 740 },
]
const CUANDO = process.env.CAPTURAS === 'antes' ? 'antes' : 'despues'

const CURSO = cursoNuevo('caro-kann:b')!
const CLAVE = 'ajedrez.v1.curso:caro-kann:b'
const URL = '/#/curso/caro-kann%3Ab'
const boton = (page: Page) => page.getByTestId('empezar-curso')

type Avance = { piezas?: Record<string, number>; terminadas?: string[]; enCurso?: string }

/** Guarda el avance en el teléfono, como lo deja la app, y vuelve a abrir la página del curso. */
async function conAvance(page: Page, a: Avance) {
  const avance = {
    piezas: a.piezas ?? {},
    variantes: Object.fromEntries((a.terminadas ?? []).map((id) => [id, { aprendida: 1, terminada: 1 }])),
    errores: {},
    enCurso: a.enCurso ? { linea: `v:${a.enCurso}`, vuelta: 'aprender', ply: 1, fecha: Date.now() } : undefined,
  }
  await page.goto(URL)
  await page.evaluate(([clave, avance]) => localStorage.setItem(clave, avance), [CLAVE, JSON.stringify(avance)] as const)
  await page.reload()
  await expect(boton(page)).toBeVisible()
  await page.evaluate(() => document.fonts.ready)
}

/** El botón, medido: sus hijos, sus dos renglones con su letra, y si el nombre cabe en uno dentro del botón. */
const medir = (page: Page) =>
  boton(page).evaluate((b) => {
    const estilo = (e: Element) => getComputedStyle(e)
    const texto = b.firstElementChild as HTMLElement
    const [arriba, abajo] = Array.from(texto.children) as HTMLElement[]
    const caja = b.getBoundingClientRect()
    const n = abajo!.getBoundingClientRect()
    return {
      hijos: b.childNodes.length,
      renglones: texto.children.length,
      letraBoton: estilo(b).fontSize,
      seguir: { texto: arriba!.textContent, letra: estilo(arriba!).fontSize },
      nombre: {
        texto: abajo!.textContent,
        letra: parseFloat(estilo(abajo!).fontSize),
        peso: estilo(abajo!).fontWeight,
        alto: n.height,
        renglon: parseFloat(estilo(abajo!).lineHeight),
        izquierda: n.left,
        derecha: n.right,
      },
      dentro: { izquierda: caja.left + parseFloat(estilo(b).paddingLeft), derecha: caja.right - parseFloat(estilo(b).paddingRight) },
      pagina: document.documentElement.scrollWidth,
      pantalla: innerWidth,
    }
  })

test.describe('El botón "Seguir" de la página del curso, con jerarquía', () => {
  test('con cada una de las 16 variantes en curso, "Seguir" grande y el nombre chico en un renglón, a 360, 375, 402 y 430', async ({ page }) => {
    expect(CURSO.variantes).toHaveLength(16)
    // la página se abre ya en cada ancho, como en el teléfono: si se achica la ventana con la página abierta, el tablero
    // tarda un momento en ajustarse y la medida ve una página más ancha que no existe
    for (const { ancho, alto } of ANCHOS) {
      await page.setViewportSize({ width: ancho, height: alto })
      for (const v of CURSO.variantes) {
        await conAvance(page, { piezas: { idea: 1, estructura: 1 }, enCurso: v.id })
        // el nombre como lo muestra la página (en figuras), sin su número: "3. Avance: 4.♘c3 (Van der Wiel)"
        const nombre = ((await page.getByTestId(`paso-v:${v.id}`).locator('.nombre').textContent()) ?? '').replace(/^\d+\.\s*/, '')
        const m = await medir(page)
        const donde = `${v.nombre}, a ${ancho}`
        expect.soft(m.hijos, `${donde}: el texto, en un solo elemento hijo del botón`).toBe(1)
        expect.soft(m.renglones, `${donde}: dos renglones`).toBe(2)
        expect.soft(m.seguir.texto, `${donde}: arriba dice "Seguir"`).toBe('Seguir')
        expect.soft(m.seguir.letra, `${donde}: "Seguir", con la letra de grande`).toBe('22px')
        expect.soft(m.seguir.letra, `${donde}: "Seguir", con la letra del botón`).toBe(m.letraBoton)
        expect.soft(m.nombre.texto, `${donde}: abajo, el nombre de la variante`).toBe(nombre)
        expect.soft(m.nombre.letra, `${donde}: el nombre, con letra chica`).toBeLessThanOrEqual(15)
        expect.soft(m.nombre.letra, `${donde}: el nombre, no menos de 13 px`).toBeGreaterThanOrEqual(13)
        expect.soft(m.nombre.peso, `${donde}: el nombre, de peso normal`).toBe('400')
        expect.soft(m.nombre.alto, `${donde}: el nombre, en un solo renglón`).toBeLessThan(m.nombre.renglon * 1.5)
        expect.soft(m.nombre.izquierda, `${donde}: el nombre, dentro del botón`).toBeGreaterThanOrEqual(m.dentro.izquierda - 0.5)
        expect.soft(m.nombre.derecha, `${donde}: el nombre, dentro del botón`).toBeLessThanOrEqual(m.dentro.derecha + 0.5)
        expect.soft(m.pagina, `${donde}: sin scroll a lo ancho`).toBeLessThanOrEqual(m.pantalla)
      }
    }
  })

  test('"Empezar" y "Repasar el curso" se quedan como estaban: una sola palabra grande', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    const comoEstaba = async (texto: string) => {
      await expect(boton(page)).toHaveText(texto)
      const m = await boton(page).evaluate((b) => ({ hijos: b.childNodes.length, elementos: b.children.length, letra: getComputedStyle(b).fontSize }))
      expect(m).toEqual({ hijos: 1, elementos: 0, letra: '22px' })
    }
    await conAvance(page, {})
    await comoEstaba('Empezar')
    await conAvance(page, { piezas: { idea: 1, estructura: 1, errores: 1, repaso: 1 }, terminadas: CURSO.variantes.map((v) => v.id) })
    await comoEstaba('Repasar el curso')
  })

  test('capturas de la página del curso con la Van der Wiel en curso, a 402×874 y 360×740', async ({ page }, info) => {
    for (const { ancho, alto } of CON_CAPTURA) {
      await page.setViewportSize({ width: ancho, height: alto })
      // como en la captura de Carlos: 2 de 16 variantes y la Van der Wiel a medias
      await conAvance(page, { piezas: { idea: 1, estructura: 1 }, terminadas: ['avance-short', 'avance-c3'], enCurso: 'avance-van-der-wiel' })
      await expect(page.getByTestId('avance')).toHaveText('2 de 16 variantes')
      await page.screenshot({ path: `iterations/v3/capturas/correcciones/${info.project.name}/boton-seguir-${CUANDO}-${ancho}x${alto}.png`, scale: 'css' })
    }
  })
})
