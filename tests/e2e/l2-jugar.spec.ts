import { expect, test, type Page } from '@playwright/test'
import { captura } from './_util.ts'

const jugadas = (page: Page) => page.getByTestId('lista-jugadas').getByTestId('jugada')

test.describe('L2 · Jugar, como "Play Bots"', () => {
  test('entra Brisa la primera vez; tocar un retrato cambia el de arriba; sin aperturas, códigos ni inglés', async ({ page }, info) => {
    await page.goto('/#/bots')
    const arriba = page.getByTestId('bot-escogido')
    await expect(arriba).toHaveAttribute('data-bot', 'brisa')
    await expect(arriba).toContainText('Brisa')
    await expect(arriba).toContainText('700')
    await expect(page.getByTestId('frase-bot')).not.toBeEmpty()
    await expect(page.getByTestId('bot-brisa')).toHaveAttribute('aria-pressed', 'true')
    // los cuatro grupos, en orden, con los 47
    await expect(page.locator('.grupo-bots h2')).toHaveText(['Principiante 100–800', 'Intermedio 900–1500', 'Avanzado 1600–2200', 'Maestro 2300–3000'])
    await expect(page.locator('.casilla-bot')).toHaveCount(47)
    await captura(page, info, 'l2-jugar')
    // tocar otro retrato: cambia el de arriba y el borde verde
    await page.getByTestId('bot-octavio').click()
    await expect(arriba).toHaveAttribute('data-bot', 'octavio')
    await expect(arriba).toContainText('Octavio')
    await expect(arriba).toContainText('2600')
    await expect(page.getByTestId('bot-octavio')).toHaveAttribute('aria-pressed', 'true')
    await expect(page.getByTestId('bot-brisa')).toHaveAttribute('aria-pressed', 'false')
    await captura(page, info, 'l2-jugar-otro')
    // nada de aperturas, códigos ECO ni inglés a la vista
    const texto = await page.locator('main').innerText()
    expect(texto).not.toMatch(/Italiana|Siciliana|Caro|Francesa|Escandinava|Eslava|Londres|Gambito|\b[A-E]\d\d\b|Defense|Game|Opening|Rapid|Blitz|Bullet/)
  })

  test('Opciones abre y guarda; el color se escoge; Jugar empieza con ese bot, color y tiempo', async ({ page }, info) => {
    await page.goto('/#/bots')
    await page.getByTestId('bot-itzel').click()
    // Opciones: la hoja con el tiempo, la guía, mis líneas y las ayudas
    await page.getByTestId('opciones').click()
    const hoja = page.getByRole('dialog', { name: 'Opciones' })
    await expect(hoja).toBeVisible()
    await expect(hoja.getByTestId('interruptor-guia')).toBeChecked()
    await expect(hoja.getByTestId('interruptor-mis-lineas')).toBeChecked()
    await expect(hoja.getByTestId('ayuda-barra')).not.toBeChecked()
    await captura(page, info, 'l2-opciones')
    await hoja.getByTestId('interruptor-guia').uncheck({ force: true })
    await hoja.getByTestId('ayuda-barra').check({ force: true })
    await hoja.getByTestId('elegir-tiempo').click()
    await page.getByRole('dialog', { name: 'Elegir tiempo' }).getByTestId('tiempo-5+0').click()
    await expect(hoja.getByTestId('elegir-tiempo')).toContainText('5 min')
    await hoja.getByTestId('opciones-listo').click()
    await expect(hoja).toBeHidden()
    await expect(page.getByTestId('opciones')).toContainText('5 min')
    // se guardó: al recargar sigue igual
    await page.reload()
    await page.getByTestId('opciones').click()
    await expect(page.getByTestId('interruptor-guia')).not.toBeChecked()
    await expect(page.getByTestId('ayuda-barra')).toBeChecked()
    await expect(page.getByTestId('elegir-tiempo')).toContainText('5 min')
    await page.getByTestId('opciones-listo').click()
    // el color: tres botones, uno escogido
    await expect(page.getByTestId('color-w')).toHaveAttribute('aria-checked', 'true')
    await page.getByTestId('color-b').click()
    await expect(page.getByTestId('color-b')).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByTestId('color-w')).toHaveAttribute('aria-checked', 'false')
    await captura(page, info, 'l2-negras')
    // Jugar: la partida es contra Itzel, con negras y 5 minutos
    await page.getByTestId('bot-itzel').click()
    await page.getByTestId('jugar').click()
    await expect(page.getByTestId('barra-rival')).toContainText('Itzel')
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-orientacion', 'black')
    await expect(page.getByTestId('reloj-yo')).toContainText('5:00')
    await expect(jugadas(page)).toHaveCount(1, { timeout: 15_000 })
    // y Jugar entra después con el último bot con el que jugué
    await page.goto('/#/bots')
    await expect(page.getByTestId('bot-escogido')).toHaveAttribute('data-bot', 'itzel')
  })
})
