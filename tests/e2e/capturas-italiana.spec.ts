import { expect, test, type Page } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId } from '../../src/curso/datos.ts'

/**
 * Las capturas de la revisión del curso de la Italiana (2026-11-25): el iPhone emulado en Chromium, a 390×844 (en la Air,
 * WebKit no corre). Van fuera del repo: `CARPETA_CAPTURAS=<carpeta> npx playwright test --project=escritorio --grep @capturas-italiana`.
 */
const CARPETA = process.env.CARPETA_CAPTURAS ?? 'test-results/capturas-italiana'
const C = cursoNuevo('italiana:w')!
const CURSO = '/#/curso/italiana%3Aw'
const linea = (id: string) => `${CURSO}/linea/${encodeURIComponent(id)}`
const momento = (page: Page, m: string) => expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', m, { timeout: 10_000 })

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
/** Retoma una línea en una jugada mía, como al volver a la lección a medias. */
async function retomar(page: Page, id: string, ply: number, vuelta: 'aprender' | 'practicar' = 'aprender') {
  await page.goto('/#/')
  await page.evaluate(([linea, ply, vuelta]) => localStorage.setItem('ajedrez.v1.curso:italiana:w', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta, ply, fecha: Date.now() } })), [id, ply, vuelta] as const)
  await page.goto(linea(id))
  await page.reload()
  await momento(page, 'tuTurno')
}
async function jugarDato(page: Page, id: string, ply: number) {
  const l = lineaPorId(C, id)!
  const ch = new Chess()
  for (const s of l.jugadas.slice(0, ply)) ch.move(s)
  const m = ch.move(l.jugadas[ply]!)
  for (const casilla of [m.from, m.to]) {
    const caja = (await page.getByTestId('tablero').first().boundingBox())!
    const col = casilla.charCodeAt(0) - 97
    const fila = 8 - Number(casilla[1])
    await page.mouse.click(caja.x + (col + 0.5) * (caja.width / 8), caja.y + (fila + 0.5) * (caja.height / 8))
  }
}

test.describe('capturas del curso de la Italiana', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 })

  test('la tarjeta, la página, el mapa y sus formas, las introducciones, una lección con marcas, el plan, un «¿Y si…?» y una opcional @capturas-italiana', async ({ page }) => {
    test.setTimeout(240_000)
    await page.goto('/#/cursos')
    await expect(page.getByTestId('tarjeta-italiana:w')).toBeVisible()
    await page.evaluate(() => document.fonts.ready)
    await foto(page, '01-la-tarjeta')

    await page.goto(CURSO)
    await expect(page.getByTestId('pagina-curso')).toBeVisible()
    await foto(page, '02-curso-arriba')
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
    await foto(page, '03-curso-abajo')

    await page.goto(`${CURSO}/leer/estructura`)
    await expect(page.getByTestId('pieza-estructura')).toBeVisible()
    const n = C.piezas.estructura.paginas.length
    for (let i = 1; i <= n; i++) {
      await expect(page.getByTestId('pagina-n-de-m')).toHaveText(`${i} de ${n}`)
      await fotoDePagina(page, `04-estructura-${i}`)
      await page.getByTestId('ver-paso-a-paso').click()
      const pasos = C.piezas.estructura.paginas[i - 1]!.pasoAPaso!.pasos.length
      for (let k = 2; k <= pasos; k++) await page.getByTestId('pap-siguiente').click()
      await foto(page, `04-estructura-${i}-paso-${pasos}`)
      await page.keyboard.press('Escape')
      if (i < n) await page.getByTestId('pagina-siguiente').click()
    }

    await page.goto(linea('v:dos-caballos-d3'))
    await momento(page, 'intro')
    await foto(page, '05-introduccion-aprender')
    await page.getByTestId('vuelta-practicar').click()
    await expect(page.getByTestId('narracion')).toContainText('Ahora, Practicar')
    await foto(page, '06-introduccion-practicar')

    // una lección con sus marcas: 7...a6 en la principal (lo del rival antes de tu jugada: ...b5 contra tu alfil)
    await retomar(page, 'v:principal', 14)
    await foto(page, '07-leccion-marcas-del-rival')
    // y después de 7.Te1, su cuidado con "Ver qué pasaría"
    await retomar(page, 'v:principal', 12)
    await jugarDato(page, 'v:principal', 12)
    await momento(page, 'leer')
    await foto(page, '08-explicacion-con-ver')
    await page.getByTestId('narracion').getByTestId('ver-que-pasa').first().click()
    await foto(page, '09-ver-que-pasaria')
    await page.keyboard.press('Escape')

    // el plan: el final de la lección de La base del Centro cerrado
    const d3 = lineaPorId(C, 'v:dos-caballos-d3')!
    await retomar(page, 'v:dos-caballos-d3', d3.jugadas.length - 1)
    await jugarDato(page, 'v:dos-caballos-d3', d3.jugadas.length - 1)
    await momento(page, 'leer')
    await page.getByTestId('siguiente').click()
    await momento(page, 'plan')
    await foto(page, '10-el-plan')

    await page.goto(linea('e:cc3-contra-ac5'))
    await momento(page, 'intro')
    await foto(page, '11-y-si')

    await page.goto(linea('v:hungara'))
    await momento(page, 'intro')
    await foto(page, '12-opcional')

    await page.goto(`${CURSO}/errores`)
    await expect(page.getByTestId('pieza-errores')).toBeVisible()
    await foto(page, '13-errores')
    await page.goto(`${CURSO}/leer/repaso`)
    await expect(page.getByTestId('pieza-repaso')).toBeVisible()
    await fotoDePagina(page, '14-repaso')
  })
})
