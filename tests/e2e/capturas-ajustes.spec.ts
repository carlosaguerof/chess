import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'

/**
 * Ajustes de la app (2026-10-28): captura de antes y después de Aprender, Refuerza, Ajustes, el menú Más y la guía
 * para instalar, en los dos perfiles. Se corre aparte, sin la suite: `CAPTURAS=antes npx playwright test --grep @ajustes`
 * (o `despues`). Van a iterations/v2/capturas/ajustes/<etapa>/<perfil>/.
 */
const ETAPA = process.env.CAPTURAS ?? 'despues'
const HOY = new Date('2026-11-02T10:00:00')

async function foto(page: Page, info: TestInfo, nombre: string) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: `iterations/v2/capturas/ajustes/${ETAPA}/${info.project.name}/${nombre}.png`, fullPage: false })
}

/** Una entrada del registro: la jugada `esperada` después de `camino`, con su resultado. */
function entrada(camino: string[], esperada: string, resultado: string, fecha: number) {
  const c = new Chess()
  for (const s of camino) c.move(s)
  return { fen: c.fen().split(' ').slice(0, 4).join(' '), esperada, resultado, lugar: 'curso', fecha, linea: 'ejemplo', camino }
}

/** Datos de ejemplo: unas jugadas falladas (de la que más a la que menos) y otras siempre bien. */
function registroDeEjemplo() {
  const ayer = HOY.getTime() - 86_400_000
  const r = []
  // 1...c6 (Caro-Kann): 3 fallos de 4
  for (const res of ['fallo', 'fallo', 'fallo', 'acierto']) r.push(entrada(['e4'], 'c6', res, ayer))
  // 3.e5 (Avance contra la Caro-Kann): 1 fallo de 2
  for (const res of ['fallo', 'acierto']) r.push(entrada(['e4', 'c6', 'd4', 'd5'], 'e5', res, ayer))
  // 2.c3 (Alapin): 2 fallos de 2
  for (const res of ['fallo', 'pista']) r.push(entrada(['e4', 'c5'], 'c3', res, ayer))
  // 1.e4 y 2.Cf3 (Italiana): siempre bien
  for (let i = 0; i < 3; i++) r.push(entrada([], 'e4', 'acierto', ayer))
  r.push(entrada(['e4', 'e5'], 'Nf3', 'acierto', ayer))
  return r
}

test('capturas de los ajustes de la app @capturas @ajustes', async ({ page }, info) => {
  test.setTimeout(120_000)
  await page.clock.setFixedTime(HOY)
  await page.goto('/')
  await page.evaluate((registro) => {
    localStorage.clear()
    localStorage.setItem('ajedrez.v1.registro', JSON.stringify(registro))
  }, registroDeEjemplo())

  const pantallas: [string, string][] = [
    ['01-aprender', '/cursos'],
    ['02-aprender-segunda-pestana', ETAPA === 'antes' ? '/cursos/todas' : '/cursos/negras'],
    ['03-refuerza', '/refuerza'],
    ['05-ajustes', '/ajustes'],
  ]
  if (ETAPA === 'antes') pantallas.push(['07-tus-datos', '/datos'])
  else pantallas.push(['08-instalar', '/instalar'])
  for (const [nombre, ruta] of pantallas) {
    await page.goto('/#' + ruta)
    await page.reload()
    await expect(page.locator('main').first()).toBeVisible()
    await foto(page, info, nombre)
  }

  // el menú Más
  await page.goto('/#/')
  await page.getByRole('button', { name: 'Más' }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  await foto(page, info, '06-mas')

  // Refuerza sin jugadas falladas (y el inicio, con su tarjeta)
  await page.evaluate(() => localStorage.setItem('ajedrez.v1.registro', '[]'))
  await page.goto('/#/refuerza')
  await page.reload()
  await foto(page, info, '04-refuerza-sin-falladas')
  await page.goto('/#/')
  await page.reload()
  await foto(page, info, '00-inicio-sin-falladas')

  if (ETAPA !== 'antes') {
    // Nota 1: el ⓘ de Refuerza en el inicio, su globito y la ventana de pasos
    await page.getByTestId('info-refuerza').click()
    await expect(page.getByTestId('globo')).toBeVisible()
    await foto(page, info, '10-como-funciona-globito')
    await page.getByTestId('ver-como-funciona-refuerza').click()
    await page.getByTestId('paso-siguiente').click()
    await foto(page, info, '11-como-funciona-ventana')
    for (let i = 0; i < 3; i++) await page.getByTestId('paso-siguiente').click()
    await foto(page, info, '12-como-funciona-ultimo')
    await page.getByTestId('paso-siguiente').click()
    // Respaldo: la sección completa, e Importar pregunta antes de reemplazar
    await page.goto('/#/ajustes')
    await page.getByTestId('respaldo').scrollIntoViewIfNeeded()
    await foto(page, info, '05b-ajustes-respaldo')
    await page.getByTestId('importar').setInputFiles({ name: 'respaldo.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify({ app: 'chess-mis-aperturas', version: 2, favoritas: [], progreso: { a: { fecha: 1 } }, registro: [], repaso: {}, historial: [{ id: 'p1' }], ajustes: {} })) })
    await expect(page.getByRole('dialog')).toBeVisible()
    await foto(page, info, '13-importar-confirmar')
    await page.getByRole('dialog').getByRole('button', { name: 'Cancelar' }).click()
  }

  // la guía para instalar, con la página abierta como app
  if (ETAPA !== 'antes') {
    await page.addInitScript(() => {
      const original = window.matchMedia.bind(window)
      window.matchMedia = (q: string) => (q.includes('display-mode: standalone') ? ({ ...original(q), matches: true, media: q } as MediaQueryList) : original(q))
    })
    await page.goto('/#/instalar')
    await page.reload()
    await expect(page.getByTestId('ya-instalada')).toBeVisible()
    await foto(page, info, '09-instalar-ya-instalada')
  }
})
