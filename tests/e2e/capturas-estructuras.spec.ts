import { expect, test, type Page } from '@playwright/test'

/**
 * Las capturas de la revisión del curso por estructuras: el iPhone emulado en Chromium, a 390×844 (en la Air, WebKit no
 * corre). Van fuera del repo: `CARPETA_CAPTURAS=<carpeta> npx playwright test --project=escritorio --grep @capturas-estructuras`.
 */
const CARPETA = process.env.CARPETA_CAPTURAS ?? 'test-results/capturas-estructuras'
const CURSO = '/#/curso/caro-kann-estructuras%3Ab'
const linea = (id: string) => `${CURSO}/linea/${encodeURIComponent(id)}`

/** Con el tablero ya quieto: al cambiar de página, sus piezas se animan de una posición a la otra. */
async function foto(page: Page, nombre: string) {
  await page.waitForTimeout(450)
  await page.screenshot({ path: `${CARPETA}/${nombre}.png` })
}

/** Una página que no cabe: arriba y, si se desliza, también abajo (la barra de abajo tapa lo que quede detrás de ella). */
async function fotoDePagina(page: Page, nombre: string) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await foto(page, `${nombre}-arriba`)
  if (await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)) {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await foto(page, `${nombre}-abajo`)
    await page.evaluate(() => window.scrollTo(0, 0))
  }
}

test.describe('capturas del curso por estructuras', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

  test('la tarjeta, la página, La estructura, las introducciones y una opcional @capturas-estructuras', async ({ page }) => {
    test.setTimeout(180_000)
    await page.goto('/#/cursos/negras')
    // una sola Caro-Kann desde el 2026-11-25: la tarjeta "Defensa Caro-Kann" abre este curso
    await expect(page.getByTestId('tarjeta-caro-kann:b')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await foto(page, '01-la-tarjeta')

    await page.goto(CURSO)
    await expect(page.getByTestId('pagina-curso')).toBeVisible()
    await foto(page, '02-curso-arriba')
    await page.getByTestId('paso-v:hillbilly').scrollIntoViewIfNeeded()
    await foto(page, '03-curso-en-medio')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await foto(page, '04-curso-abajo')

    await page.goto(`${CURSO}/leer/estructura`)
    await expect(page.getByTestId('pieza-estructura')).toBeVisible()
    const n = 5
    for (let i = 1; i <= n; i++) {
      await expect(page.getByTestId('pagina-n-de-m')).toHaveText(`${i} de ${n}`)
      await fotoDePagina(page, `05-estructura-${i}`)
      if (i === 1 || i === 3 || i === 5) {
        await page.getByTestId('ver-paso-a-paso').click()
        await foto(page, `05-estructura-${i}-paso-a-paso`)
        // lo que solo se ve avanzando: las marcas de la ruptura del Cambio y la flecha de la Tensión
        const hasta = i === 3 ? 5 : i === 5 ? 6 : 0
        for (let k = 2; k <= hasta; k++) await page.getByTestId('pap-siguiente').click()
        if (hasta) await foto(page, `05-estructura-${i}-paso-${hasta}`)
        await page.keyboard.press('Escape')
      }
      if (i < n) await page.getByTestId('pagina-siguiente').click()
    }

    await page.goto(linea('v:cambio'))
    await expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', 'intro')
    await foto(page, '06-introduccion-aprender')
    await page.getByTestId('vuelta-practicar').click()
    await expect(page.getByTestId('narracion')).toContainText('Ahora, Practicar')
    await foto(page, '07-introduccion-practicar')

    await page.goto(linea('v:panov'))
    await expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', 'intro')
    await foto(page, '08-opcional')

    await page.goto(`${CURSO}/leer/idea`)
    await expect(page.getByTestId('pieza-idea')).toBeVisible()
    await fotoDePagina(page, '09-la-idea')
    await page.goto(`${CURSO}/errores`)
    await expect(page.getByTestId('pieza-errores')).toBeVisible()
    await foto(page, '10-errores')
    await page.goto(`${CURSO}/leer/repaso`)
    await expect(page.getByTestId('pieza-repaso')).toBeVisible()
    await fotoDePagina(page, '11-repaso')
  })

  test('una sola Caro-Kann: la pestaña de negras, la página arriba y una lección hecha en el curso de antes @capturas-una-sola', async ({ page }) => {
    await page.goto('/#/')
    // como lo dejó el curso de antes: el Cambio terminado (y La idea leída, que no se pasa)
    await page.evaluate(() => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: { idea: 1 }, variantes: { cambio: { aprendida: 1, terminada: 2 } }, errores: {} })))
    await page.goto('/#/cursos/negras')
    await expect(page.getByTestId('tarjeta-caro-kann:b')).toContainText('1 de 8 variantes')
    await page.evaluate(() => document.fonts.ready)
    await foto(page, '01-pestana-negras')
    await page.getByTestId('tarjeta-caro-kann:b').click()
    await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Defensa Caro-Kann')
    await foto(page, '02-pagina-del-curso-arriba')
    await expect(page.getByTestId('paso-v:cambio')).toHaveAttribute('data-estado', 'hecha')
    await page.getByTestId('paso-v:cambio').evaluate((e) => e.scrollIntoView({ block: 'center' }))
    await foto(page, '03-leccion-hecha-en-el-curso-de-antes')
  })
})
