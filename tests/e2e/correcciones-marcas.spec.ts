import { expect, test, type Locator, type Page } from '@playwright/test'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { cursoNuevo, jugadasDeVariante, lineaPorId } from '../../src/curso/datos.ts'
import { marcasDelPaso } from '../../src/curso/marcas.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { jugadaEs } from '../../src/curso/textos.ts'
import { explicacionDespues } from '../../src/curso/turno.ts'
import type { Cambio } from '../../scripts/marcas-cambios.ts'
import { jugar } from './_util.ts'

/**
 * Las marcas en el tablero (correcciones de la Caro-Kann, C5), con las reglas v1.3 (2026-10-30): lo del rival antes de
 * tu jugada, lo tuyo después; lo pegado no se marca, salvo A5; A7, el plan o la amenaza del rival, en rojo punteado.
 * R7 en la pantalla (en Practicar, nada en tu turno; ninguna marca ni frase que adelante una jugada que viene), los
 * ejemplos de Carlos, y (`@marcas`) una captura de cada momento cuyas marcas cambiaron con la v1.3, más los seis
 * ejemplos, en iterations/v3/capturas/marcas-v1.3/<perfil>/, con su índice. La lista de momentos sale de
 * `scripts/marcas-cambios.ts` (cambios.json). Las del iPhone, en Chromium emulando el iPhone 16 Pro (402×874, táctil).
 */
const c = cursoNuevo('caro-kann:b')!
const CARPETA = 'iterations/v3/capturas/marcas-v1.3'
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const capa = (page: Page, testid = 'tablero') => page.getByTestId(testid).first().locator('[data-marca]')
const flecha = (page: Page, de: string, a: string) => page.locator(`[data-marca="flecha"][data-de="${de}"][data-a="${a}"]`)

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

/** Abre una jugada mía de una línea: en mi turno, o ya jugada (después). */
async function abrirJugada(page: Page, info: Parameters<typeof jugar>[1], linea: string, vuelta: 'aprender' | 'practicar', ply: number, despues: boolean) {
  await abrirEn(page, linea, vuelta, ply)
  await momento(page, 'tuTurno')
  if (!despues) return
  await jugar(page, info, uci(lineaPorId(c, linea)!.jugadas, ply))
  // si en Practicar todas las frases adelantan una jugada, no hay nada que leer: "Correcto" y sigue el rival
  await momento(page, explicacionDespues(c, lineaPorId(c, linea)!, vuelta, ply).length ? 'leer' : 'rival')
}

