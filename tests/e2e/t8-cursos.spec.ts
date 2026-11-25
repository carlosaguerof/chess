import { expect, test } from '@playwright/test'
import { captura, jugar, tocar } from './_util.ts'
import { FAVORITAS_PRENDIDAS } from '../../src/aprender/interruptores.ts'

test.describe('T8 · practicar con cursos', () => {
  // la Caro-Kann y la Eslava ya tienen su lección nueva (C3, tests/e2e/c3-leccion.spec.ts); la de antes sigue en los demás
  // cursos: aquí, "Otras defensas contra 1.e4"
  test('Otras defensas contra 1.e4, la Pirc (la lección de antes): enseña 1.e4, pregunta desde el inicio y tras 1...d6, marca lo incorrecto, Pista, Respuesta y al final la siguiente', async ({ page }, info) => {
    await page.goto(FAVORITAS_PRENDIDAS ? '/#/cursos/todas' : '/#/cursos')
    await expect(page.getByRole('heading', { name: 'Aperturas y defensas' })).toBeVisible()
    await captura(page, info, 't8-cursos')
    await page.getByTestId('tarjeta-otros-1e4:w').locator('a').click()
    await expect(page.getByTestId('variante').first()).toContainText('Defensa Pirc')
    await captura(page, info, 't8-curso-otros-1e4')
    await page.getByTestId('empezar-leccion').click()
    const instr = page.getByTestId('instruccion')
    const aviso = page.getByTestId('aviso-leccion')
    await expect(page.getByTestId('nombre-linea')).toContainText('Defensa Pirc')
    // 1) me la enseña
    await expect(page.getByTestId('fase')).toContainText('Te la enseño')
    await expect(instr).toContainText('Juega 1.e4')
    await captura(page, info, 't8-ensena')
    const linea = ['e2e4', 'd2d4', 'b1c3', 'g1f3', 'f1e2']
    for (const j of linea) {
      await expect(instr).toContainText('Juega', { timeout: 10_000 })
      await jugar(page, info, j)
    }
    // 2) me pregunta: desde el inicio
    await expect(page.getByTestId('fase')).toContainText('Ahora tú', { timeout: 10_000 })
    await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/8\/8\/PPPPPPPP\/RNBQKBNR w/)
    // una equivocada se marca incorrecta y se repite el paso
    await tocar(page, info, 'e2')
    await tocar(page, info, 'e3')
    await expect(aviso).toHaveAttribute('data-resultado', 'incorrecta')
    await expect(aviso).toContainText('Incorrecta')
    await captura(page, info, 't8-incorrecta')
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/8\/8\/PPPPPPPP\/RNBQKBNR w/)
    await jugar(page, info, 'e2e4')
    await expect(aviso).toHaveAttribute('data-resultado', 'correcta')
    // después de 1...d6: Pista (sin decir a dónde) y Respuesta (con la jugada)
    await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /^rnbqkbnr\/ppp1pppp\/3p4\//)
    await page.getByTestId('pista').click()
    await expect(aviso).toHaveAttribute('data-resultado', 'pista')
    await expect(aviso).toContainText('Mueve el peón de d2')
    await expect(aviso).not.toContainText('d4')
    await captura(page, info, 't8-pista')
    await page.getByTestId('respuesta').click()
    await expect(aviso).toHaveAttribute('data-resultado', 'respuesta')
    await expect(aviso).toContainText('2.d4')
    await captura(page, info, 't8-respuesta')
    await jugar(page, info, 'd2d4')
    for (const j of ['b1c3', 'g1f3', 'f1e2']) {
      await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
      await jugar(page, info, j)
    }
    // 3) al terminar: el nombre y la siguiente lección
    const fin = page.getByTestId('fin-leccion')
    await expect(fin).toBeVisible({ timeout: 10_000 })
    await expect(fin).toContainText('Defensa Pirc')
    await expect(page.getByTestId('siguiente-leccion')).toContainText('Siguiente:')
    await captura(page, info, 't8-fin-leccion')
    await page.getByTestId('siguiente-leccion').click()
    await expect(page.getByTestId('fase')).toContainText('Te la enseño')
    // el avance quedó guardado
    await page.goto('/#/curso/' + encodeURIComponent('otros-1e4:w'))
    await expect(page.getByTestId('variante').first()).toContainText('Aprendida')
    await expect(page.getByTestId('avance')).toContainText('1 de 8 variantes aprendidas')
  })
})
