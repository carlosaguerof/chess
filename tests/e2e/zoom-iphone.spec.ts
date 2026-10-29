import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursos } from '../../src/cursos/datos.ts'
import { centroCasilla, jugar } from './_util.ts'

// El bug del 2026-10-28: jugando contra Brisa en el iPhone, la página se ensanchaba y Safari cambiaba el zoom solo.
// La causa: la columna de la partida medía `1fr` y crecía con la lista de jugadas en un solo renglón (estilos.css).
// Aquí se juega tocando el tablero y, tras cada jugada, la página debe caber en la pantalla con la escala en 1.

const enUci = (san: string[]) => {
  const c = new Chess()
  return san.map((s) => {
    const m = c.move(s)
    return m.from + m.to + (m.promotion ?? '')
  })
}
const sinNumeros = (pgn: string) => pgn.replace(/\d+\./g, ' ').split(/\s+/).filter(Boolean)

/** La partida del reporte: 1.e4 e5 2.d3 c6 3.h4 Ae7 4.g4 Cf6 5.f4 Dc7 6.Ae2 d5 7.fxe5 Cfd7 8.exd5 (en SAN de chess.js) */
const DEL_REPORTE = enUci(sinNumeros('1.e4 e5 2.d3 c6 3.h4 Be7 4.g4 Nf6 5.f4 Qc7 6.Be2 d5 7.fxe5 Nfd7 8.exd5'))
/** Una partida de 40 jugadas con muchas capturas y jaques (notación larga: la lista más ancha posible) */
const CUARENTA = enUci(
  sinNumeros(`1.e4 d6 2.d4 Nf6 3.Nc3 g6 4.Be3 Bg7 5.Qd2 c6 6.f3 b5 7.Nge2 Nbd7 8.Bh6 Bxh6 9.Qxh6 Bb7 10.a3 e5
  11.O-O-O Qe7 12.Kb1 a6 13.Nc1 O-O-O 14.Nb3 exd4 15.Rxd4 c5 16.Rd1 Nb6 17.g3 Kb8 18.Na5 Ba8 19.Bh3 d5 20.Qf4+ Ka7
  21.Rhe1 d4 22.Nd5 Nbxd5 23.exd5 Qd6 24.Rxd4 cxd4 25.Re7+ Kb6 26.Qxd4+ Kxa5 27.b4+ Ka4 28.Qc3 Qxd5 29.Ra7 Bb7 30.Rxb7 Qc4
  31.Qxf6 Kxa3 32.Qxa6+ Kxb4 33.c3+ Kxc3 34.Qa1+ Kd2 35.Qb2+ Kd1 36.Bf1 Rd2 37.Rd7 Rxd7 38.Bxc4 bxc4 39.Qxh8 Rd3 40.Qa8`),
)

const jugadas = (page: Page) => page.getByTestId('lista-jugadas').getByTestId('jugada')

/** La página cabe en la pantalla: no se sale a lo ancho, la escala sigue en 1 y el tablero, el panel y sus botones quedan a la vista. */
async function cabe(page: Page, cuando: string) {
  const m = await page.evaluate(() => {
    const derecha = (s: string) => Math.max(0, ...Array.from(document.querySelectorAll(s), (e) => e.getBoundingClientRect().right))
    return {
      pantalla: innerWidth,
      pagina: document.documentElement.scrollWidth,
      escala: visualViewport?.scale ?? 1,
      tocable: derecha('[data-testid="tablero"], .partida-panel, .partida-panel button'),
    }
  })
  expect(m.pagina, `${cuando}: ancho de la página`).toBeLessThanOrEqual(m.pantalla)
  expect(m.escala, `${cuando}: escala`).toBe(1)
  expect(m.tocable, `${cuando}: tablero, panel y botones`).toBeLessThanOrEqual(m.pantalla)
}

/** La lista de jugadas en un renglón se desliza dentro de su espacio, con la última jugada a la vista. */
async function listaSeDesliza(page: Page) {
  const l = await page.evaluate(() => {
    const lista = document.querySelector('[data-testid="lista-jugadas"]')!
    const caja = lista.getBoundingClientRect()
    const ultima = lista.querySelector('.jugada.actual')!.getBoundingClientRect()
    return { desliza: lista.scrollWidth > lista.clientWidth, ultimaVisible: ultima.left >= caja.left - 1 && ultima.right <= caja.right + 1 }
  })
  expect(l).toEqual({ desliza: true, ultimaVisible: true })
}

/** Carga la partida hasta `ply` (las jugadas de Brisa, tal cual), juega la mía tocando el tablero y revisa que todo quepa. */
async function jugarDesde(page: Page, info: TestInfo, partida: string[], ply: number) {
  await page.goto(`/#/prueba-partida?bot=brisa&color=w&guia=1&jugadas=${partida.slice(0, ply).join(',')}`)
  await expect(jugadas(page)).toHaveCount(ply)
  await jugar(page, info, partida[ply]!)
  await cabe(page, `tras la jugada ${ply / 2 + 1}`)
}

