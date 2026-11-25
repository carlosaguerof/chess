import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { palabras } from '../../src/curso/textos.ts'
import type { LineaCurso } from '../../src/curso/tipos.ts'
import { jugar } from './_util.ts'

/**
 * El curso de la Alapin contra la Siciliana, por estructuras (2026-11-25; `specs/cursos.md` §6). La tarjeta abre el curso
 * nuevo; la página con sus secciones en orden ("La base", sin "Las que más te van a salir", y "Opcional"); una lección de
 * cada sección en sus dos vueltas; "Seguir" con cada obligatoria a 360, 375, 402 y 430; la lección cabe en la pantalla del
 * celular; el plan habla del rival como negras; y lo guardado de antes se muda. Lo que sale de los datos:
 * `tests/unit/curso-alapin.test.ts`.
 */
const C = cursoNuevo('siciliana:w')!
const URL = '/#/curso/siciliana%3Aw'
const CLAVE = 'ajedrez.v1.curso:siciliana:w'
const urlDe = (id: string) => `${URL}/linea/${encodeURIComponent(id)}`
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const uci = (l: LineaCurso, ply: number) => {
  const ch = new Chess()
  for (const s of l.jugadas.slice(0, ply)) ch.move(s)
  const m = ch.move(l.jugadas[ply]!)
  return m.from + m.to + (m.promotion ?? '')
}

/** Recorre una vuelta entera de una lección, jugando lo de la lección, hasta el plan (Aprender) o el resumen (Practicar). */
async function recorrer(page: Page, info: TestInfo, l: LineaCurso, vuelta: 'aprender' | 'practicar') {
  await momento(page, 'intro')
  await expect(leccion(page)).toHaveAttribute('data-vuelta', vuelta)
  await page.getByTestId('empezar-vuelta').click()
  const fin = vuelta === 'aprender' ? 'plan' : 'fin'
  for (let n = 0; n < 60; n++) {
    const m = await leccion(page).getAttribute('data-momento')
    if (m === fin) return
    if (m === 'tuTurno') {
      const ply = Number(await leccion(page).getAttribute('data-ply'))
      await jugar(page, info, uci(l, ply))
    } else if (m === 'leer') await page.getByTestId('siguiente').click()
    else if (m === 'error' || m === 'buena') throw new Error(`${l.id}: la jugada de la lección salió como ${m}`)
    else await page.waitForTimeout(200)
  }
  await momento(page, fin)
}

