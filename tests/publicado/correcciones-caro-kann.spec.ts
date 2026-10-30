import { expect, test } from '@playwright/test'
import { jugar } from '../e2e/_util.ts'

/**
 * Correcciones de la Caro-Kann (C4, 2026-10-29): en la página publicada, lo de C1 a C3. Las coordenadas en el tablero
 * de leer, "Ver paso a paso", y Practicar sin texto de tu jugada, con la explicación después de jugarla.
 */
test('La idea: coordenadas en el tablero y "Ver paso a paso"', async ({ page }) => {
  const r = await page.goto('./#/curso/caro-kann%3Ab/leer/idea')
  expect(r?.status()).toBe(200)
  const tablero = page.getByTestId('tablero-leer')
  await expect(tablero.locator('coords.files coord')).toHaveCount(8)
  await expect(tablero.locator('coords.ranks coord')).toHaveCount(8)
  await page.getByTestId('ver-paso-a-paso').click()
  await expect(page.getByTestId('paso-a-paso-frase')).toHaveText('Blancas abre con 1.e4: ocupa el centro.')
  await expect(page.getByTestId('tablero-paso-a-paso')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/4P3\//)
  await page.getByTestId('pap-siguiente').click()
  await expect(page.getByTestId('paso-a-paso')).toHaveAttribute('data-paso', '2')
  await page.keyboard.press('Escape')
  await expect(page.getByTestId('paso-a-paso')).toHaveCount(0)
})

test('Practicar: en tu turno solo la jugada del rival; la explicación, después de jugar', async ({ page }, info) => {
  await page.goto('./#/')
  await page.evaluate(() => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea: 'v:avance-tal', vuelta: 'practicar', ply: 5, fecha: Date.now() } })))
  await page.goto('./#/curso/caro-kann%3Ab/linea/' + encodeURIComponent('v:avance-tal'))
  const leccion = page.getByTestId('leccion-curso')
  await expect(leccion).toHaveAttribute('data-momento', 'tuTurno')
  await expect(leccion).toHaveAttribute('data-vuelta', 'practicar')
  const narracion = page.getByTestId('narracion')
  await expect(narracion.locator('.mensaje-curso')).toHaveCount(1)
  await expect(narracion.locator('[data-tipo="rival"]')).toContainText('3.e5')
  await jugar(page, info, 'c8f5')
  await expect(leccion).toHaveAttribute('data-momento', 'leer')
  await expect(narracion.locator('[data-tipo="explica"]').first()).toContainText('Sacas tu alfil')
  await expect(page.getByTestId('siguiente')).toBeVisible()
})

/** Abre una jugada mía de una línea de la Caro-Kann, en su turno. */
async function abrir(page: import('@playwright/test').Page, linea: string, vuelta: 'aprender' | 'practicar', ply: number) {
  await page.goto('./#/')
  await page.evaluate(([linea, vuelta, ply]) => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta, ply, fecha: Date.now() } })), [linea, vuelta, ply] as const)
  await page.goto('./#/curso/caro-kann%3Ab/linea/' + encodeURIComponent(linea))
  await page.reload()
  await expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', 'tuTurno')
}

test('Las marcas v1.3 (2026-10-30): en "3.e5 le quita la casilla f6 a tu caballo", f6 en rojo y la L roja de g8 a f6, sin la verde de 3...♗f5; la verde sale con la Respuesta', async ({ page }) => {
  await abrir(page, 'v:avance-short', 'aprender', 5)
  await expect(page.locator('[data-marca]')).toHaveCount(2)
  await expect(page.locator('[data-marca="casilla"][data-en="f6"][data-color="rojo"]')).toHaveCount(1)
  await expect(page.locator('[data-marca="flecha"][data-de="g8"][data-a="f6"][data-color="rojo"][data-puntos="3"]')).toHaveCount(1)
  await expect(page.locator('[data-marca][data-color="verde"]')).toHaveCount(0)
  await expect(page.locator('[data-marca][data-en="d6"]')).toHaveCount(0)
  await page.getByTestId('respuesta').click()
  await expect(page.locator('[data-marca="flecha"][data-de="c8"][data-a="f5"][data-color="verde"]')).toHaveCount(1)
})

