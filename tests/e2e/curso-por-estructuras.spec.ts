import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, leccionIdDe, lineaPorId, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { jugar } from './_util.ts'

/**
 * El segundo curso de la Caro-Kann, por estructuras (`specs/cursos.md` §6): las mismas jugadas con otra organización,
 * para que Carlos compare. Las dos tarjetas, las secciones, "N de 8", "Seguir" sin las opcionales, "Variante N de 8" y
 * "Opcional N de 8", "Siguiente variante" al cruzar secciones, un avance por curso y una sola ficha de Repaso por línea.
 * Lo que sale de los datos y lo que afirman los textos: `tests/unit/curso-estructuras.test.ts`.
 */
const NUEVO = cursoNuevo('caro-kann-estructuras:b')!
const ACTUAL = cursoNuevo('caro-kann:b')!
const CLAVE = 'ajedrez.v1.curso:caro-kann-estructuras:b'
const CLAVE_ACTUAL = 'ajedrez.v1.curso:caro-kann:b'
const URL_NUEVO = '/#/curso/caro-kann-estructuras%3Ab'
const URL_ACTUAL = '/#/curso/caro-kann%3Ab'
const HOY = new Date('2026-11-02T10:00:00')
const MANANA = new Date('2026-11-03T10:00:00')

const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })
const urlDe = (c: typeof NUEVO, id: string) => `/#/curso/${encodeURIComponent(c.id)}/linea/${encodeURIComponent(id)}`
const leido = (page: Page, clave: string) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) ?? 'null'), clave)

type Avance = { piezas?: Record<string, number>; terminadas?: string[]; enCurso?: string }

/** Guarda el avance del curso nuevo como lo deja la app y vuelve a abrir su página. */
async function conAvance(page: Page, a: Avance) {
  const avance = {
    piezas: a.piezas ?? {},
    variantes: Object.fromEntries((a.terminadas ?? []).map((id) => [id, { aprendida: 1, terminada: 1 }])),
    errores: {},
    enCurso: a.enCurso ? { linea: `v:${a.enCurso}`, vuelta: 'aprender', ply: 1, fecha: Date.now() } : undefined,
  }
  await page.goto(URL_NUEVO)
  await page.evaluate(([clave, avance]) => localStorage.setItem(clave, avance), [CLAVE, JSON.stringify(avance)] as const)
  await page.reload()
  await expect(page.getByTestId('empezar-curso')).toBeVisible()
}

/** Termina una variante: retoma Practicar en su última jugada mía y la juega, hasta el resumen. */
async function terminar(page: Page, info: TestInfo, c: typeof NUEVO, id: string) {
  const l = lineaPorId(c, `v:${id}`)!
  const ply = Math.max(...misJugadas(l))
  const ch = new Chess()
  for (const s of l.jugadas.slice(0, ply)) ch.move(s)
  const m = ch.move(l.jugadas[ply]!)
  const clave = `ajedrez.v1.curso:${c.id}`
  await page.goto('/#/')
  await page.evaluate(
    ([clave, linea, ply]) => {
      const a = JSON.parse(localStorage.getItem(clave as string) ?? '{"piezas":{},"variantes":{},"errores":{}}')
      localStorage.setItem(clave as string, JSON.stringify({ ...a, enCurso: { linea, vuelta: 'practicar', ply, fecha: Date.now() } }))
    },
    [clave, l.id, ply] as const,
  )
  await page.goto(urlDe(c, l.id))
  await page.reload()
  await momento(page, 'tuTurno')
  await jugar(page, info, m.from + m.to)
  if ((await leccion(page).getAttribute('data-momento')) === 'leer') await page.getByTestId('siguiente').click()
  // si la línea acaba en una jugada del rival, llega sola
  await momento(page, 'fin')
}

