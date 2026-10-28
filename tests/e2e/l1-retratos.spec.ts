import { expect, test } from '@playwright/test'

const carpeta = (perfil: string) => `iterations/v2/capturas/l1/${perfil}`

test('L1 · los 47 personajes en cada uno de los tres estilos', async ({ page }, info) => {
  for (const estilo of ['toon', 'avataaars', 'peeps']) {
    await page.goto(`/#/retratos/${estilo}`)
    await expect(page.locator(`img[data-estilo="${estilo}"]`)).toHaveCount(47)
    // que todas las imágenes ya estén dibujadas
    await expect.poll(() => page.locator('img[data-retrato]').evaluateAll((xs) => xs.every((x) => (x as HTMLImageElement).complete && (x as HTMLImageElement).naturalWidth > 0))).toBe(true)
    const srcs = await page.locator('img[data-retrato]').evaluateAll((xs) => new Set(xs.map((x) => x.getAttribute('src'))).size)
    expect(srcs).toBe(47)
    await page.screenshot({ path: `${carpeta(info.project.name)}/retratos-${estilo}.png`, fullPage: true })
  }
})

test('L1 · cambiar el estilo en Ajustes cambia los retratos al instante y se recuerda al recargar', async ({ page }, info) => {
  await page.goto('/#/bots')
  const uno = page.locator('img[data-retrato="brisa"]').first()
  await expect(uno).toHaveAttribute('data-estilo', 'toon') // el recomendado, por defecto
  const antes = await uno.getAttribute('src')
  await page.goto('/#/ajustes')
  await expect(page.getByTestId('estilo-toon')).toHaveAttribute('aria-checked', 'true')
  await page.getByTestId('estilo-peeps').click()
  await expect(page.getByTestId('estilo-peeps')).toHaveAttribute('aria-checked', 'true')
  await page.screenshot({ path: `${carpeta(info.project.name)}/ajustes-estilo.png` })
  // sin recargar: los retratos ya son del otro estilo
  await page.getByRole('link', { name: 'Jugar' }).first().click()
  await expect(uno).toHaveAttribute('data-estilo', 'peeps')
  expect(await uno.getAttribute('src')).not.toBe(antes)
  // y se recuerda al recargar
  await page.reload()
  await expect(page.locator('img[data-retrato="brisa"]').first()).toHaveAttribute('data-estilo', 'peeps')
  await page.goto('/#/ajustes')
  await expect(page.getByTestId('estilo-peeps')).toHaveAttribute('aria-checked', 'true')
})
