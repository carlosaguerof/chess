import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'

test('R3 · pego un PGN con variantes y sus jugadas aparecen en mi repertorio', async ({ page }, info) => {
  await page.goto('/#/repertorio')
  await page.getByTestId('tab-negras').click()
  await page.getByTestId('menu-repertorio').click()
  await page.getByTestId('importar-pgn').click()
  const d = page.getByRole('dialog', { name: 'Importar un PGN con negras' })
  // un error claro primero
  await d.getByTestId('texto-pgn').fill('1. e4 c6 2. Re3')
  await d.getByRole('button', { name: 'Importar' }).click()
  await expect(d.getByTestId('error-pgn')).toContainText('Jugada ilegal o que no entiendo: "Re3" después de 1.e4 c6.')
  await captura(page, info, 'r3-pgn-error')
  await d.getByTestId('texto-pgn').fill('[Event "Mis apuntes"]\n1. e4 c6 2. d4 d5 3. e5 Af5 4. h4 (4. Cc3 e6) 4... h5 5. c4 *')
  await expect(d.getByTestId('error-pgn')).toHaveCount(0)
  await captura(page, info, 'r3-pgn')
  await d.getByRole('button', { name: 'Importar' }).click()
  await expect(page.getByText('Listo: 1 línea nueva con negras ("Mis apuntes"); 1 ya estaba.')).toBeVisible()
  await page.reload()
  await page.getByTestId('tab-negras').click()
  await expect(page.getByText('Mis apuntes').first()).toBeAttached()
})
