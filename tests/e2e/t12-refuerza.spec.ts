import { expect, test } from '@playwright/test'
import { captura, jugar, tocar } from './_util.ts'

test('fallo una jugada en un curso y aparece en "Refuerza lo que fallas" (solo ella: las demás no las he fallado)', async ({ page }, info) => {
  await page.goto('/#/leccion/' + encodeURIComponent('caro-kann:b') + '/0')
  const instr = page.getByTestId('instruccion')
  for (const j of ['c7c6', 'd7d5', 'c8f5', 'e7e6']) {
    await expect(instr).toContainText('Juega', { timeout: 10_000 })
    await jugar(page, info, j)
  }
  await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
  // fallo 1...c6 (juego 1...e5) y luego acierto
  await tocar(page, info, 'e7')
  await tocar(page, info, 'e5')
  await expect(page.getByTestId('aviso-leccion')).toHaveAttribute('data-resultado', 'incorrecta')
  await jugar(page, info, 'c7c6')
  await expect(page.getByTestId('aviso-leccion')).toHaveAttribute('data-resultado', 'correcta')
  // a Refuerza, desde el inicio
  await page.goto('/#/')
  await page.getByTestId('ir-refuerza').click()
  await expect(page.getByTestId('jugada-refuerza')).toHaveCount(1)
  const primera = page.getByTestId('jugada-refuerza').first()
  await expect(primera).toContainText('después de 1.e4')
  await expect(primera).toContainText('fallada 1 de 1 vez')
  await captura(page, info, 't12-refuerza')
  // y se practica: la ronda es esa jugada, desde su posición
  await page.getByTestId('empezar-refuerza').click()
  await expect(page.getByTestId('ronda-refuerza')).toContainText('1 de 1')
  await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/4P3\//)
  await captura(page, info, 't12-ronda')
  await jugar(page, info, 'c7c6')
  await expect(page.getByRole('heading', { name: 'Listo por ahora' })).toBeVisible()
})
