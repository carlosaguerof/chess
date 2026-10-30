import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, leccionIdDe, lineaPorId, misJugadas } from '../../src/curso/datos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { jugar } from './_util.ts'

/**
 * Saltar a Practicar desde la lección (2026-10-30, solo la Caro-Kann). La etiqueta "Aprender" de la fila de arriba
 * ("Aprender · Jugada N de M") pasa a ser un interruptor de dos opciones, Aprender | Practicar: tocar la otra empieza esa
 * vuelta desde la primera jugada, sin preguntar. No va en el resumen ni en los «¿Y si…?», y no agrega altura.
 * Las capturas de la fila, a 402×874 y 360×740 y a escala CSS, en iterations/v3/capturas/correcciones/<perfil>/; las de
 * antes del cambio salieron de la primera prueba con CAPTURAS=antes, en Chromium.
 */

const c = cursoNuevo('caro-kann:b')!
const enUci = (san: string[]) => {
  const t = new Chess()
  return san.map((s) => {
    const m = t.move(s)
    return m.from + m.to + (m.promotion ?? '')
  })
}
/** La Tal: 3...♗f5 4.h4 h5 5.♗d3 ♗xd3 6.♕xd3 e6; mis jugadas en los plies 5, 7, 9 y 11 (la 3, 5...♗xd3, en el 9) */
const TAL = lineaPorId(c, 'v:avance-tal')!
const EN_LA_3 = misJugadas(TAL)[2]!
/** La Fantasía, la más corta: dos jugadas mías */
const FANTASIA = lineaPorId(c, 'v:fantasia')!
const url = (id: string) => '/#/curso/caro-kann%3Ab/linea/' + encodeURIComponent(id)
const CUANDO = process.env.CAPTURAS === 'antes' ? 'antes' : 'despues'

const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const interruptor = (page: Page) => page.getByTestId('interruptor-vuelta')
const marcas = (page: Page) => page.locator('[data-testid="tablero"] [data-marca]')

/** Retoma una lección como al volver a ella a medias: la vuelta y la jugada guardadas. */
async function retomar(page: Page, linea: string, vuelta: 'aprender' | 'practicar', ply: number) {
  await page.goto('/#/')
  await page.evaluate(([linea, vuelta, ply]) => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta, ply, fecha: Date.now() } })), [linea, vuelta, ply] as const)
  await page.goto(url(linea))
  await page.reload()
  await momento(page, 'tuTurno')
  await expect(leccion(page)).toHaveAttribute('data-vuelta', vuelta)
  await expect(leccion(page)).toHaveAttribute('data-ply', String(ply))
}

const enCurso = (page: Page) => page.evaluate(() => JSON.parse(localStorage.getItem('ajedrez.v1.curso:caro-kann:b') ?? '{}').enCurso ?? null)

for (const p of [
  { ancho: 402, alto: 874 },
  { ancho: 360, alto: 740 },
]) {
  test.describe(`Saltar a Practicar · las capturas de la fila (${p.ancho}×${p.alto})`, () => {
    test.use({ viewport: { width: p.ancho, height: p.alto } })

    test(`las capturas de la fila, en Aprender y en Practicar, a ${p.ancho}×${p.alto}`, async ({ page }, info) => {
      for (const vuelta of ['aprender', 'practicar'] as const) {
        await retomar(page, TAL.id, vuelta, EN_LA_3)
        await expect(page.getByTestId('jugada-n-de-m')).toHaveText('Jugada 3 de 4')
        const nombre = `iterations/v3/capturas/correcciones/${info.project.name}/saltar-${CUANDO}-${p.ancho}x${p.alto}-${vuelta}`
        await page.screenshot({ path: `${nombre}.png`, scale: 'css' })
        // la fila sola, con un poco de lo que tiene arriba y abajo
        const fila = (await page.getByTestId('fase').boundingBox())!
        const y = Math.max(0, fila.y - 16)
        await page.screenshot({ path: `${nombre}-fila.png`, scale: 'css', clip: { x: 0, y, width: p.ancho, height: fila.y + fila.height + 40 - y } })
      }
    })
  })
}

