import { expect, test, type Page } from '@playwright/test'
import { cursoNuevo, lineaPorId } from '../../src/curso/datos.ts'

/**
 * Las capturas de la revisión de los cursos del Avance: el iPhone emulado en Chromium, a 390×844 (en la Air, WebKit no
 * corre). Van fuera del repo: `CARPETA_CAPTURAS=<carpeta> npx playwright test --project=escritorio --grep @capturas-avance`.
 */
const CARPETA = process.env.CARPETA_CAPTURAS ?? 'test-results/capturas-avance'
const url = (id: string) => `/#/curso/${encodeURIComponent(id)}`
const linea = (curso: string, id: string) => `${url(curso)}/linea/${encodeURIComponent(id)}`
const leccion = (page: Page) => page.getByTestId('leccion-curso')
const momento = (page: Page, m: string) => expect(leccion(page)).toHaveAttribute('data-momento', m, { timeout: 15_000 })

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

/** Abre una lección a medias, en la jugada `ply` de su vuelta, como al volver a ella. */
async function retomar(page: Page, curso: string, id: string, vuelta: 'aprender' | 'practicar', ply: number) {
  await page.goto('/#/')
  await page.evaluate(([clave, l, v, p]) => localStorage.setItem(clave as string, JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea: l, vuelta: v, ply: p, fecha: Date.now() } })), [`ajedrez.v1.curso:${curso}`, id, vuelta, ply] as const)
  await page.goto(linea(curso, id))
}

const CURSOS = [
  { id: 'caro-kann:w', corto: 'ck', marcas: { leccion: 'v:c5', ply: 11 }, error: 'e:ad3-g4', opcional: null },
  { id: 'francesa:w', corto: 'fr', marcas: { leccion: 'v:cambio-d4', ply: 12 }, error: 'e:ae3', opcional: 'v:lputian' },
]

test.describe('capturas de los cursos del Avance', () => {
  test.use({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true })

  for (const c of CURSOS)
    test(`${c.id}: la tarjeta, la página, el mapa y sus formas, las dos introducciones, las marcas, el plan, un «¿Y si…?» y una opcional @capturas-avance`, async ({ page }) => {
      test.setTimeout(240_000)
      const curso = cursoNuevo(c.id)!
      const n = (k: string) => `${c.corto}-${k}`
      await page.goto('/#/cursos/blancas')
      await expect(page.getByTestId(`tarjeta-${c.id}`)).toBeVisible()
      await page.getByTestId(`tarjeta-${c.id}`).scrollIntoViewIfNeeded()
      await page.evaluate(() => document.fonts.ready)
      await foto(page, n('01-la-tarjeta'))

      await page.goto(url(c.id))
      await expect(page.getByTestId('pagina-curso')).toBeVisible()
      await foto(page, n('02-curso-arriba'))
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      await foto(page, n('03-curso-abajo'))

      await page.goto(`${url(c.id)}/leer/estructura`)
      const paginas = curso.piezas.estructura.paginas.length
      for (let i = 1; i <= paginas; i++) {
        await expect(page.getByTestId('pagina-n-de-m')).toHaveText(`${i} de ${paginas}`)
        await fotoDePagina(page, n(`04-estructura-${i}`))
        await page.getByTestId('ver-paso-a-paso').click()
        await foto(page, n(`04-estructura-${i}-paso-a-paso`))
        await page.keyboard.press('Escape')
        if (i < paginas) await page.getByTestId('pagina-siguiente').click()
      }

      // la introducción en Aprender y en Practicar
      const primera = curso.secciones![0]!.variantes[0]!
      await page.goto(linea(c.id, `v:${primera}`))
      await momento(page, 'intro')
      await foto(page, n('05-intro-aprender'))
      await page.getByTestId('vuelta-practicar').click()
      await momento(page, 'intro')
      await foto(page, n('06-intro-practicar'))

      // una jugada con marcas (la frase del rival, en "Te toca")
      await retomar(page, c.id, c.marcas.leccion, 'aprender', c.marcas.ply)
      await momento(page, 'tuTurno')
      await foto(page, n('07-marcas-te-toca'))

      // el plan, al final de Aprender
      const l = lineaPorId(curso, c.marcas.leccion)!
      await retomar(page, c.id, c.marcas.leccion, 'aprender', l.jugadas.length)
      await momento(page, 'plan')
      await foto(page, n('08-plan'))

      // un «¿Y si…?»
      await page.goto(`${url(c.id)}/errores`)
      await expect(page.getByTestId('pieza-errores')).toBeVisible()
      await foto(page, n('09-errores-y-trampas'))
      await page.goto(linea(c.id, c.error))
      await momento(page, 'intro')
      await foto(page, n('10-y-si-intro'))

      // una opcional
      if (c.opcional) {
        await page.goto(linea(c.id, c.opcional))
        await momento(page, 'intro')
        await foto(page, n('11-opcional-intro'))
      }
    })
})
