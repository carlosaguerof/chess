import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId } from '../../src/curso/datos.ts'
import { jugar, tocar } from './_util.ts'

/**
 * El pie de la narración (2026-10-30, Carlos en su iPhone: "Siguiente debería ir a la derecha, no a la izquierda"): la
 * acción principal va a la derecha, sola o con una secundaria a su izquierda.
 */
const c = cursoNuevo('caro-kann:b')!
const TAL = 'v:avance-tal'
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })

async function abrirEn(page: Page, linea: string, vuelta: 'aprender' | 'practicar', ply: number) {
  await page.goto('/#/')
  await page.evaluate(([linea, vuelta, ply]) => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta, ply, fecha: Date.now() } })), [linea, vuelta, ply] as const)
  await page.goto('/#/curso/caro-kann%3Ab/linea/' + encodeURIComponent(linea))
  await page.reload()
}

const uci = (jugadas: string[], ply: number) => {
  const m = new Chess()
  for (const s of jugadas.slice(0, ply)) m.move(s)
  const j = m.move(jugadas[ply]!)
  return j.from + j.to + (j.promotion ?? '')
}

/** Abre una jugada mía de una línea y la juega: queda en "leer", con su explicación. */
async function despuesDe(page: Page, info: TestInfo, linea: string, vuelta: 'aprender' | 'practicar', ply: number) {
  await abrirEn(page, linea, vuelta, ply)
  await momento(page, 'tuTurno')
  await jugar(page, info, uci(lineaPorId(c, linea)!.jugadas, ply))
  await momento(page, 'leer')
}

/** Cuánto le falta al botón para llegar a la orilla derecha e izquierda de su pie. */
async function orillas(page: Page, id: string) {
  return page.getByTestId(id).evaluate((b) => {
    const r = b.getBoundingClientRect()
    const pie = b.closest('.narracion-pie')!.getBoundingClientRect()
    return { derecha: Math.round(pie.right - r.right), izquierda: Math.round(r.left - pie.left) }
  })
}

test.describe('V3 · la acción principal va a la derecha del pie', () => {
  test('sola: "Empezar" y "Siguiente" quedan pegados a la derecha', async ({ page }, info) => {
    await page.goto('/#/curso/caro-kann%3Ab/linea/' + encodeURIComponent('v:clasica'))
    await momento(page, 'intro')
    const empezar = await orillas(page, 'empezar-vuelta')
    expect(empezar.derecha, '"Empezar", pegado a la derecha').toBe(0)
    expect(empezar.izquierda, '"Empezar" no llena el pie').toBeGreaterThan(0)

    // 5...Axd3 de la Tal: su explicación no trae nada que ver, y "Siguiente" va solo
    await despuesDe(page, info, TAL, 'aprender', 9)
    const siguiente = await orillas(page, 'siguiente')
    expect(siguiente.derecha, '"Siguiente", pegado a la derecha').toBe(0)
    expect(siguiente.izquierda, '"Siguiente" no llena el pie').toBeGreaterThan(0)
  })

  test('con error a la vista: "Reintentar" también va a la derecha', async ({ page }, info) => {
    await abrirEn(page, TAL, 'aprender', 9)
    await momento(page, 'tuTurno')
    // 5...Ag6 no es la jugada de la lección: el error se queda hasta Reintentar
    await tocar(page, info, 'f5')
    await tocar(page, info, 'g6')
    await momento(page, 'error')
    const r = await orillas(page, 'reintentar')
    expect(r.derecha).toBe(0)
    expect(r.izquierda).toBeGreaterThan(0)
  })

  test('el plan no cambia: "Ver paso a paso" a la izquierda y "Ahora, Practicar" a la derecha', async ({ page }) => {
    const l = lineaPorId(c, TAL)!
    await abrirEn(page, TAL, 'aprender', l.jugadas.length)
    await momento(page, 'plan')
    expect((await orillas(page, 'ver-paso-a-paso')).izquierda).toBe(0)
    expect((await orillas(page, 'a-practicar')).derecha).toBe(0)
  })
})
