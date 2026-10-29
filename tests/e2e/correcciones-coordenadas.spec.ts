import { expect, test, type Locator } from '@playwright/test'

/**
 * Correcciones de la Caro-Kann, C1 (puntos 1 y 4 del feedback): los tableros de las páginas de leer llevan las mismas
 * coordenadas que la lección, volteadas porque el curso es con negras: de izquierda a derecha h…a, de arriba abajo 1…8.
 * Las capturas, en iterations/v3/capturas/correcciones/<perfil>/.
 */
const COLUMNAS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h']
const FILAS = ['1', '2', '3', '4', '5', '6', '7', '8']

/** Las coordenadas de un tablero, cada una con su centro en la pantalla. */
async function coordenadas(tablero: Locator) {
  const leer = (sel: string) =>
    tablero.locator(sel).evaluateAll((els) =>
      els.map((el) => {
        const r = el.getBoundingClientRect()
        const estilo = getComputedStyle(el)
        return { texto: (el.textContent ?? '').trim(), x: r.x + r.width / 2, y: r.y + r.height / 2, ancho: r.width, alto: r.height, color: estilo.color, visible: estilo.visibility !== 'hidden' && estilo.display !== 'none' && Number(estilo.opacity) > 0 }
      }),
    )
  return { columnas: await leer('coords.files coord'), filas: await leer('coords.ranks coord'), caja: (await tablero.locator('cg-board').boundingBox())! }
}

async function revisarTablero(tablero: Locator) {
  await expect(tablero).toHaveAttribute('data-orientacion', 'black')
  const { columnas, filas, caja } = await coordenadas(tablero)
  expect(columnas.map((c) => c.texto).sort()).toEqual(COLUMNAS)
  expect(filas.map((f) => f.texto).sort()).toEqual(FILAS)
  for (const c of [...columnas, ...filas]) {
    expect(c.visible, `se ve "${c.texto}"`).toBe(true)
    expect(c.ancho * c.alto, `"${c.texto}" tiene tamaño`).toBeGreaterThan(0)
    // dentro del tablero
    expect(c.x).toBeGreaterThan(caja.x)
    expect(c.x).toBeLessThan(caja.x + caja.width)
    expect(c.y).toBeGreaterThan(caja.y)
    expect(c.y).toBeLessThan(caja.y + caja.height)
  }
  // con negras: de izquierda a derecha h, g, …, a; de arriba abajo 1, 2, …, 8
  const porX = [...columnas].sort((a, b) => a.x - b.x).map((c) => c.texto)
  const porY = [...filas].sort((a, b) => a.y - b.y).map((f) => f.texto)
  expect(porX).toEqual([...COLUMNAS].reverse())
  expect(porY).toEqual(FILAS)
  // las letras van en la fila de abajo y los números en la columna de la izquierda, como en la lección
  const lado = caja.width / 8
  for (const c of columnas) expect(c.y).toBeGreaterThan(caja.y + 7 * lado)
  for (const f of filas) expect(f.x).toBeLessThan(caja.x + lado)
}

test.describe('Correcciones · C1 · coordenadas en los tableros de leer', () => {
  test('La idea y las dos páginas de La estructura traen a–h y 1–8, volteadas para negras', async ({ page }, info) => {
    const cap = (nombre: string) => page.screenshot({ path: `iterations/v3/capturas/correcciones/${info.project.name}/${nombre}.png`, fullPage: true })
    await page.goto('/#/curso/caro-kann%3Ab/leer/idea')
    await expect(page.getByTestId('pieza-idea')).toBeVisible()
    await revisarTablero(page.getByTestId('tablero-leer'))
    await cap('c1-la-idea')

    await page.goto('/#/curso/caro-kann%3Ab/leer/estructura')
    await expect(page.getByTestId('pagina-n-de-m')).toHaveText('1 de 2')
    await revisarTablero(page.getByTestId('tablero-leer'))
    await cap('c1-la-estructura-avance')
    await page.getByTestId('pagina-siguiente').click()
    await expect(page.getByTestId('pagina-n-de-m')).toHaveText('2 de 2')
    await revisarTablero(page.getByTestId('tablero-leer'))
    await cap('c1-la-estructura-clasica')
  })

  test('el tablero de la lección no cambia: sigue con sus coordenadas', async ({ page }) => {
    await page.goto('/#/curso/caro-kann%3Ab/linea/' + encodeURIComponent('v:avance-short'))
    await revisarTablero(page.getByTestId('tablero').first())
  })
})
