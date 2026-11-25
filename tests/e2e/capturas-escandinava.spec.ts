import { expect, test, type Page } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId } from '../../src/curso/datos.ts'
import { jugar } from './_util.ts'

/**
 * Las capturas de la revisión del curso de la captura contra la Escandinava: el iPhone emulado en Chromium, a 390×844
 * (en la Air, WebKit no corre). Van fuera del repo:
 * `CARPETA_CAPTURAS=<carpeta> npx playwright test --project=escritorio --grep @capturas-escandinava`.
 */
const CARPETA = process.env.CARPETA_CAPTURAS ?? 'test-results/capturas-escandinava'
const C = cursoNuevo('escandinava:w')!
const CURSO = '/#/curso/escandinava%3Aw'
const linea = (id: string) => `${CURSO}/linea/${encodeURIComponent(id)}`
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 10_000 })

async function foto(page: Page, nombre: string) {
  await page.waitForTimeout(450)
  await page.screenshot({ path: `${CARPETA}/${nombre}.png` })
}

async function fotoDePagina(page: Page, nombre: string) {
  await page.evaluate(() => window.scrollTo(0, 0))
  await foto(page, `${nombre}-arriba`)
  if (await page.evaluate(() => document.documentElement.scrollHeight > innerHeight)) {
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await foto(page, `${nombre}-abajo`)
    await page.evaluate(() => window.scrollTo(0, 0))
  }
}

/** Retoma una línea en la jugada `ply` (en la vuelta que digas), como al volver a la lección a medias. */
async function retomar(page: Page, id: string, ply: number, vuelta: 'aprender' | 'practicar') {
  await page.evaluate(
    ([linea, vuelta, ply]) => localStorage.setItem('ajedrez.v1.curso:escandinava:w', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta, ply, fecha: Date.now() } })),
    [id, vuelta, ply] as const,
  )
  await page.goto(linea(id))
  await page.reload()
  await momento(page, 'tuTurno')
}

const uci = (jugadas: string[], ply: number) => {
  const ch = new Chess()
  for (const s of jugadas.slice(0, ply)) ch.move(s)
  const m = ch.move(jugadas[ply]!)
  return m.from + m.to
}

test.describe('capturas del curso de la Escandinava', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

  test('la tarjeta, la página, La estructura, las introducciones, una lección con marcas, el plan, un «¿Y si…?» y una opcional @capturas-escandinava', async ({ page }, info) => {
    test.setTimeout(240_000)
    await page.goto('/#/cursos/blancas')
    await expect(page.getByTestId('tarjeta-escandinava:w')).toBeVisible()
    await page.getByTestId('tarjeta-escandinava:w').scrollIntoViewIfNeeded()
    await page.evaluate(() => document.fonts.ready)
    await foto(page, '01-tarjeta')

    await page.goto(CURSO)
    await expect(page.getByTestId('pagina-curso')).toBeVisible()
    await foto(page, '02-curso-arriba')
    await page.getByTestId('paso-v:lasker').scrollIntoViewIfNeeded()
    await foto(page, '03-curso-en-medio')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await foto(page, '04-curso-abajo')

    await page.goto(`${CURSO}/leer/estructura`)
    await expect(page.getByTestId('pieza-estructura')).toBeVisible()
    const n = C.piezas.estructura.paginas.length
    for (let i = 1; i <= n; i++) {
      await expect(page.getByTestId('pagina-n-de-m')).toHaveText(`${i} de ${n}`)
      await fotoDePagina(page, `05-estructura-${i}`)
      await page.getByTestId('ver-paso-a-paso').click()
      await foto(page, `05-estructura-${i}-paso-1`)
      for (let k = 2; k <= 3; k++) await page.getByTestId('pap-siguiente').click()
      await foto(page, `05-estructura-${i}-paso-3`)
      await page.keyboard.press('Escape')
      if (i < n) await page.getByTestId('pagina-siguiente').click()
    }

    await page.goto(linea('v:valenciana'))
    await momento(page, 'intro')
    await foto(page, '06-introduccion-aprender')
    await page.getByTestId('vuelta-practicar').click()
    await expect(page.getByTestId('narracion')).toContainText('Ahora, Practicar')
    await foto(page, '07-introduccion-practicar')

    // una lección con sus marcas: la frase del rival (3...Da5, A4 a5→c3) y, en Practicar, la de 8.Cd5 (A2 d2→a5)
    const clasica = lineaPorId(C, 'v:clasica')!
    await retomar(page, clasica.id, 6, 'aprender')
    await foto(page, '08-marcas-del-rival')
    const ultima = clasica.jugadas.length - 1
    await retomar(page, clasica.id, ultima, 'practicar')
    await jugar(page, info, uci(clasica.jugadas, ultima))
    await momento(page, 'leer')
    await foto(page, '09-marcas-despues-de-jugar')
    // "Ver qué pasaría" de la Clásica, en Aprender
    await retomar(page, clasica.id, ultima, 'aprender')
    await jugar(page, info, uci(clasica.jugadas, ultima))
    await momento(page, 'leer')
    await foto(page, '10-explicacion-con-ver')
    const ver = page.getByTestId('ver-que-pasa').first()
    if (await ver.count()) {
      await ver.click()
      await page.getByTestId('pap-siguiente').click()
      await page.getByTestId('pap-siguiente').click()
      await foto(page, '11-ver-que-pasaria')
      await page.keyboard.press('Escape')
    }
    // el plan, al final de Aprender
    await page.getByTestId('siguiente').click()
    await momento(page, 'plan')
    await foto(page, '12-plan')

    await page.goto(`${CURSO}/errores`)
    await expect(page.getByTestId('pieza-errores')).toBeVisible()
    await foto(page, '13-errores')
    await page.goto(linea('e:dama-c6'))
    await momento(page, 'intro')
    await foto(page, '14-y-si')

    await page.goto(linea('v:bronstein'))
    await momento(page, 'intro')
    await foto(page, '15-opcional')

    await page.goto(`${CURSO}/leer/idea`)
    await expect(page.getByTestId('pieza-idea')).toBeVisible()
    await fotoDePagina(page, '16-la-idea')
    await page.goto(`${CURSO}/leer/repaso`)
    await expect(page.getByTestId('pieza-repaso')).toBeVisible()
    await fotoDePagina(page, '17-repaso')
  })
})
