import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, leccionIdDe, lineaPorId, misJugadas, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { jugar } from './_util.ts'

/**
 * La Caro-Kann por estructuras (`specs/cursos.md` §6): las mismas jugadas del curso de antes con otra organización.
 * Desde el 2026-11-25 es la única Caro-Kann que se ve (una sola tarjeta, "Defensa Caro-Kann"); la dirección del curso de
 * antes lleva a ella y lo que terminé allá sale hecho aquí. Las secciones, "N de 8", "Seguir" sin las opcionales, "Variante N de 8" y
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
const escapar = (s: string) => s.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')
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
  test('en Aprender, pestaña negras, una sola Caro-Kann: la primera, "Defensa Caro-Kann", con el curso por estructuras adentro', async ({ page }) => {
    await page.goto('/#/cursos/negras')
    const tarjetas = page.getByTestId('lista-aperturas').locator('[data-testid^="tarjeta-"]')
    await expect(tarjetas).toHaveCount(3)
    expect(await tarjetas.evaluateAll((ts) => ts.map((t) => t.getAttribute('data-testid')))).toEqual(['tarjeta-caro-kann:b', 'tarjeta-eslava:b', 'tarjeta-otros-negras:b'])
    await expect(tarjetas).toContainText(['Defensa Caro-Kann', 'Defensa Eslava', 'Otras aperturas de blancas'])
    await expect(page.getByTestId('lista-aperturas')).not.toContainText('por estructuras')
    await expect(page.getByTestId('tarjeta-caro-kann:b')).toContainText('0 de 8 variantes')
    await page.getByTestId('tarjeta-caro-kann:b').click()
    await expect(page).toHaveURL(/#\/curso\/caro-kann-estructuras%3Ab$/)
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Defensa Caro-Kann')
    await expect(page.getByTestId('seccion-base')).toHaveText('La base')
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

  test('la dirección del curso de antes lleva al que queda: su página, una línea, una pieza de leer y "#/leccion"', async ({ page }) => {
    await page.goto(URL_ACTUAL)
    await expect(page).toHaveURL(/#\/curso\/caro-kann-estructuras%3Ab$/)
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Defensa Caro-Kann')
    await expect(page.getByTestId('avance')).toHaveText('0 de 8 variantes')
    await expect(page.getByTestId('seccion-base')).toBeVisible()

    await page.goto(urlDe(ACTUAL, 'v:cambio'))
    await expect(page).toHaveURL(new RegExp(`${escapar(urlDe(NUEVO, 'v:cambio').slice(2))}$`))
    await expect(page.getByTestId('cual-variante')).toHaveText('Variante 2 de 8')

    await page.goto(`${URL_ACTUAL}/leer/estructura`)
    await expect(page).toHaveURL(/#\/curso\/caro-kann-estructuras%3Ab\/leer\/estructura$/)
    await expect(page.getByTestId('pieza-estructura')).toBeVisible()

    // "Practicar esta línea" y el resumen de una lección llevan a "#/leccion/<curso>/<n>": la misma línea
    const i = ACTUAL.variantes.findIndex((v) => v.id === 'fantasia')
    await page.goto(`/#/leccion/caro-kann%3Ab/${i}`)
    await expect(page).toHaveURL(new RegExp(`${escapar(urlDe(NUEVO, 'v:fantasia').slice(2))}$`))
    await expect(page.getByTestId('nombre-linea')).toHaveText(mostrarTexto(lineaPorId(NUEVO, 'v:fantasia')!.nombre, 'figuras'))
    await expect(page.getByTestId('cual-variante')).toHaveText('Opcional 8 de 8')

    // un «¿Y si…?» que ya no está en el curso, a su página: ni página vacía ni error
    await page.goto(urlDe(ACTUAL, 'e:bayoneta-h6'))
    await expect(page).toHaveURL(/#\/curso\/caro-kann-estructuras%3Ab$/)
    await expect(page.getByTestId('pagina-curso')).toBeVisible()
  })

  test('"N de 8" cuenta solo las obligatorias, y una opcional hecha se marca igual que cualquier lección', async ({ page }) => {
    await conAvance(page, { piezas: { idea: 1, estructura: 1 }, terminadas: ['avance-short', 'cambio', 'panov'] })
    await expect(page.getByTestId('avance')).toHaveText('2 de 8 variantes')
    await expect(page.getByTestId('paso-v:panov')).toHaveAttribute('data-estado', 'hecha')
    await expect(page.getByTestId('paso-v:panov')).toContainText('Hecha')
    await expect(page.getByTestId('paso-v:avance-c3')).toContainText('Pendiente')
    await page.goto('/#/cursos/negras')
    await expect(page.getByTestId('tarjeta-caro-kann:b')).toContainText('2 de 8 variantes')
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
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Defensa Caro-Kann')
  })

  test('una lección hecha en el curso de antes sale hecha en el que queda, sin reescribir lo guardado', async ({ page }) => {
    const antes = { piezas: { idea: 1, estructura: 1, errores: 1, repaso: 1 }, variantes: { cambio: { aprendida: 1, terminada: 2 }, panov: { aprendida: 1, terminada: 2 } }, errores: { 'tal-e6': 3, 'cambio-dc7': 3 } }
    await page.goto('/#/')
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [CLAVE_ACTUAL, JSON.stringify(antes)] as const)
    await page.goto('/#/cursos/negras')
    await expect(page.getByTestId('tarjeta-caro-kann:b')).toContainText('1 de 8 variantes')
    await page.getByTestId('tarjeta-caro-kann:b').click()
    await expect(page.getByTestId('avance')).toHaveText('1 de 8 variantes')
    await expect(page.getByTestId('paso-v:cambio')).toHaveAttribute('data-estado', 'hecha')
    await expect(page.getByTestId('paso-v:panov')).toHaveAttribute('data-estado', 'hecha')
    await expect(page.getByTestId('paso-v:clasica')).toHaveAttribute('data-estado', 'pendiente')
    // las piezas de leer cambiaron: no se pasan
    for (const p of ['idea', 'estructura', 'errores', 'repaso']) await expect(page.getByTestId(`paso-${p}`), p).not.toHaveAttribute('data-estado', 'hecha')
    expect(await leido(page, CLAVE), 'el que queda no guardó nada').toBeNull()
    expect(await leido(page, CLAVE_ACTUAL), 'el de antes, sin tocar').toEqual(antes)
  })

  test('"Seguir" lleva al curso que queda y se salta lo que terminé en el de antes', async ({ page }) => {
    await page.goto('/#/')
    const antes = { piezas: {}, variantes: Object.fromEntries(['avance-short', 'cambio', 'clasica', 'dos-caballos'].map((id) => [id, { aprendida: 1, terminada: 2 }])), errores: {} }
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [CLAVE_ACTUAL, JSON.stringify(antes)] as const)
    await page.evaluate(([k, v]) => localStorage.setItem(k, v), [CLAVE, JSON.stringify({ piezas: { idea: 1, estructura: 1 }, variantes: {}, errores: {} })] as const)
    await page.goto('/#/cursos/negras')
    await page.getByTestId('tarjeta-caro-kann:b').click()
    await expect(page.getByTestId('avance')).toHaveText('4 de 8 variantes')
    await expect(page.getByTestId('seguir-nombre')).toHaveText(mostrarTexto(lineaPorId(NUEVO, 'v:avance-van-der-wiel')!.nombre, 'figuras'))
    await page.getByTestId('empezar-curso').click()
    await expect(page).toHaveURL(new RegExp(`${escapar(urlDe(NUEVO, 'v:avance-van-der-wiel').slice(2))}$`))
    await expect(page.getByTestId('cual-variante')).toHaveText('Variante 5 de 8')
  })

  test('una sola ficha de Repaso por línea: lo del curso de antes y lo del que queda, sin repetir ninguna', async ({ page }, info) => {
    test.setTimeout(120_000)
    await page.clock.setFixedTime(HOY)
    const v = ACTUAL.variantes.find((x) => x.id === 'dos-caballos')!
    const w = ACTUAL.variantes.find((x) => x.id === 'cambio')!
    // como lo dejó el curso de antes: dos líneas terminadas, cada una con su ficha
    await page.goto('/#/')
    await page.evaluate(
      ([ids, clave, avance]) => {
        localStorage.setItem('ajedrez.v1.progreso', JSON.stringify(Object.fromEntries((ids as readonly string[]).map((id) => [id, { fecha: Date.now() }]))))
        localStorage.setItem(clave as string, avance as string)
      },
      [[leccionIdDe(ACTUAL, v), leccionIdDe(ACTUAL, w)], CLAVE_ACTUAL, JSON.stringify({ piezas: {}, variantes: { 'dos-caballos': { terminada: 1 }, cambio: { terminada: 1 } }, errores: {} })] as const,
    )
    // una de ellas, terminada otra vez en el que queda: usa la misma ficha
    await terminar(page, info, NUEVO, 'dos-caballos')
    expect(Object.keys(await leido(page, 'ajedrez.v1.progreso')).sort()).toEqual([leccionIdDe(ACTUAL, v), leccionIdDe(ACTUAL, w)].sort())

    await page.clock.setFixedTime(MANANA)
    await page.goto('/#/')
    await page.reload()
    await expect(page.getByTestId('repaso-hoy')).toHaveAttribute('data-n', '2')
    await page.goto('/#/repaso')
    await expect(page.getByTestId('nombre-linea')).toHaveText(new RegExp(`^(${escapar(mostrarTexto(v.nombre, 'figuras'))}|${escapar(mostrarTexto(w.nombre, 'figuras'))})$`))
  })

  test('las opcionales no salen en el Repaso ni en Refuerza; lo guardado se queda', async ({ page }) => {
    await page.clock.setFixedTime(MANANA)
    const id = (v: string) => leccionIdDe(ACTUAL, ACTUAL.variantes.find((x) => x.id === v)!)
    const ayer = HOY.getTime()
    const fen = (camino: string[]) => {
      const ch = new Chess()
      for (const s of camino) ch.move(s)
      return ch.fen().split(' ').slice(0, 4).join(' ')
    }
    const fallo = (camino: string[], esperada: string) => ({ fen: fen(camino), esperada, resultado: 'fallo', lugar: 'curso', fecha: ayer, linea: 'x', camino })
    // como lo dejó el curso de antes: la Tal (opcional) y el Cambio (obligatoria) aprendidas, y un fallo solo de la Tal
    const progreso = { [id('avance-tal')]: { fecha: ayer }, [id('cambio')]: { fecha: ayer } }
    const registro = [fallo(['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'h4'], 'h5')]
    await page.goto('/#/')
    await page.evaluate(([p, r]) => {
      localStorage.setItem('ajedrez.v1.progreso', p)
      localStorage.setItem('ajedrez.v1.registro', r)
    }, [JSON.stringify(progreso), JSON.stringify(registro)] as const)
    await page.reload()
    await expect(page.getByTestId('repaso-hoy')).toHaveAttribute('data-n', '1')
    await expect(page.getByTestId('ir-refuerza')).toHaveAttribute('data-n', '0')
    await page.goto('/#/repaso')
    await expect(page.getByTestId('nombre-linea')).toHaveText(mostrarTexto(ACTUAL.variantes.find((x) => x.id === 'cambio')!.nombre, 'figuras'))
    await page.goto('/#/refuerza')
    await expect(page.getByTestId('refuerza-vacia')).toBeVisible()
    // un fallo en una obligatoria sí sale
    await page.evaluate((r) => localStorage.setItem('ajedrez.v1.registro', r), JSON.stringify([...registro, fallo(['e4', 'c6', 'd4', 'd5', 'e5'], 'Bf5')]))
    await page.goto('/#/')
    await page.reload()
    await expect(page.getByTestId('ir-refuerza')).toHaveAttribute('data-n', '1')
    // nada se borró
    expect(Object.keys(await leido(page, 'ajedrez.v1.progreso')).sort()).toEqual(Object.keys(progreso).sort())
    expect(await leido(page, 'ajedrez.v1.registro')).toHaveLength(2)
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
      await expect(page.getByText('Defensa Caro-Kann').first()).toBeVisible()
      const m = await page.evaluate(() => ({ pagina: document.documentElement.scrollWidth, pantalla: innerWidth }))
      expect(m.pagina, u).toBeLessThanOrEqual(m.pantalla)
    }
  })
})
