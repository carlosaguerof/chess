import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { PERSONAJES } from '../../src/bots/personajes.ts'
import { candidatasDeLibro } from '../../src/bots/libros.ts'
import { lineasDeLibro } from '../../src/bots/fuente-libros.ts'
import { jugadasDeLibro, PERDIDA_MAXIMA_LIBRO, PROFUNDIDAD } from '../../scripts/validar-libros.ts'
import { claveValidacion } from '../../scripts/construir-base.ts'

const zona = PERSONAJES.filter((p) => p.elo >= 500 && p.elo <= 1000)
const juega = (color: 'w' | 'b', historia: string[]) => new Set(zona.flatMap((p) => candidatasDeLibro(p, color, lineasDeLibro)(historia)))

describe('T13 · los 47 personajes y sus libros', () => {
  it('ninguna jugada de libro pierde más de 2 peones a profundidad 16', () => {
    const v = JSON.parse(readFileSync('conocimiento/validacion-libros.json', 'utf8')) as Record<string, { perdida: number; profundidad: number }>
    const todas = jugadasDeLibro()
    expect(todas.length).toBeGreaterThan(300)
    for (const j of todas) {
      const r = v[claveValidacion(j.fen, j.uci)]
      expect(r, `${j.san} sin validar`).toBeDefined()
      expect(r!.profundidad).toBe(PROFUNDIDAD)
      expect(r!.perdida, `${j.san} (${j.quien.join(', ')})`).toBeLessThanOrEqual(PERDIDA_MAXIMA_LIBRO)
    }
  })

  it('con blancas: 1...e5, c5, c6, e6 y d5 los juega al menos un personaje de 500 a 1000', () => {
    const r = juega('b', ['e4'])
    for (const m of ['e5', 'c5', 'c6', 'e6', 'd5']) expect(r.has(m), m).toBe(true)
  })

  it('con negras: 1.e4 con las 4 variantes de la Caro-Kann, 1.d4 con 2.c4, y 1.c4, 1.Cf3, 1.b3', () => {
    expect(juega('w', []).has('e4')).toBe(true)
    const tercera = juega('w', ['e4', 'c6', 'd4', 'd5'])
    expect(tercera.has('e5')).toBe(true) // Avance
    expect(tercera.has('Nd2') || tercera.has('Nc3')).toBe(true) // Clásica
    expect(tercera.has('exd5')).toBe(true) // Cambio
    expect(juega('w', ['e4', 'c6']).has('Nc3')).toBe(true) // Dos Caballos
    expect(juega('w', ['d4', 'd5']).has('c4')).toBe(true)
    for (const m of ['c4', 'Nf3', 'b3']) expect(juega('w', []).has(m), m).toBe(true)
  })

  it('los tres de 700 abren y se defienden distinto', () => {
    const tres = PERSONAJES.filter((p) => p.elo === 700)
    expect(tres).toHaveLength(3)
    const abre = tres.map((p) => [...new Set(candidatasDeLibro(p, 'w', lineasDeLibro)([]))].sort().join(','))
    const contraE4 = tres.map((p) => [...new Set(candidatasDeLibro(p, 'b', lineasDeLibro)(['e4']))].sort().join(','))
    const contraD4 = tres.map((p) => [...new Set(candidatasDeLibro(p, 'b', lineasDeLibro)(['d4']))].sort().join(','))
    expect(new Set(abre).size).toBe(3)
    expect(new Set(contraE4).size).toBe(3)
    expect(abre.every((a) => a.length > 0) && contraE4.every((a) => a.length > 0)).toBe(true)
    expect(contraD4.every((a) => a.length > 0)).toBe(true)
  })
})

describe('T13 · con las opciones por defecto ("Que juegue mis líneas" prendido), los tres de 700 siguen distintos (pase 3 de la T22)', () => {
  it('por el camino de la app (jugadaDelBot), cada uno abre y contesta 1.e4 con su libro dentro de mi árbol', async () => {
    const { Chess } = await import('chess.js')
    const { jugadaDelBot } = await import('../../src/motor/bot.ts')
    const { libroDe } = await import('../../src/bots/libros.ts')
    const { jugadaDeMisLineas } = await import('../../src/guia/guia.ts')
    const { repertorioInicial } = await import('../../src/repertorio/modelo.ts')
    const { OPCIONES_POR_DEFECTO } = await import('../../src/partida/modelo.ts')
    const { azarConSemilla } = await import('../../src/motor/elegir.ts')
    expect(OPCIONES_POR_DEFECTO.misLineas).toBe(true)
    const base = JSON.parse(readFileSync('conocimiento/base.json', 'utf8'))
    const rep = repertorioInicial(base)
    const sinMotor = () => Promise.reject(new Error('no debía llegar al motor'))
    const juega = async (p: (typeof PERSONAJES)[number], colorBot: 'w' | 'b', historia: string[]) => {
      const c = new Chess()
      for (const s of historia) c.move(s)
      const humano = colorBot === 'w' ? 'b' : 'w'
      const azar = azarConSemilla(7)
      const vistas = new Set<string>()
      for (let i = 0; i < 40; i++) {
        const j = await jugadaDelBot(c, { elo: p.elo, modo: 'debil', nodos: 1, multipv: 1, errorGrande: 0, temperatura: 1 }, sinMotor, {
          misLineas: (h, a, pref) => jugadaDeMisLineas(rep, humano, h, a, pref),
          libro: libroDe(p, colorBot, lineasDeLibro),
          delLibro: candidatasDeLibro(p, colorBot, lineasDeLibro),
        }, azar)
        vistas.add(c.move({ from: j!.uci.slice(0, 2), to: j!.uci.slice(2, 4) }).san)
        c.undo()
      }
      return [...vistas].sort().join(',')
    }
    const tres = PERSONAJES.filter((p) => p.elo === 700)
    const abre = await Promise.all(tres.map((p) => juega(p, 'w', [])))
    const contraE4 = await Promise.all(tres.map((p) => juega(p, 'b', ['e4'])))
    expect(new Set(abre).size).toBe(3)
    expect(new Set(contraE4).size).toBe(3)
    for (const [p, a] of tres.map((p, i) => [p, abre[i]!] as const)) expect(new Set(candidatasDeLibro(p, 'w', lineasDeLibro)([])).has(a), `${p.nombre} abre ${a}`).toBe(true)
  })
})
