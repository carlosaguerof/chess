import { expect, test, type Locator, type Page } from '@playwright/test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { cursoNuevo, jugadasDeVariante, lineasDe } from '../../src/curso/datos.ts'
import { marcasDelPaso } from '../../src/curso/marcas.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { enPalabras, ligadas, type Ligada } from '../../scripts/marcas-por-jugada.ts'
import type { Marca } from '../../src/curso/tipos.ts'
import { jugar } from './_util.ts'

/**
 * Correcciones de la Caro-Kann, C5: las marcas, con el interruptor interno prendido solo en esta prueba. R7 (en
 * Practicar, nada en tu turno; la segunda Pista ilumina la pieza; la Respuesta es la flecha A1), el dibujo de Carlos, y
 * una captura de cada frase que lleva marcas, en los dos perfiles: iterations/v3/capturas/marcas/<perfil>/, con su
 * índice (indice.md). Las capturas del iPhone, una sola corrida (y a escala CSS, para no cargar la memoria de imagen).
 */
const c = cursoNuevo('caro-kann:b')!
const CARPETA = 'iterations/v3/capturas/marcas'
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const capa = (page: Page, testid = 'tablero') => page.getByTestId(testid).first().locator('[data-marca]')
const prender = (page: Page) => page.addInitScript(() => localStorage.setItem('chess.interno.marcas', '1'))

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

