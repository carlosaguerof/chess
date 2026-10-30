import { mkdirSync, writeFileSync } from 'node:fs'
import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId, lineasDe, misJugadas } from '../../src/curso/datos.ts'
import { fotosDePasos } from '../../src/curso/pasos.ts'
import { todosLosVer, verDelError, verDespues, type VerDelMomento } from '../../src/curso/ver.ts'
import { explicacionDespues } from '../../src/curso/turno.ts'
import { mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { jugadaEs, posicion } from '../../src/curso/textos.ts'
import { jugar, tocar } from './_util.ts'

/**
 * El pie de la narración (2026-10-30, Carlos en su iPhone: "Siguiente debería ir a la derecha, no a la izquierda"): la
 * acción principal va a la derecha, sola o con una secundaria a su izquierda. Y "Ver qué pasa" (Carlos: "lo leo y no lo
 * veo"): la frase de una alternativa, en el tablero, con la ventana del paso a paso. Las capturas para la torre
 * (`--grep @capturas-ver`), en iterations/v3/capturas/ver-que-pasa/<perfil>/, con su índice.
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

const ventana = (page: Page) => page.getByTestId('paso-a-paso')
const fraseDe = (page: Page) => page.getByTestId('paso-a-paso-frase')
const tituloDe = (page: Page) => page.getByTestId('paso-a-paso-titulo')
const fig = (t: string) => mostrarTexto(t, 'figuras')

/** Recorre todos los pasos con Siguiente: la frase y el tablero de cada uno son los de los datos. Termina en el último. */
async function recorrer(page: Page, v: VerDelMomento) {
  const fotos = fotosDePasos(v.pa, v.inicio)
  for (let i = 0; i < v.pa.pasos.length; i++) {
    await expect(ventana(page)).toHaveAttribute('data-paso', String(i + 1))
    await expect(fraseDe(page)).toHaveText(fig(v.pa.pasos[i]!.frase))
    await expect(page.getByTestId('tablero-paso-a-paso')).toHaveAttribute('data-fen', fotos[i]!.fen)
    if (i < v.pa.pasos.length - 1) await page.getByTestId('pap-siguiente').click()
  }
}

test.describe('V1 · "Ver qué pasa"', () => {
  const tal = lineaPorId(c, TAL)!

  test('en la Tal, después de 4...h5: abre en la posición de después de 4.h4, recorre 4...e6 a 7.h5 y dice la consecuencia; al salir, la lección sigue igual', async ({ page }, info) => {
    await despuesDe(page, info, TAL, 'aprender', 7)
    expect((await orillas(page, 'ver-que-pasa')).izquierda, '"Ver qué pasa", a la izquierda').toBe(0)
    expect((await orillas(page, 'siguiente')).derecha, '"Siguiente", a la derecha').toBe(0)
    const antes = await page.getByTestId('narracion').innerText()

    await page.getByTestId('ver-que-pasa').click()
    await expect(tituloDe(page)).toHaveText(fig('Si juegas ...e6 ahora, siguen 5.g4, 6.f3 y 7.h5, y tu alfil se queda sin casillas: lo pierdes.'))
    await expect(page.getByTestId('tablero-paso-a-paso')).toHaveAttribute('data-fen', posicion(tal.jugadas, 7).fen())
    await expect(fraseDe(page)).toHaveText(fig('Esta es la posición después de 4.h4.'))
    await recorrer(page, verDespues(c, tal, 'aprender', 7)!)
    await expect(fraseDe(page)).toContainText('lo pierdes')
    await expect(page.getByTestId('pap-siguiente')).toHaveText('Salir')
    await page.getByTestId('pap-siguiente').click()

    await expect(ventana(page)).toHaveCount(0)
    await expect(leccion(page)).toHaveAttribute('data-momento', 'leer')
    await expect(leccion(page)).toHaveAttribute('data-ply', '8')
    expect(await page.getByTestId('narracion').innerText()).toBe(antes)
    await page.getByTestId('siguiente').click()
    await momento(page, 'tuTurno')
  })

  test('con Atrás regresa un paso, y se cierra con un toque fuera o con Esc', async ({ page }, info) => {
    await despuesDe(page, info, TAL, 'aprender', 7)
    await page.getByTestId('ver-que-pasa').click()
    await page.getByTestId('pap-siguiente').click()
    await expect(ventana(page)).toHaveAttribute('data-paso', '2')
    await page.getByTestId('pap-atras').click()
    await expect(ventana(page)).toHaveAttribute('data-paso', '1')
    await page.keyboard.press('Escape')
    await expect(ventana(page)).toHaveCount(0)
    await page.getByTestId('ver-que-pasa').click()
    await page.getByTestId('paso-a-paso-fondo').click({ position: { x: 4, y: 4 } })
    await expect(ventana(page)).toHaveCount(0)
    await expect(leccion(page)).toHaveAttribute('data-momento', 'leer')
  })

  test('en Practicar, la frase oculta no trae "Ver": "Siguiente" va solo, a la derecha', async ({ page }, info) => {
    await despuesDe(page, info, TAL, 'practicar', 7)
    await expect(page.getByTestId('narracion')).not.toContainText('Si juegas')
    await expect(page.getByTestId('ver-que-pasa')).toHaveCount(0)
    expect((await orillas(page, 'siguiente')).derecha).toBe(0)
  })

  test('en Practicar, una frase que se muestra y no adelanta nada sí lo trae, y verlo no cuenta como fallo ni como ayuda', async ({ page }, info) => {
    // 7...Axf7 de la Bayoneta, la última jugada: "Tomar con el rey también se puede…"
    const id = 'v:avance-bayoneta'
    await despuesDe(page, info, id, 'practicar', 13)
    await page.getByTestId('ver-que-pasa').click()
    await recorrer(page, verDespues(c, lineaPorId(c, id)!, 'practicar', 13)!)
    await page.getByTestId('pap-siguiente').click()
    await page.getByTestId('siguiente').click()
    await momento(page, 'fin')
    await expect(page.getByTestId('resumen-tropiezos')).toContainText('Sin errores ni ayuda en Practicar.')
  })

  test('con una equivocada conocida: "Ver qué pasa" y "Reintentar"; al salir, el error sigue a la vista; en Practicar, solo si no adelanta', async ({ page }, info) => {
    // 4...h6 en la Tal: el "Ver" no contiene ...h5
    await abrirEn(page, TAL, 'practicar', 7)
    await momento(page, 'tuTurno')
    await tocar(page, info, 'h7')
    await tocar(page, info, 'h6')
    await momento(page, 'error')
    expect((await orillas(page, 'ver-que-pasa')).izquierda).toBe(0)
    expect((await orillas(page, 'reintentar')).derecha).toBe(0)
    await page.getByTestId('ver-que-pasa').click()
    await recorrer(page, verDelError(c, tal, 'practicar', 7, 'h6')!)
    await page.getByTestId('pap-siguiente').click()
    await expect(ventana(page)).toHaveCount(0)
    await expect(leccion(page)).toHaveAttribute('data-momento', 'error')
    await expect(page.getByTestId('reintentar')).toBeVisible()

    // 4...e6: el "Ver" contiene ...e6, que la línea me va a pedir: en Practicar no va, y en Aprender sí
    await page.getByTestId('reintentar').click()
    await momento(page, 'tuTurno')
    await tocar(page, info, 'e7')
    await tocar(page, info, 'e6')
    await momento(page, 'error')
    await expect(page.getByTestId('ver-que-pasa')).toHaveCount(0)
    await expect(page.getByTestId('reintentar')).toBeVisible()
    await abrirEn(page, TAL, 'aprender', 7)
    await momento(page, 'tuTurno')
    await tocar(page, info, 'e7')
    await tocar(page, info, 'e6')
    await momento(page, 'error')
    await expect(page.getByTestId('ver-que-pasa')).toBeVisible()
  })

  test('dos frases en un momento: una tras otra, y el título cambia con la frase', async ({ page }, info) => {
    const id = 'v:cambio'
    await despuesDe(page, info, id, 'aprender', 13)
    await page.getByTestId('ver-que-pasa').click()
    await expect(tituloDe(page)).toHaveText(fig('Nunca con ...Dc7: el alfil de f4 se come tu dama.'))
    await recorrer(page, verDespues(c, lineaPorId(c, id)!, 'aprender', 13)!)
    await expect(tituloDe(page)).toHaveText(fig('Y si juegas ...e6, pierdes b7.'))
  })

  for (const p of [
    { ancho: 375, alto: 667 },
    { ancho: 360, alto: 740 },
    { ancho: 390, alto: 844 },
    { ancho: 402, alto: 874 },
    { ancho: 430, alto: 932 },
  ])
    test.describe(`a ${p.ancho}×${p.alto}`, () => {
      test.use({ viewport: { width: p.ancho, height: p.alto } })

      test('el pie no crece, los dos botones caben en un renglón, y la frase más larga no saca de la pantalla los botones de la ventana', async ({ page }, info) => {
        test.skip(info.project.name !== 'iphone', 'en la computadora la ventana sobra')
        // la explicación más larga con "Ver": 3...Af5
        await despuesDe(page, info, TAL, 'aprender', 5)
        const pie = await page.evaluate(() => {
          const ver = document.querySelector('[data-testid="ver-que-pasa"]')!.getBoundingClientRect()
          const sig = document.querySelector('[data-testid="siguiente"]')!.getBoundingClientRect()
          return { arribaVer: ver.top, arribaSig: sig.top, altoVer: ver.height, altoSig: sig.height, ancho: document.documentElement.scrollWidth, pagina: document.documentElement.scrollHeight }
        })
        expect(Math.round(pie.arribaVer)).toBe(Math.round(pie.arribaSig))
        expect(pie.altoVer).toBe(pie.altoSig)
        expect(pie.altoVer, 'en un renglón').toBeLessThanOrEqual(48)
        expect(pie.ancho).toBeLessThanOrEqual(p.ancho)
        expect(pie.pagina).toBeLessThanOrEqual(p.alto)
        await page.getByTestId('ver-que-pasa').click()
        const medida = await page.evaluate(() => {
          const r = document.querySelector('[data-testid="paso-a-paso"]')!.getBoundingClientRect()
          const b = document.querySelector('[data-testid="pap-siguiente"]')!.getBoundingClientRect()
          return { arriba: r.top, abajo: r.bottom, boton: b.bottom, alto: innerHeight }
        })
        expect(medida.arriba, 'la ventana, dentro de la pantalla').toBeGreaterThanOrEqual(0)
        expect(medida.abajo).toBeLessThanOrEqual(medida.alto)
        expect(medida.boton, 'Siguiente, a la vista').toBeLessThanOrEqual(medida.alto)
      })
    })
})

// ---------------------------------------------------------------- las capturas para la torre
const CARPETA = 'iterations/v3/capturas/ver-que-pasa'

test('@capturas-ver el pie, los pasos de la Tal, el primero y el último de cada "Ver", los "Siguen…" y "Siguiente" solo, con su índice', async ({ page, isMobile }, info) => {
  test.setTimeout(1_500_000)
  if (isMobile) await page.setViewportSize({ width: 402, height: 874 })
  const dir = `${CARPETA}/${info.project.name}`
  mkdirSync(dir, { recursive: true })
  const filas: string[] = []
  let n = 1
  const foto = async (nombre: string, fila: { momento: string; frase: string; marcas?: string }) => {
    const archivo = `${String(n++).padStart(3, '0')}-${nombre}.png`
    await page.waitForTimeout(200)
    await page.screenshot({ path: `${dir}/${archivo}`, scale: 'css' })
    filas.push(`| ${archivo} | ${fila.momento} | ${fila.frase.replace(/\|/g, '\\|')} | ${fila.marcas || '—'} |`)
  }
  const marcasVistas = async (testid: string) => {
    const r = await page.getByTestId(testid).first().locator('[data-marca]').evaluateAll((es) =>
      es.map((e) => {
        if (e.getAttribute('data-marca') === 'flecha') return `${e.getAttribute('data-de')}→${e.getAttribute('data-a')} (${e.getAttribute('data-tipo') ?? ''}${e.getAttribute('data-punteada') === 'si' ? ', punteada' : ''})`
        return `casilla ${e.getAttribute('data-en')} (${e.getAttribute('data-tipo') ?? ''})`
      }),
    )
    return r.join('; ')
  }

  // 1. el pie con "Ver qué pasa" y "Siguiente"
  const tal = lineaPorId(c, TAL)!
  await despuesDe(page, info, TAL, 'aprender', 7)
  await foto('pie-ver-y-siguiente-tal', { momento: 'La Tal, Aprender, después de 4...h5: el pie', frase: fig('Si juegas ...e6 ahora, siguen 5.g4, 6.f3 y 7.h5, y tu alfil se queda sin casillas: lo pierdes.') })

  // 2. cada paso del ejemplo de la Tal
  const vTal = verDespues(c, tal, 'aprender', 7)!
  await page.getByTestId('ver-que-pasa').click()
  for (let i = 0; i < vTal.pa.pasos.length; i++) {
    await foto(`tal-paso-${i + 1}`, { momento: `La Tal, paso ${i + 1} de ${vTal.pa.pasos.length}`, frase: fig(vTal.pa.pasos[i]!.frase), marcas: await marcasVistas('tablero-paso-a-paso') })
    await page.getByTestId('pap-siguiente').click()
  }

  // 3. el primero y el último de cada "Ver": en su lección, como se abren
  for (const v of todosLosVer(c)) {
    const ply = v.clave.split(' ').length - 1
    const l = lineasDe(c).find((x) => x.tipo === 'variante' && misJugadas(x).includes(ply) && x.jugadas.slice(0, ply + 1).join(' ') === v.clave)!
    let abierta: VerDelMomento
    if (v.campo === 'errores') {
      await abrirEn(page, l.id, 'aprender', ply)
      await momento(page, 'tuTurno')
      const j = posicion(l.jugadas, ply).move(v.i as string)
      await tocar(page, info, j.from)
      await tocar(page, info, j.to)
      await momento(page, 'error')
      abierta = verDelError(c, l, 'aprender', ply, v.i as string)!
    } else {
      await despuesDe(page, info, l.id, 'aprender', ply)
      abierta = verDespues(c, l, 'aprender', ply)!
    }
    const desde = abierta.pa.pasos.findIndex((p) => p.titulo === v.frase)
    const otra = abierta.pa.pasos.findIndex((p, i) => i > desde && p.titulo)
    const hasta = (otra < 0 ? abierta.pa.pasos.length : otra) - 1
    await page.getByTestId('ver-que-pasa').click()
    const lugar = `${fig(l.nombre)}, ${fig(jugadaEs(l.jugadas[ply]!, ply))}, ${v.campo === 'errores' ? `si juegas ${fig(jugadaEs(v.i as string, ply))}` : v.campo}`
    const nombre = `${l.id.slice(2)}-${ply + 1}-${v.campo}-${String(v.i).replace(/[^A-Za-z0-9]/g, '')}`
    for (let i = 0; i <= hasta; i++) {
      await expect(ventana(page)).toHaveAttribute('data-paso', String(i + 1))
      if (i === desde || i === hasta) await foto(`${nombre}-${i === desde ? 'primero' : 'ultimo'}`, { momento: `${lugar}: paso ${i + 1} de ${abierta.pa.pasos.length}`, frase: `Título: ${fig(v.frase)}<br>Paso: ${fig(abierta.pa.pasos[i]!.frase)}`, marcas: await marcasVistas('tablero-paso-a-paso') })
      if (i < hasta) await page.getByTestId('pap-siguiente').click()
    }
    await page.keyboard.press('Escape')
  }

  // 4. las frases "Siguen…" con sus marcas
  for (const [id, ply] of [
    ['v:avance-tal', 11],
    ['v:avance-c3', 11],
    ['v:clasica', 19],
    ['v:avance-bayoneta', 13],
  ] as const) {
    const l = lineaPorId(c, id)!
    await despuesDe(page, info, id, 'aprender', ply)
    await foto(`siguen-${id.slice(2)}`, { momento: `${fig(l.nombre)}, Aprender, después de ${fig(jugadaEs(l.jugadas[ply]!, ply))}`, frase: explicacionDespues(c, l, 'aprender', ply).map(fig).join('<br>'), marcas: await marcasVistas('tablero') })
  }

  // 5. "Siguiente" solo, a la derecha, y "Empezar"
  await despuesDe(page, info, TAL, 'aprender', 9)
  await foto('siguiente-solo-tal', { momento: 'La Tal, Aprender, después de 5...♗xd3: sin nada que ver', frase: explicacionDespues(c, tal, 'aprender', 9).map(fig).join('<br>') })
  await page.evaluate(() => localStorage.removeItem('ajedrez.v1.curso:caro-kann:b'))
  await page.goto('/#/curso/caro-kann%3Ab/linea/' + encodeURIComponent('v:clasica'))
  await page.reload()
  await momento(page, 'intro')
  await foto('empezar-solo-clasica', { momento: 'La Clásica, la introducción', frase: lineaPorId(c, 'v:clasica')!.intro })

  if (info.project.name === 'escritorio')
    writeFileSync(
      `${CARPETA}/indice.md`,
      [
        '# Las capturas de "Ver qué pasa" (2026-10-30)',
        '',
        '> Generado por `tests/e2e/ver-que-pasa.spec.ts` (`--grep @capturas-ver`). Las mismas en `iphone/` (Chromium emulando el iPhone 16 Pro, 402×874, táctil) y `escritorio/` (Chromium, 1440×900). Primero el pie y cada paso del ejemplo de la Tal; después, el primero y el último paso de cada "Ver qué pasa"; al final, las frases "Siguen…" con sus marcas, "Siguiente" y "Empezar" solos. Las líneas completas, en `iterations/v3/ver-que-pasa-inventario.md`.',
        '',
        '| Captura | Momento | Frase | Marcas |',
        '|---|---|---|---|',
        ...filas,
        '',
      ].join('\n'),
    )
})
