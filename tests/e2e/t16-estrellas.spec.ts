import { expect, test } from '@playwright/test'
import { captura, jugar } from './_util.ts'

test('ganar una partida preparada da sus estrellas, y se ven en la lista de bots', async ({ page }, info) => {
  // posición preparada: mate del pastor a una jugada, sin guía ni ayudas → 3 estrellas
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=e2e4,e7e5,d1h5,b8c6,f1c4,g8f6')
  await expect(page.getByTestId('tablero')).toBeVisible()
  await jugar(page, info, 'h5f7')
  const aviso = page.getByTestId('aviso-final')
  await expect(aviso).toContainText('¡Ganaste!')
  await expect(aviso.getByTestId('estrellas-final')).toHaveAttribute('data-estrellas', '3')
  await captura(page, info, 't16-estrellas')
  await aviso.getByTestId('otro-bot').click()
  await expect(page.getByTestId('estrellas-brisa')).toHaveAttribute('data-estrellas', '3')
  // con la guía prendida, ganar da 1 (pero se guarda la mejor: siguen 3)
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=1&jugadas=e2e4,e7e5,d1h5,b8c6,f1c4,g8f6')
  await jugar(page, info, 'h5f7')
  await expect(page.getByTestId('aviso-final').getByTestId('estrellas-final')).toHaveAttribute('data-estrellas', '1')
  await page.goto('/#/bots')
  await expect(page.getByTestId('estrellas-brisa')).toHaveAttribute('data-estrellas', '3')
  await captura(page, info, 't16-lista-con-estrellas')
})