test('Las marcas v1.3: la amenaza del rival (A7) en la Van der Wiel, h4→h5 roja y punteada, sin la verde de 7...h5', async ({ page }) => {
  await abrir(page, 'v:avance-van-der-wiel', 'aprender', 13)
  await expect(page.locator('[data-marca]')).toHaveCount(1)
  await expect(page.locator('[data-marca="flecha"][data-tipo="A7"][data-de="h4"][data-a="h5"][data-color="rojo"][data-punteada="si"]')).toHaveCount(1)
})

test('Practicar no adelanta tu siguiente jugada (el caso de Carlos): después de 3...♗f5 en la Van der Wiel, ni "...e6" ni su flecha', async ({ page }, info) => {
  await abrir(page, 'v:avance-van-der-wiel', 'practicar', 5)
  await jugar(page, info, 'c8f5')
  await expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', 'leer')
  const narracion = page.getByTestId('narracion')
  await expect(narracion.locator('[data-tipo="explica"]')).toHaveText(['Sacas tu alfil de casillas blancas fuera de la cadena de peones.'])
  await expect(narracion).not.toContainText('e6')
  await expect(page.locator('[data-marca]')).toHaveCount(0)
})

test('"Ver qué pasaría" (2026-10-30): en la Tal, después de 4...h5, a la izquierda de "Siguiente"; recorre 4...e6 a 7.h5 y la lección sigue igual; en Practicar no sale', async ({ page }, info) => {
  await abrir(page, 'v:avance-tal', 'aprender', 7)
  await jugar(page, info, 'h7h5')
  const leccion = page.getByTestId('leccion-curso')
  await expect(leccion).toHaveAttribute('data-momento', 'leer')
  await expect(page.getByTestId('ver-que-pasa')).toHaveText('Ver qué pasaría')
  // la captura del pie: en la corrida de `pagina-publicada.yml` queda en el artefacto, y es la de WebKit en el perfil iphone
  await page.locator('.narracion-pie').screenshot({ path: test.info().outputPath('pie-ver-que-pasaria.png') })
  const [ver, siguiente] = await Promise.all([page.getByTestId('ver-que-pasa').boundingBox(), page.getByTestId('siguiente').boundingBox()])
  expect(ver!.x + ver!.width).toBeLessThanOrEqual(siguiente!.x)
  await page.getByTestId('ver-que-pasa').click()
  const frase = page.getByTestId('paso-a-paso-frase')
  await expect(frase).toHaveText('Regresamos a la posición después de 4.h4.')
  await expect(page.getByTestId('tablero-paso-a-paso')).toHaveAttribute('data-fen', /^rn1qkbnr\/pp2pppp\/2p5\/3pPb2\/3P3P\//)
  for (let i = 0; i < 9; i++) await page.getByTestId('pap-siguiente').click()
  await expect(frase).toContainText('lo pierdes')
  await expect(page.getByTestId('tablero-paso-a-paso')).toHaveAttribute('data-fen', /^rn1qkbnr\/pp3ppp\/2p1p3\/3pP2R\/3P2P1\/5P2\//)
  await page.getByTestId('pap-siguiente').click()
  await expect(page.getByTestId('paso-a-paso')).toHaveCount(0)
  await expect(leccion).toHaveAttribute('data-momento', 'leer')
  await abrir(page, 'v:avance-tal', 'practicar', 7)
  await jugar(page, info, 'h7h5')
  await expect(leccion).toHaveAttribute('data-momento', 'leer')
  await expect(page.getByTestId('ver-que-pasa')).toHaveCount(0)
})

test('El tablero de arriba de la página del curso lleva coordenadas (2026-10-30)', async ({ page }) => {
  await page.goto('./#/curso/caro-kann%3Ab')
  const tablero = page.getByTestId('pagina-curso').getByTestId('tablero-mini')
  await expect(tablero.locator('coords.files coord')).toHaveCount(8)
  await expect(tablero.locator('coords.ranks coord')).toHaveCount(8)
})
