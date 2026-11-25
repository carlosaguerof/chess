import { expect, test, type Locator, type Page } from '@playwright/test'
import { cursoNuevo, esOpcional, lineasDe, misJugadas, textoMio } from '../../src/curso/datos.ts'
import { CURSOS_DE_LA_LECCION_DE_ANTES } from '../../src/curso/avance.ts'
import { fotosDePasos, soloPeones } from '../../src/curso/pasos.ts'
import { explicacionDespues } from '../../src/curso/turno.ts'
import { posicion } from '../../src/curso/textos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import type { PasoAPaso } from '../../src/curso/tipos.ts'
import { jugar } from './_util.ts'

/**
 * Las correcciones del piloto (C1 coordenadas, C2 Practicar sin ayudas que no pediste, C3 "Ver paso a paso" y R7 de las
 * marcas) en los siete cursos nuevos (cierre de los cursos, 2026-11-25, §3.6). Los `correcciones-*.spec.ts` las miden
 * en la Caro-Kann con sus jugadas; aquí, cada curso con las suyas: su primera lección obligatoria y su primera jugada.
 */
const COLUMNAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const FILAS = ['1', '2', '3', '4', '5', '6', '7', '8']
const ver = (t: string) => mostrarTexto(t, 'figuras')
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string | RegExp) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const narracion = (page: Page) => page.getByTestId('narracion')
const flechas = (page: Page) => page.locator('[data-testid="tablero"] [data-marca="flecha"]')
const circulos = (page: Page) => page.locator('[data-testid="tablero"] [data-marca="casilla"]')

/** Las coordenadas de un tablero, en el orden en que se ven: de izquierda a derecha y de arriba abajo, dentro del tablero. */
async function revisarTablero(tablero: Locator, orientacion: 'white' | 'black') {
  await expect(tablero).toHaveAttribute('data-orientacion', orientacion)
  const leer = (sel: string) =>
    tablero.locator(sel).evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        const e = getComputedStyle(el)
        return { texto: (el.textContent ?? '').trim(), x: r.x + r.width / 2, y: r.y + r.height / 2, visible: e.visibility !== 'hidden' && e.display !== 'none' && Number(e.opacity) > 0 && r.width * r.height > 0 }
      }),
    )
  const columnas = await leer('coords.files coord')
  const filas = await leer('coords.ranks coord')
  const caja = (await tablero.locator('cg-board').boundingBox())!
  expect(columnas.map((c) => c.texto).sort()).toEqual(COLUMNAS)
  expect(filas.map((f) => f.texto).sort()).toEqual(FILAS)
  for (const x of [...columnas, ...filas]) {
    expect(x.visible, `se ve "${x.texto}"`).toBe(true)
    expect(x.x > caja.x && x.x < caja.x + caja.width && x.y > caja.y && x.y < caja.y + caja.height, `"${x.texto}" dentro del tablero`).toBe(true)
  }
  const porX = [...columnas].sort((a, b) => a.x - b.x).map((c) => c.texto)
  const porY = [...filas].sort((a, b) => a.y - b.y).map((f) => f.texto)
  expect(porX).toEqual(orientacion === 'white' ? COLUMNAS : [...COLUMNAS].reverse())
  expect(porY).toEqual(orientacion === 'white' ? [...FILAS].reverse() : FILAS)
}

/** Recorre todos los pasos con Siguiente: en cada uno, la frase y el tablero son los de los datos. Termina en "Salir". */
async function recorrer(page: Page, pa: PasoAPaso) {
  const fotos = fotosDePasos(pa, [])
  const ventana = page.getByTestId('paso-a-paso')
  for (let i = 0; i < pa.pasos.length; i++) {
    await expect(ventana).toHaveAttribute('data-paso', String(i + 1))
    await expect(page.getByTestId('paso-a-paso-frase')).toHaveText(ver(pa.pasos[i]!.frase))
    await expect(page.getByTestId('tablero-paso-a-paso')).toHaveAttribute('data-fen', pa.soloPeones ? soloPeones(fotos[i]!.fen) : fotos[i]!.fen)
    if (i < pa.pasos.length - 1) await page.getByTestId('pap-siguiente').click()
  }
  await expect(page.getByTestId('pap-siguiente')).toHaveText('Salir')
  await page.getByTestId('pap-siguiente').click()
  await expect(ventana).toHaveCount(0)
}