test.describe('Correcciones · C5 · las marcas (interruptor prendido)', () => {
  test('apagado de entrada: sin el interruptor, la lección se ve como antes (sin la capa nueva)', async ({ page }) => {
    await abrirEn(page, 'v:avance-short', 'aprender', 5)
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('capa-marcas')).toHaveCount(0)
  })

  test('el dibujo de Carlos: en "3.e5 le quita la casilla f6 a tu caballo", f6 en rojo y la flecha roja en L de g8 a f6, sin d6; y "Te toca: 3...♗f5", una flecha verde', async ({ page }, info) => {
    await prender(page)
    await abrirEn(page, 'v:avance-short', 'aprender', 5)
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('narracion')).toContainText('le quita la casilla f6 a tu caballo')
    await expect(page.getByTestId('narracion')).toContainText('Te toca: 3...♗f5')
    await expect(capa(page)).toHaveCount(3)
    await expect(capa(page).and(page.locator('[data-marca="casilla"][data-en="f6"][data-color="rojo"]'))).toHaveCount(1)
    await expect(capa(page).and(page.locator('[data-marca="flecha"][data-de="g8"][data-a="f6"][data-color="rojo"][data-puntos="3"]'))).toHaveCount(1)
    await expect(capa(page).and(page.locator('[data-marca="flecha"][data-de="c8"][data-a="f5"][data-color="verde"][data-puntos="2"]'))).toHaveCount(1)
    await expect(page.locator('[data-marca][data-en="d6"], [data-marca][data-a="d6"]')).toHaveCount(0)
    // el alfil no se encierra: ninguna casilla en c8
    await expect(page.locator('[data-marca="casilla"][data-en="c8"]')).toHaveCount(0)
    mkdirSync(`${CARPETA}/${info.project.name}`, { recursive: true })
    await page.waitForTimeout(250)
    await page.screenshot({ path: `${CARPETA}/${info.project.name}/00-el-ejemplo-de-carlos.png`, scale: 'css' })
  })

  test('R7 · en Practicar, nada en tu turno; la segunda Pista ilumina la pieza; la Respuesta es la flecha; después de jugar, las de su explicación', async ({ page }, info) => {
    await prender(page)
    await abrirEn(page, 'v:avance-short', 'practicar', 5)
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('capa-marcas')).toHaveCount(0)
    await page.getByTestId('pista').click()
    await expect(page.getByTestId('capa-marcas')).toHaveCount(0)
    await page.getByTestId('pista').click()
    await expect(capa(page)).toHaveCount(1)
    await expect(page.locator('[data-marca="casilla"][data-en="c8"][data-color="verde"]')).toHaveCount(1)
    await page.getByTestId('respuesta').click()
    await expect(capa(page)).toHaveCount(1)
    await expect(page.locator('[data-marca="flecha"][data-de="c8"][data-a="f5"][data-color="verde"]')).toHaveCount(1)
    await jugar(page, info, 'c8f5')
    await momento(page, 'leer')
    // por qué ahora: ...e6 después (punteada: es plan)
    await expect(capa(page)).toHaveCount(1)
    await expect(page.locator('[data-marca="flecha"][data-punteada="si"][data-de="e7"][data-a="e6"]')).toHaveCount(1)
    // y al jugar el rival, el tablero se limpia
    await page.getByTestId('siguiente').click()
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('capa-marcas')).toHaveCount(0)
  })

  test('las páginas de leer: el tablero de la página queda limpio; las marcas van con su frase en el paso a paso', async ({ page }) => {
    await prender(page)
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

  test('@marcas una captura de cada frase que lleva marcas, con su índice', async ({ page }, info) => {
    test.setTimeout(600_000)
    await prender(page)
    mkdirSync(`${CARPETA}/${info.project.name}`, { recursive: true })
    const indice: string[] = []
    let n = 1
    const foto = async (nombre: string, frases: Ligada[], que: Page | Locator = page) => {
      const archivo = `${String(n++).padStart(2, '0')}-${nombre}.png`
      await page.waitForTimeout(250)
      await que.screenshot({ path: `${CARPETA}/${info.project.name}/${archivo}`, scale: 'css' })
      indice.push(`| ${archivo} | ${frases.map((x) => `${x.donde}: «${mostrarTexto(x.frase, 'figuras')}»`).join('<br>')} | ${frases.flatMap((x) => x.marcas).map(enPalabras).join('; ')} |`)
    }
    const todas = ligadas(c)
    const grupos = new Map<string, Ligada[]>()
    for (const x of todas) for (const g of x.grupos) if (!g.startsWith('practicar:')) grupos.set(g, [...(grupos.get(g) ?? []), x])
    const contar = (xs: Ligada[]) => new Set(xs.flatMap((x) => x.marcas).map((m: Marca) => `${m.de}-${m.a}-${m.en}`)).size
    const lineas = lineasDe(c)
    const dondeVa = (k: string) => {
      const n = k.split(' ').length - 1
      return lineas.find((l) => l.jugadas.slice(0, n + 1).join(' ') === k && n >= l.desde && (n % 2 === 0 ? 'w' : 'b') === l.lado)!
    }

    // la lección: "Te toca" (con la frase del rival), y después de jugar (en Aprender)
    for (const [g, xs] of grupos) {
      if (!g.startsWith('tuTurno:') && !g.startsWith('aprender:')) continue
      const k = g.slice(g.indexOf(':') + 1)
      const l = dondeVa(k)
      const ply = k.split(' ').length - 1
      await abrirEn(page, l.id, 'aprender', ply)
      await momento(page, 'tuTurno')
      if (g.startsWith('aprender:')) {
        await jugar(page, info, uci(l.jugadas, ply))
        await momento(page, 'leer')
      }
      await expect(capa(page), g).toHaveCount(contar(xs))
      await foto(`${g.startsWith('tuTurno:') ? 'te-toca' : 'despues'}-${l.id.slice(2)}-${ply + 1}`, xs)
    }
    // el plan de cada variante
    for (const [g, xs] of grupos) {
      if (!g.startsWith('plan:')) continue
      const v = c.variantes.find((x) => x.id === g.slice(5))!
      await abrirEn(page, `v:${v.id}`, 'aprender', jugadasDeVariante(c, v).length)
      await momento(page, 'plan')
      await expect(capa(page), g).toHaveCount(contar(xs))
      await foto(`plan-${v.id}`, xs)
    }
    // el paso a paso: cada paso con marcas, con lo que se acumula desde la última jugada
    for (const pieza of ['idea', 'estructura', 'repaso'] as const)
      for (const [k, pagina] of c.piezas[pieza].paginas.entries()) {
        const pa = pagina.pasoAPaso!
        if (!pa.pasos.some((p) => p.marcas?.length)) continue
        await page.goto(`/#/curso/caro-kann%3Ab/leer/${pieza}`)
        await page.reload()
        for (let j = 0; j < k; j++) await page.getByTestId('pagina-siguiente').click()
        await page.getByTestId('ver-paso-a-paso').click()
        for (let i = 0; i < pa.pasos.length; i++) {
          if (pa.pasos[i]!.marcas?.length) {
            await expect(capa(page, 'tablero-paso-a-paso')).toHaveCount(marcasDelPaso(pa, i).length)
            await foto(`paso-${pieza}-${k + 1}-${i + 1}`, todas.filter((x) => x.donde === `${pieza} ${k + 1}, paso ${i + 1}`), page.getByTestId('paso-a-paso'))
          }
          if (i < pa.pasos.length - 1) await page.getByTestId('pap-siguiente').click()
        }
      }
    for (const v of c.variantes) {
      const pa = v.plan.pasoAPaso!
      if (!pa.pasos.some((p) => p.marcas?.length)) continue
      await abrirEn(page, `v:${v.id}`, 'aprender', jugadasDeVariante(c, v).length)
      await momento(page, 'plan')
      await page.getByTestId('ver-paso-a-paso').click()
      for (let i = 0; i < pa.pasos.length; i++) {
        if (pa.pasos[i]!.marcas?.length) {
          await expect(capa(page, 'tablero-paso-a-paso')).toHaveCount(marcasDelPaso(pa, i).length)
          await foto(`paso-plan-${v.id}-${i + 1}`, todas.filter((x) => x.donde === `plan ${v.id} paso a paso, paso ${i + 1}`), page.getByTestId('paso-a-paso'))
        }
        if (i < pa.pasos.length - 1) await page.getByTestId('pap-siguiente').click()
      }
    }
    if (info.project.name === 'escritorio')
      writeFileSync(
        `${CARPETA}/indice.md`,
        [
          '# Las capturas de las marcas (correcciones de la Caro-Kann, C5)',
          '',
          '> Generado por `tests/e2e/correcciones-marcas.spec.ts` (`@marcas`), con el interruptor interno prendido. Una captura por cada momento en que se ven marcas: "te toca" (la frase del rival y la tuya), "después" de tu jugada, el plan y cada paso del paso a paso. Las mismas en `iphone/` y `escritorio/`. `00-el-ejemplo-de-carlos.png` es su dibujo.',
          '',
          '| Captura | Frases | Marcas |',
          '|---|---|---|',
          ...indice,
          '',
        ].join('\n'),
      )
  })
})
