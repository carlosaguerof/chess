import { expect, test } from '@playwright/test'

/**
 * La lección del curso cabe en la pantalla del celular (2026-10-29): en la página publicada, a 402×874 (el iPhone 16 Pro de
 * Carlos), "Te toca" en la última jugada de la Clásica (la línea más larga) no tiene scroll de la página, y Pista,
 * Respuesta, Atrás y Reiniciar quedan completos a la vista.
 */
test.use({ viewport: { width: 402, height: 874 } })

test('La lección a 402×874: sin scroll de la página, con los cuatro botones a la vista', async ({ page }) => {
  await page.goto('./#/')
  await page.evaluate(() => localStorage.setItem('ajedrez.v1.curso:caro-kann:b', JSON.stringify({ piezas: {}, variantes: {}, errores: {}, enCurso: { linea: 'v:clasica', vuelta: 'aprender', ply: 19, fecha: Date.now() } })))
  await page.goto('./#/curso/caro-kann%3Ab/linea/' + encodeURIComponent('v:clasica'))
  await page.reload()
  await expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-momento', 'tuTurno')
  await expect(page.getByTestId('reiniciar')).toHaveText('Reiniciar')
  const m = await page.evaluate(() => {
    const caja = (id: string) => document.querySelector(`[data-testid="${id}"]`)!.getBoundingClientRect()
    return {
      pagina: document.documentElement.scrollHeight,
      ventana: innerHeight,
      abajo: Math.max(...['pista', 'respuesta', 'atras', 'reiniciar'].map((id) => caja(id).bottom)),
      narracion: caja('narracion').height,
      tablero: caja('tablero').width,
    }
  })
  expect(m.pagina, 'sin scroll de la página').toBeLessThanOrEqual(m.ventana)
  expect(m.abajo, 'los cuatro botones, a la vista').toBeLessThanOrEqual(m.ventana)
  expect(m.narracion).toBeGreaterThanOrEqual(140)
  expect(m.tablero).toBeGreaterThanOrEqual(280)
})
