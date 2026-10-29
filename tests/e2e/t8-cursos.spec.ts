import { expect, test } from '@playwright/test'
import { captura, jugar, tocar } from './_util.ts'
import { FAVORITAS_PRENDIDAS } from '../../src/aprender/interruptores.ts'

test.describe('T8 · practicar con cursos', () => {
  test('Caro-Kann, lección del Avance: enseña 1...c6, pregunta tras 1.e4 y 2.d4, marca lo incorrecto, Pista, Respuesta y al final la siguiente', async ({ page }, info) => {
    await page.goto(FAVORITAS_PRENDIDAS ? '/#/cursos/todas' : '/#/cursos/negras')
    await expect(page.getByRole('heading', { name: 'Aperturas y defensas' })).toBeVisible()
    await captura(page, info, 't8-cursos')
    await page.getByTestId('tarjeta-caro-kann:b').locator('a').click()
    await expect(page.getByTestId('variante').first()).toContainText('Variante del Avance')
    await captura(page, info, 't8-curso-caro-kann')
    await page.getByTestId('empezar-leccion').click()
    const instr = page.getByTestId('instruccion')
    const aviso = page.getByTestId('aviso-leccion')
    await expect(page.getByTestId('nombre-linea')).toContainText('Variante del Avance')
    // 1) me la enseña
    await expect(page.getByTestId('fase')).toContainText('Te la enseño')
    await expect(instr).toContainText('Juega 1...c6')
    await captura(page, info, 't8-ensena')
    const linea = ['c7c6', 'd7d5', 'c8f5', 'e7e6']
    for (const j of linea) {
      await expect(instr).toContainText('Juega', { timeout: 10_000 })
      await jugar(page, info, j)
    }
    // 2) me pregunta: después de 1.e4
    await expect(page.getByTestId('fase')).toContainText('Ahora tú', { timeout: 10_000 })
    await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/4P3\//)
    // una equivocada se marca incorrecta y se repite el paso
    await tocar(page, info, 'e7')
    await tocar(page, info, 'e5')
    await expect(aviso).toHaveAttribute('data-resultado', 'incorrecta')
    await expect(aviso).toContainText('Incorrecta')
    await captura(page, info, 't8-incorrecta')
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /^rnbqkbnr\/pppppppp\/8\/8\/4P3\//)
    await jugar(page, info, 'c7c6')
    await expect(aviso).toHaveAttribute('data-resultado', 'correcta')
    // después de 2.d4: Pista (sin decir a dónde) y Respuesta (con la jugada)
    await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
    await expect(page.getByTestId('tablero')).toHaveAttribute('data-fen', /\/3PP3\//)
    await page.getByTestId('pista').click()
    await expect(aviso).toHaveAttribute('data-resultado', 'pista')
    await expect(aviso).toContainText('Mueve el peón de d7')
    await expect(aviso).not.toContainText('d5')
    await captura(page, info, 't8-pista')
    await page.getByTestId('respuesta').click()
    await expect(aviso).toHaveAttribute('data-resultado', 'respuesta')
    await expect(aviso).toContainText('2...d5')
    await captura(page, info, 't8-respuesta')
    await jugar(page, info, 'd7d5')
    for (const j of ['c8f5', 'e7e6']) {
      await expect(instr).toContainText('¿Qué harías?', { timeout: 10_000 })
      await jugar(page, info, j)
    }
    // 3) al terminar: el nombre y la siguiente lección
    const fin = page.getByTestId('fin-leccion')
    await expect(fin).toBeVisible({ timeout: 10_000 })
    await expect(fin).toContainText('Variante del Avance')
    await expect(page.getByTestId('siguiente-leccion')).toContainText('Siguiente:')
    await captura(page, info, 't8-fin-leccion')
    await page.getByTestId('siguiente-leccion').click()
    await expect(page.getByTestId('fase')).toContainText('Te la enseño')
    // el avance quedó guardado
    await page.goto('/#/curso/' + encodeURIComponent('caro-kann:b'))
    await expect(page.getByTestId('variante').first()).toContainText('Aprendida')
    await expect(page.getByTestId('avance')).toContainText('1 de 22 variantes aprendidas')
  })
})
