import { expect, test, type Page } from '@playwright/test'

/**
 * Las capturas de La estructura de la Caro-Kann (vuelta 5, 2026-11-28): cada una de sus cinco páginas y cada paso de su
 * "Ver paso a paso", al ancho del iPhone (390×844, emulado en Chromium: en la Air, WebKit no corre). Antes y después del
 * cambio que pidió Carlos ("solo la idea general [...] y el paso a paso verlo con el botón").
 * `CAPTURAS=antes|despues npx playwright test --project=escritorio --grep @capturas-estructura-ck`; van a
 * `iterations/v5/capturas/estructura-caro-kann/<antes|despues>/`.
 */
const ETAPA = process.env.CAPTURAS === 'antes' ? 'antes' : 'despues'
const CARPETA = `iterations/v5/capturas/estructura-caro-kann/${ETAPA}`
const CURSO = '/#/curso/caro-kann-estructuras%3Ab'

/** Con el tablero ya quieto: al cambiar de paso, las piezas se animan de una posición a la otra. */
async function quieto(page: Page) {
  await page.waitForTimeout(450)
}

test.describe('capturas de La estructura de la Caro-Kann', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

  test('las cinco páginas y cada paso de su paso a paso @capturas-estructura-ck', async ({ page }) => {
    test.setTimeout(300_000)
    await page.goto(`${CURSO}/leer/estructura`)
    await expect(page.getByTestId('pieza-estructura')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    for (let i = 1; i <= 5; i++) {
      await expect(page.getByTestId('pagina-n-de-m')).toHaveText(`${i} de 5`)
      await page.evaluate(() => window.scrollTo(0, 0))
      await quieto(page)
      await page.screenshot({ path: `${CARPETA}/${i}-pagina.png`, fullPage: true })
      await page.getByTestId('ver-paso-a-paso').click()
      const ventana = page.getByTestId('paso-a-paso')
      const total = Number((await ventana.locator('.como-funciona-cuenta').textContent())!.split(' de ')[1])
      for (let k = 1; k <= total; k++) {
        await expect(ventana).toHaveAttribute('data-paso', String(k))
        await quieto(page)
        await ventana.screenshot({ path: `${CARPETA}/${i}-paso-${String(k).padStart(2, '0')}.png` })
        await page.getByTestId('pap-siguiente').click()
      }
      await expect(ventana).toHaveCount(0)
      if (i < 5) await page.getByTestId('pagina-siguiente').click()
    }
  })
})
