import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import type { Base } from '../../src/base/tipos.ts'
import { leerFuente, jugadasMias, claveValidacion, PERDIDA_MAXIMA_CP, type Validacion } from '../../scripts/construir-base.ts'
import { motorNode } from '../../scripts/motor-node.ts'
import { evaluarJugada } from '../../scripts/evaluar-jugada.ts'

const base = JSON.parse(readFileSync('conocimiento/base.json', 'utf8')) as Base
const validacion = JSON.parse(readFileSync('conocimiento/validacion-motor.json', 'utf8')) as Validacion
const fuente = leerFuente()
const variantes = base.aperturas.flatMap((a) => a.variantes)

describe('T6 · la base de conocimiento de aperturas', () => {
  it('tiene las aperturas de mi guía y las populares para principiantes', () => {
    const ids = base.aperturas.map((a) => a.id)
    for (const id of ['italiana', 'siciliana', 'caro-kann', 'francesa', 'escandinava', 'otros-1e4', 'eslava', 'otros-negras', 'londres', 'gambito-dama', 'gambito-dama-declinado']) expect(ids).toContain(id)
    expect(variantes.length).toBeGreaterThan(80)
  })

  it('1) cada jugada es legal', () => {
    for (const v of variantes) {
      const c = new Chess()
      for (const s of v.jugadas) expect(() => c.move(s), `${v.clave}: ${s}`).not.toThrow()
    }
  })

  it('2) cada línea con nombre coincide jugada por jugada con la fuente (lichess-org/chess-openings)', () => {
    for (const v of variantes) {
      const fila = fuente.find((f) => f.eco === v.fuente.eco && f.name === v.fuente.name && f.pgn === v.fuente.pgn)
      expect(fila, `${v.clave} no está en la fuente`).toBeDefined()
      expect(v.nombreIngles).toBe(fila!.name)
      expect(v.eco).toBe(fila!.eco)
      if (v.recorte) {
        // recortada antes de una jugada mía que el motor no aprueba: lo que queda es un prefijo exacto de la fuente
        expect(v.jugadas).toEqual(fila!.sanes.slice(0, v.jugadas.length))
        expect(v.recorte.jugadasOriginales).toBe(fila!.sanes.length)
      } else expect(v.jugadas).toEqual(fila!.sanes)
    }
  })

  it('3) ninguna jugada de mi lado pierde más de 1 peón contra la mejor del motor a profundidad 18', () => {
    let revisadas = 0
    for (const v of variantes)
      for (const j of jugadasMias(v.jugadas, v.lado)) {
        const r = validacion[claveValidacion(j.fen, j.uci)]
        expect(r, `${v.clave}: falta validar ${j.san}`).toBeDefined()
        expect(r!.profundidad).toBeGreaterThanOrEqual(18)
        expect(r!.perdida, `${v.clave}: ${j.san} pierde ${r!.perdida} cp`).toBeLessThanOrEqual(PERDIDA_MAXIMA_CP)
        revisadas++
      }
    expect(revisadas).toBeGreaterThan(200)
  })

  it('3b) la validación guardada es real: dos posiciones recalculadas en vivo dan lo mismo', { timeout: 120_000 }, async () => {
    const motor = motorNode()
    await motor.iniciar()
    const muestra = [variantes[3]!, variantes[variantes.length - 4]!]
    for (const v of muestra) {
      const j = jugadasMias(v.jugadas, v.lado).at(-1)!
      const guardada = validacion[claveValidacion(j.fen, j.uci)]!
      const ahora = await evaluarJugada(motor, j.fen, j.uci, 18)
      expect(ahora).toEqual(guardada)
    }
    motor.cerrar()
  })

  it('cubre lo mínimo de la §4.4: las respuestas del rival en cada nodo de mi guía', () => {
    const hay = (apertura: string, prefijo: string) =>
      base.aperturas.find((a) => a.id === apertura)!.variantes.some((v) => v.jugadas.join(' ').startsWith(prefijo))
    // con blancas
    expect(hay('italiana', 'e4 e5 Nf3 Nc6 Bc4 Bc5')).toBe(true)
    expect(hay('italiana', 'e4 e5 Nf3 Nc6 Bc4 Nf6')).toBe(true)
    expect(hay('siciliana', 'e4 c5 c3 d5')).toBe(true)
    expect(hay('siciliana', 'e4 c5 c3 Nf6')).toBe(true)
    expect(hay('caro-kann', 'e4 c6 d4 d5 e5')).toBe(true)
    expect(hay('francesa', 'e4 e6 d4 d5 e5')).toBe(true)
    for (const r of ['Qa5', 'Qd6', 'Qd8']) expect(hay('escandinava', `e4 d5 exd5 Qxd5 Nc3 ${r}`)).toBe(true)
    expect(hay('escandinava', 'e4 d5 exd5 Nf6')).toBe(true)
    for (const r of ['g6', 'Nf6', 'd6', 'Nc6']) expect(hay('otros-1e4', `e4 ${r}`)).toBe(true)
    // con negras
    expect(hay('caro-kann', 'e4 c6 d4 d5 Nd2 dxe4 Nxe4 Bf5') || hay('caro-kann', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5')).toBe(true)
    expect(hay('caro-kann', 'e4 c6 d4 d5 Nd2 dxe4 Nxe4 Nd7') || hay('caro-kann', 'e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7')).toBe(true)
    expect(hay('caro-kann', 'e4 c6 d4 d5 exd5 cxd5 Bd3')).toBe(true)
    expect(hay('caro-kann', 'e4 c6 d4 d5 exd5 cxd5 c4')).toBe(true)
    expect(hay('caro-kann', 'e4 c6 Nc3 d5 Nf3')).toBe(true)
    expect(hay('caro-kann', 'e4 c6 c4')).toBe(true)
    expect(hay('caro-kann', 'e4 c6 d4 d5 f3')).toBe(true)
    for (const r of ['Nf3', 'Nc3', 'cxd5']) expect(hay('eslava', `d4 d5 c4 c6 ${r}`)).toBe(true)
    for (const r of ['c4', 'Nf3', 'b3']) expect(hay('otros-negras', r)).toBe(true)
  })
})
