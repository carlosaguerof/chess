import { mkdirSync, writeFileSync } from 'node:fs'
import { expect, test, type Locator, type Page, type TestInfo } from '@playwright/test'
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
 * acción principal va a la derecha, y el pie es solo para seguir. Y "Ver qué pasaría" (Carlos: "lo leo y no lo veo"): la
 * frase de una alternativa, en el tablero, con la ventana del paso a paso; su botón va dentro de la explicación, justo
 * después de su frase ("más pequeño y justo al final"). Las capturas para la torre (`--grep @capturas-ver`), en
 * iterations/v3/capturas/ver-que-pasa/<perfil>/, con su índice.
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

/** Los botones que hay en el pie. */
const delPie = (page: Page) => page.locator('.narracion-pie button').evaluateAll((b) => b.map((x) => x.getAttribute('data-testid')))

/** En qué mensaje va un botón, y qué texto lleva antes y después, dentro de ese mensaje. */
const alrededor = (boton: Locator) =>
  boton.evaluate((b) => {
    const p = b.parentElement!
    const antes = document.createRange()
    antes.setStart(p, 0)
    antes.setEndBefore(b)
    const despues = document.createRange()
    despues.setStartAfter(b)
    despues.setEnd(p, p.childNodes.length)
    return { tipo: p.getAttribute('data-tipo'), antes: antes.toString().trim(), despues: despues.toString().trim(), separa: antes.toString().at(-1) }
  })

/**
 * Cómo queda el botón en su renglón: en cuántos renglones va su nombre, cuánto le sobra al cuadro, cuánto creció el mensaje
 * sobre lo que miden sus renglones (`crecioConRelleno`: la misma medida con el relleno de `.enlace-chico`, para ver que la
 * medida sí lo nota), lo que mide su zona de toque, lo que le queda de ella con el texto deslizado hasta abajo (ahí el pie
 * manda), si otro botón le queda encima y el contraste contra el fondo de su cuadro.
 */
async function medirBoton(boton: Locator) {
  return boton.evaluate((b: HTMLElement) => {
    const p = b.parentElement!
    const estilo = getComputedStyle(p)
    const renglon = parseFloat(estilo.lineHeight)
    const crecio = () => {
      const r = p.getBoundingClientRect()
      const rango = document.createRange()
      rango.selectNodeContents(p)
      const adentro = r.top + parseFloat(estilo.paddingTop)
      const renglones = new Set(Array.from(rango.getClientRects()).map((x) => Math.floor((x.top + x.height / 2 - adentro) / renglon))).size
      return r.height - parseFloat(estilo.paddingTop) - parseFloat(estilo.paddingBottom) - renglones * renglon
    }
    const medidaCrecio = crecio()
    b.style.padding = '4px 0'
    const crecioConRelleno = crecio()
    b.style.padding = ''

    // la zona de toque: hasta dónde, arriba y abajo del centro, un toque cae en este botón (a medio cuadro, sin el pie cerca)
    const n = b.closest<HTMLElement>('.narracion')!
    const scroll = n.scrollTop
    const pie = n.querySelector<HTMLElement>('.narracion-pie')!
    pie.style.visibility = 'hidden'
    const c = b.getBoundingClientRect()
    n.scrollTop += c.top + c.height / 2 - (n.getBoundingClientRect().top + n.clientHeight / 2)
    const r = b.getBoundingClientRect()
    const [x, y] = [r.left + r.width / 2, r.top + r.height / 2]
    const zona = (cx: number, cy: number) => {
      const cae = (d: number) => document.elementFromPoint(cx, cy + d)?.closest('[data-testid="ver-que-pasa"]') === b
      let [arriba, abajo] = [0, 0]
      while (arriba < 60 && cae(-arriba - 1)) arriba++
      while (abajo < 60 && cae(abajo + 1)) abajo++
      return arriba + abajo + 1
    }
    const zonaDeToque = zona(x, y)
    const otroBotonEncima = Array.from(document.querySelectorAll('[data-testid="ver-que-pasa"]')).some((o) => {
      const q = o.getBoundingClientRect()
      return o !== b && Math.abs(q.top - r.top) < 44 && q.left < r.right && q.right > r.left
    })
    pie.style.visibility = ''
    n.scrollTop = n.scrollHeight
    const abajo = b.getBoundingClientRect()
    // si el botón ya salió de la vista por arriba, ahí no hay nada que tocar
    const zonaJuntoAlPie = abajo.top < n.getBoundingClientRect().top ? null : zona(abajo.left + abajo.width / 2, abajo.top + abajo.height / 2)
    n.scrollTop = scroll

    const luz = (css: string) => {
      const [red, green, blue] = css.match(/[\d.]+/g)!.map(Number).map((v) => v / 255)
      const canal = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
      return 0.2126 * canal(red!) + 0.7152 * canal(green!) + 0.0722 * canal(blue!)
    }
    const fondoDelMensaje = estilo.backgroundColor
    const fondo = fondoDelMensaje === 'rgba(0, 0, 0, 0)' ? getComputedStyle(n).backgroundColor : fondoDelMensaje
    const [claro, oscuro] = [luz(getComputedStyle(b).color), luz(fondo)].sort((m, o) => o - m)
    const nombre = b.firstElementChild!.getClientRects()
    return {
      renglonesDelNombre: new Set(Array.from(nombre).map((x) => Math.round(x.top))).size,
      letra: getComputedStyle(b).fontSize,
      anchoBoton: Math.round(r.width * 10) / 10,
      sobraEnElCuadro: Math.round((p.getBoundingClientRect().right - parseFloat(estilo.paddingRight) - r.right) * 10) / 10,
      crecio: Math.round(medidaCrecio * 100) / 100,
      crecioConRelleno: Math.round(crecioConRelleno * 100) / 100,
      zonaDeToque,
      zonaJuntoAlPie,
      otroBotonEncima,
      contraste: Math.round(((claro! + 0.05) / (oscuro! + 0.05)) * 100) / 100,
    }
  })
}

