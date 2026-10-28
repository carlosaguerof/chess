import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import type { Base } from '../../src/base/tipos.ts'
import { repertorioInicial } from '../../src/repertorio/modelo.ts'
import { agregarDeBase, agregarPropia, borrarRama, deshacerBorrado, editarLinea, exportar, importar, repertorioOriginal, ErrorImportar } from '../../src/repertorio/edicion.ts'

const base = JSON.parse(readFileSync('conocimiento/base.json', 'utf8')) as Base
const inicial = repertorioInicial(base)
const najdorf = base.aperturas.find((a) => a.id === 'siciliana')!.variantes.find((v) => v.id.startsWith('najdorf'))!

describe('T10 · escoger qué aprendo (editar mi repertorio)', () => {
  it('agrego una línea tomándola de la base (y no se duplica)', () => {
    const r = agregarDeBase(inicial, base, najdorf.clave, 'b')
    expect(r.lineas).toHaveLength(inicial.lineas.length + 1)
    const l = r.lineas.at(-1)!
    expect(l).toMatchObject({ color: 'b', apertura: 'siciliana', origen: 'base', claveBase: najdorf.clave, jugadas: najdorf.jugadas })
    expect(agregarDeBase(r, base, najdorf.clave, 'b')).toBe(r)
  })

  it('agrego una línea jugándola desde un nodo', () => {
    const r = agregarPropia(inicial, 'b', ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6'], 'Mi Avance')
    expect(r.lineas.at(-1)).toMatchObject({ origen: 'propia', nombre: 'Mi Avance', autorPlan: 'yo', frecuencia: 3 })
  })

  it('cambio nombre, plan y frecuencia (la frecuencia queda entre 1 y 5; el plan pasa a ser mío)', () => {
    const id = inicial.lineas[0]!.id
    const r = editarLinea(inicial, id, { nombre: 'Mi Italiana', plan: 'Mi plan', frecuencia: 9 })
    expect(r.lineas[0]).toMatchObject({ nombre: 'Mi Italiana', plan: 'Mi plan', frecuencia: 5, autorPlan: 'yo' })
    expect(inicial.lineas[0]!.nombre).not.toBe('Mi Italiana')
  })

  it('borro una rama y la deshago: regresa igual y en su lugar', () => {
    const b = borrarRama(inicial, 'b', ['e4', 'c6', 'd4', 'd5', 'e5'])
    expect(b.quitadas.length).toBeGreaterThan(3)
    expect(b.repertorio.lineas.some((l) => l.color === 'b' && l.jugadas.slice(0, 5).join(' ') === 'e4 c6 d4 d5 e5')).toBe(false)
    expect(deshacerBorrado(b.repertorio, b)).toEqual(inicial)
  })

  it('exportar → importar → exportar da exactamente los mismos bytes, con las favoritas, el registro y el avance', () => {
    const favoritas = ['caro-kann:b', 'italiana:w']
    const progreso = { 'caro-kann:b/b:caro-kann/avance-short': { fecha: 1793190000000 } }
    const registro = [{ fen: 'x', esperada: 'c6', resultado: 'fallo', lugar: 'curso', fecha: 1793190000001, linea: 'ñandú «acentos» y comillas' }]
    const texto = exportar({ favoritas, progreso, registro })
    const leido = importar(texto)
    expect(exportar(leido)).toBe(texto)
    expect(leido.favoritas).toEqual(favoritas)
    expect(leido.registro).toEqual(registro)
  })

  it('un respaldo de antes de las favoritas (versión 1) se lee: el avance pasa a los ids nuevos y las favoritas quedan vacías', () => {
    const rep = editarLinea(agregarDeBase(inicial, base, najdorf.clave, 'b'), inicial.lineas[2]!.id, { plan: 'otro plan' })
    const viejo = JSON.stringify({
      app: 'chess-mis-aperturas',
      version: 1,
      repertorio: rep,
      progreso: { 'caro-kann:b/b:caro-kann/avance-short': { fecha: 1 }, 'siciliana:w/siciliana/smith-morra': { fecha: 2 } },
      registro: [],
      repaso: { 'siciliana:w/siciliana/smith-morra': { escalon: 2, proxima: '2026-11-01' } },
    })
    const leido = importar(viejo)
    expect(leido.version).toBe(2)
    expect(leido.favoritas).toEqual([])
    expect(leido.progreso).toEqual({ 'caro-kann:b/b:caro-kann/avance-short': { fecha: 1 }, 'siciliana:w/w:siciliana/smith-morra': { fecha: 2 } })
    expect(leido.repaso).toEqual({ 'siciliana:w/w:siciliana/smith-morra': { escalon: 2, proxima: '2026-11-01' } })
  })

  it('importar un archivo que no es de la app dice qué pasó, sin códigos', () => {
    expect(() => importar('{"hola": 1}')).toThrow(ErrorImportar)
    expect(() => importar('no es json')).toThrow(/no se pudo leer/i)
  })

  it('volver al repertorio original', () => {
    const r = borrarRama(inicial, 'w', ['e4']).repertorio
    expect(repertorioOriginal(base)).toEqual(inicial)
    expect(r.lineas.length).toBeLessThan(inicial.lineas.length)
  })
})
