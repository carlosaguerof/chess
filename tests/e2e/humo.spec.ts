import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'

test('la app carga y muestra el inicio', async ({ page }, info) => {
  await page.goto('/')
  await expect(page.getByTestId('jugar-recomendado')).toBeVisible()
  await captura(page, info, 't1-humo')
})