test.describe('El curso por estructuras', () => {
  test('en Aprender, pestaña negras, dos tarjetas: la de hoy y, justo después, la nueva, con su avance aparte', async ({ page }) => {
    await page.goto('/#/cursos/negras')
    const tarjetas = page.getByTestId('lista-aperturas').locator('[data-testid^="tarjeta-"]')
    await expect(tarjetas).toHaveCount(4)
    expect(await tarjetas.evaluateAll((ts) => ts.map((t) => t.getAttribute('data-testid')))).toEqual(['tarjeta-caro-kann:b', 'tarjeta-caro-kann-estructuras:b', 'tarjeta-eslava:b', 'tarjeta-otros-negras:b'])
    await expect(page.getByTestId('tarjeta-caro-kann:b')).toContainText('Defensa Caro-Kann')
    await expect(page.getByTestId('tarjeta-caro-kann:b')).toContainText('0 de 16 variantes')
    await expect(page.getByTestId('tarjeta-caro-kann-estructuras:b')).toContainText('Caro-Kann por estructuras')
    await expect(page.getByTestId('tarjeta-caro-kann-estructuras:b')).toContainText('0 de 8 variantes')
    await page.getByTestId('tarjeta-caro-kann-estructuras:b').click()
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Caro-Kann por estructuras')
  })

  test('la página: La idea, La estructura, La base, Las que más te van a salir, Errores y trampas, Repaso y Opcional, en ese orden', async ({ page }) => {
    await page.goto(URL_NUEVO)
    const orden = await page.getByTestId('piezas-curso').locator('[data-testid^="paso-"], [data-testid^="seccion-"]').evaluateAll((xs) => xs.map((x) => x.getAttribute('data-testid')))
    const de = (i: number) => NUEVO.secciones![i]!.variantes.map((v) => `paso-v:${v}`)
    expect(orden).toEqual(['paso-idea', 'paso-estructura', 'seccion-base', ...de(0), 'seccion-frecuentes', ...de(1), 'paso-errores', 'paso-repaso', 'seccion-opcional', ...de(2)])
    await expect(page.getByTestId('seccion-base')).toHaveText('La base')
    await expect(page.getByTestId('seccion-frecuentes')).toHaveText('Las que más te van a salir')
    await expect(page.getByTestId('seccion-opcional')).toContainText('Opcional')
    await expect(page.getByTestId('seccion-opcional')).toContainText('No cuentan para terminar el curso.')
    await expect(page.getByTestId('pagina-curso').locator('h2', { hasText: 'Las variantes' })).toHaveCount(0)

    // las obligatorias, del 1 al 8; las opcionales, con su propia numeración, del 1 al 8
    const numeros = await page.locator('.numero-variante').allTextContents()
    expect(numeros.map((n) => Number.parseInt(n))).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8])
    // la estructura, en letra chica y debajo del nombre; las dos de fuera del mapa no llevan nada
    for (const v of NUEVO.variantes) {
      const fila = page.getByTestId(`paso-v:${v.id}`)
      if (!v.estructura) await expect(fila.getByTestId('estructura-leccion'), v.id).toHaveCount(0)
      else await expect(fila.getByTestId('estructura-leccion'), v.id).toHaveText(v.estructura)
    }
    const fila = page.getByTestId('paso-v:cambio')
    const m = await fila.evaluate((f) => {
      const nombre = f.querySelector('.nombre')!.getBoundingClientRect()
      const e = f.querySelector('[data-testid="estructura-leccion"]')!
      return { debajo: e.getBoundingClientRect().top >= nombre.bottom - 1, letra: getComputedStyle(e).fontSize, nombre: getComputedStyle(f.querySelector('.nombre')!).fontSize }
    })
    expect(m.debajo, 'debajo del nombre').toBe(true)
    expect(m.letra).toBe('13px')
    expect(parseFloat(m.nombre)).toBeGreaterThan(13)
  })

  test('el curso de hoy se ve como siempre: "Las variantes", 16, sin secciones ni estructuras', async ({ page }) => {
    await page.goto(URL_ACTUAL)
    await expect(page.getByTestId('avance')).toHaveText('0 de 16 variantes')
    await expect(page.getByTestId('pagina-curso').locator('h2', { hasText: 'Las variantes' })).toHaveCount(1)
    await expect(page.getByTestId('piezas-curso').locator('[data-testid^="paso-"]')).toHaveCount(2 + 16 + 2)
    await expect(page.getByTestId('estructura-leccion')).toHaveCount(0)
    await expect(page.locator('.nota-seccion')).toHaveCount(0)
  })

  test('"N de 8" cuenta solo las obligatorias, y una opcional hecha se marca igual que cualquier lección', async ({ page }) => {
    await conAvance(page, { piezas: { idea: 1, estructura: 1 }, terminadas: ['avance-short', 'cambio', 'panov'] })
    await expect(page.getByTestId('avance')).toHaveText('2 de 8 variantes')
    await expect(page.getByTestId('paso-v:panov')).toHaveAttribute('data-estado', 'hecha')
    await expect(page.getByTestId('paso-v:panov')).toContainText('Hecha')
    await expect(page.getByTestId('paso-v:avance-c3')).toContainText('Pendiente')
    await page.goto('/#/cursos/negras')
    await expect(page.getByTestId('tarjeta-caro-kann-estructuras:b')).toContainText('2 de 8 variantes')
  })

  test('"Seguir" salta las opcionales, y con lo obligatorio hecho el botón dice "Repasar el curso"', async ({ page }) => {
    const boton = page.getByTestId('empezar-curso')
    const nombre = page.getByTestId('seguir-nombre')
    // una opcional a medias no cambia nada: sigue diciendo Empezar, y lleva a La idea
    await conAvance(page, { enCurso: 'panov' })
    await expect(boton).toHaveText('Empezar')
    await boton.click()
    await expect(page.getByTestId('pieza-idea')).toBeVisible()

    // con lo obligatorio a medias, "Seguir" va a lo que sigue, aunque haya una opcional a medias
    await conAvance(page, { piezas: { idea: 1, estructura: 1 }, terminadas: ['avance-short', 'cambio', 'clasica', 'dos-caballos'], enCurso: 'panov' })
    await expect(nombre).toHaveText(mostrarTexto(lineaPorId(NUEVO, 'v:avance-van-der-wiel')!.nombre, 'figuras'))

    // al acabar las ocho obligatorias, sigue Errores y trampas, no la primera opcional
    const todas = obligatorias(NUEVO).map((v) => v.id)
    await conAvance(page, { piezas: { idea: 1, estructura: 1 }, terminadas: todas })
    await expect(page.getByTestId('avance')).toHaveText('8 de 8 variantes')
    await expect(nombre).toHaveText('Errores y trampas')

    // todo lo obligatorio hecho, con las ocho opcionales pendientes
    await conAvance(page, { piezas: { idea: 1, estructura: 1, errores: 1, repaso: 1 }, terminadas: todas })
    await expect(boton).toHaveText('Repasar el curso')
    await expect(page.locator('[data-testid^="paso-v:"][data-estado="pendiente"]')).toHaveCount(8)
  })

  test('arriba, "Variante N de 8" en las obligatorias y "Opcional N de 8" en las opcionales', async ({ page }) => {
    for (const [i, v] of obligatorias(NUEVO).entries()) {
      await page.goto(urlDe(NUEVO, `v:${v.id}`))
      await expect(page.getByTestId('cual-variante'), v.id).toHaveText(`Variante ${i + 1} de 8`)
    }
    for (const [i, v] of opcionales(NUEVO).entries()) {
      await page.goto(urlDe(NUEVO, `v:${v.id}`))
      await expect(page.getByTestId('cual-variante'), v.id).toHaveText(`Opcional ${i + 1} de 8`)
    }
    await page.goto(urlDe(ACTUAL, 'v:fantasia'))
    await expect(page.getByTestId('cual-variante')).toHaveText(`Variante ${ACTUAL.variantes.findIndex((v) => v.id === 'fantasia') + 1} de 16`)
  })

  test('la introducción abre con la frase de su estructura, y Practicar no la repite', async ({ page }) => {
    await page.goto(urlDe(NUEVO, 'v:cambio'))
    await momento(page, 'intro')
    await expect(page.getByTestId('narracion')).toContainText('Estás en el Cambio: tu objetivo es atacar los peones de blancas en el lado de dama.')
    await expect(page.getByTestId('narracion')).toContainText('Es la Variante del Cambio.')
    await page.getByTestId('vuelta-practicar').click()
    await expect(page.getByTestId('narracion')).toContainText('Ahora, Practicar')
    await expect(page.getByTestId('narracion')).not.toContainText('Estás en el Cambio')
  })

  test('"Siguiente variante" sigue la tabla: cruza de La base a Las que más salen; la última obligatoria va a Errores y trampas', async ({ page }, info) => {
    test.setTimeout(120_000)
    await terminar(page, info, NUEVO, 'dos-caballos')
    await expect(page.getByTestId('salida-siguiente')).toHaveText('Siguiente variante')
    await page.getByTestId('salida-siguiente').click()
    await expect(page.getByTestId('nombre-linea')).toHaveText(mostrarTexto(lineaPorId(NUEVO, 'v:avance-van-der-wiel')!.nombre, 'figuras'))
    await expect(page.getByTestId('cual-variante')).toHaveText('Variante 5 de 8')

    await terminar(page, info, NUEVO, 'hillbilly')
    await expect(page.getByTestId('salida-siguiente')).toHaveText('Errores y trampas')
    await page.getByTestId('salida-siguiente').click()
    await expect(page.getByTestId('pieza-errores')).toBeVisible()
    await expect(page.getByTestId('pieza-errores').locator('[data-testid^="error-"]')).toHaveCount(2)
    await expect(page.getByTestId('pieza-errores')).toContainText('Dos «¿Y si…?»')
  })

  test('una opcional lleva a la siguiente opcional, y la última, de vuelta al curso', async ({ page }, info) => {
    test.setTimeout(120_000)
    await terminar(page, info, NUEVO, 'panov')
    await expect(page.getByTestId('salida-siguiente')).toHaveText('Siguiente variante')
    await page.getByTestId('salida-siguiente').click()
    await expect(page.getByTestId('nombre-linea')).toHaveText(mostrarTexto(lineaPorId(NUEVO, 'v:apocalipsis')!.nombre, 'figuras'))
    await expect(page.getByTestId('cual-variante')).toHaveText('Opcional 6 de 8')

    await terminar(page, info, NUEVO, 'fantasia')
    await expect(page.getByTestId('salida-siguiente')).toHaveText('Volver al curso')
    await page.getByTestId('salida-siguiente').click()
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Caro-Kann por estructuras')
  })

  test('el avance de un curso no toca el del otro', async ({ page }, info) => {
    test.setTimeout(120_000)
    await terminar(page, info, NUEVO, 'dos-caballos')
    expect(await leido(page, CLAVE_ACTUAL), 'el curso de hoy, sin tocar').toBeNull()
    await page.goto(URL_NUEVO)
    await expect(page.getByTestId('avance')).toHaveText('1 de 8 variantes')
    await page.goto(URL_ACTUAL)
    await expect(page.getByTestId('avance')).toHaveText('0 de 16 variantes')
    await expect(page.getByTestId('paso-v:dos-caballos')).toHaveAttribute('data-estado', 'pendiente')

    // y al revés
    const antes = await leido(page, CLAVE)
    await terminar(page, info, ACTUAL, 'fantasia')
    expect(await leido(page, CLAVE), 'el curso nuevo, sin tocar').toEqual(antes)
    await page.goto(URL_ACTUAL)
    await expect(page.getByTestId('avance')).toHaveText('1 de 16 variantes')
    await page.goto(URL_NUEVO)
    await expect(page.getByTestId('avance')).toHaveText('1 de 8 variantes')
    await expect(page.getByTestId('paso-v:fantasia')).toHaveAttribute('data-estado', 'pendiente')
  })

  test('una sola ficha de Repaso por línea: una obligatoria cuenta para la del curso de hoy, y no sale dos veces', async ({ page }, info) => {
    test.setTimeout(120_000)
    await page.clock.setFixedTime(HOY)
    // la misma línea, terminada en los dos cursos
    await terminar(page, info, NUEVO, 'dos-caballos')
    const v = ACTUAL.variantes.find((x) => x.id === 'dos-caballos')!
    expect(Object.keys(await leido(page, 'ajedrez.v1.progreso'))).toEqual([leccionIdDe(ACTUAL, v)])
    await terminar(page, info, ACTUAL, 'dos-caballos')
    expect(Object.keys(await leido(page, 'ajedrez.v1.progreso'))).toEqual([leccionIdDe(ACTUAL, v)])

    await page.clock.setFixedTime(MANANA)
    await page.goto('/#/')
    await page.reload()
    await expect(page.getByTestId('repaso-hoy')).toHaveAttribute('data-n', '1')
    await page.goto('/#/repaso')
    await expect(page.getByTestId('nombre-linea')).toHaveText(mostrarTexto(v.nombre, 'figuras'))
  })

  test('una opcional no entra al Repaso', async ({ page }, info) => {
    test.setTimeout(120_000)
    await page.clock.setFixedTime(HOY)
    await terminar(page, info, NUEVO, 'panov')
    expect((await leido(page, CLAVE)).variantes.panov.terminada).toBeTruthy()
    expect((await leido(page, 'ajedrez.v1.progreso')) ?? {}).toEqual({})
    await page.clock.setFixedTime(MANANA)
    await page.goto('/#/')
    await page.reload()
    await expect(page.getByTestId('repaso-hoy')).toHaveAttribute('data-n', '0')
  })

  test('en el ancho más chico, nada se sale: las tarjetas y la página con sus secciones', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    for (const u of ['/#/cursos/negras', URL_NUEVO]) {
      await page.goto(u)
      await expect(page.getByText('Caro-Kann por estructuras').first()).toBeVisible()
      const m = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, pantalla: innerWidth }))
      expect(m.pagina, u).toBeLessThanOrEqual(m.pantalla)
    }
  })
})
