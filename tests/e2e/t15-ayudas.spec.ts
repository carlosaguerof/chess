import { expect, test } from '@playwright/test'
import { captura, jugar } from './_util.ts'

test('las tres ayudas se prenden y apagan, se recuerdan al recargar, y el bot sigue a tiempo', async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem('ajedrez.v1.opciones-partida', JSON.stringify({ guia: false, misLineas: false })))
  // 1.e4 e6 2.Ac4 d5: mi alfil de c4 lo ataca un peón (vale menos): amenaza
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=e2e4,e7e6,f1c4,d7d5')
  await expect(page.getByTestId('barra-eval')).toHaveCount(0)
  await page.getByTestId('ayudas').click()
  const menu = page.getByRole('dialog', { name: 'Ayudas' })
  for (const a of ['barra', 'amenazas', 'sugerencia']) await expect(menu.getByTestId(`ayuda-${a}`)).not.toBeChecked()
  for (const a of ['barra', 'amenazas', 'sugerencia']) await menu.getByTestId(`ayuda-${a}`).check({ force: true })
  await captura(page, info, 't15-menu-ayudas')
  await menu.getByRole('button', { name: 'Listo' }).click()
  // barra, amenaza y sugerencia
  await expect(page.getByTestId('barra-eval').first()).toBeAttached()
  await expect(page.getByTestId('flechas')).toHaveAttribute('data-flechas', /red:d5c4/)
  await expect(page.getByTestId('flechas')).toHaveAttribute('data-flechas', /green:/, { timeout: 15_000 })
  await captura(page, info, 't15-ayudas-prendidas')
  // se recuerdan al recargar
  await page.reload()
  await page.getByTestId('ayudas').click()
  for (const a of ['barra', 'amenazas', 'sugerencia']) await expect(page.getByRole('dialog', { name: 'Ayudas' }).getByTestId(`ayuda-${a}`)).toBeChecked()
  await page.getByRole('dialog', { name: 'Ayudas' }).getByRole('button', { name: 'Listo' }).click()
  // el bot contesta dentro de su rango con las tres prendidas
  const t0 = Date.now()
  await jugar(page, info, 'c4b3')
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(6, { timeout: 10_000 })
  expect(Date.now() - t0).toBeLessThan(5000)
  // y se apagan
  await page.getByTestId('ayudas').click()
  for (const a of ['barra', 'amenazas', 'sugerencia']) await page.getByRole('dialog', { name: 'Ayudas' }).getByTestId(`ayuda-${a}`).uncheck({ force: true })
  await page.getByRole('dialog', { name: 'Ayudas' }).getByRole('button', { name: 'Listo' }).click()
  await expect(page.getByTestId('barra-eval')).toHaveCount(0)
  await expect(page.getByTestId('flechas')).toHaveAttribute('data-flechas', '')
})