test.describe('El zoom en el iPhone: la página nunca se ensancha ni cambia de escala al jugar', () => {
  test.skip(({ isMobile }) => !isMobile, 'el bug es del celular')

  test('la partida del reporte contra Brisa, jugada por toques', async ({ page }, info) => {
    test.setTimeout(120_000)
    for (let ply = 0; ply < DEL_REPORTE.length; ply += 2) await jugarDesde(page, info, DEL_REPORTE, ply)
    // Brisa contesta a 8.exd5
    await expect(jugadas(page)).toHaveCount(DEL_REPORTE.length + 1, { timeout: 20_000 })
    await cabe(page, 'tras la respuesta de Brisa')
    await listaSeDesliza(page)
    // lo que se toca no hace zoom con doble toque; el tablero ya lo impedía (touch-action: none) y lo sigue haciendo
    const tacto = await page.evaluate(() => ({
      tablero: getComputedStyle(document.querySelector('.tablero')!).touchAction,
      lista: getComputedStyle(document.querySelector('[data-testid="lista-jugadas"]')!).touchAction,
      boton: getComputedStyle(document.querySelector('[data-testid="voltear"]')!).touchAction,
    }))
    expect(tacto).toEqual({ tablero: 'none', lista: 'manipulation', boton: 'manipulation' })
    // dos casillas tocadas rápido (en el iPhone cuenta como doble toque), y dos toques rápidos en la lista y en un botón
    const [a, b] = [await centroCasilla(page, 'a2'), await centroCasilla(page, 'a3')]
    await page.touchscreen.tap(a.x, a.y)
    await page.touchscreen.tap(b.x, b.y)
    const lista = (await page.getByTestId('lista-jugadas').boundingBox())!
    await page.touchscreen.tap(lista.x + 20, lista.y + lista.height / 2)
    await page.touchscreen.tap(lista.x + 20, lista.y + lista.height / 2)
    const voltear = (await page.getByTestId('voltear').boundingBox())!
    await page.touchscreen.tap(voltear.x + voltear.width / 2, voltear.y + voltear.height / 2)
    await page.touchscreen.tap(voltear.x + voltear.width / 2, voltear.y + voltear.height / 2)
    await cabe(page, 'tras los toques rápidos')
  })

  test('una partida de 40 jugadas, jugada por toques cada 5', async ({ page }, info) => {
    test.setTimeout(120_000)
    expect(CUARENTA).toHaveLength(79)
    for (let jugada = 5; jugada <= 40; jugada += 5) await jugarDesde(page, info, CUARENTA, (jugada - 1) * 2)
    // Brisa contesta a 40.Da8: 40 jugadas completas
    await expect(jugadas(page)).toHaveCount(80, { timeout: 20_000 })
    await cabe(page, 'con las 40 jugadas')
    await listaSeDesliza(page)
  })

  test('las demás pantallas con tablero: la lección más larga (las dos fases), su variante y su apertura', async ({ page }, info) => {
    test.setTimeout(120_000)
    const todas = cursos().flatMap((c) => c.lecciones.map((l, i) => ({ curso: c, l, i })))
    const { curso, l, i } = todas.reduce((x, y) => (y.l.jugadas.length > x.l.jugadas.length ? y : x))
    const uci = enUci(l.jugadas)
    const esMia = (ply: number) => (ply % 2 === 0 ? 'w' : 'b') === l.color
    await page.goto(`/#/leccion/${encodeURIComponent(curso.id)}/${i}`)
    for (const fase of ['Juega', '¿Qué harías?']) {
      for (let ply = 0; ply < uci.length; ply++) {
        if (!esMia(ply)) continue
        await expect(jugadas(page)).toHaveCount(ply, { timeout: 10_000 })
        await expect(page.getByTestId('instruccion')).toContainText(fase, { timeout: 10_000 })
        await jugar(page, info, uci[ply]!)
        await cabe(page, `lección, ${fase}, media jugada ${ply + 1}`)
      }
    }
    await expect(page.getByTestId('fin-leccion')).toBeVisible({ timeout: 10_000 })
    await cabe(page, 'al terminar la lección')
    // la página de la variante (abre con la línea completa en el tablero) y la de la apertura
    await page.goto(`/#/curso/${encodeURIComponent(curso.id)}/${i}`)
    await expect(page.getByTestId('al-final')).toBeDisabled()
    await cabe(page, 'página de la variante')
    await page.goto(`/#/curso/${encodeURIComponent(curso.id)}`)
    await expect(page.getByTestId('variante').first()).toBeVisible()
    await cabe(page, 'página de la apertura')
  })
})
