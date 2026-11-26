import { expect, test } from '@playwright/test'
import { abrirInicioCon, ESTADOS } from './_seguir.ts'

/**
 * Las capturas de Inicio antes y después de "Seguir" (vuelta 5; `specs/aprender.md`, "Seguir"), con lo guardado vacío,
 * la Caro-Kann a medias, un curso terminado y todo terminado; al ancho del iPhone (390×844) y de la computadora (1440×900).
 * Se corre aparte, en Chromium: `CAPTURAS=antes|despues npx playwright test tests/e2e/capturas-seguir.spec.ts --grep @capturas --project=escritorio`.
 * Van a `iterations/v5/capturas/<antes|despues>/`.
 */
const ETAPA = process.env.CAPTURAS === 'antes' ? 'antes' : 'despues'
const TAMANOS = [
  { nombre: 'iphone', width: 390, height: 844 },
  { nombre: 'escritorio', width: 1440, height: 900 },
]

test('capturas de Inicio con "Seguir" @capturas', async ({ page }) => {
  test.setTimeout(120_000)
  for (const t of TAMANOS) {
    await page.setViewportSize({ width: t.width, height: t.height })
    for (const [estado, guardado] of Object.entries(ESTADOS)) {
      await abrirInicioCon(page, guardado)
      await expect(page.getByTestId('jugar-recomendado')).toBeVisible()
      await page.evaluate(() => document.fonts.ready)
      await page.waitForTimeout(300)
      await page.screenshot({ path: `iterations/v5/capturas/${ETAPA}/${t.nombre}/inicio-${estado}.png`, fullPage: false })
    }
  }
})
