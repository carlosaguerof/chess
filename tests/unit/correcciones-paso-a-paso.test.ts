import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { CURSOS_NUEVOS, jugadasDeVariante } from '../../src/curso/datos.ts'
import { fotosDePasos, mover } from '../../src/curso/pasos.ts'
import { sanAEspanol } from '../../src/ajedrez/notacion.ts'
import { palabras } from '../../src/curso/textos.ts'
import type { PasoAPaso } from '../../src/curso/tipos.ts'

/**
 * Correcciones de la Caro-Kann, C3 (puntos 2 y 3 del feedback): "Ver paso a paso" en La idea, La estructura, el plan y
 * el repaso. La prueba sobre los datos: cada paso es una frase, y cada paso que habla de una jugada trae esa jugada.
 */
const c = CURSOS_NUEVOS['caro-kann:b']!

/** Todos los paso a paso del curso, con su salida. */
const TODOS: { nombre: string; pa: PasoAPaso; inicio: string[] }[] = [
  ...(['idea', 'estructura', 'repaso'] as const).flatMap((pieza) => c.piezas[pieza].paginas.map((p, i) => ({ nombre: `${pieza} ${i + 1}`, pa: p.pasoAPaso!, inicio: [] }))),
  ...c.variantes.map((v) => ({ nombre: `plan ${v.id}`, pa: v.plan.pasoAPaso!, inicio: jugadasDeVariante(c, v) })),
]

// una jugada numerada en la notación de las guías: "1.e4", "3...Af5", "7.Db3", "3.exd5"
const NUMERADA = /(\d+)\.(\.\.)?((?:[RDTAC][a-h]?[1-8]?x?[a-h][1-8])|(?:[a-h]x[a-h][1-8])|(?:[a-h][1-8])|(?:0-0(?:-0)?))/g
const sinJaque = (san: string) => sanAEspanol(san).replace(/[+#]$/, '')
/** La jugada aparece escrita en la frase, como palabra suelta ("Cge7", "...c5", "0-0"). */
const escrita = (frase: string, sanEs: string) => new RegExp(`(^|[^A-Za-zÁÉÍÓÚáéíóúñ0-9-])${sanEs.replace(/[+]/g, '\\+')}(?![A-Za-z0-9-])`).test(frase)

describe('Correcciones · C3 · los datos del paso a paso', () => {
  it('La idea, las dos páginas de La estructura, las dos del Repaso y los 16 planes traen su paso a paso', () => {
    expect(TODOS).toHaveLength(1 + 2 + 2 + 16)
    for (const t of TODOS) expect(t.pa?.pasos.length ?? 0, t.nombre).toBeGreaterThanOrEqual(3)
  })

  it('cada jugada es legal; solo un plan o una estructura (ilustrativo) mueve dos veces seguidas el mismo color', () => {
    for (const t of TODOS) {
      expect(() => fotosDePasos(t.pa, t.inicio), t.nombre).not.toThrow()
      if (!t.pa.ilustrativo) expect(() => fotosDePasos({ ...t.pa, ilustrativo: false }, t.inicio), t.nombre).not.toThrow()
    }
    // "...": la jugada es de negras; en un ilustrativo se les da el turno, y fuera de él, no
    expect(mover(new Chess(), '...e5', true).color).toBe('b')
    expect(() => mover(new Chess(), '...e5')).toThrow()
    // sin "...", en un ilustrativo es de blancas: Ad6 del alfil blanco, no del negro (el plan del Cambio)
    const ch = new Chess('r3kb1r/pp1q1ppp/2n1pn2/3p4/3P1Bb1/1QPB4/PP3PPP/RN2K1NR b KQkq - 0 9')
    expect(mover(new Chess(ch.fen()), '...Bd6', true).from).toBe('f8')
    expect(mover(new Chess(ch.fen()), 'Bd6', true).from).toBe('f4')
  })

  it('cada paso que habla de una jugada trae esa jugada: lo numerado en la frase se juega en ese paso, con su número', () => {
    for (const t of TODOS)
      t.pa.pasos.forEach((p, i) => {
        const fotos = fotosDePasos(t.pa, t.inicio)
        const hechas = fotos[i]!.hechas.map((m) => ({ es: sinJaque(m.san), num: Number(m.before.split(' ')[5]), color: m.color }))
        for (const [, num, puntos, jugada] of p.frase.matchAll(NUMERADA)) {
          const color = puntos ? 'b' : 'w'
          const ok = hechas.some((h) => h.es === jugada && h.num === Number(num) && h.color === color)
          expect(ok, `${t.nombre}, paso ${i + 1}: "${num}.${puntos ?? ''}${jugada}" se juega en ese paso`).toBe(true)
        }
        // en un plan o una estructura no hay números de jugada: las jugadas no siguen una partida
        if (t.pa.ilustrativo) expect(p.frase, `${t.nombre}, paso ${i + 1}`).not.toMatch(NUMERADA)
      })
  })

  it('y al revés: cada jugada que hace el tablero está escrita en su frase', () => {
    for (const t of TODOS) {
      const fotos = fotosDePasos(t.pa, t.inicio)
      t.pa.pasos.forEach((p, i) => {
        for (const m of fotos[i]!.hechas) expect(escrita(p.frase, sinJaque(m.san)), `${t.nombre}, paso ${i + 1}: "${sinJaque(m.san)}" en "${p.frase}"`).toBe(true)
      })
    }
  })

  it('el tablero cambia en cada paso que juega, y no cambia en el que solo explica', () => {
    for (const t of TODOS) {
      const fotos = fotosDePasos(t.pa, t.inicio)
      t.pa.pasos.forEach((p, i) => expect(fotos[i]!.cambia, `${t.nombre}, paso ${i + 1}`).toBe(!!(p.jugadas?.length || p.reinicio)))
    }
  })

  it('cada paso es una frase corta, en la notación de las guías, sin símbolos de evaluación', () => {
    for (const t of TODOS) {
      const vistas = new Set<string>()
      t.pa.pasos.forEach((p, i) => {
        const donde = `${t.nombre}, paso ${i + 1}`
        expect(palabras(p.frase), donde).toBeLessThanOrEqual(30)
        expect(p.frase, donde).not.toMatch(/[!?±]/)
        // las piezas, en R D T A C (nunca la letra inglesa)
        expect(p.frase, donde).not.toMatch(/(^|[^A-Za-z])[NBQK][a-h]?[1-8]?x?[a-h][1-8]/)
        expect(vistas.has(p.frase), `${donde}: frase repetida`).toBe(false)
        vistas.add(p.frase)
      })
    }
  })

  it('La idea arranca de la posición inicial y llega a la del tablero de la página (1.e4 c6 2.d4 d5)', () => {
    const fotos = fotosDePasos(c.piezas.idea.paginas[0]!.pasoAPaso!)
    const pagina = new Chess()
    for (const s of c.piezas.idea.paginas[0]!.tablero!.jugadas!) pagina.move(s)
    expect(fotos[3]!.fen).toBe(pagina.fen())
  })
})