test.describe('El curso de la Alapin', () => {
  test('en Aprender, la tarjeta de la Alapin abre el curso nuevo: "0 de 2 variantes" y su tablero desde 1.e4 c5 2.c3', async ({ page }) => {
    await page.goto('/#/cursos')
    const tarjeta = page.getByTestId('tarjeta-siciliana:w')
    // la tarjeta conserva su nombre de antes (`nombreCurso`): con blancas, "Contra la Siciliana"
    await expect(tarjeta).toContainText('Contra la Siciliana')
    await expect(tarjeta).toContainText('0 de 2 variantes')
    await tarjeta.click()
    await expect(page).toHaveURL(/#\/curso\/siciliana%3Aw$/)
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Alapin contra la Siciliana')
    await expect(page.getByTestId('avance')).toHaveText('0 de 2 variantes')
    await expect(page.getByTestId('empezar-curso')).toHaveText('Empezar')
    // el tablero de arriba: lo que comparten las seis líneas, con blancas abajo
    const t = page.getByTestId('pagina-curso').getByTestId('tablero-mini').first()
    await expect(t).toHaveAttribute('data-orientacion', 'white')
    const ch = new Chess()
    for (const s of ['e4', 'c5', 'c3']) ch.move(s)
    expect((await t.getAttribute('data-fen'))!.split(' ')[0]).toBe(ch.fen().split(' ')[0])
  })

  test('la página: La idea, La estructura, La base, Errores y trampas, Repaso y Opcional, en ese orden', async ({ page }) => {
    await page.goto(URL)
    const orden = await page.getByTestId('piezas-curso').locator('[data-testid^="paso-"], [data-testid^="seccion-"]').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-testid')))
    const de = (i: number) => C.secciones![i]!.variantes.map((v) => `paso-v:${v}`)
    expect(orden).toEqual(['paso-idea', 'paso-estructura', 'seccion-base', ...de(0), 'paso-errores', 'paso-repaso', 'seccion-opcional', ...de(1)])
    await expect(page.getByTestId('seccion-base')).toHaveText('La base')
    await expect(page.getByTestId('seccion-frecuentes')).toHaveCount(0)
    await expect(page.getByTestId('seccion-opcional')).toContainText('No cuentan para terminar el curso.')
    const numeros = await page.locator('.numero-variante').allTextContents()
    expect(numeros.map((n) => Number.parseInt(n))).toEqual([1, 2, 1, 2, 3, 4])
    for (const v of C.variantes) await expect(page.getByTestId(`paso-v:${v.id}`).getByTestId('estructura-leccion'), v.id).toHaveText(v.estructura!)
  })

  test('La estructura: El mapa, El aislado, La cadena y Los dos peones del centro', async ({ page }) => {
    await page.goto(`${URL}/leer/estructura`)
    const n = C.piezas.estructura.paginas.length
    expect(n).toBe(4)
    for (let i = 1; i <= n; i++) {
      await expect(page.getByTestId('pagina-n-de-m')).toHaveText(`${i} de ${n}`)
      await expect(page.getByTestId('pieza-estructura')).toContainText(C.piezas.estructura.paginas[i - 1]!.subtitulo!)
      await expect(page.getByTestId('pieza-estructura')).not.toContainText('El gambito')
      if (i < n) await page.getByTestId('pagina-siguiente').click()
    }
  })

  test('La base, 2...Cf6: Aprender hasta el plan (el del rival, "El de negras") y Practicar hasta el resumen', async ({ page }, info) => {
    const l = lineaPorId(C, 'v:cf6-d4')!
    await page.goto(urlDe(l.id))
    await expect(page.getByTestId('cual-variante')).toContainText('Variante 2 de 2')
    await recorrer(page, info, l, 'aprender')
    await expect(page.getByTestId('narracion')).toContainText('El de negras:')
    await expect(page.getByTestId('narracion')).not.toContainText('El de blancas:')
    await expect(page.getByTestId('narracion')).toContainText(mostrarTexto(l.variante!.plan.tuyo, 'figuras'))
    await page.getByTestId('a-practicar').click()
    await recorrer(page, info, l, 'practicar')
    await expect(page.getByTestId('resumen-variante')).toBeVisible()
    const a = await page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), CLAVE)
    expect(a.variantes['cf6-d4'].terminada).toBeTruthy()
  })

  test('Opcional, el gambito: Practicar sin Aprender, y cuenta como hecha sin cambiar "N de 2"', async ({ page }, info) => {
    const l = lineaPorId(C, 'v:gambito')!
    await page.goto(urlDe(l.id))
    await expect(page.getByTestId('cual-variante')).toContainText('Opcional 4 de 4')
    await page.getByTestId('vuelta-practicar').click()
    await recorrer(page, info, l, 'practicar')
    await page.goto(URL)
    await expect(page.getByTestId('avance')).toHaveText('0 de 2 variantes')
  })

  test('el Cambio Central, en Aprender: "Ver qué pasaría" sale junto a su frase después de 6.Cf3', async ({ page }, info) => {
    const l = lineaPorId(C, 'v:cambio-central')!
    const ply = l.jugadas.indexOf('Nf3')
    await page.goto('/#/')
    await page.evaluate(([k, linea, ply]) => localStorage.setItem(k as string, JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta: 'aprender', ply, fecha: Date.now() } })), [CLAVE, l.id, ply] as const)
    await page.goto(urlDe(l.id))
    await page.reload()
    await momento(page, 'tuTurno')
    await jugar(page, info, uci(l, ply))
    await momento(page, 'leer')
    await expect(page.getByTestId('ver-que-pasa')).toHaveCount(1)
  })
})

