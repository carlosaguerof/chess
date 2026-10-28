import { expect, test } from '@playwright/test'
import { personajesDisponibles } from '../../src/bots/personajes.ts'

test('R4 · la lista completa de bots con su cara dibujada en el código (sin imágenes de fuera)', async ({ page }, info) => {
  const deFuera: string[] = []
  page.on('request', (r) => {
    if (r.resourceType() === 'image' && !r.url().startsWith('http://localhost')) deFuera.push(r.url())
  })
  await page.goto('/#/bots')
  await expect(page.locator('svg[data-cara]').first()).toBeVisible()
  const caras = await page.locator('svg[data-cara]').evaluateAll((s) => new Set(s.map((x) => x.getAttribute('data-cara'))).size)
  // los 47: con la calibración de la T13 (100 a 3000) todos se pueden escoger
  expect(personajesDisponibles()).toHaveLength(47)
  expect(caras).toBe(47)
  expect(deFuera).toEqual([])
  await page.screenshot({ path: `iterations/v1/capturas/${info.project.name}/r4-lista-completa.png`, fullPage: true })
})
