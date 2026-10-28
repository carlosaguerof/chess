import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import type { Base } from '../../src/base/tipos.ts'
import { GUIA, arbolDe, repertorioInicial, siguientesEnRepertorio } from '../../src/repertorio/modelo.ts'

const base = JSON.parse(readFileSync('conocimiento/base.json', 'utf8')) as Base
const rep = repertorioInicial(base)

describe('T7 · mi repertorio (nota 11: mi guía dice QUÉ; las líneas salen de la base)', () => {
  it('cada apertura y defensa de mi guía está en mi repertorio, con sus variantes de la base', () => {
    // la lista de la nota 11
    const esperada = [
      ['w', 'italiana'], ['w', 'siciliana'], ['w', 'caro-kann'], ['w', 'francesa'], ['w', 'escandinava'], ['w', 'otros-1e4'],
      ['b', 'caro-kann'], ['b', 'eslava'], ['b', 'otros-negras'],
    ]
    expect(GUIA.map((g) => [g.color, g.apertura])).toEqual(esperada)
    for (const g of GUIA) {
      const a = base.aperturas.find((x) => x.id === g.apertura)!
      const deLaBase = a.variantes.filter((v) => v.id.startsWith(g.prefijo) && (v.lado === 'ambos' || (v.lado === 'blancas') === (g.color === 'w')))
      expect(deLaBase.length, `${g.apertura} sin variantes`).toBeGreaterThan(0)
      for (const v of deLaBase) {
        const l = rep.lineas.find((x) => x.claveBase === v.clave && x.color === g.color)
        expect(l, `${g.color} ${v.clave} falta en mi repertorio`).toBeDefined()
        expect(l!.jugadas).toEqual(v.jugadas)
        expect(l!.origen).toBe('base')
      }
    }
  })

  it('con blancas, contra 1.e4 el rival tiene en mi árbol 1...e5, c5, c6, e6, d5 y "otros"', () => {
    const tras = siguientesEnRepertorio(rep, 'w', ['e4']).map((o) => o.san)
    for (const r of ['e5', 'c5', 'c6', 'e6', 'd5', 'g6', 'Nf6', 'd6', 'Nc6']) expect(tras).toContain(r)
    expect(siguientesEnRepertorio(rep, 'w', []).map((o) => o.san)).toEqual(['e4'])
  })

  it('con negras, las 4 variantes de la Caro-Kann con las frecuencias de la guía, y lo de la base aparte', () => {
    const a = arbolDe(rep, 'b', base)
    const e4 = a.hijos.find((h) => h.san === 'e4')!
    const c6 = e4.hijos.find((h) => h.san === 'c6')!
    const d4d5 = c6.hijos.find((h) => h.san === 'd4')!.hijos.find((h) => h.san === 'd5')!
    const fam = (n: typeof a) => n.familia && { nombre: n.familia.nombre, f: n.familia.frecuencia }
    expect(fam(d4d5.hijos.find((h) => h.san === 'e5')!)).toEqual({ nombre: 'Variante del Avance', f: 5 })
    // 3.Cd2/3.Cc3 dxe4 4.Cxe4: ahí se separan la Clásica (4...Af5) y la Karpov (4...Cd7), como las nombra la fuente
    const tras4 = d4d5.hijos.find((h) => h.san === 'Nd2')!.hijos.find((h) => h.san === 'dxe4')!.hijos.find((h) => h.san === 'Nxe4')!
    expect(fam(tras4.hijos.find((h) => h.san === 'Bf5')!)).toEqual({ nombre: 'Variante Clásica', f: 4 })
    expect(fam(tras4.hijos.find((h) => h.san === 'Nd7')!)).toEqual({ nombre: 'Variante Karpov', f: 4 })
    expect(d4d5.hijos.find((h) => h.san === 'Nc3')!.enRepertorio).toBe(true)
    expect(fam(d4d5.hijos.find((h) => h.san === 'exd5')!)).toEqual({ nombre: 'Variante del Cambio', f: 3 })
    expect(fam(c6.hijos.find((h) => h.san === 'Nc3')!)).toEqual({ nombre: 'Ataque de los Dos Caballos', f: 2 })
    // la Siciliana con negras está en la base, no en mi repertorio
    const c5 = e4.hijos.find((h) => h.san === 'c5')!
    expect(c5.enRepertorio).toBe(false)
    expect(c5.soloBase.length).toBeGreaterThan(0)
    expect(c6.enRepertorio).toBe(true)
  })
})
