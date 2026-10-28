import { expect, test, type Page, type TestInfo } from '@playwright/test'
import { Chess } from 'chess.js'
import { BASE } from '../../src/base/base.ts'
import { repertorioInicial } from '../../src/repertorio/modelo.ts'
import { cursosDe, type Leccion } from '../../src/cursos/modelo.ts'
import { captura, jugar, tocar } from './_util.ts'

const curso = cursosDe(BASE, repertorioInicial(BASE)).find((c) => c.id === 'caro-kann:b')!
const [A, B] = [curso.lecciones[0]!, curso.lecciones[1]!]
const HOY = new Date('2026-11-02T10:00:00')
const MANANA = new Date('2026-11-03T10:00:00')

const uci = (jugadas: string[], ply: number) => {
  const c = new Chess()
  for (const s of jugadas.slice(0, ply)) c.move(s)
  const m = c.move(jugadas[ply]!)
  return m.from + m.to + (m.promotion ?? '')
}

/** Contesta la lección del repaso; si `fallar`, primero juega una jugada que no es (en su primer paso). */
async function contestar(page: Page, info: TestInfo, l: Leccion, fallar = false) {
  for (let ply = 0; ply < l.jugadas.length; ply++) {
    if ((ply % 2 === 0 ? 'w' : 'b') !== l.color) continue
    await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(ply, { timeout: 10_000 })
    await expect(page.getByTestId('instruccion')).toContainText('¿Qué harías?')
    if (fallar && ply === 1) {
      // la lección no acepta la jugada: el tablero no cambia, solo el aviso
      await tocar(page, info, 'a7')
      await tocar(page, info, 'a6')
      await expect(page.getByTestId('aviso-leccion')).toHaveAttribute('data-resultado', 'incorrecta')
    }
    await jugar(page, info, uci(l.jugadas, ply))
  }
  await expect(page.getByTestId('fin-repaso')).toBeVisible({ timeout: 10_000 })
}

test('R7 · el repaso de hoy: la que contesto bien sale de la lista; un día después vuelve la que fallé', async ({ page }, info) => {
  test.setTimeout(120_000)
  await page.clock.setFixedTime(HOY)
  await page.goto('/')
  // dos líneas de la Caro-Kann que aprendí ayer
  const ayer = HOY.getTime() - 86_400_000
  await page.evaluate(([a, b, f]) => localStorage.setItem('ajedrez.v1.progreso', JSON.stringify({ [a]: { fecha: f }, [b]: { fecha: f } })), [A.id, B.id, ayer] as const)
  await page.reload()
  const tarjeta = page.getByTestId('repaso-hoy')
  await expect(tarjeta).toHaveAttribute('data-n', '2')
  await expect(tarjeta).toContainText(/Repaso de hoy: 2 líneas, unos \d+ minutos?/)
  await captura(page, info, 'r7-inicio')
  await tarjeta.click()
  // A: completa y sin ayuda → vuelve en 3 días
  await expect(page.getByTestId('nombre-linea')).toHaveText(A.nombre)
  await expect(page.getByTestId('fase')).toContainText('Ahora tú') // sin la parte de enseñar
  await contestar(page, info, A)
  await expect(page.getByTestId('cuando-vuelve')).toContainText('vuelve en 3 días')
  await page.getByTestId('siguiente-repaso').click()
  // B: con un error → vuelve mañana
  await expect(page.getByTestId('nombre-linea')).toHaveText(B.nombre)
  await contestar(page, info, B, true)
  await expect(page.getByTestId('cuando-vuelve')).toContainText('vuelve mañana')
  await captura(page, info, 'r7-fin-linea')
  await page.getByTestId('siguiente-repaso').click()
  await expect(page.getByTestId('listo-por-hoy')).toContainText('Listo por hoy')
  await expect(page.getByTestId('manana')).toContainText('Mañana toca 1 línea')
  await captura(page, info, 'r7-listo')
  // en el inicio, ya no queda nada para hoy
  await page.goto('/')
  await expect(page.getByTestId('repaso-hoy')).toHaveAttribute('data-n', '0')
  // adelanto el reloj un día: vuelve solo la que fallé
  await page.clock.setFixedTime(MANANA)
  await page.reload()
  await expect(page.getByTestId('repaso-hoy')).toHaveAttribute('data-n', '1')
  await page.getByTestId('repaso-hoy').click()
  await expect(page.getByTestId('nombre-linea')).toHaveText(B.nombre)
})

test('R7 · el interruptor quita el repaso del inicio y se recuerda al recargar; Refuerza sigue igual', async ({ page }) => {
  await page.clock.setFixedTime(HOY)
  await page.goto('/')
  await page.evaluate(([a, f]) => localStorage.setItem('ajedrez.v1.progreso', JSON.stringify({ [a]: { fecha: f } })), [A.id, HOY.getTime() - 86_400_000] as const)
  await page.reload()
  await expect(page.getByTestId('repaso-hoy')).toBeVisible()
  await page.goto('/#/ajustes')
  await expect(page.getByTestId('ajuste-repaso')).toBeChecked() // prendido por defecto
  await page.getByTestId('ajuste-repaso').uncheck({ force: true })
  await page.goto('/')
  await expect(page.getByTestId('jugar-recomendado')).toBeVisible()
  await expect(page.getByTestId('repaso-hoy')).toHaveCount(0)
  await expect(page.getByTestId('ir-refuerza')).toBeVisible()
  await page.reload()
  await expect(page.getByTestId('jugar-recomendado')).toBeVisible()
  await expect(page.getByTestId('repaso-hoy')).toHaveCount(0)
  await page.goto('/#/ajustes')
  await expect(page.getByTestId('ajuste-repaso')).not.toBeChecked()
})
