import { expect, test } from '@playwright/test'
import { jugar } from '../e2e/_util.ts'

/** C9 (2026-10-29): en la página publicada, el curso de la Caro-Kann abre y su lección se juega, de la tarjeta al plan. */
test('el curso de la Caro-Kann abre y su lección se juega hasta el plan', async ({ page }, info) => {
  const r = await page.goto('./#/cursos/negras')
  expect(r?.status()).toBe(200)
  const tarjeta = page.getByTestId('tarjeta-caro-kann:b')
  await expect(tarjeta).toContainText('Defensa Caro-Kann')
  await tarjeta.click()
  await expect(page.getByTestId('pagina-curso')).toBeVisible()
  await expect(page.getByTestId('piezas-curso').locator('[data-testid^="paso-"]')).toHaveCount(2 + 16 + 2)

  // la lección de la Tal, en Aprender: la Respuesta una vez y las cuatro jugadas hasta el plan
  await page.goto('./#/curso/caro-kann-estructuras%3Ab/linea/' + encodeURIComponent('v:avance-tal'))
  const momento = (m: string) => expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', m)
  await page.getByTestId('empezar-vuelta').click()
  await momento('tuTurno')
  await page.getByTestId('respuesta').click()
  await expect(page.getByTestId('narracion').locator('[data-tipo="respuesta"]')).toContainText('Respuesta:')
  for (const j of ['c8f5', 'h7h5', 'f5d3', 'e7e6']) {
    await momento('tuTurno')
    await jugar(page, info, j)
    await momento('leer')
    await page.getByTestId('siguiente').click()
  }
  await momento('plan')
  await expect(page.getByTestId('narracion')).toContainText('Tu plan:')
  await expect(page.getByTestId('a-practicar')).toBeVisible()
})

/** 2026-11-25: en Aprender, pestaña negras, una sola Caro-Kann; abre el curso por estructuras, con sus secciones, y la dirección de antes lleva a él. */
test('en Aprender sale una sola Caro-Kann, y abre el curso por estructuras', async ({ page }) => {
  await page.goto('./#/cursos/negras')
  const tarjetas = page.getByTestId('lista-aperturas').locator('[data-testid^="tarjeta-"]')
  await expect(tarjetas).toHaveCount(3)
  await expect(tarjetas.nth(0)).toContainText('Defensa Caro-Kann')
  await expect(tarjetas.nth(0)).toContainText('de 8 variantes')
  await expect(page.getByTestId('lista-aperturas')).not.toContainText('por estructuras')
  await tarjetas.nth(0).click()
  await expect(page).toHaveURL(/#\/curso\/caro-kann-estructuras%3Ab$/)
  await expect(page.getByTestId('pagina-curso').locator('h1')).toHaveText('Defensa Caro-Kann')
  await expect(page.getByTestId('seccion-base')).toHaveText('La base')
  await expect(page.getByTestId('seccion-opcional')).toContainText('No cuentan para terminar el curso.')
  // la dirección del curso de antes lleva al que queda
  await page.goto('./#/curso/caro-kann%3Ab')
  await expect(page).toHaveURL(/#\/curso\/caro-kann-estructuras%3Ab$/)
  await expect(page.getByTestId('seccion-base')).toHaveText('La base')
})
