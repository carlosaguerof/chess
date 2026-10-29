import { expect, test } from '@playwright/test'
import { captura, jugar, tocar } from './_util.ts'
import { FAVORITAS_PRENDIDAS } from '../../src/aprender/interruptores.ts'

test.describe('T8 · practicar con cursos', () => {
  // la Caro-Kann ya tiene su lección nueva (C3, tests/e2e/c3-leccion.spec.ts); la de antes sigue en los demás cursos: aquí, la Eslava
  test('Eslava, Variante Checa (la lección de antes): enseña 1...d5, pregunta tras 1.d4 y 2.c4, marca lo incorrecto, Pista, Respuesta y al final la siguiente', async ({ page }, info) => {
    await page.goto(FAVORITAS_PRENDIDAS ? '/#/cursos/todas' : '/#/cursos/negras')
    await expect(page.getByRole('heading', { name: 'Aperturas y defensas' })).toBeVisible()
    await captura(page, info, 't8-cursos')
    await page.getByTestId('tarjeta-eslava:b').locator('a').click()
    await expect(page.getByTestId('variante').first()).toContainText('Variante Checa')
    await captura(page, info, 't8-curso-eslava')
    await page.getByTestId('empezar-leccion').click()
    const instr = page.getByTestId('instruccion')
    const aviso = page.getByTestId('aviso-leccion')
    await expect(page.getByTestId('nombre-linea')).toContainText('Variante Checa')
    // 1) me la enseña
    await expect(page.getByTestId('fase')).toContainText('Te la enseño')
    await expect(instr).toContainText('Juega 1...d5')
    await captura(page, info, 't8-ensena')
    const linea = ['d7d5', 'c7c6', 'g8f6', 'd5c4', 'c8f5']
    for (const j of linea) {
      await expect(instr).toContainText('Juega', { timeout: 10_000 })
      await jugar(page, info, j)
    }
    // 2) me pregunta: después de 1.d4
    await expect(page.getByTestId('fase')).toContainText('Ahora tú', { timeout: 10_000 })
    await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/3P4\//)
    // una equivocada se marca incorrecta y se repite el paso
    await tocar(page, info, 'e7')
    await tocar(page, info, 'e5')
    await expect(aviso).toHaveAttribute('data-resultado', 'incorrecta')
    await expect(aviso).toContainText('Incorrecta')
    await captura(page, info, 't8-incorrecta')
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/3P4\//)
    await jugar(page, info, 'd7d5')
    await expect(aviso).toHaveAttribute('data-resultado', 'correcta')
    // después de 2.c4: Pista (sin decir a dónde) y Respuesta (con la jugada)
    await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /\/2PP4\//)
    await page.getByTestId('pista').click()
    await expect(aviso).toHaveAttribute('data-resultado', 'pista')
    await expect(aviso).toContainText('Mueve el peón de c7')
    await expect(aviso).not.toContainText('c6')
    await captura(page, info, 't8-pista')
    await page.getByTestId('respuesta').click()
    await expect(aviso).toHaveAttribute('data-resultado', 'respuesta')
    await expect(aviso).toContainText('2...c6')
    await captura(page, info, 't8-respuesta')
    await jugar(page, info, 'c7c6')
    for (const j of ['g8f6', 'd5c4', 'c8f5']) {
      await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
      await jugar(page, info, j)
    }
    // 3) al terminar: el nombre y la siguiente lección
    const fin = page.getByTestId('fin-leccion')
    await expect(fin).toBeVisible({ timeout: 10_000 })
    await expect(fin).toContainText('Variante Checa')
    await expect(page.getByTestId('siguiente-leccion')).toContainText('Siguiente:')
    await captura(page, info, 't8-fin-leccion')
    await page.getByTestId('siguiente-leccion').click()
    await expect(page.getByTestId('fase')).toContainText('Te la enseño')
    // el avance quedó guardado
    await page.goto('/#/curso/' + encodeURIComponent('eslava:b'))
    await expect(page.getByTestId('variante').first()).toContainText('Aprendida')
    await expect(page.getByTestId('avance')).toContainText('1 de 13 variantes aprendidas')
  })
})