/**
 * Angosta el mensaje poco a poco: en cada ancho, el nombre sigue en un renglón, dentro del cuadro y, si bajó de renglón, en
 * la orilla del texto, sin sangría. Devuelve los anchos donde no.
 */
const anchosQueLoRompen = (boton: Locator) =>
  boton.evaluate((b) => {
    const p = b.parentElement!
    const malos: number[] = []
    const renglones = () => new Set(Array.from(b.firstElementChild!.getClientRects()).map((x) => Math.round(x.top))).size
    const lleno = p.clientWidth
    for (let ancho = lleno; ancho >= 150; ancho -= 3) {
      p.style.width = `${ancho}px`
      const [r, m] = [b.getBoundingClientRect(), p.getBoundingClientRect()]
      const sangria = r.left - m.left - parseFloat(getComputedStyle(p).paddingLeft)
      if (renglones() !== 1 || r.right > m.right || r.left < m.left || (sangria > 0.5 && sangria < 12)) malos.push(ancho)
    }
    // más angosto que el botón: aquí se sale del cuadro, pero tampoco se parte (`nowrap`)
    p.style.width = '60px'
    if (renglones() !== 1) malos.push(60)
    p.style.width = ''
    return malos
  })

/** Pone el último botón justo arriba del principal, en su columna, y dice qué hay en el borde de arriba del principal. */
const bordeDelPie = (page: Page, testid: string) =>
  page.evaluate((testid) => {
    const ver = Array.from(document.querySelectorAll<HTMLElement>('[data-testid="ver-que-pasa"]')).at(-1)!
    ver.parentElement!.style.textAlign = 'right'
    const n = document.querySelector<HTMLElement>('[data-testid="narracion"]')!
    n.scrollTop = n.scrollHeight
    const principal = document.querySelector(`[data-testid="${testid}"]`)!.getBoundingClientRect()
    const b = ver.getBoundingClientRect()
    const x = (Math.max(b.left, principal.left) + Math.min(b.right, principal.right)) / 2
    const y = principal.top + 1
    return { x, y, enSuColumna: x >= Math.max(b.left, principal.left), justoArriba: b.bottom <= principal.top, distancia: y - (b.top + b.bottom) / 2, toca: document.elementFromPoint(x, y)?.closest('button')?.getAttribute('data-testid') }
  }, testid)

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

