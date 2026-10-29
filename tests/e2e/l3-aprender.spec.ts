import { expect, test } from '@playwright/test'
import { Chess } from 'chess.js'
import { misAperturas, repertorioDeFavoritas } from '../../src/aprender/favoritas.ts'
import { FAVORITAS_PRENDIDAS, TUS_DATOS_PRENDIDA } from '../../src/aprender/interruptores.ts'
import { siguientesEnRepertorio } from '../../src/repertorio/modelo.ts'
import { captura, jugar } from './_util.ts'

const ck = 'caro-kann:b'

test.describe('Nota 1 · "Aperturas y defensas"', () => {
  test('Mis favoritas vacía la primera vez; el ♡ de la Caro-Kann la guarda al instante, se conserva al recargar y se quita', async ({ page }, info) => {
    test.skip(!FAVORITAS_PRENDIDAS, 'las favoritas están apagadas (aprender/interruptores.ts): para cuando haya varios usuarios')
    await page.goto('/#/cursos')
    await expect(page.getByRole('heading', { name: 'Aperturas y defensas' })).toBeVisible()
    await expect(page.getByTestId('pestana-favoritas')).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByTestId('favoritas-vacia')).toContainText('Toca el ♡ en Todas para guardar las que quieres aprender')
    await captura(page, info, 'l3-favoritas-vacia')
    // la barra de abajo: Inicio, Jugar, Aprender y Más (sin Repertorio)
    await expect(page.getByRole('navigation', { name: 'Secciones' })).not.toContainText('Repertorio')
    // a Todas, con el botón
    await page.getByTestId('ir-a-todas').click()
    await expect(page.getByTestId('pestana-todas')).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByRole('region', { name: 'Para jugar con blancas' })).toBeVisible()
    await expect(page.getByRole('region', { name: 'Para jugar con negras' })).toBeVisible()
    const corazon = page.getByTestId(`corazon-${ck}`)
    await expect(corazon).toHaveAttribute('aria-pressed', 'false')
    await corazon.click()
    await expect(corazon).toHaveAttribute('aria-pressed', 'true')
    await captura(page, info, 'l3-todas')
    // en Mis favoritas
    await page.getByTestId('pestana-favoritas').click()
    await expect(page.getByTestId(`tarjeta-${ck}`)).toBeVisible()
    await expect(page.locator('.tarjeta-apertura')).toHaveCount(1)
    await captura(page, info, 'l3-favoritas')
    // recargar la conserva
    await page.reload()
    await expect(page.getByTestId(`tarjeta-${ck}`)).toBeVisible()
    // tocarlo otra vez la quita
    await page.getByTestId(`corazon-${ck}`).click()
    await expect(page.getByTestId('favoritas-vacia')).toBeVisible()
  })

  test('Con negras → Caro-Kann → Variante del Avance: avanzar y regresar en el tablero, y Practicar abre la lección', async ({ page }, info) => {
    await page.goto(FAVORITAS_PRENDIDAS ? '/#/cursos/todas' : '/#/cursos/negras')
    await page.getByTestId(`tarjeta-${ck}`).locator('a').click()
    // la página de la apertura: tablero arriba, avance, variantes de la más común a la más rara (el corazón, solo con favoritas)
    await expect(page.getByRole('heading', { name: 'Defensa Caro-Kann' })).toBeVisible()
    await expect(page.getByTestId('avance')).toContainText('0 de 22 variantes aprendidas')
    await expect(page.getByTestId('tablero-mini')).toHaveAttribute('data-orientacion', 'black')
    await expect(page.getByTestId(`corazon-${ck}`)).toHaveCount(FAVORITAS_PRENDIDAS ? 1 : 0)
    // L5: la idea general de la apertura, de mi lado y corta
    await expect(page.getByTestId('idea')).toContainText('1...c6')
    const filas = page.getByTestId('variante')
    await expect(filas).toHaveCount(22)
    await expect(filas.first()).toContainText('Variante del Avance')
    // el inglés y el ECO, solo en "Detalles"
    const texto = await page.locator('main').innerText()
    expect(texto.replace(/Detalles[\s\S]*$/, '')).not.toMatch(/Defense|Variation|\bB1\d\b/)
    await captura(page, info, 'l3-apertura')
    // la variante: su línea en el tablero, en un renglón
    await filas.first().click()
    await expect(page.getByRole('heading', { name: /Variante del Avance/ })).toBeVisible()
    const tablero = page.getByTestId('tablero')
    const linea = page.getByTestId('linea')
    await expect(linea).toContainText('1.e4 c6 2.d4 d5 3.e5 Af5')
    const final = await tablero.getAttribute('data-fen')
    await page.getByTestId('regresar').click()
    await expect(tablero).not.toHaveAttribute('data-fen', final!)
    await page.getByTestId('al-inicio').click()
    await expect(tablero).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/8\/8\/PPPPPPPP\/RNBQKBNR w/)
    await page.getByTestId('avanzar').click()
    await expect(tablero).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/4P3\//)
    await expect(linea.locator('.actual')).toHaveText('1.e4')
    await page.getByTestId('al-final').click()
    await expect(tablero).toHaveAttribute('data-fen', final!)
    // el dibujo también está al final: el peón de c6 ya no está en c7 (lo dibuja chessground, no React)
    await expect(tablero.locator('piece.black.pawn')).toHaveCount(8)
    await page.waitForTimeout(400)
    await captura(page, info, 'l3-variante')
    // Practicar abre la lección
    await page.getByTestId('practicar').click()
    await expect(page).toHaveURL(/#\/leccion\/caro-kann%3Ab\/0/)
    await expect(page.getByTestId('instruccion')).toBeVisible()
  })

  test('una partida con "Que juegue mis líneas" llega a una variante de mis aperturas', async ({ page }, info) => {
    // con las favoritas apagadas, mis líneas son todas mis aperturas (la favorita guardada no cuenta)
    await page.addInitScript((f) => localStorage.setItem('ajedrez.v1.favoritas', JSON.stringify(f)), [ck])
    await page.goto('/#/prueba-partida?bot=brisa&color=b&guia=1&mislineas=1&jugadas=')
    const rep = repertorioDeFavoritas(misAperturas([ck]))
    const historia = () => page.getByTestId('lista-jugadas').getByTestId('jugada').count()
    // tres jugadas mías: cada vez, la que dice mi línea después de la del bot
    for (let n = 1; n <= 3; n++) {
      await expect.poll(historia, { timeout: 15_000 }).toBe(2 * n - 1)
      const jugadas = (await page.getByTestId('partida').getAttribute('data-jugadas'))!.split(' ').filter(Boolean)
      const mia = siguientesEnRepertorio(rep, 'b', jugadas)[0]!.san
      const c = new Chess()
      for (const s of jugadas) c.move(s)
      const m = c.move(mia)
      await jugar(page, info, m.from + m.to)
    }
    await expect.poll(historia, { timeout: 15_000 }).toBe(7)
    const jugadas = (await page.getByTestId('partida').getAttribute('data-jugadas'))!.split(' ').filter(Boolean)
    // el bot nunca se salió de mis líneas: lo jugado es el principio de una variante de mis aperturas
    expect(rep.lineas.some((l) => jugadas.every((s, i) => l.jugadas[i] === s))).toBe(true)
    await captura(page, info, 'l3-partida-mis-lineas')
  })

  test('Tus datos (menú Más): exportar e importar devuelve las favoritas', async ({ page }, info) => {
    test.skip(!TUS_DATOS_PRENDIDA || !FAVORITAS_PRENDIDAS, '"Tus datos" y las favoritas están apagadas (aprender/interruptores.ts); exportar vive en Ajustes')
    await page.addInitScript((f) => localStorage.getItem('ajedrez.v1.favoritas') ?? localStorage.setItem('ajedrez.v1.favoritas', JSON.stringify(f)), [ck, 'italiana:w'])
    await page.goto('/')
    await page.getByRole('button', { name: 'Más' }).click()
    await page.getByRole('menuitem', { name: 'Tus datos' }).click()
    const descarga = page.waitForEvent('download')
    await page.getByTestId('exportar').click()
    const archivo = await (await descarga).path()
    await expect(page.getByTestId('aviso-respaldo')).toContainText('se descargó')
    // se quitan las favoritas y se importa el archivo
    await page.evaluate(() => localStorage.setItem('ajedrez.v1.favoritas', '[]'))
    await page.getByTestId('importar').setInputFiles(archivo)
    await expect(page.getByTestId('aviso-respaldo')).toContainText('2 favoritas')
    await captura(page, info, 'l3-tus-datos')
    await page.goto('/#/cursos')
    await expect(page.locator('.tarjeta-apertura')).toHaveCount(2)
    // un archivo ajeno dice qué pasó
    await page.goto('/#/datos')
    await page.getByTestId('importar').setInputFiles({ name: 'otro.json', mimeType: 'application/json', buffer: Buffer.from('{"hola":1}') })
    await expect(page.getByTestId('aviso-respaldo')).toContainText('no es un respaldo de esta app')
  })
})
