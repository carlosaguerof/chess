import { expect, type Locator, type Page, type TestInfo } from '@playwright/test'

/** Guarda una captura en iterations/v2/capturas/pruebas/<perfil>/<nombre>.png (las de la v1 se quedan como estaban) */
export async function captura(page: Page, info: TestInfo, nombre: string) {
  await page.screenshot({ path: `iterations/v2/capturas/pruebas/${info.project.name}/${nombre}.png`, fullPage: false })
}

export const esCelular = (info: TestInfo) => info.project.name === 'iphone'

/**
 * La caja del tablero. Recién abierta la página, `boundingBox` puede dar vacío un instante aunque el tablero ya esté (dos
 * pruebas cayeron así en GitHub, 2026-10-30): se mide otra vez, hasta un segundo.
 */
async function cajaDelTablero(page: Page, tablero: Locator) {
  for (let i = 0; i < 20; i++) {
    const caja = await tablero.locator('cg-board').boundingBox()
    if (caja) return caja
    await page.waitForTimeout(50)
  }
  throw new Error('no se ve el tablero')
}

/** El centro de una casilla ("e2") en la pantalla, según hacia dónde mira el tablero. */
export async function centroCasilla(page: Page, casilla: string, tablero = page.getByTestId('tablero').first()) {
  const orientacion = await tablero.getAttribute('data-orientacion')
  const caja = await cajaDelTablero(page, tablero)
  const columna = casilla.charCodeAt(0) - 97
  const fila = Number(casilla[1]) - 1
  const lado = caja.width / 8
  const x = orientacion === 'black' ? 7 - columna : columna
  const y = orientacion === 'black' ? fila : 7 - fila
  return { x: caja.x + (x + 0.5) * lado, y: caja.y + (y + 0.5) * lado }
}

/** Toca una casilla: con el dedo en el perfil de iPhone, con el ratón en el de escritorio. */
export async function tocar(page: Page, info: TestInfo, casilla: string) {
  const { x, y } = await centroCasilla(page, casilla)
  if (esCelular(info)) await page.touchscreen.tap(x, y)
  else await page.mouse.click(x, y)
}

/** Juega "e2e4" tocando origen y destino. */
export async function jugar(page: Page, info: TestInfo, uci: string) {
  const antes = await page.getByTestId('tablero').first().getAttribute('data-fen')
  await tocar(page, info, uci.slice(0, 2))
  await tocar(page, info, uci.slice(2, 4))
  if (uci.length === 4) await expect(page.getByTestId('tablero').first()).not.toHaveAttribute('data-fen', antes ?? '')
}