/** El último botón, justo arriba del principal y en su columna: tocar el borde de arriba del principal sigue con la lección. */
async function tocarElBordeDelPie(page: Page, info: TestInfo) {
  const toque = async (x: number, y: number) => (info.project.name === 'iphone' ? page.touchscreen.tap(x, y) : page.mouse.click(x, y))
  await despuesDe(page, info, 'v:cambio', 'aprender', 13)
  const borde = await bordeDelPie(page, 'siguiente')
  expect(borde.enSuColumna, 'el botón, en la columna de "Siguiente"').toBe(true)
  expect(borde.justoArriba, 'y justo arriba').toBe(true)
  expect(borde.distancia, 'tan cerca que su zona de toque llega a "Siguiente"').toBeLessThan(22)
  expect(borde.toca, 'el borde de arriba es de "Siguiente"').toBe('siguiente')
  await toque(borde.x, borde.y)
  await expect(ventana(page)).toHaveCount(0)
  await expect(leccion(page)).not.toHaveAttribute('data-momento', 'leer', { timeout: 10_000 })

  await abrirEn(page, TAL, 'practicar', 7)
  await momento(page, 'tuTurno')
  await tocar(page, info, 'h7')
  await tocar(page, info, 'h6')
  await momento(page, 'error')
  const rojo = await bordeDelPie(page, 'reintentar')
  expect(rojo.toca, 'el borde de arriba es de "Reintentar"').toBe('reintentar')
  await toque(rojo.x, rojo.y)
  await expect(ventana(page)).toHaveCount(0)
  await momento(page, 'tuTurno')
}

const ventana = (page: Page) => page.getByTestId('paso-a-paso')
const fraseDe = (page: Page) => page.getByTestId('paso-a-paso-frase')
const tituloDe = (page: Page) => page.getByTestId('paso-a-paso-titulo')
const amarillas = (page: Page) => page.getByTestId('tablero-paso-a-paso').locator('square.last-move')
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

