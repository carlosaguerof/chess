import { describe, expect, it } from 'vitest'
import { mostrarSan, mostrarTexto } from '../../src/ajedrez/mostrar.ts'

/** C2: las jugadas se ven en figuras (de entrada) o en letras en inglés; nunca las dos juntas. */
describe('C2: mostrar las jugadas', () => {
  it('una jugada de chess.js, en figuras y en letras', () => {
    expect(mostrarSan('Nf3', 'figuras')).toBe('♘f3')
    expect(mostrarSan('Bxc4', 'figuras')).toBe('♗xc4')
    expect(mostrarSan('Qxd5+', 'figuras')).toBe('♕xd5+')
    expect(mostrarSan('Rxe1', 'figuras')).toBe('♖xe1')
    expect(mostrarSan('Kb1', 'figuras')).toBe('♔b1')
    expect(mostrarSan('O-O', 'figuras')).toBe('0-0')
    expect(mostrarSan('O-O-O', 'figuras')).toBe('0-0-0')
    expect(mostrarSan('e8=Q+', 'figuras')).toBe('e8=♕+')
    expect(mostrarSan('exd5', 'figuras')).toBe('exd5')
    expect(mostrarSan('Nf3', 'letras')).toBe('Nf3')
    expect(mostrarSan('O-O', 'letras')).toBe('O-O')
  })

  it('un texto en la notación de mis guías (R D T A C) pasa entero', () => {
    const t = '1.e4 c6 2.d4 d5 3.e5 Af5 4.Cf3 e6 5.Ae2 c5 6.0-0 Cc6; si Db3, ...Dd7, nunca ...Dc7 (Txe1, Cbd7, C1f3, Rxd8, e8=D).'
    expect(mostrarTexto(t, 'figuras')).toBe('1.e4 c6 2.d4 d5 3.e5 ♗f5 4.♘f3 e6 5.♗e2 c5 6.0-0 ♘c6; si ♕b3, ...♕d7, nunca ...♕c7 (♖xe1, ♘bd7, ♘1f3, ♔xd8, e8=♕).')
    expect(mostrarTexto(t, 'letras')).toBe('1.e4 c6 2.d4 d5 3.e5 Bf5 4.Nf3 e6 5.Be2 c5 6.O-O Nc6; si Qb3, ...Qd7, nunca ...Qc7 (Rxe1, Nbd7, N1f3, Kxd8, e8=Q).')
  })

  it('las palabras no se tocan', () => {
    const t = 'Caro-Kann, Réti, Defensa, Torre de Ataque, Alapin, Dos Caballos, R D T A C, el alfil de c8, la casilla d5, Carlsbad, 0-0-0 y 1-0.'
    expect(mostrarTexto(t, 'figuras')).toBe(t)
    expect(mostrarTexto(t, 'letras')).toBe(t.replace('0-0-0', 'O-O-O'))
  })

  it('nunca las dos juntas: en figuras no queda ninguna letra de pieza, en letras ninguna figura', () => {
    const t = 'Variante del Avance: Short (4.c3 y 5.Ae2): Cf3, Ae2, 0-0 y Te1; luego Dd2.'
    expect(mostrarTexto(t, 'figuras')).not.toMatch(/\b[RDTACKQBN][a-h]?[1-8]?x?[a-h][1-8]/)
    expect(mostrarTexto(t, 'letras')).not.toMatch(/[♔♕♖♗♘]/)
  })
})
