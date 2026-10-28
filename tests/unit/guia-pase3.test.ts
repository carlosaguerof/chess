import { describe, expect, it } from 'vitest'
import base from '../../conocimiento/base.json'
import type { Base } from '../../src/base/tipos.ts'
import { repertorioInicial } from '../../src/repertorio/modelo.ts'
import { mensajeTrasMiJugada, resumenDePartida, ayudaEnMiTurno, nombreDeApertura, type Contexto } from '../../src/guia/guia.ts'

const b = base as unknown as Base
const rep = repertorioInicial(b)
const blancas: Contexto = { base: b, rep, color: 'w' }
const negras: Contexto = { base: b, rep, color: 'b' }

describe('T11 pase 3', () => {
  it('H1: llegar a mi repertorio por otro orden no es desvío (Italiana 5.c3 y 7.Cbd2)', () => {
    const h = ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4', 'Bc5', 'd3', 'Nf6', 'c3']
    const m = mensajeTrasMiJugada(blancas, h)
    expect(m.tipo).toBe('en-linea')
    expect(m.desvio).toBeUndefined()
  })
  it('H1: el resumen no culpa al rival en una transposición (Caro-Kann 2.Cc3 d5 3.d4)', () => {
    const h = ['e4', 'c6', 'Nc3', 'd5', 'd4', 'dxe4', 'Nxe4', 'Bf5']
    const r = resumenDePartida(rep, 'b', h)
    expect(r.caso).not.toBe('se-salio-rival')
    expect(r.texto).not.toContain('se salió el rival')
  })
  it('H1: una salida de verdad sigue siendo salida', () => {
    const r = resumenDePartida(rep, 'b', ['e4', 'c6', 'd4', 'd5', 'e5', 'e6'])
    expect(r.caso).toBe('me-sali')
  })
  it('H2: la Respuesta y el resumen traen el nombre en inglés y el ECO', () => {
    const a = ayudaEnMiTurno(negras, ['e4'])
    expect(a.ingles).toMatch(/Caro-Kann Defense.*· B1\d/)
    const r = resumenDePartida(rep, 'b', ['e4', 'c6', 'd4', 'd5', 'e5', 'e6'])
    expect(r.ingles).toMatch(/Caro-Kann Defense/)
    const d = mensajeTrasMiJugada(negras, ['e4', 'c6', 'd4', 'd5', 'e5', 'e6'])
    expect(d.tipo).toBe('desvio')
    expect(d.ingles).toMatch(/Caro-Kann Defense/)
  })
  it('H3: en las "otras", el nombre es la familia y se sabe en cuanto se puede', () => {
    expect(nombreDeApertura(b, ['e4', 'Nf6'])?.apertura).toBe('Defensa Alekhine')
    expect(nombreDeApertura(b, ['c4'])?.apertura).toBe('Apertura Inglesa (1.c4)')
    expect(nombreDeApertura(b, ['c4', 'c6'])?.apertura).toBe('Apertura Inglesa (1.c4)')
    const m = mensajeTrasMiJugada(negras, ['c4', 'c6'])
    expect(m.texto).not.toContain('Otras aperturas')
    expect(m.texto).not.toContain('Otras defensas')
  })
  it('H4: el texto de mi guía sobre "otras" solo sale cuando el rival salió al inicio', () => {
    const dentro = ayudaEnMiTurno(negras, ['e4', 'c6', 'd4', 'd5', 'exd5', 'cxd5', 'Nf3'])
    if (dentro.origen === 'fuera') expect(dentro.pista).not.toContain('Tu guía dice')
    const fuera = ayudaEnMiTurno(negras, ['a3'])
    expect(fuera.origen).toBe('fuera')
    expect(fuera.pista).toContain('Tu guía dice')
  })
  it('H5: el plan de la Londres con ...c5 y ...Cc6 ya no pide f4 con el alfil en f4', () => {
    const v = b.aperturas.find((a) => a.id === 'londres')!.variantes.find((x) => x.id === 'd5-c5-cc6')!
    expect(v.plan).toContain('si el alfil pasa a g3, f4')
  })
})
