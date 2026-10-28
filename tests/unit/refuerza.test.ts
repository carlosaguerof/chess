import { describe, expect, it, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import type { Base } from '../../src/base/tipos.ts'
import { repertorioInicial } from '../../src/repertorio/modelo.ts'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { registrarJugadaPartida, registrarPasoCurso, registrarPasoRefuerza, resultadoEnPartida } from '../../src/registro/eventos.ts'
import { leerRegistro } from '../../src/registro/almacen-registro.ts'
import { jugadasDeMiRepertorio, ordenRefuerza, textoConteo } from '../../src/registro/refuerza.ts'
import type { EntradaRegistro } from '../../src/registro/registro.ts'

const base = JSON.parse(readFileSync('conocimiento/base.json', 'utf8')) as Base
const rep = repertorioInicial(base)
const tras = (...sanes: string[]) => {
  const c = new Chess()
  for (const s of sanes) c.move(s)
  return c.fen()
}

describe('T12 (nota 1) · registro por jugada y "Refuerza lo que fallas"', () => {
  beforeEach(() => {
    instalarLocalStorage()
  })

  it('los cuatro casos (acierto, fallo, Pista, Respuesta) se registran desde los tres lugares, con la fecha', () => {
    const base0 = { fen: tras('e4'), esperada: 'c6', linea: 'Caro-Kann', camino: ['e4'] }
    const pasos = [
      { fallos: 0, pista: false, respuesta: false },
      { fallos: 2, pista: false, respuesta: false },
      { fallos: 0, pista: true, respuesta: false },
      { fallos: 1, pista: true, respuesta: true },
    ]
    pasos.forEach((paso, i) => registrarPasoCurso({ ...base0, paso }, 1000 + i))
    pasos.forEach((paso, i) => registrarPasoRefuerza({ ...base0, paso }, 2000 + i))
    ;(
      [
        [false, null],
        [true, null],
        [false, 'pista'],
        [false, 'respuesta'],
      ] as const
    ).forEach(([desvio, ayuda], i) => registrarJugadaPartida({ ...base0, desvio, ayuda }, 3000 + i))
    const r = leerRegistro()
    expect(r).toHaveLength(12)
    for (const lugar of ['curso', 'refuerza', 'partida'] as const)
      expect(r.filter((e) => e.lugar === lugar).map((e) => e.resultado)).toEqual(['acierto', 'fallo', 'pista', 'respuesta'])
    expect(r[0]).toMatchObject({ esperada: 'c6', fecha: 1000, fen: tras('e4').split(' ').slice(0, 4).join(' ') })
    expect(resultadoEnPartida(true, 'respuesta')).toBe('fallo')
  })

  it('el orden de Refuerza: primero lo que más fallo; después lo nunca practicado; al final lo practicado hace más tiempo', () => {
    const corto = (fen: string) => fen.split(' ').slice(0, 4).join(' ')
    const e = (fen: string, esperada: string, resultado: EntradaRegistro['resultado'], fecha: number): EntradaRegistro => ({ fen: corto(fen), esperada, resultado, lugar: 'curso', fecha })
    const registro: EntradaRegistro[] = [
      // 1...c6 (negras): fallada 1 de 2
      e(tras('e4'), 'c6', 'fallo', 10),
      e(tras('e4'), 'c6', 'acierto', 11),
      // 3...Af5 en el Avance: fallada 2 de 2 (con Pista)
      e(tras('e4', 'c6', 'd4', 'd5', 'e5'), 'Bf5', 'fallo', 20),
      e(tras('e4', 'c6', 'd4', 'd5', 'e5'), 'Bf5', 'pista', 21),
      // 1.e4 (blancas): bien, hace tiempo
      e(tras(), 'e4', 'acierto', 5),
    ]
    const orden = ordenRefuerza(jugadasDeMiRepertorio(rep, registro))
    expect(orden[0]!.esperada).toBe('Bf5')
    expect(textoConteo(orden[0]!)).toBe('fallada 2 de 2 veces')
    expect(orden[1]!.esperada).toBe('c6')
    expect(textoConteo(orden[1]!)).toBe('fallada 1 de 2 veces')
    // luego, todas las nunca practicadas antes que 1.e4 (practicada, sin fallos)
    const resto = orden.slice(2)
    const iE4 = resto.findIndex((j) => j.esperada === 'e4' && j.camino.length === 0)
    expect(resto.slice(0, iE4).every((j) => j.intentos === 0)).toBe(true)
    expect(iE4).toBe(resto.length - 1)
    expect(textoConteo(resto[0]!)).toBe('nunca practicada')
  })
})
