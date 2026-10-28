import { expect, test, type Page } from '@playwright/test'
import { captura, esCelular, jugar, tocar } from './_util.ts'

const jugadas = (page: Page) => page.getByTestId('lista-jugadas').getByTestId('jugada')

test.describe('T5 · jugar contra un bot', () => {
  test('del inicio a mi primera jugada en 3 toques, y el bot contesta pensando', async ({ page }, info) => {
    await page.goto('/')
    await expect(page.getByTestId('jugar-recomendado')).toBeVisible()
    await expect(page.locator('.recomendado')).toContainText('700')
    await captura(page, info, 't5-inicio')
    let toques = 0
    await page.getByTestId('jugar-recomendado').click()
    toques++
    await expect(page.getByTestId('tablero')).toBeVisible()
    await tocar(page, info, 'e2')
    toques++
    await tocar(page, info, 'e4')
    toques++
    await expect(jugadas(page).first()).toHaveText('e4')
    expect(toques).toBeLessThanOrEqual(3)
    // el bot piensa y se ve
    await expect(page.getByTestId('pensando')).toBeVisible()
    await expect(page.getByTestId('pensando')).toContainText('está pensando')
    await captura(page, info, 't5-bot-pensando')
    await expect(jugadas(page)).toHaveCount(2, { timeout: 15_000 })
    await expect(page.getByTestId('pensando')).toBeHidden()
    await expect(page.getByTestId('partida')).toHaveAttribute('data-motor', /Stockfish 19/)
    await captura(page, info, 't5-partida')
  })

  test('lista de bots: mi zona primero; el bot en grande; escoger negras', async ({ page }, info) => {
    await page.goto('/#/bots')
    const grupos = page.locator('.grupo-bots h2')
    await expect(grupos.first()).toContainText('Tu zona')
    await expect(grupos.first()).toContainText('500 a 1000')
    await captura(page, info, 't5-lista-bots')
    await page.getByTestId('bot-itzel').click()
    await expect(page.locator('.detalle-cabeza')).toContainText('Itzel')
    await expect(page.locator('.detalle-cabeza')).toContainText('700')
    await page.getByTestId('color-b').click()
    await expect(page.getByTestId('color-b')).toHaveAttribute('aria-checked', 'true')
    await captura(page, info, 't5-detalle-bot')
    await page.getByTestId('jugar').click()
    // con negras, el bot abre
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-orientacion', 'black')
    await expect(jugadas(page)).toHaveCount(1, { timeout: 15_000 })
  })

  test('recargar a media partida la deja igual; deshacer regresa dos medias jugadas', async ({ page }, info) => {
    await page.goto('/')
    await page.getByTestId('jugar-recomendado').click()
    await jugar(page, info, 'e2e4')
    await expect(jugadas(page)).toHaveCount(2, { timeout: 15_000 })
    await jugar(page, info, 'g1f3')
    await expect(jugadas(page)).toHaveCount(4, { timeout: 15_000 })
    const fen = await page.getByTestId('tablero').getAttribute('data-fen')
    const texto = await page.getByTestId('lista-jugadas').textContent()
    await page.reload()
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', fen!)
    await expect(page.getByTestId('lista-jugadas')).toHaveText(texto!)
    await expect(jugadas(page)).toHaveCount(4)
    // deshacer: mi Cf3 y la respuesta del bot
    await page.getByTestId('deshacer').click()
    await expect(jugadas(page)).toHaveCount(2)
    await expect(jugadas(page).first()).toHaveText('e4')
    // salir al inicio no pierde la partida
    await page.locator('a.salir').click()
    await expect(page.getByTestId('partida-en-curso')).toBeVisible()
    await captura(page, info, 't5-inicio-partida-en-curso')
    await page.getByTestId('partida-en-curso').click()
    await expect(jugadas(page)).toHaveCount(2)
  })

  test('rendirse pide confirmación y termina la partida', async ({ page }, info) => {
    await page.goto('/')
    await page.getByTestId('jugar-recomendado').click()
    await jugar(page, info, 'd2d4')
    await expect(jugadas(page)).toHaveCount(2, { timeout: 15_000 })
    await page.getByTestId('rendirse').click()
    const dialogo = page.getByRole('dialog', { name: '¿Rendirte?' })
    await expect(dialogo).toBeVisible()
    await captura(page, info, 't5-confirmar-rendirse')
    await dialogo.getByRole('button', { name: 'Seguir jugando' }).click()
    await expect(dialogo).toBeHidden()
    await expect(page.getByTestId('aviso-final')).toBeHidden()
    await page.getByTestId('rendirse').click()
    await page.getByRole('dialog', { name: '¿Rendirte?' }).getByRole('button', { name: 'Rendirme' }).click()
    const aviso = page.getByTestId('aviso-final')
    await expect(aviso).toBeVisible()
    await expect(aviso).toContainText('Perdiste')
    await expect(aviso).toContainText('Te rendiste')
    await expect(aviso.getByTestId('revancha')).toBeVisible()
    await expect(aviso.getByTestId('otro-bot')).toBeVisible()
    await captura(page, info, 't5-final')
    // revancha: mismo bot, colores cambiados
    await aviso.getByTestId('revancha').click()
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-orientacion', 'black')
    await expect(jugadas(page)).toHaveCount(1, { timeout: 15_000 })
  })

  test('empezar otra partida con una en curso pide confirmación', async ({ page }, info) => {
    await page.goto('/')
    await page.getByTestId('jugar-recomendado').click()
    await jugar(page, info, 'e2e4')
    await expect(jugadas(page)).toHaveCount(2, { timeout: 15_000 })
    await page.goto('/')
    await page.getByTestId('jugar-recomendado').click()
    const d = page.getByRole('dialog', { name: '¿Empezar otra partida?' })
    await expect(d).toBeVisible()
    await d.getByRole('button', { name: 'Cancelar' }).click()
    await expect(page.getByTestId('partida-en-curso')).toBeVisible()
    if (esCelular(info)) await captura(page, info, 't5-inicio-celular')
  })
})