test.describe('Saltar a Practicar · el interruptor Aprender | Practicar', () => {
  test.use({ viewport: { width: 402, height: 874 } })

  test('se ve en Aprender y en Practicar, marcado en la vuelta en curso, y no agrega altura a la fila', async ({ page }) => {
    for (const vuelta of ['aprender', 'practicar'] as const) {
      await retomar(page, TAL.id, vuelta, EN_LA_3)
      await expect(interruptor(page)).toBeVisible()
      const otra = vuelta === 'aprender' ? 'practicar' : 'aprender'
      await expect(page.getByTestId(`vuelta-${vuelta}`)).toHaveAttribute('aria-checked', 'true')
      await expect(page.getByTestId(`vuelta-${otra}`)).toHaveAttribute('aria-checked', 'false')
      // la vuelta en curso, siempre en verde (chip-rep) y en negritas; la otra, sin fondo y gris (Carlos, 2026-10-30:
      // "que Practicar se ponga en verde cuando esté seleccionado y que Aprender se ponga un gris")
      await expect(page.getByTestId(`vuelta-${vuelta}`)).toHaveClass(/chip-rep/)
      await expect(page.getByTestId(`vuelta-${otra}`)).not.toHaveClass(/chip-rep|chip-base/)
      const estilo = (id: string) =>
        page.getByTestId(id).evaluate((el) => {
          const s = getComputedStyle(el)
          return { fondo: s.backgroundColor, color: s.color, grosor: s.fontWeight }
        })
      const verde = await page.evaluate(() => {
        const muestra = document.createElement('span')
        muestra.className = 'chip chip-rep'
        document.body.append(muestra)
        const s = getComputedStyle(muestra)
        const r = { fondo: s.backgroundColor, color: s.color }
        muestra.remove()
        return r
      })
      expect(await estilo(`vuelta-${vuelta}`), `${vuelta} escogida: el fondo y el color de chip-rep`).toEqual({ ...verde, grosor: '700' })
      expect(await estilo(`vuelta-${otra}`), `${otra}: sin fondo y gris`).toEqual({ fondo: 'rgba(0, 0, 0, 0)', color: 'rgb(161, 159, 156)', grosor: '500' })
      // en la misma fila, con "Jugada N de M" a la derecha, y sin hacerla más alta que ese texto
      const m = await page.evaluate(() => {
        const caja = (s: string) => document.querySelector(`[data-testid="${s}"]`)!.getBoundingClientRect()
        const [fila, int, jugada] = [caja('fase'), caja('interruptor-vuelta'), caja('jugada-n-de-m')]
        return { fila: fila.height, int: { top: int.top, bottom: int.bottom, right: int.right }, jugada: { top: jugada.top, bottom: jugada.bottom, left: jugada.left, alto: jugada.height } }
      })
      expect(m.int.right, 'el interruptor, a la izquierda de "Jugada N de M"').toBeLessThan(m.jugada.left)
      expect(m.int.bottom, 'en el mismo renglón').toBeGreaterThan(m.jugada.top)
      expect(m.int.top, 'en el mismo renglón').toBeLessThan(m.jugada.bottom)
      expect(m.fila, 'la fila no crece: mide lo que "Jugada N de M"').toBeLessThanOrEqual(m.jugada.alto + 0.5)
      // lo que se toca es más alto que el chip, sin agregar altura: 8 arriba y 8 abajo de la otra opción, todavía es ella
      const alrededor = await page.evaluate((id) => {
        const r = document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect()
        const en = (y: number) => document.elementFromPoint(r.left + r.width / 2, y)?.closest('[data-testid]')?.getAttribute('data-testid')
        return [en(r.top - 8), en(r.bottom + 8)]
      }, `vuelta-${otra}`)
      expect(alrededor, 'lo que se toca, más alto que el chip').toEqual([`vuelta-${otra}`, `vuelta-${otra}`])
    }
  })

  test('no va en el resumen ni en los «¿Y si…?»: ahí se queda lo de hoy', async ({ page }, info) => {
    // un «¿Y si…?»: el chip "Castígalo", sin interruptor
    await page.goto('/#/')
    await page.goto(url('e:tal-e6'))
    await expect(page.getByTestId('fase')).toBeVisible()
    await expect(page.getByTestId('fase')).toContainText('Castígalo')
    await expect(interruptor(page)).toHaveCount(0)

    // el resumen, al terminar Practicar
    const ultima = misJugadas(FANTASIA).at(-1)!
    await retomar(page, FANTASIA.id, 'practicar', ultima)
    await expect(interruptor(page)).toBeVisible()
    await jugar(page, info, enUci(FANTASIA.jugadas)[ultima]!)
    if ((await leccion(page).getAttribute('data-momento')) === 'leer') await page.getByTestId('siguiente').click()
    await momento(page, 'fin')
    await expect(page.getByTestId('resumen-variante')).toBeVisible()
    await expect(interruptor(page)).toHaveCount(0)
  })

  test('desde Aprender, en la jugada 3, "Practicar" lleva a Practicar en la jugada 1, con el tablero limpio en tu turno', async ({ page }) => {
    await retomar(page, TAL.id, 'aprender', EN_LA_3)
    await expect(page.getByTestId('jugada-n-de-m')).toHaveText('Jugada 3 de 4')
    // tocar la que ya está no hace nada
    await page.getByTestId('vuelta-aprender').click()
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-ply', String(EN_LA_3))

    // sin preguntar: Practicar desde la primera jugada (su introducción, como "Ahora, Practicar")
    await page.getByTestId('vuelta-practicar').click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(leccion(page)).toHaveAttribute('data-vuelta', 'practicar')
    await momento(page, 'intro')
    await expect(leccion(page)).toHaveAttribute('data-ply', String(TAL.desde))
    await expect(page.getByTestId('jugada-n-de-m')).toHaveText('Jugada 1 de 4')
    await expect(page.getByTestId('vuelta-practicar')).toHaveAttribute('aria-checked', 'true')
    // lo que se guarda para retomar ya es la vuelta nueva
    expect(await enCurso(page)).toMatchObject({ linea: TAL.id, vuelta: 'practicar', ply: TAL.desde })

    // "Empezar": juega el rival (3.e5) y me toca, con el tablero limpio
    await page.getByTestId('empezar-vuelta').click()
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-ply', String(misJugadas(TAL)[0]))
    await expect(page.getByTestId('jugada-n-de-m')).toHaveText('Jugada 1 de 4')
    await expect(marcas(page)).toHaveCount(0)
    await expect(page.getByTestId('narracion').locator('.mensaje-curso')).toHaveCount(1)
    await expect(page.getByTestId('narracion').locator('[data-tipo="rival"]')).toHaveCount(1)
    expect(await enCurso(page)).toMatchObject({ linea: TAL.id, vuelta: 'practicar', ply: misJugadas(TAL)[0] })

    // al volver a la lección, retomo en Practicar
    await page.reload()
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-vuelta', 'practicar')
  })

  test('desde Practicar, "Aprender" lleva a Aprender en la jugada 1', async ({ page }) => {
    await retomar(page, TAL.id, 'practicar', EN_LA_3)
    await page.getByTestId('vuelta-practicar').click()
    await momento(page, 'tuTurno')
    await expect(leccion(page)).toHaveAttribute('data-ply', String(EN_LA_3))

    await page.getByTestId('vuelta-aprender').click()
    await expect(page.getByRole('dialog')).toHaveCount(0)
    await expect(leccion(page)).toHaveAttribute('data-vuelta', 'aprender')
    await momento(page, 'intro')
    await expect(leccion(page)).toHaveAttribute('data-ply', String(TAL.desde))
    await expect(page.getByTestId('jugada-n-de-m')).toHaveText('Jugada 1 de 4')
    await expect(page.getByTestId('narracion')).toContainText(mostrarTexto(TAL.intro, 'figuras'))
    expect(await enCurso(page)).toMatchObject({ linea: TAL.id, vuelta: 'aprender', ply: TAL.desde })
    await page.getByTestId('empezar-vuelta').click()
    await momento(page, 'tuTurno')
    await expect(page.getByTestId('narracion')).toContainText('Te toca')
  })

  test('terminar Practicar sin Aprender cuenta la variante en la página del curso, entra al Repaso y registra las jugadas', async ({ page }, info) => {
    await page.goto('/#/')
    await page.evaluate(() => localStorage.clear())
    await page.goto(url(FANTASIA.id))
    // la primera vez, la lección abre en Aprender
    await momento(page, 'intro')
    await expect(leccion(page)).toHaveAttribute('data-vuelta', 'aprender')
    await page.getByTestId('vuelta-practicar').click()
    await momento(page, 'intro')
    await expect(leccion(page)).toHaveAttribute('data-vuelta', 'practicar')
    await page.getByTestId('empezar-vuelta').click()

    const uci = enUci(FANTASIA.jugadas)
    for (const ply of misJugadas(FANTASIA)) {
      await momento(page, 'tuTurno')
      await expect(leccion(page)).toHaveAttribute('data-ply', String(ply))
      await jugar(page, info, uci[ply]!)
      if ((await leccion(page).getAttribute('data-momento')) === 'leer') await page.getByTestId('siguiente').click()
    }
    await momento(page, 'fin')
    await expect(page.getByTestId('resumen-tropiezos')).toContainText('Sin errores ni ayuda en Practicar.')

    // el avance: terminada (sin "aprendida"), sin "dónde me quedé"; el Repaso; y el registro de cada jugada de Practicar
    const guardado = await page.evaluate(() => ({
      avance: JSON.parse(localStorage.getItem('ajedrez.v1.curso:caro-kann:b') ?? '{}'),
      progreso: JSON.parse(localStorage.getItem('ajedrez.v1.progreso') ?? '{}'),
      registro: JSON.parse(localStorage.getItem('ajedrez.v1.registro') ?? '[]'),
    }))
    expect(guardado.avance.variantes['fantasia']?.terminada).toBeTruthy()
    expect(guardado.avance.variantes['fantasia']?.aprendida).toBeUndefined()
    expect(guardado.avance.enCurso).toBeUndefined()
    expect(Object.keys(guardado.progreso)).toEqual([leccionIdDe(c, FANTASIA.variante!)])
    expect(guardado.registro.filter((r: { lugar: string; linea: string }) => r.lugar === 'curso' && r.linea === FANTASIA.nombre)).toHaveLength(misJugadas(FANTASIA).length)

    // la página del curso la cuenta
    await page.getByTestId('salida-curso').click()
    await expect(page.getByTestId('avance')).toHaveText(`1 de ${c.variantes.length} variantes`)
    await expect(page.getByTestId(`paso-${FANTASIA.id}`)).toHaveAttribute('data-estado', 'hecha')
    await expect(page.getByTestId(`paso-${FANTASIA.id}`)).toContainText('Hecha')

    // y el inicio la trae para el Repaso (mañana, como cuando hago las dos vueltas)
    await page.goto('/#/')
    await expect(page.getByTestId('repaso-hoy')).toContainText('Mañana toca 1 línea')
  })
})
