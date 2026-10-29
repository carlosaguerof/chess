import { expect, test } from '@playwright/test'
import { jugar } from './_util.ts'

/** C2 (curso de la Caro-Kann): figuras de entrada; en Ajustes, "Notación": Figuras o Letras. Nunca las dos juntas. */
test.describe('C2 · la notación', () => {
  test('de entrada se ve en figuras; en Ajustes cambia a letras, se ve en la lista de jugadas y se recuerda al recargar', async ({ page }, info) => {
    await page.goto('/#/libre')
    for (const j of ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4']) await jugar(page, info, j)
    const lista = page.getByTestId('lista-jugadas')
    await expect(lista).toContainText('♘f3')
    await expect(lista).toContainText('♘c6')
    await expect(lista).toContainText('♗c4')
    await expect(lista).not.toContainText('Nf3')
    await expect(lista).not.toContainText('Cf3')

    // Ajustes → Notación → Letras
    await page.goto('/#/ajustes')
    await expect(page.getByTestId('notacion-figuras')).toHaveAttribute('aria-checked', 'true')
    await expect(page.getByTestId('notacion-figuras')).toContainText('♘f3')
    await expect(page.getByTestId('notacion-letras')).toContainText('Nf3')
    await page.getByTestId('notacion-letras').click()
    await expect(page.getByTestId('notacion-letras')).toHaveAttribute('aria-checked', 'true')

    // la lista de jugadas, en letras (inglés) y sin figuras
    await page.goto('/#/libre')
    for (const j of ['e2e4', 'e7e5', 'g1f3', 'b8c6', 'f1c4']) await jugar(page, info, j)
    await expect(lista).toContainText('Nf3')
    await expect(lista).toContainText('Nc6')
    await expect(lista).toContainText('Bc4')
    await expect(lista).not.toContainText('♘')

    // se recuerda al recargar
    await page.reload()
    await page.goto('/#/ajustes')
    await expect(page.getByTestId('notacion-letras')).toHaveAttribute('aria-checked', 'true')
    await page.goto('/#/libre')
    for (const j of ['e2e4', 'e7e5', 'g1f3']) await jugar(page, info, j)
    await expect(lista).toContainText('Nf3')
  })

  test('los planes y las líneas de Aprender también cambian de notación', async ({ page }) => {
    // la Eslava, Variante Checa: 1.d4 d5 2.c4 c6 3.Cf3 Cf6 4.Cc3 dxc4 5.a4 Af5
    await page.goto('/#/curso/' + encodeURIComponent('eslava:b') + '/0')
    await expect(page.getByTestId('linea')).toContainText('5.a4 ♗f5')
    await expect(page.getByTestId('linea')).toContainText('3.♘f3')
    await page.goto('/#/ajustes')
    await page.getByTestId('notacion-letras').click()
    await page.goBack()
    await page.reload()
    await expect(page.getByTestId('linea')).toContainText('5.a4 Bf5')
    await expect(page.getByTestId('linea')).not.toContainText('♗')
  })
})
