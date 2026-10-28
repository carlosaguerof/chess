import { expect, test } from '@playwright/test'
import { captura, jugar, tocar } from './_util.ts'

test.describe('T9 · la guía de aperturas en una partida real', () => {
  test('interruptores al escoger el bot (prendidos por defecto)', async ({ page }, info) => {
    await page.goto('/#/bot/brisa')
    await expect(page.getByTestId('interruptor-guia')).toBeChecked()
    await expect(page.getByTestId('interruptor-mis-lineas')).toBeChecked()
    await captura(page, info, 't9-interruptores')
  })

  test('mensajes en R D T A C, silencio tras el rival, Respuesta de mi línea aunque el motor prefiera otra, y deshacer al desviarme', async ({ page }, info) => {
    // Brisa ya jugó 1.e4; yo con negras, guía prendida, el bot con su libro (Avance contra la Caro-Kann)
    await page.goto('/#/prueba-partida?bot=brisa&color=b&jugadas=e2e4&guia=1&mislineas=0')
    const panel = page.getByTestId('panel-guia')
    await expect(panel).toBeVisible()
    // después del rival: silencio, pero Pista y Respuesta a la mano
    await expect(page.getByTestId('mensaje-guia')).toHaveCount(0)
    await page.getByTestId('respuesta').click()
    const ayuda = page.getByTestId('ayuda-guia')
    await expect(ayuda).toHaveAttribute('data-origen', 'repertorio')
    await expect(ayuda).toContainText('1...c6') // el motor prefiere 1...e5 (tests/unit/guia.test.ts)
    await captura(page, info, 't9-respuesta')
    await jugar(page, info, 'c7c6')
    await expect(page.getByTestId('mensaje-guia')).toContainText('Estás en la Defensa Caro-Kann')
    await captura(page, info, 't9-mensaje')
    // el bot contesta 2.d4 y la guía se calla
    await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(3, { timeout: 15_000 })
    await expect(page.getByTestId('mensaje-guia')).toHaveCount(0)
    await jugar(page, info, 'd7d5')
    await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(5, { timeout: 15_000 })
    const fenAntes = await page.getByTestId('tablero').getAttribute('data-fen')
    // me desvío: 3...e6 en vez de 3...Af5
    await tocar(page, info, 'e7')
    await tocar(page, info, 'e6')
    const m = page.getByTestId('mensaje-guia')
    await expect(m).toHaveAttribute('data-tipo', 'desvio')
    await expect(m).toContainText('Te desviaste')
    await expect(m).toContainText('tu línea dice 3...Af5')
    await captura(page, info, 't9-desvio')
    // el bot espera mi decisión; deshacer regresa a la posición anterior
    await page.waitForTimeout(1500)
    await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(6)
    await page.getByTestId('deshacer-desvio').click()
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', fenAntes!)
    // ahora sí mi línea: el mensaje en notación R D T A C
    await jugar(page, info, 'c8f5')
    await expect(page.getByTestId('mensaje-guia')).toContainText('3...Af5')
    // al final, el resumen
    await page.getByTestId('rendirse').click()
    await page.getByRole('dialog', { name: '¿Rendirte?' }).getByRole('button', { name: 'Rendirme' }).click()
    await expect(page.getByTestId('resumen-aviso')).toContainText('Seguiste tu línea')
    await captura(page, info, 't9-resumen')
  })
})
