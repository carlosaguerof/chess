import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'

test('la app carga y muestra el inicio', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.getByTestId('jugar-recomendado')).toBeVisible()
  await captura(page, info, 't1-humo')
})

test('el menú tiene "Código fuente y licencias" y lleva al repo público y a LICENCIAS.md', async ({ page }, info) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Más' }).click()
  await page.getByRole('menuitem', { name: 'Código fuente y licencias' }).click()
  await expect(page.getByRole('heading', { name: 'Código fuente y licencias' })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver el código fuente' })).toHaveAttribute('href', 'https://github.com/carlosaguerof/chess')
  await expect(page.getByRole('link', { name: 'Ver las licencias' })).toHaveAttribute('href', 'https://github.com/carlosaguerof/chess/blob/main/LICENCIAS.md')
  await captura(page, info, 'nota7-licencias')
})
