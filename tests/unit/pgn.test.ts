import { describe, expect, it } from 'vitest'
import { lineasDePgn, ErrorPgn } from '../../src/repertorio/pgn.ts'

describe('R3 · importar un PGN con variantes', () => {
  it('saca cada línea, con sus variantes anidadas, en inglés o en R D T A C', () => {
    const pgn = `[Event "Mi Caro-Kann"]
1. e4 c6 2. d4 d5 3. e5 (3. Nc3 dxe4 4. Nxe4 Bf5 (4... Nd7 5. Nf3)) (3. exd5 cxd5 4. Ad3 Cc6) 3... Af5 {la idea} 4. Nf3 e6 *`
    const ls = lineasDePgn(pgn).map((l) => l.join(' '))
    expect(ls).toContain('e4 c6 d4 d5 e5 Bf5 Nf3 e6')
    expect(ls).toContain('e4 c6 d4 d5 Nc3 dxe4 Nxe4 Bf5')
    expect(ls).toContain('e4 c6 d4 d5 Nc3 dxe4 Nxe4 Nd7 Nf3')
    expect(ls).toContain('e4 c6 d4 d5 exd5 cxd5 Bd3 Nc6')
    expect(ls).toHaveLength(4)
  })
  it('una jugada ilegal o un paréntesis suelto dicen qué pasó', () => {
    expect(() => lineasDePgn('1. e4 e5 2. Ke3 Ke6 3. Qh5')).toThrow(ErrorPgn)
    expect(() => lineasDePgn('1. e4 (1. d4')).toThrow(/paréntesis/)
  })
})

describe('R3 · el PGN entra a mi repertorio', () => {
  it('las jugadas del PGN quedan en el árbol de mi repertorio, en el curso de su apertura, sin repetir', async () => {
    const base = (await import('../../conocimiento/base.json')).default
    const { repertorioInicial, siguientesEnRepertorio } = await import('../../src/repertorio/modelo.ts')
    const { importarPgn } = await import('../../src/repertorio/edicion.ts')
    const rep = repertorioInicial(base as never)
    const pgn = `[Event "Caro-Kann: mis apuntes"]
1. e4 c6 2. d4 d5 3. e5 Bf5 4. h4 (4. Nc3 e6 5. g4 Bg6 6. Nge2 c5 7. h4) 4... h5 5. c4 *`
    const { repertorio, nuevas, yaEstaban, nombre } = importarPgn(rep, 'b', pgn)
    expect(nombre).toBe('Caro-Kann: mis apuntes')
    expect(nuevas).toBe(1) // 4.h4 h5 5.c4 es nueva
    expect(yaEstaban).toBe(1) // la Van der Wiel ya está en mi repertorio con negras
    // en el árbol: después de 3...Af5, 4.h4 es una respuesta del rival en mi repertorio, y 4...h5 mi jugada
    const tras = (h: string[]) => siguientesEnRepertorio(repertorio, 'b', h).map((o) => o.san)
    expect(tras(['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5'])).toContain('h4')
    expect(tras(['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'h4'])).toEqual(['h5'])
    // 5.c4 (la del PGN) y 5.Ad3 (la de la base desde el curso piloto, C4)
    expect(tras(['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'h4', 'h5']).sort()).toEqual(['Bd3', 'c4'])
    const nueva = repertorio.lineas.find((l) => l.jugadas.join(' ') === 'e4 c6 d4 d5 e5 Bf5 h4 h5 c4')!
    expect(nueva.apertura).toBe('caro-kann')
    expect(nueva.origen).toBe('propia')
    // importarlo otra vez no repite nada
    expect(importarPgn(repertorio, 'b', pgn).nuevas).toBe(0)
  })
})

describe('R3 · PGN con R D T A C (pase 2 de la T22)', () => {
  it('en un PGN en español, R es el rey', () => {
    const [l] = lineasDePgn('1. e4 e5 2. Cf3 Cc6 3. Ac4 Ac5 4. Rf1')
    expect(l!.at(-1)).toBe('Kf1')
    // en uno en inglés, R sigue siendo la torre
    expect(lineasDePgn('1. e4 e5 2. Nf3 Nc6 3. Bc4 Bc5 4. Rf1')[0]!.at(-1)).toBe('Rf1') // la torre de h1 a f1
  })
})
