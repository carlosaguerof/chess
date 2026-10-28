import { expect, test } from '@playwright/test'
import { captura, jugar, tocar } from './_util.ts'

test.describe('T2 · tablero y reglas', () => {
  test('el mate del pastor termina en "Jaque mate"', async ({ page }, info) => {
    await page.goto('/#/libre')
    for (const j of ['e2e4', 'e7e5', 'd1h5', 'b8c6', 'f1c4', 'g8f6', 'h5f7']) await jugar(page, info, j)
    await expect(page.getByTestId('fin')).toContainText('Jaque mate')
    await expect(page.getByTestId('lista-jugadas')).toContainText('Dxf7#')
    await expect(page.getByTestId('lista-jugadas')).toContainText('Ac4')
    await expect(page.locator('cg-board square.check')).toHaveCount(1)
    await captura(page, info, 't2-mate-del-pastor')
  })

  test('una coronación muestra el selector y respeta la pieza escogida', async ({ page }, info) => {
    await page.goto('/#/libre?fen=' + encodeURIComponent('8/4P1k1/8/8/8/8/6K1/8 w - - 0 1'))
    await tocar(page, info, 'e7')
    await tocar(page, info, 'e8')
    const selector = page.getByRole('dialog', { name: 'Coronación' })
    await expect(selector).toBeVisible()
    await expect(selector.getByRole('button')).toHaveCount(5) // dama, torre, alfil, caballo y cancelar
    await captura(page, info, 't2-coronacion')
    await selector.getByRole('button', { name: 'Caballo' }).click()
    await expect(selector).toBeHidden()
    await expect(page.getByTestId('lista-jugadas')).toContainText('e8=C+')
  })

  test('una jugada ilegal no se acepta, y la casilla se marca en menos de 0.1 s', async ({ page }, info) => {
    await page.goto('/#/libre')
    await expect(page.locator('cg-board piece')).toHaveCount(32)
    const fenInicial = await page.getByTestId('tablero').getAttribute('data-fen')
    // medir: desde el toque hasta que la casilla aparece marcada
    await page.evaluate(() => {
      const w = window as unknown as { __t: { toque?: number; marca?: number } }
      w.__t = {}
      const alTocar = () => { if (w.__t.toque === undefined) w.__t.toque = performance.now() }
      document.addEventListener('touchstart', alTocar, { capture: true })
      document.addEventListener('mousedown', alTocar, { capture: true })
      const tablero = document.querySelector('cg-board')!
      new MutationObserver(() => {
        if (w.__t.marca === undefined && tablero.querySelector('square.selected')) w.__t.marca = performance.now()
      }).observe(tablero, { childList: true, subtree: true, attributes: true })
    })
    await tocar(page, info, 'e2')
    await expect(page.locator('cg-board square.selected')).toHaveCount(1)
    await expect(page.locator('cg-board square.move-dest')).toHaveCount(2) // e3 y e4
    const t = await page.evaluate(() => (window as unknown as { __t: { toque: number; marca: number } }).__t)
    const ms = t.marca - t.toque
    console.log(`[${info.project.name}] casilla marcada en ${ms.toFixed(1)} ms`)
    expect(ms).toBeLessThan(100)
    await captura(page, info, 't2-casillas-marcadas')
    // e2 → e5 es ilegal
    await tocar(page, info, 'e5')
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', fenInicial!)
    await expect(page.getByTestId('lista-jugadas')).toContainText('Aún no hay jugadas')
    // una legal sí entra
    await jugar(page, info, 'e2e4')
    await expect(page.getByTestId('lista-jugadas')).toContainText('e4')
  })

  test('voltear el tablero', async ({ page }) => {
    await page.goto('/#/libre')
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-orientacion', 'white')
    await page.getByRole('button', { name: 'Voltear' }).click()
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-orientacion', 'black')
  })
})