test.describe('V1 · "Ver qué pasaría"', () => {
  const tal = lineaPorId(c, TAL)!

  test('en la Tal, después de 4...h5: el botón va después de su frase y el pie trae solo "Siguiente"; abre en la posición de después de 4.h4, recorre 4...e6 a 7.h5 y dice la consecuencia; al salir, la lección sigue igual', async ({ page }, info) => {
    await despuesDe(page, info, TAL, 'aprender', 7)
    const frase = fig('Con ...e6 en vez de ...h5, siguen 5.g4, 6.f3 y 7.h5, y tu alfil se queda sin casillas: lo pierdes.')
    const boton = page.getByTestId('narracion').getByTestId('ver-que-pasa')
    await expect(boton).toHaveText('Ver qué pasaría')
    expect((await alrededor(boton)).antes.endsWith(frase), 'justo después de su frase').toBe(true)
    expect(await delPie(page), 'el pie, solo con el principal').toEqual(['siguiente'])
    expect((await orillas(page, 'siguiente')).derecha, '"Siguiente", a la derecha').toBe(0)
    const antes = await page.getByTestId('narracion').innerText()

    await boton.click()
    await expect(tituloDe(page)).toHaveText(frase)
    await expect(page.getByTestId('tablero-paso-a-paso')).toHaveAttribute('data-fen', posicion(tal.jugadas, 7).fen())
    await expect(fraseDe(page)).toHaveText(fig('Regresamos a la posición después de 4.h4.'))
    await expect(amarillas(page), 'la última jugada, en amarillo').toHaveCount(2)
    await recorrer(page, verDespues(c, tal, 'aprender', 7)[0]!)
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
    await expect(page.getByTestId('narracion')).not.toContainText('Con ...e6 en vez de')
    await expect(page.getByTestId('ver-que-pasa')).toHaveCount(0)
    expect((await orillas(page, 'siguiente')).derecha).toBe(0)
  })

  test('en Practicar, una frase que se muestra y no adelanta nada sí lo trae, y verlo no cuenta como fallo ni como ayuda', async ({ page }, info) => {
    // 7...Axf7 de la Bayoneta, la última jugada: "Tomar con el rey también se puede…"
    const id = 'v:avance-bayoneta'
    await despuesDe(page, info, id, 'practicar', 13)
    await page.getByTestId('ver-que-pasa').click()
    await recorrer(page, verDespues(c, lineaPorId(c, id)!, 'practicar', 13)[0]!)
    await page.getByTestId('pap-siguiente').click()
    await page.getByTestId('siguiente').click()
    await momento(page, 'fin')
    await expect(page.getByTestId('resumen-tropiezos')).toContainText('Sin errores ni ayuda en Practicar.')
  })

  test('con una equivocada conocida: "Ver qué pasaría" dentro del cuadro rojo y el pie solo con "Reintentar"; al salir, el error sigue a la vista; en Practicar, solo si no adelanta', async ({ page }, info) => {
    // 4...h6 en la Tal: el "Ver" no contiene ...h5
    await abrirEn(page, TAL, 'practicar', 7)
    await momento(page, 'tuTurno')
    await tocar(page, info, 'h7')
    await tocar(page, info, 'h6')
    await momento(page, 'error')
    const cuadro = await alrededor(page.getByTestId('ver-que-pasa'))
    expect(cuadro.tipo, 'dentro del cuadro rojo').toBe('incorrecta')
    expect(cuadro.antes.endsWith(fig(verDelError(c, tal, 'practicar', 7, 'h6')!.titulo)), 'después de la frase').toBe(true)
    expect(cuadro.despues).toBe('')
    expect(await delPie(page)).toEqual(['reintentar'])
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

  test('la frase a media explicación: el botón queda entre las dos frases', async ({ page }, info) => {
    await despuesDe(page, info, 'v:cambio', 'aprender', 13)
    const entre = await alrededor(page.getByTestId('ver-que-pasa').first())
    expect(entre.antes).toBe(`Cuidado: ${fig('Nunca con ...Dc7: el alfil de f4 se come tu dama.')}`)
    expect(entre.despues.startsWith(fig('Y si juegas ...e6, pierdes b7.'))).toBe(true)
    expect(entre.separa, 'separado con medio eme: con un margen, al bajar de renglón quedaría sangrado').toBe('\u2002')
    expect(await delPie(page)).toEqual(['siguiente'])
  })

  test('una jugada con dos "Ver": dos botones, cada uno abre su frase, en su ventana, desde su propia posición, y la que antes seguía a la otra empieza desde el principio', async ({ page }, info) => {
    for (const id of ['v:cambio', 'v:avance-van-der-wiel']) {
      const vers = verDespues(c, lineaPorId(c, id)!, 'aprender', 13)
      expect(vers).toHaveLength(2)
      await despuesDe(page, info, id, 'aprender', 13)
      const botones = page.getByTestId('ver-que-pasa')
      await expect(botones).toHaveCount(2)
      for (const [i, v] of vers.entries()) {
        await botones.nth(i).click()
        await expect(tituloDe(page)).toHaveText(fig(v.titulo))
        await expect(ventana(page)).not.toContainText('Frase ')
        await expect(amarillas(page), 'su última jugada, en amarillo').toHaveCount(2)
        await recorrer(page, v)
        await expect(tituloDe(page), 'el título no cambia').toHaveText(fig(v.titulo))
        await page.getByTestId('pap-siguiente').click()
        await expect(ventana(page)).toHaveCount(0)
      }
      await expect(leccion(page)).toHaveAttribute('data-momento', 'leer')
    }
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

      test('el botón no saca nada de la pantalla, y la frase más larga no saca de la pantalla los botones de la ventana', async ({ page }, info) => {
        test.skip(info.project.name !== 'iphone', 'en la computadora la ventana sobra')
        // la explicación más larga con "Ver": 3...Af5
        await despuesDe(page, info, TAL, 'aprender', 5)
        const pagina = await page.evaluate(() => ({ ancho: document.documentElement.scrollWidth, alto: document.documentElement.scrollHeight }))
        expect(pagina.ancho).toBeLessThanOrEqual(p.ancho)
        expect(pagina.alto).toBeLessThanOrEqual(p.alto)
        await page.getByTestId('ver-que-pasa').click()
        const medida = await page.evaluate(() => {
          const r = document.querySelector('[data-testid="paso-a-paso"]')!.getBoundingClientRect()
          const b = document.querySelector('[data-testid="pap-siguiente"]')!.getBoundingClientRect()
          return { arriba: r.top, abajo: r.bottom, boton: b.bottom, alto: innerHeight }
        })
        expect(medida.arriba, 'la ventana, dentro de la pantalla').toBeGreaterThanOrEqual(0)
        expect(medida.abajo).toBeLessThanOrEqual(medida.alto)
        expect(medida.boton, 'Siguiente, a la vista').toBeLessThanOrEqual(medida.alto)

        // la frase más larga con "Ver" en un momento de dos: 6...h6 de la Clásica, que además habla de antes de mi jugada
        await despuesDe(page, info, 'v:clasica', 'aprender', 11)
        await page.getByTestId('ver-que-pasa').last().click()
        const dos = await page.evaluate(() => {
          const r = document.querySelector('[data-testid="paso-a-paso"]')!.getBoundingClientRect()
          const b = document.querySelector('[data-testid="pap-siguiente"]')!.getBoundingClientRect()
          return { arriba: r.top, abajo: r.bottom, boton: b.bottom, alto: innerHeight }
        })
        expect(dos.arriba, 'con dos "Ver", dentro de la pantalla').toBeGreaterThanOrEqual(0)
        expect(dos.abajo).toBeLessThanOrEqual(dos.alto)
        expect(dos.boton, 'con dos "Ver", Siguiente a la vista').toBeLessThanOrEqual(dos.alto)
      })
    })

  // el botón va en el renglón (`nowrap`): un botón que se parte o se sale del cuadro no hace fallar nada por sí solo
  for (const p of [
    { ancho: 390, alto: 844 },
    { ancho: 375, alto: 667 },
  ])
    test.describe(`el botón en su renglón, a ${p.ancho}×${p.alto}`, () => {
      test.use({ viewport: { width: p.ancho, height: p.alto } })
      const VDW = 'v:avance-van-der-wiel'

      test('no se parte ni se sale del cuadro, el renglón no crece, la zona de toque mide 44 o más y el contraste 4.5:1 o más, con "Siguiente" y en el cuadro rojo', async ({ page }, info) => {
        const medidas: Record<string, Awaited<ReturnType<typeof medirBoton>>> = {}
        const rotos: Record<string, number[]> = {}
        const medir = async (nombre: string, boton: Locator) => {
          rotos[nombre] = await anchosQueLoRompen(boton)
          medidas[nombre] = await medirBoton(boton)
        }
        const botones = page.getByTestId('ver-que-pasa')
        await despuesDe(page, info, TAL, 'aprender', 7)
        await medir('tal', botones)
        await despuesDe(page, info, 'v:cambio', 'aprender', 13)
        await medir('aMedias', botones.first())
        await medir('aMediasLaSegunda', botones.last())
        await despuesDe(page, info, VDW, 'practicar', 13)
        await medir('dosLaPrimera', botones.first())
        await medir('dosLaSegunda', botones.last())
        await abrirEn(page, TAL, 'practicar', 7)
        await momento(page, 'tuTurno')
        await tocar(page, info, 'h7')
        await tocar(page, info, 'h6')
        await momento(page, 'error')
        await medir('cuadroRojo', botones)

        // en el artefacto de `pruebas.yml`: así se sabe cómo queda en WebKit, que en la Air no corre
        writeFileSync(info.outputPath('medidas.json'), JSON.stringify({ perfil: info.project.name, ...p, medidas, rotos }, null, 2))
        for (const [donde, m] of Object.entries(medidas)) {
          expect(rotos[donde], `${donde}: de cualquier ancho, baja entero y no se sale`).toEqual([])
          expect(m.renglonesDelNombre, `${donde}: no se parte`).toBe(1)
          expect(m.sobraEnElCuadro, `${donde}: dentro del cuadro`).toBeGreaterThanOrEqual(0)
          expect(m.letra, `${donde}: el enlace chico`).toBe('13px')
          expect(Math.abs(m.crecio), `${donde}: el renglón no crece`).toBeLessThanOrEqual(0.5)
          expect(m.crecioConRelleno, `${donde}: la medida sí ve un renglón que crece`).toBeGreaterThan(0.5)
          // dos botones en renglones seguidos comparten lo que hay entre ellos: 44 para cada uno no cabe en 22 de distancia
          expect(m.zonaDeToque, `${donde}: la zona de toque`).toBeGreaterThanOrEqual(m.otroBotonEncima ? 28 : 44)
          // con el texto hasta abajo, el pie manda: a 19 de "Siguiente", la zona pierde 3
          expect(m.zonaJuntoAlPie ?? 44, `${donde}: la zona de toque, junto al pie`).toBeGreaterThanOrEqual(28)
          expect(m.contraste, `${donde}: el contraste`).toBeGreaterThanOrEqual(4.5)
        }
      })

      test('con dos botones, uno sobre otro, un toque en cada uno abre el suyo', async ({ page }, info) => {
        await despuesDe(page, info, 'v:cambio', 'aprender', 13)
        const botones = page.getByTestId('ver-que-pasa')
        await page.getByTestId('narracion').evaluate((n) => {
          n.scrollTop = n.scrollHeight
        })
        const [a, b] = [(await botones.first().boundingBox())!, (await botones.last().boundingBox())!]
        expect(b.y - a.y, 'en renglones seguidos').toBeLessThan(30)
        expect(Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x), 'en la misma columna').toBeGreaterThan(0)
        for (const [i, v] of verDespues(c, lineaPorId(c, 'v:cambio')!, 'aprender', 13).entries()) {
          const r = (await botones.nth(i).boundingBox())!
          const [x, y] = [Math.max(a.x, b.x) + 4, r.y + r.height / 2]
          if (info.project.name === 'iphone') await page.touchscreen.tap(x, y)
          else await page.mouse.click(x, y)
          await expect(tituloDe(page), `el botón ${i + 1}`).toHaveText(fig(v.titulo))
          await page.keyboard.press('Escape')
          await expect(ventana(page)).toHaveCount(0)
        }
      })

      test('tocar "Siguiente" o "Reintentar" nunca abre la ventana, aunque el botón quede justo arriba', async ({ page }, info) => {
        await tocarElBordeDelPie(page, info)
      })

      test('al cerrar la ventana, el texto sigue deslizado donde estaba', async ({ page }, info) => {
        await despuesDe(page, info, VDW, 'practicar', 13)
        const narracion = page.getByTestId('narracion')
        const antes = await narracion.evaluate((n) => {
          n.scrollTop = n.scrollHeight
          return n.scrollTop
        })
        expect(antes, 'el texto se desliza').toBeGreaterThan(0)
        await page.getByTestId('ver-que-pasa').last().click()
        await expect(ventana(page)).toBeVisible()
        await page.keyboard.press('Escape')
        await expect(ventana(page)).toHaveCount(0)
        expect(await narracion.evaluate((n) => n.scrollTop)).toBe(antes)
        await page.getByTestId('ver-que-pasa').last().click()
        await page.getByTestId('paso-a-paso-fondo').click({ position: { x: 4, y: 4 } })
        await expect(ventana(page)).toHaveCount(0)
        expect(await narracion.evaluate((n) => n.scrollTop)).toBe(antes)
      })
    })

  test('en la computadora, donde el pie no va pegado: tocar "Siguiente" o "Reintentar" nunca abre la ventana', async ({ page }, info) => {
    test.skip(info.project.name !== 'escritorio', 'el iPhone ya lo prueba arriba')
    await tocarElBordeDelPie(page, info)
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

  // 1. "Ver qué pasaría" junto a su frase, y "Siguiente" solo en el pie
  const tal = lineaPorId(c, TAL)!
  await despuesDe(page, info, TAL, 'aprender', 7)
  await foto('frase-con-ver-tal', { momento: 'La Tal, Aprender, después de 4...h5: el botón junto a su frase', frase: fig('Con ...e6 en vez de ...h5, siguen 5.g4, 6.f3 y 7.h5, y tu alfil se queda sin casillas: lo pierdes.') })

  // 2. cada paso del ejemplo de la Tal
  const vTal = verDespues(c, tal, 'aprender', 7)[0]!
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
    let boton = 0
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
      const vers = verDespues(c, l, 'aprender', ply)
      boton = vers.findIndex((x) => x.titulo === v.frase)
      abierta = vers[boton]!
    }
    const hasta = abierta.pa.pasos.length - 1
    await page.getByTestId('ver-que-pasa').nth(boton).click()
    const lugar = `${fig(l.nombre)}, ${fig(jugadaEs(l.jugadas[ply]!, ply))}, ${v.campo === 'errores' ? `si juegas ${fig(jugadaEs(v.i as string, ply))}` : v.campo}`
    const nombre = `${l.id.slice(2)}-${ply + 1}-${v.campo}-${String(v.i).replace(/[^A-Za-z0-9]/g, '')}`
    for (let i = 0; i <= hasta; i++) {
      await expect(ventana(page)).toHaveAttribute('data-paso', String(i + 1))
      // además del primero y el último, cada paso con marcas
      if (i === 0 || i === hasta || abierta.pa.pasos[i]!.marcas?.length) await foto(`${nombre}-${i === 0 ? 'primero' : i === hasta ? 'ultimo' : `paso-${i + 1}`}`, { momento: `${lugar}: paso ${i + 1} de ${abierta.pa.pasos.length}`, frase: `Título: ${fig(v.frase)}<br>Paso: ${fig(abierta.pa.pasos[i]!.frase)}`, marcas: await marcasVistas('tablero-paso-a-paso') })
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

  // 6. Practicar y el error: el pie con y sin "Ver", y "Ver qué pasaría" con "Reintentar"
  await despuesDe(page, info, TAL, 'practicar', 7)
  await foto('practicar-tal-sin-ver', { momento: 'La Tal, Practicar, después de 4...h5: la frase oculta no trae "Ver"', frase: explicacionDespues(c, tal, 'practicar', 7).map(fig).join('<br>') })
  await despuesDe(page, info, 'v:avance-bayoneta', 'practicar', 13)
  await foto('practicar-bayoneta-con-ver', { momento: 'La Bayoneta, Practicar, después de 7...♗xf7: la frase se muestra y no adelanta nada', frase: explicacionDespues(c, lineaPorId(c, 'v:avance-bayoneta')!, 'practicar', 13).map(fig).join('<br>') })
  await abrirEn(page, TAL, 'practicar', 7)
  await momento(page, 'tuTurno')
  await tocar(page, info, 'h7')
  await tocar(page, info, 'h6')
  await momento(page, 'error')
  await foto('practicar-error-con-ver-y-reintentar', { momento: 'La Tal, Practicar, si juegas 4...h6: "Ver qué pasaría" en el cuadro rojo, y "Reintentar"', frase: fig(c.mias['e4 c6 d4 d5 e5 Bf5 h4 h5']!.errores!.h6!) })

  // 7. en la pantalla más chica, la ventana con la frase más larga
  if (isMobile) {
    await page.setViewportSize({ width: 375, height: 667 })
    await despuesDe(page, info, TAL, 'aprender', 5)
    await foto('375x667-frase', { momento: 'A 375×667: el botón junto a su frase, después de 3...♗f5', frase: 'la explicación más larga con "Ver"' })
    await page.getByTestId('ver-que-pasa').click()
    await foto('375x667-ventana', { momento: 'A 375×667: la ventana con el título más largo', frase: 'el título más largo' })
    await despuesDe(page, info, 'v:clasica', 'aprender', 11)
    await page.getByTestId('ver-que-pasa').last().click()
    await foto('375x667-dos-frases', { momento: 'A 375×667: la ventana del segundo "Ver", después de 6...h6 de la Clásica', frase: 'la segunda frase, en su propia ventana' })
  }

  if (info.project.name === 'escritorio')
    writeFileSync(
      `${CARPETA}/indice.md`,
      [
        '# Las capturas de "Ver qué pasaría" (2026-10-30)',
        '',
        '> Generado por `tests/e2e/ver-que-pasa.spec.ts` (`--grep @capturas-ver`). Las mismas en `iphone/` (Chromium emulando el iPhone 16 Pro, 402×874, táctil) y `escritorio/` (Chromium, 1440×900). Primero el pie y cada paso del ejemplo de la Tal; después, el primero y el último paso de cada "Ver qué pasaría"; al final, las frases "Siguen…" con sus marcas, "Siguiente" y "Empezar" solos. Las líneas completas, en `iterations/v3/ver-que-pasa-inventario.md`.',
        '',
        '| Captura | Momento | Frase | Marcas |',
        '|---|---|---|---|',
        ...filas,
        '',
      ].join('\n'),
    )
})
