import { expect, test } from '@playwright/test'
import { captura, jugar, tocar } from './_util.ts'

test('fallo una jugada en un curso y aparece en "Refuerza lo que fallas" (solo ella: las demás no las he fallado)', async ({ page }, info) => {
  // con la lección de antes (la Eslava, Variante Checa); la de la Caro-Kann registra igual (tests/unit/curso-ciclo.test.ts)
  await page.goto('/#/leccion/' + encodeURIComponent('eslava:b') + '/0')
  const instr = page.getByTestId('instruccion')
  for (const j of ['d7d5', 'c7c6', 'g8f6', 'd5c4', 'c8f5']) {
    await expect(instr).toContainText('Juega', { timeout: 10_000 })
    await jugar(page, info, j)
  }
  await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
  // fallo 1...d5 (juego 1...e5) y luego acierto
  await tocar(page, info, 'e7')
  await tocar(page, info, 'e5')
  await expect(page.getByTestId('aviso-leccion')).toHaveAttribute('data-resultado', 'incorrecta')
  await jugar(page, info, 'd7d5')
  await expect(page.getByTestId('aviso-leccion')).toHaveAttribute('data-resultado', 'correcta')
  // a Refuerza, desde el inicio
  await page.goto('/#/')
  // el botón de la tarjeta (en el centro del iPhone puede quedar el ⓘ de "cómo funciona")
  await page.getByTestId('ir-refuerza').getByRole('link', { name: 'Reforzar' }).click()
  await expect(page.getByTestId('jugada-refuerza')).toHaveCount(1)
  const primera = page.getByTestId('jugada-refuerza').first()
  await expect(primera).toContainText('después de 1.d4')
  await expect(primera).toContainText('fallada 1 de 1 vez')
  await captura(page, info, 't12-refuerza')
  // y se practica: la ronda es esa jugada, desde su posición
  await page.getByTestId('empezar-refuerza').click()
  await expect(page.getByTestId('ronda-refuerza')).toContainText('1 de 1')
  await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/3P4\//)
  await captura(page, info, 't12-ronda')
  // la única jugada de la ronda: al contestarla, la ronda termina (y el tablero se va)
  await tocar(page, info, 'd7')
  await tocar(page, info, 'd5')
  await expect(page.getByRole('heading', { name: 'Listo por ahora' })).toBeVisible()
  await expect(page.getByText('Repasaste 1 jugada.')).toBeVisible()
})
