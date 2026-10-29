import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import type { Base } from '../../src/base/tipos.ts'
import { lineaDeVariante, repertorioInicial } from '../../src/repertorio/modelo.ts'
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

  it('si mi repertorio no tiene nada, salen de la base (solo de mis cursos); si la base tampoco, el aviso de fuera de teoría', () => {
    // sin la Caro-Kann en el repertorio, la base da la jugada de mi curso de la Caro-Kann
    const sinCaroKann = { base, rep: { version: 1 as const, lineas: rep.lineas.filter((l) => l.apertura !== 'caro-kann') }, color: 'b' as const }
    const b = ayudaEnMiTurno(sinCaroKann, ['e4', 'c6', 'd4'])
    expect(b.origen).toBe('base')
    expect(b.san).toBe('d5')
    expect(b.respuesta).not.toContain('(de la base)') // §3.3: sin etiquetas de origen (L5, pase 2)
    // la Siciliana con negras está apagada (populares de la base): ya no da jugadas, aunque la nombra
    const s = ayudaEnMiTurno(negras, ['e4', 'c5', 'Nf3'])
    expect(s.origen).toBe('fuera')
    expect(nombreDeApertura(base, ['e4', 'c5', 'Nf3'])?.apertura).toBe('Defensa Siciliana')
    const f = ayudaEnMiTurno(negras, ['a3', 'h5', 'h3'])
    expect(f.origen).toBe('fuera')
    expect(f.pista).toContain('Fuera de teoría')
    expect(f.pista).not.toContain('Tu guía') // desde la Nota 1 la guía no se cita (L5, pase 2)
  })

  it('"Que juegue mis líneas": el bot escoge entre las jugadas del rival de mi árbol', () => {
    const azar = azarConSemilla(4)
    for (let i = 0; i < 20; i++) expect(['e5', 'c5', 'c6', 'e6', 'd5', 'g6', 'Nf6', 'd6', 'Nc6', 'b6', 'a6', 'h6']).toContain(jugadaDeMisLineas(rep, 'w', ['e4'], azar))
    expect(jugadaDeMisLineas(rep, 'w', [], azar)).toBeNull() // me toca a mí
    expect(jugadaDeMisLineas(rep, 'b', ['e4', 'c6'], azar)).toMatch(/^(d4|Nc3|Nf3|c4|d3|Bc4)$/)
  })

  it('pase 1: si mi línea termina en la jugada del rival, la ayuda da su plan (no "fuera de teoría")', () => {
    const a = ayudaEnMiTurno(blancas, ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'd6'])
    expect(a.origen).toBe('fin-de-linea')
    expect(a.respuesta).toContain('termina aquí')
    expect(a.respuesta).toContain('Defensa París')
  })

  it('pase 1: "Que juegue mis líneas" evita las respuestas donde mi línea se acaba', () => {
    const azar = azarConSemilla(7)
    const vistas = new Set<string>()
    for (let i = 0; i < 300; i++) vistas.add(jugadaDeMisLineas(rep, 'w', ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4'], azar)!)
    for (const callejon of ['d6', 'h6', 'Nd4', 'f5']) expect(vistas.has(callejon), callejon).toBe(false)
    expect(vistas.has('Bc5') && vistas.has('Nf6')).toBe(true)
  })

  it('pase 1: la Pista no dice la jugada aunque el nombre de la variante la traiga entre paréntesis', () => {
    // la Escandinava con negras está apagada: el caso se prueba con la base completa como repertorio de negras
    const escandinava = { base, rep: { version: 1 as const, lineas: base.aperturas.find((x) => x.id === 'escandinava')!.variantes.map((v) => lineaDeVariante(v, 'b', 'escandinava', 'ambos')) }, color: 'b' as const }
    const a = ayudaEnMiTurno(escandinava, ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3'])
    expect(a.origen).toBe('repertorio')
    expect(a.pista).not.toMatch(/a5|d6|d8/)
    // y ya no la sugiere la base con mi repertorio de siempre
    expect(ayudaEnMiTurno(negras, ['e4', 'd5', 'exd5', 'Qxd5', 'Nc3']).origen).toBe('fuera')
  })

  it('pase 2: reconoce la misma posición por otro orden de jugadas (transposición)', () => {
    const m = mensajeTrasMiJugada(negras, ['e4', 'c6', 'd4', 'd5', 'Nc3', 'dxe4', 'Nxe4', 'Bf5'])
    expect(m.tipo).toBe('en-linea')
    expect(m.texto).toContain('4...Af5')
    const eslava = mensajeTrasMiJugada(negras, ['c4', 'c6', 'd4', 'd5'])
    expect(eslava.tipo).toBe('en-linea')
    expect(ayudaEnMiTurno(negras, ['c4', 'c6', 'd4', 'd5', 'Nc3']).origen).toBe('repertorio')
  })

  it('pase 2: la Pista de una línea que termina no dice jugadas; la Respuesta da el plan completo', () => {
    const a = ayudaEnMiTurno(negras, ['d4', 'd5', 'c4', 'c6', 'e4'])
    expect(a.origen).toBe('fin-de-linea')
    expect(a.pista).not.toMatch(/\d+\.{1,3}\s?[RDTAC]?[a-h]?x?[a-h][1-8]/)
    expect(a.respuesta).toContain('termina aquí')
  })

  describe('el resumen al final, en sus tres casos', () => {
    it('nombra la familia si la partida no llegó a una subvariante (pase 1)', () => {
      const r = resumenDePartida(rep, 'b', ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5'])
      expect(r.texto).toContain('(Variante del Avance)')
      expect(r.texto).not.toContain('Short')
    })
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
      // la Tal completa, como la trae la base desde el curso piloto (C4): 4...h5 5.Ad3 Axd3 6.Dxd3 e6, y la partida sigue
      const r = resumenDePartida(rep, 'b', ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'h4', 'h5', 'Bd3', 'Bxd3', 'Qxd3', 'e6', 'Nf3'])
      expect(r.caso).toBe('completa')
      expect(r.texto).toContain('Seguiste tu línea completa')
    })
  })
})
