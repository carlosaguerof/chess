import { expect, test } from '@playwright/test'

/** L6: la página publicada ya es la de la limpieza visual (Jugar como "Play Bots", "Aperturas y defensas", los retratos). */
test('el sitio publicado trae Jugar con los 47 retratos y la sección "Aperturas y defensas"', async ({ page }) => {
  const r = await page.goto('./#/bots')
  expect(r?.status()).toBe(200)
  await expect(page.getByTestId('bot-escogido')).toHaveAttribute('data-bot', 'brisa')
  await expect(page.locator('.casilla-bot')).toHaveCount(47)
  await expect(page.locator('img[data-retrato]').first()).toHaveAttribute('data-estilo', 'toon')
  await page.goto('./#/cursos')
  await expect(page.getByRole('heading', { name: 'Aperturas y defensas' })).toBeVisible()
  // ajustes de la app: "Con blancas" y "Con negras", sin ♡
  await expect(page.getByTestId('pestana-blancas')).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('pestana-negras')).toBeVisible()
  await expect(page.locator('.corazon')).toHaveCount(0)
  await expect(page.getByRole('navigation', { name: 'Secciones' })).not.toContainText('Repertorio')
})
