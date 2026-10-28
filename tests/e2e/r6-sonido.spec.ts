import { expect, test } from '@playwright/test'
import { captura, jugar } from './_util.ts'

test('R6 · el sonido viene apagado, se prende en Ajustes, se guarda al recargar y suena al mover y al capturar', async ({ page }, info) => {
  // un AudioContext falso que cuenta los sonidos y su tono (sin bocinas en la prueba)
  await page.addInitScript(() => {
    const w = window as unknown as { __tonos: number[]; AudioContext: unknown }
    w.__tonos = []
    class Falso {
      currentTime = 0
      destination = {}
      createOscillator() {
        const o = { type: '', frequency: { value: 0 }, connect: (g: unknown) => g, start: () => w.__tonos.push(o.frequency.value), stop: () => undefined }
        return o
      }
      createGain() {
        return { gain: { setValueAtTime: () => undefined, exponentialRampToValueAtTime: () => undefined }, connect: (d: unknown) => d }
      }
    }
    w.AudioContext = Falso
  })
  const tonos = () => page.evaluate(() => (window as unknown as { __tonos: number[] }).__tonos)
  await page.goto('/#/ajustes')
  await expect(page.getByTestId('ajuste-sonido')).not.toBeChecked()
  // apagado: una jugada no suena
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=e2e4,d7d5')
  await jugar(page, info, 'e4d5')
  expect(await tonos()).toEqual([])
  // se prende y se recuerda al recargar
  await page.goto('/#/ajustes')
  await page.getByTestId('ajuste-sonido').check({ force: true })
  await captura(page, info, 'r6-ajustes')
  await page.reload()
  await expect(page.getByTestId('ajuste-sonido')).toBeChecked()
  // prendido: la captura suena grave (220 Hz) y la respuesta del bot suena
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=e2e4,d7d5')
  await jugar(page, info, 'e4d5')
  await expect.poll(tonos).toContain(220)
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(4, { timeout: 15_000 })
  await expect.poll(async () => (await tonos()).length).toBeGreaterThanOrEqual(2)
})
