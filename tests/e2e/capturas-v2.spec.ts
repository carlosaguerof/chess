import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { BASE } from '../../src/base/base.ts'
import { repertorioInicial } from '../../src/repertorio/modelo.ts'
import { cursosDe } from '../../src/cursos/modelo.ts'
import { jugar } from './_util.ts'

/**
 * Corrida de limpieza visual (iterations/v2): una captura de cada pantalla, en los dos perfiles.
 * Se corre aparte, sin la suite: `CAPTURAS=antes npx playwright test --grep @capturas` (o `despues`).
 * Usa datos de ejemplo para que Refuerza, el Repaso y Mis partidas no salgan vacíos.
 */
const ETAPA = process.env.CAPTURAS ?? 'despues'
const HOY = new Date('2026-11-02T10:00:00')

async function foto(page: Page, info: TestInfo, nombre: string) {
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(300)
  await page.screenshot({ path: `iterations/v2/capturas/${ETAPA}/${info.project.name}/${nombre}.png`, fullPage: false })
}

function datosDeEjemplo() {
  const curso = cursosDe(BASE, repertorioInicial(BASE)).find((c) => c.id === 'caro-kann:b')!
  const [a, b] = [curso.lecciones[0]!, curso.lecciones[1]!]
  const ayer = HOY.getTime() - 86_400_000
  const c = new Chess()
  c.move('e4')
  const fen = c.fen().split(' ').slice(0, 4).join(' ')
  return {
    progreso: { [a.id]: { fecha: ayer }, [b.id]: { fecha: ayer } },
    registro: [
      { fen, esperada: 'c6', resultado: 'fallo', lugar: 'curso', fecha: ayer, linea: a.nombre, camino: ['e4'] },
      { fen, esperada: 'c6', resultado: 'acierto', lugar: 'curso', fecha: ayer + 1000, linea: a.nombre, camino: ['e4'] },
    ],
    // Nota 1: dos favoritas, para que "Mis favoritas" no salga vacía en las capturas de después
    favoritas: ['caro-kann:b', 'italiana:w'],
    historial: [
      { id: 'p2', botId: 'brisa', colorHumano: 'b', resultado: 'perdi', fin: 'abandono', jugadas: 7, fecha: ayer, resumen: { caso: 'desvio', linea: 'Variante del Avance', jugue: '3...e6', tuLinea: '3...Af5', ply: 5 } },
      { id: 'p1', botId: 'brisa', colorHumano: 'w', resultado: 'gane', fin: 'jaque mate', jugadas: 7, fecha: ayer - 3_600_000 },
    ],
  }
}

test('capturas de todas las pantallas @capturas', async ({ page }, info) => {
  test.setTimeout(240_000)
  await page.clock.setFixedTime(HOY)
  const datos = datosDeEjemplo()
  await page.goto('/')
  await page.evaluate(({ d, antes }) => {
    localStorage.setItem('ajedrez.v1.progreso', JSON.stringify(d.progreso))
    localStorage.setItem('ajedrez.v1.registro', JSON.stringify(d.registro))
    localStorage.setItem('ajedrez.v1.historial', JSON.stringify(d.historial))
    if (!antes) localStorage.setItem('ajedrez.v1.favoritas', JSON.stringify(d.favoritas))
  }, { d: datos, antes: ETAPA === 'antes' })

  // las de "antes" (código de 525a3d3) usaron las rutas de entonces; desde la Nota 1, Repertorio y Aperturas son
  // "Aperturas y defensas": 07 = Mis favoritas, 08 = la página de una apertura, 12 = Todas, 13 = una variante,
  // 14 = Mis favoritas vacía y 15 = Tus datos (exportar e importar, en Más)
  const pantallas: [string, string][] =
    ETAPA === 'antes'
      ? [
          ['01-inicio', '/'],
          ['02-jugar', '/bots'],
          ['03-jugar-bot', '/bot/brisa'],
          ['07-aprender', '/cursos'],
          ['08-curso', '/curso/' + encodeURIComponent('caro-kann:b')],
          ['10-refuerza', '/refuerza'],
          ['11-repaso', '/repaso'],
          ['12-aperturas', '/aperturas'],
          ['13-apertura', '/apertura/caro-kann'],
          ['14-repertorio-blancas', '/repertorio'],
          ['15-repertorio-negras', '/repertorio/negras'],
          ['16-historial', '/historial'],
          ['18-ajustes', '/ajustes'],
          ['19-licencias', '/licencias'],
        ]
      : [
          ['01-inicio', '/'],
          ['02-jugar', '/bots'],
          ['03-jugar-bot', '/bot/octavio'],
          ['07-aprender', '/cursos'],
          ['08-curso', '/curso/' + encodeURIComponent('caro-kann:b')],
          ['10-refuerza', '/refuerza'],
          ['11-repaso', '/repaso'],
          ['12-aperturas', '/cursos/todas'],
          ['13-apertura', '/curso/' + encodeURIComponent('caro-kann:b') + '/0'],
          ['15-tus-datos', '/datos'],
          ['16-historial', '/historial'],
          ['18-ajustes', '/ajustes'],
          ['19-licencias', '/licencias'],
        ]
  for (const [nombre, ruta] of pantallas) {
    await page.goto('/#' + ruta)
    await page.reload()
    await expect(page.locator('main').first()).toBeVisible()
    await foto(page, info, nombre)
  }

  // Mis favoritas vacía (después)
  if (ETAPA !== 'antes') {
    await page.evaluate(() => localStorage.setItem('ajedrez.v1.favoritas', '[]'))
    await page.goto('/#/cursos')
    await page.reload()
    await expect(page.getByTestId('favoritas-vacia')).toBeVisible()
    await foto(page, info, '14-favoritas-vacia')
    await page.evaluate((f) => localStorage.setItem('ajedrez.v1.favoritas', JSON.stringify(f)), datos.favoritas)
  }

  // el menú Más
  await page.goto('/#/')
  await page.getByRole('button', { name: 'Más' }).click()
  await expect(page.getByRole('menu')).toBeVisible()
  await foto(page, info, '17-mas')

  // una lección (Caro-Kann, la primera línea)
  await page.goto('/#/leccion/' + encodeURIComponent('caro-kann:b') + '/0')
  await expect(page.getByTestId('instruccion')).toBeVisible()
  await foto(page, info, '09-leccion')

  // la partida sin guía, con un par de jugadas
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=e2e4,e7e5,g1f3,b8c6')
  await expect(page.getByTestId('tablero')).toBeVisible()
  await foto(page, info, '04-partida')

  // la partida con la guía prendida: la guía nombra la apertura
  await page.goto('/#/prueba-partida?bot=brisa&color=b&guia=1&mislineas=0&jugadas=e2e4')
  await jugar(page, info, 'c7c6')
  await expect(page.getByTestId('mensaje-guia')).toContainText('Caro-Kann')
  await foto(page, info, '05-partida-guia')

  // y el resumen al final
  await page.getByTestId('rendirse').click()
  await page.getByRole('dialog', { name: '¿Rendirte?' }).getByRole('button', { name: 'Rendirme' }).click()
  await expect(page.getByTestId('aviso-final')).toBeVisible()
  await foto(page, info, '06-partida-resumen')
})
