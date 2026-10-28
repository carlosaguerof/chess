import { expect, test } from '@playwright/test'
import { personajesDisponibles } from '../../src/bots/personajes.ts'

test('R4 · la lista completa de bots con su retrato dibujado en el código (sin imágenes de fuera)', async ({ page }, info) => {
  const deFuera: string[] = []
  page.on('request', (r) => {
    if (r.resourceType() === 'image' && !r.url().startsWith('http://localhost') && !r.url().startsWith('data:')) deFuera.push(r.url())
  })
  await page.goto('/#/bots')
  await expect(page.locator('img[data-retrato]').first()).toBeVisible()
  const caras = await page.locator('img[data-retrato]').evaluateAll((s) => new Set(s.map((x) => x.getAttribute('data-retrato'))).size)
  // los 47: con la calibración de la T13 (100 a 3000) todos se pueden escoger
  expect(personajesDisponibles()).toHaveLength(47)
  expect(caras).toBe(47)
  expect(deFuera).toEqual([])
  await page.screenshot({ path: `iterations/v2/capturas/pruebas/${info.project.name}/r4-lista-completa.png`, fullPage: true })
})
