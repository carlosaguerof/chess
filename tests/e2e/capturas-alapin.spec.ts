import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { cursoNuevo, lineaPorId, misJugadas } from '../../src/curso/datos.ts'
import { jugar } from './_util.ts'

/**
 * Las capturas de la revisión del curso de la Alapin: el iPhone emulado en Chromium, a 390×844 (en la Air, WebKit no
 * corre). Van fuera del repo: `CARPETA_CAPTURAS=<carpeta> npx playwright test --project=escritorio --grep @capturas-alapin`.
 */
const CARPETA = process.env.CARPETA_CAPTURAS ?? 'test-results/capturas-alapin'
const C = cursoNuevo('siciliana:w')!
const CURSO = '/#/curso/siciliana%3Aw'
const CLAVE = 'ajedrez.v1.curso:siciliana:w'
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

/** Retoma una línea en una jugada mía, como al volver a la lección a medias. */
async function retomar(page: Page, id: string, vuelta: 'aprender' | 'practicar', ply: number) {
  await page.goto('/#/')
  await page.evaluate(([k, linea, vuelta, ply]) => localStorage.setItem(k as string, JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea, vuelta, ply, fecha: Date.now() } })), [CLAVE, id, vuelta, ply] as const)
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

test.describe('capturas del curso de la Alapin', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

  test('la tarjeta, la página, La estructura, las lecciones, el plan, un «¿Y si…?» y una opcional @capturas-alapin', async ({ page }, info: TestInfo) => {
    test.setTimeout(240_000)
    await page.goto('/#/cursos')
    await expect(page.getByTestId('tarjeta-siciliana:w')).toBeVisible()
    await page.getByTestId('tarjeta-siciliana:w').scrollIntoViewIfNeeded()
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
      await foto(page, `04-estructura-${i}-paso-a-paso`)
      const pasos = C.piezas.estructura.paginas[i - 1]!.pasoAPaso!.pasos.length
      for (let k = 2; k <= pasos; k++) await page.getByTestId('pap-siguiente').click()
      await foto(page, `04-estructura-${i}-paso-${pasos}`)
      await page.keyboard.press('Escape')
      if (i < n) await page.getByTestId('pagina-siguiente').click()
    }

    await page.goto(linea('v:cambio-central'))
    await momento(page, 'intro')
    await foto(page, '05-introduccion-aprender')
    await page.getByTestId('vuelta-practicar').click()
    await expect(page.getByTestId('narracion')).toContainText('Ahora, Practicar')
    await foto(page, '06-introduccion-practicar')

    // una jugada con marcas: 5...Cc6 ataca d4 (Aprender, en tu turno) y, después de 6.Cf3, la explicación con su "Ver"
    const cc = lineaPorId(C, 'v:cambio-central')!
    const nf3 = cc.jugadas.indexOf('Nf3')
    await retomar(page, cc.id, 'aprender', nf3)
    await foto(page, '07-marcas-del-rival-en-tu-turno')
    await jugar(page, info, uci(cc.jugadas, nf3))
    await momento(page, 'leer')
    await foto(page, '08-explicacion-con-ver')
    await page.getByTestId('ver-que-pasa').first().click()
    await foto(page, '09-ver-que-pasaria')
    await page.keyboard.press('Escape')

    // el plan: la última jugada de la cadena y "Siguiente"
    const ca = lineaPorId(C, 'v:cf6-d4')!
    const ultima = Math.max(...misJugadas(ca))
    await retomar(page, ca.id, 'aprender', ultima)
    await jugar(page, info, uci(ca.jugadas, ultima))
    await momento(page, 'leer')
    await foto(page, '10-explicacion-de-la-ultima')
    await page.getByTestId('siguiente').click()
    await momento(page, 'plan')
    await foto(page, '11-el-plan')

    await page.goto(`${CURSO}/errores`)
    await expect(page.getByTestId('pieza-errores')).toBeVisible()
    await foto(page, '12-errores')
    await page.goto(linea('e:dama-glotona'))
    await momento(page, 'intro')
    await foto(page, '13-y-si-intro')

    await page.goto(linea('v:gambito'))
    await momento(page, 'intro')
    await foto(page, '14-opcional')

    await page.goto(`${CURSO}/leer/idea`)
    await expect(page.getByTestId('pieza-idea')).toBeVisible()
    await fotoDePagina(page, '15-la-idea')
    await page.goto(`${CURSO}/leer/repaso`)
    await expect(page.getByTestId('pieza-repaso')).toBeVisible()
    await fotoDePagina(page, '16-repaso')
  })
})
