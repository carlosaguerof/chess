import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { CONTROLES, alJugar, arrancar, controlPorId, finPorTiempo, formato, nuevoReloj, pausar, restante, seAcabo } from '../../src/reloj/reloj.ts'
import { estrellas, conEstrellas, SIN_AYUDAS } from '../../src/estrellas/estrellas.ts'

describe('T14 · reloj', () => {
  it('los controles, en tres grupos de 3, más "Sin tiempo"', () => {
    expect(CONTROLES.filter((c) => c.grupo === 'bullet').map((c) => c.nombre)).toEqual(['1 min', '1 | 1', '2 | 1'])
    expect(CONTROLES.filter((c) => c.grupo === 'blitz').map((c) => c.nombre)).toEqual(['3 min', '3 | 2', '5 min'])
    expect(CONTROLES.filter((c) => c.grupo === 'rapid').map((c) => c.nombre)).toEqual(['10 min', '15 | 10', '30 min'])
    expect(controlPorId(undefined).id).toBe('sin')
  })
  it('el descuento: solo corre el reloj del que tiene el turno', () => {
    let r = arrancar(nuevoReloj(controlPorId('3+0')), 'w', 0)
    expect(restante(r, 'w', 10_000)).toBe(170_000)
    expect(restante(r, 'b', 10_000)).toBe(180_000)
    r = alJugar(r, 'w', 10_000)
    expect(restante(r, 'w', 50_000)).toBe(170_000)
    expect(restante(r, 'b', 50_000)).toBe(140_000)
  })
  it('el incremento se suma al jugar', () => {
    let r = arrancar(nuevoReloj(controlPorId('15+10')), 'w', 0)
    r = alJugar(r, 'w', 30_000)
    expect(restante(r, 'w', 30_000)).toBe(900_000 - 30_000 + 10_000)
  })
  it('pausar detiene el reloj (al irse de la app) y conserva lo que quedaba', () => {
    let r = arrancar(nuevoReloj(controlPorId('1+0')), 'w', 0)
    r = pausar(r, 20_000)
    expect(restante(r, 'w', 999_999)).toBe(40_000)
    r = arrancar(r, 'w', 1_000_000)
    expect(restante(r, 'w', 1_005_000)).toBe(35_000)
  })
  it('perder por tiempo', () => {
    const r = arrancar(nuevoReloj(controlPorId('1+0')), 'w', 0)
    expect(seAcabo(r, 59_999)).toBeNull()
    expect(seAcabo(r, 60_000)).toBe('w')
    const fin = finPorTiempo(new Chess(), 'w')
    expect(fin).toMatchObject({ tipo: 'tiempo', ganador: 'b' })
    expect(seAcabo(arrancar(nuevoReloj(controlPorId('sin')), 'w', 0), 10 ** 9)).toBeNull()
  })
  it('tablas por tiempo si el rival no tiene material para dar mate', () => {
    const soloAlfil = new Chess('8/8/4k3/8/8/4K3/8/2b5 w - - 0 1') // negras: rey y alfil
    expect(finPorTiempo(soloAlfil, 'w')).toMatchObject({ tipo: 'tablas-tiempo', ganador: null })
    const conTorre = new Chess('8/8/4k3/8/8/4K3/8/2r5 w - - 0 1')
    expect(finPorTiempo(conTorre, 'w')).toMatchObject({ tipo: 'tiempo', ganador: 'b' })
  })
  it('formato del reloj', () => {
    expect(formato(245_000)).toBe('4:05')
    expect(formato(9_300)).toBe('0:09.3')
  })
})

describe('T16 · estrellas', () => {
  const con = (x: Partial<typeof SIN_AYUDAS>) => ({ ...SIN_AYUDAS, ...x })
  it('si gano: 3 sin ayuda; 2 con barra o flechas; 1 con guía, Pista/Respuesta o deshacer (cuenta la peor)', () => {
    expect(estrellas('gane', SIN_AYUDAS)).toBe(3)
    expect(estrellas('gane', con({ barraOFlechas: true }))).toBe(2)
    expect(estrellas('gane', con({ guia: true }))).toBe(1)
    expect(estrellas('gane', con({ pistaORespuesta: true }))).toBe(1)
    expect(estrellas('gane', con({ deshacer: true }))).toBe(1)
    expect(estrellas('gane', con({ barraOFlechas: true, deshacer: true }))).toBe(1)
  })
  it('si empato: 2 sin ayuda; 1 con cualquier ayuda (nota 2)', () => {
    expect(estrellas('tablas', SIN_AYUDAS)).toBe(2)
    expect(estrellas('tablas', con({ barraOFlechas: true }))).toBe(1)
    expect(estrellas('tablas', con({ guia: true }))).toBe(1)
  })
  it('si pierdo: 0', () => {
    expect(estrellas('perdi', SIN_AYUDAS)).toBe(0)
  })
  it('por bot se guarda la mejor', () => {
    expect(conEstrellas(conEstrellas({}, 'brisa', 2), 'brisa', 1)).toEqual({ brisa: 2 })
    expect(conEstrellas({ brisa: 2 }, 'brisa', 3)).toEqual({ brisa: 3 })
  })
})

describe('T14 · jugar con el reloj ya en cero (pase 2 de la T22)', () => {
  it('pierde por tiempo y la jugada no entra, aunque haya incremento', async () => {
    const { nuevaPartida, conJugada } = await import('../../src/partida/modelo.ts')
    const p = nuevaPartida('brisa', 'w', undefined, undefined, '1+1')
    const corriendo = { ...p, reloj: { ...p.reloj!, corriendo: 'w' as const, desde: 0 } }
    const tarde = conJugada(corriendo, 'e2e4', 60_050)
    expect(tarde.jugadas).toEqual([])
    expect(tarde.fin?.tipo).toBe('tiempo')
    expect(tarde.fin?.ganador).toBe('b')
    const atiempo = conJugada(corriendo, 'e2e4', 59_000)
    expect(atiempo.jugadas).toEqual(['e2e4'])
    expect(atiempo.reloj!.restante.w).toBe(1000 + 1000) // le quedaba 1 s y suma 1 de incremento
  })
})

