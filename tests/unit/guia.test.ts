import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import type { Base } from '../../src/base/tipos.ts'
import { repertorioInicial } from '../../src/repertorio/modelo.ts'
import { ayudaEnMiTurno, jugadaDeMisLineas, mensajeTrasMiJugada, nombreDeApertura, resumenDePartida, type Contexto } from '../../src/guia/guia.ts'
import { claveValidacion } from '../../scripts/construir-base.ts'
import { azarConSemilla } from '../../src/motor/elegir.ts'

const base = JSON.parse(readFileSync('conocimiento/base.json', 'utf8')) as Base
const validacion = JSON.parse(readFileSync('conocimiento/validacion-motor.json', 'utf8')) as Record<string, { mejor: string }>
const rep = repertorioInicial(base)
const blancas: Contexto = { base, rep, color: 'w' }
const negras: Contexto = { base, rep, color: 'b' }

describe('T9 · la guía en una partida real', () => {
  it('dice el nombre de la apertura en cuanto se puede saber', () => {
    expect(mensajeTrasMiJugada(blancas, ['e4']).texto).toContain('Iniciaste con 1.e4')
    const m = mensajeTrasMiJugada(negras, ['e4', 'c6'])
    expect(m.tipo).toBe('en-linea')
    expect(m.texto).toContain('Estás en la Defensa Caro-Kann')
    expect(nombreDeApertura(base, ['e4'])).toBeNull()
    expect(nombreDeApertura(base, ['d4', 'd5', 'c4', 'c6'])?.apertura).toBe('Defensa Eslava')
  })

  it('"contestaste con X; otra opción era Y" cuando hay variantes hermanas en mi repertorio (en R D T A C)', () => {
    const m = mensajeTrasMiJugada(blancas, ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'c3'])
    expect(m.tipo).toBe('en-linea')
    expect(m.texto).toContain('Contestaste con 4.c3')
    expect(m.texto).toContain('otra opción era')
    expect(m.texto).toContain('4.d3')
    const k = mensajeTrasMiJugada(negras, ['e4', 'c6', 'd4', 'd5', 'Nd2', 'dxe4', 'Nxe4', 'Nd7'])
    expect(k.texto).toContain('Contestaste con 4...Cd7')
    expect(k.texto).toContain('4...Af5')
  })

  it('"te desviaste" con mi jugada y la de mi línea', () => {
    const m = mensajeTrasMiJugada(negras, ['e4', 'c6', 'd4', 'd5', 'e5', 'e6'])
    expect(m.tipo).toBe('desvio')
    expect(m.texto).toContain('Te desviaste de la Defensa Caro-Kann')
    expect(m.texto).toContain('jugaste 3...e6')
    expect(m.texto).toContain('tu línea dice 3...Af5')
    expect(m.desvio).toEqual({ jugue: 'e6', linea: 'Bf5' })
  })

  it('Pista y Respuesta salen de mi repertorio, no del motor (aunque el motor prefiera otra)', () => {
    const a = ayudaEnMiTurno(negras, ['e4'])
    expect(a.origen).toBe('repertorio')
    expect(a.san).toBe('c6')
    expect(a.respuesta).toContain('1...c6')
    expect(a.pista).not.toContain('c6')
    // el motor, a profundidad 18, prefiere 1...e5 en esa posición
    const fen = new Chess()
    fen.move('e4')
    expect(validacion[claveValidacion(fen.fen(), 'c7c6')]!.mejor).toBe('e7e5')
  })

  it('si mi repertorio no tiene nada, salen de la base; si la base tampoco, el aviso de fuera de teoría', () => {
    const b = ayudaEnMiTurno(negras, ['e4', 'c5', 'Nf3'])
    expect(b.origen).toBe('base')
    expect(['d6', 'Nc6', 'e6', 'g6']).toContain(b.san)
    expect(b.respuesta).toContain('(de la base)')
    const f = ayudaEnMiTurno(negras, ['a3', 'h5', 'h3'])
    expect(f.origen).toBe('fuera')
    expect(f.pista).toContain('Fuera de teoría')
    expect(f.pista).toContain('...c6 + ...d5')
  })

  it('"Que juegue mis líneas": el bot escoge entre las jugadas del rival de mi árbol', () => {
    const azar = azarConSemilla(4)
    for (let i = 0; i < 20; i++) expect(['e5', 'c5', 'c6', 'e6', 'd5', 'g6', 'Nf6', 'd6', 'Nc6', 'b6', 'a6', 'h6']).toContain(jugadaDeMisLineas(rep, 'w', ['e4'], azar))
    expect(jugadaDeMisLineas(rep, 'w', [], azar)).toBeNull() // me toca a mí
    expect(jugadaDeMisLineas(rep, 'b', ['e4', 'c6'], azar)).toMatch(/^(d4|Nc3|c4|d3|Bc4)$/)
  })

  describe('el resumen al final, en sus tres casos', () => {
    it('me salí yo', () => {
      const r = resumenDePartida(rep, 'b', ['e4', 'c6', 'd4', 'd5', 'e5', 'e6', 'c4'])
      expect(r.caso).toBe('me-sali')
      expect(r.hastaPly).toBe(4)
      expect(r.texto).toContain('En 3...e6 te saliste tú')
      expect(r.texto).toContain('3...Af5')
    })
    it('se salió el rival', () => {
      const r = resumenDePartida(rep, 'b', ['e4', 'c6', 'd4', 'd5', 'Bd3', 'dxe4'])
      expect(r.caso).toBe('se-salio-rival')
      expect(r.texto).toContain('En 3.Ad3 se salió el rival')
    })
    it('seguí mi línea completa', () => {
      const r = resumenDePartida(rep, 'b', ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'h4', 'h5', 'Bd3'])
      expect(r.caso).toBe('completa')
      expect(r.texto).toContain('Seguiste tu línea completa')
    })
  })
})