test.describe('La Alapin · las correcciones del piloto, con blancas', () => {
  /** Las coordenadas de un tablero, en el orden en que se ven: de izquierda a derecha y de arriba abajo. */
  const coordenadas = (t: ReturnType<Page['getByTestId']>) =>
    t.evaluate((el) => {
      const leer = (sel: string, eje: 'x' | 'y') =>
        Array.from(el.querySelectorAll(sel), (c) => ({ t: (c.textContent ?? '').trim(), v: c.getBoundingClientRect()[eje] })).sort((a, b) => a.v - b.v).map((c) => c.t)
      return { columnas: leer('coords.files coord', 'x'), filas: leer('coords.ranks coord', 'y') }
    })

  test('todo tablero del curso lleva coordenadas, desde el lado de blancas: a…h de izquierda a derecha y 8…1 de arriba abajo', async ({ page }) => {
    const BLANCAS = { columnas: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'], filas: ['8', '7', '6', '5', '4', '3', '2', '1'] }
    await page.goto(URL)
    expect(await coordenadas(page.getByTestId('pagina-curso').getByTestId('tablero-mini').first())).toEqual(BLANCAS)
    await page.goto(`${URL}/leer/estructura`)
    expect(await coordenadas(page.getByTestId('tablero-leer').first())).toEqual(BLANCAS)
    await page.goto(urlDe('v:cambio-central'))
    await momento(page, 'intro')
    expect(await coordenadas(page.getByTestId('tablero').first())).toEqual(BLANCAS)
  })

  test('Practicar: en tu turno no hay texto de tu jugada; después de jugar, su explicación', async ({ page }, info) => {
    const l = lineaPorId(C, 'v:cf6-d4')!
    await page.goto(urlDe(l.id))
    await page.getByTestId('vuelta-practicar').click()
    await momento(page, 'intro')
    await page.getByTestId('empezar-vuelta').click()
    await momento(page, 'tuTurno')
    const ply = Number(await leccion(page).getAttribute('data-ply'))
    const narracion = await page.getByTestId('narracion').innerText()
    expect(narracion).not.toContain('Te toca')
    expect(narracion).not.toContain(mostrarTexto(C.mias[l.jugadas.slice(0, ply + 1).join(' ')]!.pregunta, 'figuras'))
    await jugar(page, info, uci(l, ply))
    await expect(page.getByTestId('narracion')).toContainText('Correcto')
  })
})

test.describe('La Alapin en el celular', () => {
  const ANCHOS = [
    { ancho: 360, alto: 740 },
    { ancho: 375, alto: 667 },
    { ancho: 402, alto: 874 },
    { ancho: 430, alto: 932 },
  ]

  test('"Seguir" con cada obligatoria en curso: "Seguir" grande y el nombre en un renglón, dentro del botón, a 360, 375, 402 y 430', async ({ page }) => {
    for (const { ancho, alto } of ANCHOS) {
      await page.setViewportSize({ width: ancho, height: alto })
      for (const v of obligatorias(C)) {
        await page.goto(URL)
        await page.evaluate(([k, a]) => localStorage.setItem(k as string, a as string), [CLAVE, JSON.stringify({ piezas: { idea: 1, estructura: 1 }, variantes: {}, errores: {}, enCurso: { linea: `v:${v.id}`, vuelta: 'aprender', ply: 1, fecha: Date.now() } })] as const)
        await page.reload()
        await page.evaluate(() => document.fonts.ready)
        const m = await page.getByTestId('empezar-curso').evaluate((b) => {
          const [arriba, abajo] = Array.from((b.firstElementChild as HTMLElement).children) as HTMLElement[]
          const caja = b.getBoundingClientRect()
          const n = abajo!.getBoundingClientRect()
          const e = getComputedStyle(b)
          return { seguir: arriba!.textContent, alto: n.height, renglon: parseFloat(getComputedStyle(abajo!).lineHeight), izq: n.left, der: n.right, dentroIzq: caja.left + parseFloat(e.paddingLeft), dentroDer: caja.right - parseFloat(e.paddingRight), pagina: document.documentElement.scrollWidth, pantalla: innerWidth }
        })
        const donde = `${v.nombre}, a ${ancho}`
        expect.soft(m.seguir, donde).toBe('Seguir')
        expect.soft(m.alto, `${donde}: un renglón`).toBeLessThan(m.renglon * 1.5)
        expect.soft(m.izq, donde).toBeGreaterThanOrEqual(m.dentroIzq - 0.5)
        expect.soft(m.der, donde).toBeLessThanOrEqual(m.dentroDer + 0.5)
        expect.soft(m.pagina, `${donde}: sin scroll a lo ancho`).toBeLessThanOrEqual(m.pantalla)
      }
    }
  })

  test('la lección con la introducción más larga cabe en la pantalla: sin scroll de la página y con los cuatro botones a la vista', async ({ page }) => {
    const v = [...C.variantes].sort((a, b) => palabras(b.intro) - palabras(a.intro))[0]!
    for (const { ancho, alto } of [...ANCHOS, { ancho: 390, alto: 844 }]) {
      await page.setViewportSize({ width: ancho, height: alto })
      // la página se abre ya en su ancho (iterations/v3/learning.md n.º 42): la misma dirección no recarga sola
      await page.goto(urlDe(`v:${v.id}`))
      await page.reload()
      await momento(page, 'intro')
      await page.evaluate(() => document.fonts.ready)
      const m = await page.evaluate(() => {
        const dentro = (id: string) => {
          const r = document.querySelector(`[data-testid="${id}"]`)?.getBoundingClientRect()
          return !!r && r.top >= 0 && r.bottom <= innerHeight + 0.5 && r.right <= innerWidth + 0.5
        }
        return { pagina: document.documentElement.scrollHeight, ventana: innerHeight, ancho: document.documentElement.scrollWidth, pantalla: innerWidth, fuera: ['pista', 'respuesta', 'atras', 'reiniciar', 'empezar-vuelta'].filter((id) => !dentro(id)) }
      })
      const donde = `${v.id}, a ${ancho}×${alto}`
      expect.soft(m.pagina, `${donde}: sin scroll`).toBeLessThanOrEqual(m.ventana)
      expect.soft(m.ancho, donde).toBeLessThanOrEqual(m.pantalla)
      expect.soft(m.fuera, donde).toEqual([])
    }
  })
})

test.describe('La Alapin · lo guardado de antes', () => {
  test('al abrir la app, lo del Repaso de una lección vieja pasa a la nueva de la misma línea, una sola vez', async ({ page }) => {
    await page.goto('/#/')
    await page.evaluate(() => {
      localStorage.removeItem('ajedrez.v1.modelo-alapin')
      localStorage.setItem('ajedrez.v1.repaso', JSON.stringify({ 'siciliana:w/w:siciliana/alapin-cf6-stoltz': { escalon: 2, proxima: '2026-11-30' } }))
      localStorage.setItem('ajedrez.v1.progreso', JSON.stringify({ 'siciliana:w/w:siciliana/alapin-d5-cambio-central': { fecha: 1 } }))
    })
    await page.reload()
    const r = await page.evaluate(() => ({ repaso: JSON.parse(localStorage.getItem('ajedrez.v1.repaso')!), progreso: JSON.parse(localStorage.getItem('ajedrez.v1.progreso')!), modelo: localStorage.getItem('ajedrez.v1.modelo-alapin') }))
    expect(r.repaso).toEqual({ 'siciliana:w/w:siciliana/alapin-curso-cf6-d4': { escalon: 2, proxima: '2026-11-30' } })
    expect(r.progreso).toEqual({ 'siciliana:w/w:siciliana/alapin-curso-cambio-central': { fecha: 1 } })
    expect(r.modelo).toBe('1')
    expect(opcionales(C).length + obligatorias(C).length).toBe(6)
    expect(misJugadas(lineaPorId(C, 'v:moderna')!).length).toBe(8)
  })
})