for (const id of CURSOS_DE_LA_LECCION_DE_ANTES) {
  const c = cursoNuevo(id)!
  const orientacion = c.color === 'w' ? 'white' : 'black'
  const pagina = `/#/curso/${encodeURIComponent(id)}`
  const l = lineasDe(c).find((x) => x.tipo === 'variante' && !esOpcional(c, x.variante!.id))!
  const mias = misJugadas(l)
  const ply = mias[0]!
  const mia = textoMio(c, l.jugadas, ply)!
  const abrirEn = async (page: Page, vuelta: 'aprender' | 'practicar', p: number) => {
    await page.goto('/#/')
    await page.evaluate(([k, linea, vuelta, p]) => localStorage.setItem(k, JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta, ply: p, fecha: Date.now() } })), [`ajedrez.v1.curso:${id}`, l.id, vuelta, p] as const)
    await page.goto(`${pagina}/linea/${encodeURIComponent(l.id)}`)
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-vuelta', vuelta)
    await expect(leccion(page)).toHaveAttribute('data-ply', String(p))
  }

  test.describe(`Las correcciones en ${c.nombre} (${id})`, () => {
    test('C1 · todo tablero del curso lleva sus coordenadas, desde tu lado: la página, La idea, cada página de La estructura y la lección', async ({ page }) => {
      await page.goto(pagina)
      await revisarTablero(page.getByTestId('pagina-curso').getByTestId('tablero-mini'), orientacion)
      await page.goto(`${pagina}/leer/idea`)
      await revisarTablero(page.getByTestId('tablero-leer'), orientacion)
      const n = c.piezas.estructura.paginas.length
      await page.goto(`${pagina}/leer/estructura`)
      for (let i = 1; i <= n; i++) {
        if (i > 1) await page.getByTestId('pagina-siguiente').click()
        if (n > 1) await expect(page.getByTestId('pagina-n-de-m')).toHaveText(`${i} de ${n}`)
        await revisarTablero(page.getByTestId('tablero-leer'), orientacion)
      }
      await page.goto(`${pagina}/linea/${encodeURIComponent(l.id)}`)
      await revisarTablero(page.getByTestId('tablero').first(), orientacion)
    })

    test('C2 · en Practicar, nada de tu jugada en tu turno; la Pista da la meta y luego la pieza; la Respuesta, solo la flecha; después, la explicación', async ({ page }, info) => {
      await abrirEn(page, 'practicar', ply)
      await expect(narracion(page).locator('[data-tipo="pregunta"], [data-tipo="explica"], [data-tipo="pista"]')).toHaveCount(0)
      await expect(narracion(page)).not.toContainText('Te toca')
      if (mia.hace) await expect(narracion(page)).not.toContainText(ver(mia.hace))
      await expect(flechas(page)).toHaveCount(0)
      await expect(circulos(page)).toHaveCount(0)
      await page.getByTestId('pista').click()
      await expect(narracion(page).locator('[data-tipo="pista"]')).toContainText('Pista: ' + ver(mia.pregunta))
      await expect(flechas(page)).toHaveCount(0)
      await expect(circulos(page)).toHaveCount(0)
      await page.getByTestId('pista').click()
      await expect(circulos(page)).toHaveCount(1)
      await expect(narracion(page).locator('[data-tipo="pista"]')).toHaveCount(1)
      await page.getByTestId('respuesta').click()
      await expect(flechas(page)).toHaveCount(1)
      await expect(circulos(page)).toHaveCount(0)
      await expect(narracion(page).locator('[data-tipo="respuesta"], [data-tipo="pista"]')).toHaveCount(0)
      const j = posicion(l.jugadas, ply).move(l.jugadas[ply]!)
      await jugar(page, info, j.from + j.to)
      const explica = explicacionDespues(c, l, 'practicar', ply)
      if (explica.length) {
        await momento(page, 'leer')
        await expect(narracion(page).locator('[data-tipo="explica"]').first()).toHaveText(ver(explica[0]!))
      } else await expect(leccion(page)).not.toHaveAttribute('data-ply', String(ply))
    })

    test('R7 · en Practicar, ninguna marca en ningún turno tuyo de la lección', async ({ page }) => {
      for (const p of mias) {
        await abrirEn(page, 'practicar', p)
        await expect(page.locator('[data-testid="tablero"] [data-marca]'), `${l.id}, jugada ${p}`).toHaveCount(0)
      }
    })

    test('C3 · "Ver paso a paso" de La idea: el tablero coincide con cada frase, de principio a fin', async ({ page }) => {
      const pa = c.piezas.idea.paginas[0]!.pasoAPaso!
      await page.goto(`${pagina}/leer/idea`)
      await page.getByTestId('ver-paso-a-paso').first().click()
      await expect(page.getByTestId('tablero-paso-a-paso')).toHaveAttribute('data-orientacion', orientacion)
      await expect(page.getByTestId('tablero-paso-a-paso').locator('coords.files coord')).toHaveCount(8)
      await recorrer(page, pa)
    })
  })
}