test.describe('Correcciones · las marcas (reglas v1.3)', () => {
  test('prendido de entrada (C7); con el interruptor en "0", la lección se ve como antes (sin la capa nueva)', async ({ page }) => {
    await abrirEn(page, 'v:avance-short', 'aprender', 5)
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('capa-marcas')).toHaveCount(1)
    await page.evaluate(() => localStorage.setItem('chess.interno.marcas', '0'))
    await page.reload()
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('capa-marcas')).toHaveCount(0)
  })

  test('ejemplo 1 · el dibujo de Carlos: f6 en rojo y la L roja g8→f6, sin d6 y sin la verde de 3...♗f5 (antes de tu jugada, solo lo del rival)', async ({ page }) => {
    await abrirEn(page, 'v:avance-short', 'aprender', 5)
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('narracion')).toContainText('le quita la casilla f6 a tu caballo')
    await expect(page.getByTestId('narracion')).toContainText('Te toca: 3...♗f5')
    await expect(capa(page)).toHaveCount(2)
    await expect(page.locator('[data-marca="casilla"][data-en="f6"][data-color="rojo"]')).toHaveCount(1)
    await expect(flecha(page, 'g8', 'f6').and(page.locator('[data-color="rojo"][data-puntos="3"]'))).toHaveCount(1)
    await expect(page.locator('[data-marca][data-color="verde"]')).toHaveCount(0)
    await expect(page.locator('[data-marca][data-en="d6"], [data-marca][data-a="d6"]')).toHaveCount(0)
    // la flecha de tu jugada sale solo con la Respuesta
    await page.getByTestId('respuesta').click()
    await expect(flecha(page, 'c8', 'f5').and(page.locator('[data-color="verde"][data-tipo="A1"]'))).toHaveCount(1)
  })

  test('ejemplos 4 y 5 · la A7 en la Van der Wiel: e2→f4 y f4→g6, y h4→h5, rojas y punteadas', async ({ page }) => {
    await abrirEn(page, 'v:avance-van-der-wiel', 'aprender', 11)
    await momento(page, 'tuTurno')
    await expect(capa(page)).toHaveCount(2)
    for (const [de, a] of [['e2', 'f4'], ['f4', 'g6']]) await expect(flecha(page, de!, a!).and(page.locator('[data-tipo="A7"][data-color="rojo"][data-punteada="si"]'))).toHaveCount(1)
    await abrirEn(page, 'v:avance-van-der-wiel', 'aprender', 13)
    await momento(page, 'tuTurno')
    await expect(capa(page)).toHaveCount(1)
    await expect(flecha(page, 'h4', 'h5').and(page.locator('[data-tipo="A7"][data-color="rojo"][data-punteada="si"]'))).toHaveCount(1)
    await expect(flecha(page, 'h7', 'h5')).toHaveCount(0)
  })

  test('R7 · en Practicar, nada en tu turno; la segunda Pista ilumina la pieza; la Respuesta es la flecha; después, nada que adelante tu siguiente jugada (el caso de Carlos: 3...♗f5 y ...e6)', async ({ page }, info) => {
    await abrirEn(page, 'v:avance-van-der-wiel', 'practicar', 5)
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('capa-marcas')).toHaveCount(0)
    await page.getByTestId('pista').click()
    await expect(page.getByTestId('capa-marcas')).toHaveCount(0)
    await page.getByTestId('pista').click()
    await expect(capa(page)).toHaveCount(1)
    await expect(page.locator('[data-marca="casilla"][data-en="c8"][data-color="verde"]')).toHaveCount(1)
    await page.getByTestId('respuesta').click()
    await expect(capa(page)).toHaveCount(1)
    await expect(flecha(page, 'c8', 'f5').and(page.locator('[data-color="verde"]'))).toHaveCount(1)
    await jugar(page, info, 'c8f5')
    await momento(page, 'leer')
    // ni la flecha punteada e7→e6 ni "Después vas a jugar ...e6": ...e6 es tu siguiente jugada (4.♘c3 e6)
    await expect(page.getByTestId('narracion')).toContainText('Sacas tu alfil de casillas blancas fuera de la cadena de peones.')
    await expect(page.getByTestId('narracion')).not.toContainText('e6')
    await expect(page.getByTestId('capa-marcas')).toHaveCount(0)
    // y al jugar el rival, el tablero se limpia
    await page.getByTestId('siguiente').click()
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('capa-marcas')).toHaveCount(0)
  })

  test('ejemplo 6 · 6...♗g4 en el Cambio: la verde g4→d1 en Practicar, después de jugar; en Aprender, "Te toca" sin marcas tuyas', async ({ page }, info) => {
    await abrirJugada(page, info, 'v:cambio', 'practicar', 11, true)
    await expect(page.getByTestId('narracion')).toContainText('atacas a la dama de d1')
    await expect(capa(page)).toHaveCount(1)
    await expect(flecha(page, 'g4', 'd1').and(page.locator('[data-tipo="A2"][data-color="verde"][data-punteada="no"]'))).toHaveCount(1)
    await abrirJugada(page, info, 'v:cambio', 'aprender', 11, false)
    await expect(page.locator('[data-marca][data-color="verde"]')).toHaveCount(0)
    await expect(flecha(page, 'f4', 'c7').and(page.locator('[data-color="rojo"]'))).toHaveCount(1)
  })

  test('las páginas de leer: el tablero de la página queda limpio; las marcas van con su frase en el paso a paso', async ({ page }) => {
    await page.goto('/#/curso/caro-kann%3Ab/leer/idea')
    await expect(page.getByTestId('tablero-leer')).toBeVisible()
    await expect(page.getByTestId('tablero-leer').locator('svg.cg-shapes line, svg.cg-shapes circle')).toHaveCount(0)
    await expect(page.getByTestId('tablero-leer').locator('[data-marca]')).toHaveCount(0)
    await page.getByTestId('ver-paso-a-paso').click()
    const pa = c.piezas.idea.paginas[0]!.pasoAPaso!
    for (let i = 0; i < pa.pasos.length; i++) {
      await expect(page.getByTestId('paso-a-paso')).toHaveAttribute('data-paso', String(i + 1))
      await expect(capa(page, 'tablero-paso-a-paso')).toHaveCount(marcasDelPaso(pa, i).length)
      if (i < pa.pasos.length - 1) await page.getByTestId('pap-siguiente').click()
    }
  })

  test('@marcas una captura de cada momento cuyas marcas cambiaron con la v1.3, y los seis ejemplos, con su índice', async ({ page, isMobile }, info) => {
    test.setTimeout(900_000)
    if (isMobile) await page.setViewportSize({ width: 402, height: 874 })
    const dir = `${CARPETA}/${info.project.name}`
    mkdirSync(dir, { recursive: true })
    const indice: string[] = []
    let n = 1
    const fig = (t: string) => mostrarTexto(t, 'figuras').replace(/\|/g, '\\|')
    const foto = async (nombre: string, fila: { momento: string; frases: string; antes: string; despues: string }, que: Page | Locator = page) => {
      const archivo = `${String(n++).padStart(2, '0')}-${nombre}.png`
      await page.waitForTimeout(250)
      await que.screenshot({ path: `${dir}/${archivo}`, scale: 'css' })
      indice.push(`| ${archivo} | ${fila.momento} | ${fila.frases} | ${fila.antes || '—'} | ${fila.despues || '—'} |`)
    }

    // los seis ejemplos de §4 de las reglas, y el caso de Carlos en Practicar
    const ejemplos: [string, string, 'aprender' | 'practicar', number, boolean, string, string][] = [
      ['ejemplo-1-3e5', 'v:avance-short', 'aprender', 5, false, 'casilla f6 (A5, roja); flecha g8→f6 (A5, roja); flecha c8→f5 (A1, verde)', 'casilla f6 (A5, roja); flecha g8→f6 (A5, roja)'],
      ['ejemplo-2-6Cf3-avance-c3', 'v:avance-c3', 'aprender', 11, false, 'flecha f3→d4 (A4, roja)', 'flecha f3→d4 (A4, roja)'],
      ['ejemplo-3-5g4-van-der-wiel', 'v:avance-van-der-wiel', 'aprender', 9, false, '—', '— (pegada)'],
      ['ejemplo-4-6Cge2-van-der-wiel', 'v:avance-van-der-wiel', 'aprender', 11, false, '—', 'flecha e2→f4 (A7, roja, punteada); flecha f4→g6 (A7, roja, punteada)'],
      ['ejemplo-5-7h4-van-der-wiel', 'v:avance-van-der-wiel', 'aprender', 13, false, 'flecha h7→h5 (A1, verde)', 'flecha h4→h5 (A7, roja, punteada)'],
      ['ejemplo-6-6Ag4-cambio-practicar', 'v:cambio', 'practicar', 11, true, 'flecha g4→d1 (A2, verde)', 'flecha g4→d1 (A2, verde)'],
      ['caso-carlos-3Af5-van-der-wiel-practicar', 'v:avance-van-der-wiel', 'practicar', 5, true, 'flecha e7→e6 (A3, verde, punteada)', '— (...e6 es tu siguiente jugada)'],
    ]
    for (const [nombre, linea, vuelta, ply, despues, antes, ahora] of ejemplos) {
      await abrirJugada(page, info, linea, vuelta, ply, despues)
      const l = lineaPorId(c, linea)!
      const frases = await page.getByTestId('narracion').locator('.mensaje-curso').allInnerTexts()
      await foto(nombre, { momento: `${l.nombre}, ${vuelta === 'aprender' ? 'Aprender' : 'Practicar'}, ${despues ? 'después de' : 'antes de'} ${fig(jugadaEs(l.jugadas[ply]!, ply))}`, frases: frases.map((f) => `«${f.replace(/\n/g, ' ').replace(/\|/g, '\\|')}»`).join('<br>'), antes, despues: ahora })
    }

    // cada momento que cambió (cambios.json, de scripts/marcas-cambios.ts)
    const cambios = JSON.parse(readFileSync(`${CARPETA}/cambios.json`, 'utf8')) as Cambio[]
    for (const x of cambios) {
      const frases = x.frases.map((f) => `«${fig(f.texto)}»${f.despues === null ? ' (no se muestra en Practicar)' : ''}`).join('<br>')
      const fila = { frases, antes: x.antes.join('; '), despues: x.despues.join('; ') }
      const tambien = x.tambien.length ? ` (igual en ${x.tambien.map((t) => lineaPorId(c, t)!.nombre).join(', ')})` : ''
      if (x.tipo === 'te-toca' || x.tipo === 'despues-aprender' || x.tipo === 'despues-practicar') {
        const l = lineaPorId(c, x.linea!)!
        const vuelta = x.tipo === 'despues-practicar' ? 'practicar' : 'aprender'
        await abrirJugada(page, info, l.id, vuelta, x.ply!, x.tipo !== 'te-toca')
        await expect(capa(page), x.id).toHaveCount(x.despues.length)
        const cuando = x.tipo === 'te-toca' ? 'Aprender, antes de' : `${vuelta === 'aprender' ? 'Aprender' : 'Practicar'}, después de`
        await foto(`${x.tipo}-${l.id.slice(2)}-${x.ply! + 1}`, { ...fila, momento: `${fig(l.nombre)}, ${cuando} ${fig(jugadaEs(l.jugadas[x.ply!]!, x.ply!))}${tambien}` })
      } else if (x.tipo === 'plan') {
        const l = lineaPorId(c, x.linea!)!
        await abrirEn(page, l.id, 'aprender', jugadasDeVariante(c, l.variante!).length)
        await momento(page, 'plan')
        await expect(capa(page), x.id).toHaveCount(x.despues.length)
        await foto(`plan-${l.id.slice(2)}`, { ...fila, momento: `${fig(l.nombre)}, el plan` })
      } else {
        // el paso a paso: de una página de leer, o del plan de una variante
        if (x.pieza) {
          await page.goto(`/#/curso/caro-kann%3Ab/leer/${x.pieza}`)
          await page.reload()
          for (let j = 0; j < x.pagina!; j++) await page.getByTestId('pagina-siguiente').click()
        } else {
          const l = lineaPorId(c, x.linea!)!
          await abrirEn(page, l.id, 'aprender', jugadasDeVariante(c, l.variante!).length)
          await momento(page, 'plan')
        }
        await page.getByTestId('ver-paso-a-paso').click()
        for (let i = 0; i < x.paso!; i++) await page.getByTestId('pap-siguiente').click()
        await expect(page.getByTestId('paso-a-paso')).toHaveAttribute('data-paso', String(x.paso! + 1))
        await expect(capa(page, 'tablero-paso-a-paso'), x.id).toHaveCount(x.despues.length)
        const donde = x.pieza ? `${{ idea: 'La idea', estructura: 'La estructura', repaso: 'El repaso' }[x.pieza]} ${x.pagina! + 1}` : `el plan de ${fig(lineaPorId(c, x.linea!)!.nombre)}`
        await foto(`paso-${x.pieza ? `${x.pieza}-${x.pagina! + 1}` : `plan-${x.linea!.slice(2)}`}-${x.paso! + 1}`, { ...fila, momento: `Paso a paso, ${donde}, paso ${x.paso! + 1}` }, page.getByTestId('paso-a-paso'))
      }
    }
    // S1 (la torre, 2026-10-30): la fila del interruptor, con cada vuelta escogida, siempre en verde la de ahora
    for (const vuelta of ['practicar', 'aprender'] as const) {
      await abrirEn(page, 'v:avance-tal', vuelta, 9)
      await momento(page, 'tuTurno')
      const fila = (await page.getByTestId('fase').boundingBox())!
      const y = Math.max(0, fila.y - 16)
      const archivo = `${String(n++).padStart(2, '0')}-s1-interruptor-${vuelta}.png`
      await page.waitForTimeout(250)
      await page.screenshot({ path: `${dir}/${archivo}`, scale: 'css', clip: { x: 0, y, width: page.viewportSize()!.width, height: fila.y + fila.height + 40 - y } })
      const escogida = vuelta === 'aprender' ? 'Aprender' : 'Practicar'
      const antes = vuelta === 'practicar' ? 'Practicar escogida, en gris (`chip-base`) y en negritas' : 'Aprender escogida, en verde (`chip-rep`): no cambia'
      indice.push(`| ${archivo} | S1: la fila del interruptor, con ${escogida} escogida (Avance: 4.h4 (Tal), jugada 3) | — | ${antes} | ${escogida} en verde (\`chip-rep\`) y en negritas; la otra, sin fondo y gris |`)
    }
    if (info.project.name === 'escritorio' || !existsSync(`${CARPETA}/indice.md`))
      writeFileSync(
        `${CARPETA}/indice.md`,
        [
          '# Las capturas de las marcas, v1.3 (2026-10-30)',
          '',
          '> Generado por `tests/e2e/correcciones-marcas.spec.ts` (`@marcas`). Primero los seis ejemplos de §4 de las reglas y el caso de Carlos en Practicar; después, una captura de cada momento cuyas marcas cambiaron con la v1.3, contra lo publicado (`ad72f10`), según `cambios.json` (`node scripts/marcas-cambios.ts`). Las mismas en `iphone/` (Chromium emulando el iPhone 16 Pro, 402×874, táctil) y `escritorio/` (Chromium, 1440×900). "Antes" es lo que se veía con las reglas v1.1; "después", lo que se ve hoy.',
          '',
          '| Captura | Momento | Frases | Antes | Después |',
          '|---|---|---|---|---|',
          ...indice,
          '',
        ].join('\n'),
      )
  })
})
