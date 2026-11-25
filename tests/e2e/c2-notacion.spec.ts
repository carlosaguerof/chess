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
    // la Pirc, con la página de antes: 1.e4 d6 2.d4 Cf6 3.Cc3 g6 4.Cf3 Ag7 5.Ae2
    await page.goto('/#/curso/' + encodeURIComponent('otros-1e4:w') + '/0')
    await expect(page.getByTestId('linea')).toContainText('4.♘f3 ♗g7')
    await expect(page.getByTestId('linea')).toContainText('3.♘c3')
    await page.goto('/#/ajustes')
    await page.getByTestId('notacion-letras').click()
    await page.goBack()
    await page.reload()
    await expect(page.getByTestId('linea')).toContainText('4.Nf3 Bg7')
    await expect(page.getByTestId('linea')).not.toContainText('♗')
  })
})
