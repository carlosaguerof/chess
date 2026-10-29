import { expect, test } from '@playwright/test'
import { Chess } from 'chess.js'
import { jugar } from '../e2e/_util.ts'

/** 2026-10-28: en la página publicada, la partida del reporte del zoom ya cabe en el iPhone (sin ensancharse ni cambiar de escala). */
test('la partida del reporte del zoom cabe en la pantalla del iPhone', async ({ page, isMobile }, info) => {
  test.skip(!isMobile, 'el bug es del celular')
  const c = new Chess()
  const jugadas = 'e4 e5 d3 c6 h4 Be7 g4 Nf6 f4 Qc7 Be2 d5 fxe5 Nfd7'.split(' ').map((s) => {
    const m = c.move(s)
    return m.from + m.to
  })
  // la partida guardada tal cual quedó antes de 8.exd5 (en desarrollo la arma /#/prueba-partida; aquí, el guardado del navegador)
  await page.addInitScript((j) => {
    const p = { id: 'zoom', botId: 'brisa', colorHumano: 'w', fenInicial: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1', jugadas: j, fin: null, orientacion: 'white', deshechas: 0, iniciada: Date.now(), opciones: { guia: true, misLineas: false }, ayudas: { pista: 0, respuesta: 0 }, pausa: null, reloj: null }
    if (!localStorage.getItem('ajedrez.v1.partida')) localStorage.setItem('ajedrez.v1.partida', JSON.stringify(p))
  }, jugadas)
  const r = await page.goto('./#/partida')
  expect(r?.status()).toBe(200)
  await jugar(page, info, 'e4d5')
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(16, { timeout: 30_000 })
  const m = await page.evaluate(() => ({ pantalla: innerWidth, pagina: document.documentElement.scrollWidth, escala: visualViewport?.scale ?? 1 }))
  expect(m.pagina).toBeLessThanOrEqual(m.pantalla)
  expect(m.escala).toBe(1)
})
