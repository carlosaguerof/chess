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
