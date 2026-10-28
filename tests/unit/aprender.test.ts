import { beforeEach, describe, expect, it } from 'vitest'
import { BASE } from '../../src/base/base.ts'
import { cursosDeLaBase } from '../../src/cursos/modelo.ts'
import { cursosDe } from '../../src/cursos/modelo.ts'
import { repertorioInicial } from '../../src/repertorio/modelo.ts'
import { idLeccionNuevo, migrarAlModeloDeFavoritas, migrarIds } from '../../src/aprender/migracion.ts'
import { instalarLocalStorage } from './memoria-navegador.ts'

describe('Nota 1 · "Aperturas y defensas": un curso por apertura y color de la base', () => {
  const cursos = cursosDeLaBase(BASE)

  it('cada apertura de la base, agrupada por el color con que se juega', () => {
    const blancas = cursos.filter((c) => c.color === 'w').map((c) => c.nombre)
    const negras = cursos.filter((c) => c.color === 'b').map((c) => c.nombre)
    expect(blancas).toEqual(['Apertura Italiana', 'Contra la Siciliana', 'Contra la Caro-Kann', 'Contra la Francesa', 'Contra la Escandinava', 'Otras defensas contra 1.e4', 'Sistema Londres', 'Gambito de Dama'])
    expect(negras).toEqual(['Defensa Siciliana', 'Defensa Caro-Kann', 'Defensa Escandinava', 'Defensa Eslava', 'Otras aperturas de blancas', 'Gambito de Dama Declinado'])
    // todas las variantes de la base están en algún curso (las de "ambos", en los dos)
    const total = BASE.aperturas.reduce((n, a) => n + a.variantes.reduce((m, v) => m + (v.lado === 'ambos' ? 2 : 1), 0), 0)
    expect(cursos.reduce((n, c) => n + c.lecciones.length, 0)).toBe(total)
  })

  it('sus variantes, de la más común a la más rara', () => {
    for (const c of cursos) for (let i = 1; i < c.lecciones.length; i++) expect(c.lecciones[i - 1]!.frecuencia).toBeGreaterThanOrEqual(c.lecciones[i]!.frecuencia)
  })

  it('los ids de las lecciones son los del repertorio de antes: el avance guardado sigue valiendo', () => {
    const antes = cursosDe(BASE, repertorioInicial(BASE)).find((c) => c.id === 'caro-kann:b')!
    const ahora = cursos.find((c) => c.id === 'caro-kann:b')!
    expect(new Set(ahora.lecciones.map((l) => l.id))).toEqual(new Set(antes.lecciones.map((l) => l.id)))
  })
})

describe('Nota 1 · lo guardado pasa al modelo nuevo', () => {
  let memoria: Map<string, string>
  beforeEach(() => {
    memoria = instalarLocalStorage()
  })

  it('los ids de "solo en la base" toman la forma nueva; los de mi repertorio se quedan igual', () => {
    expect(idLeccionNuevo('siciliana:w/siciliana/smith-morra')).toBe('siciliana:w/w:siciliana/smith-morra')
    expect(idLeccionNuevo('caro-kann:b/b:caro-kann/avance-short')).toBe('caro-kann:b/b:caro-kann/avance-short')
    // si existían las dos formas, gana la nueva
    expect(migrarIds({ 'eslava:b/eslava/clasica': { fecha: 1 }, 'eslava:b/b:eslava/clasica': { fecha: 2 } })).toEqual({ 'eslava:b/b:eslava/clasica': { fecha: 2 } })
    // y todo id de la forma nueva existe en los cursos
    const ids = new Set(cursosDeLaBase(BASE).flatMap((c) => c.lecciones.map((l) => l.id)))
    const viejos = cursosDe(BASE, repertorioInicial(BASE)).flatMap((c) => c.lecciones.map((l) => l.id))
    for (const v of viejos) expect(ids.has(idLeccionNuevo(v)), v).toBe(true)
  })

  it('al abrir la app: el avance y el repaso se conservan, las favoritas empiezan vacías, y corre una sola vez', () => {
    memoria.set('ajedrez.v1.repertorio', JSON.stringify(repertorioInicial(BASE)))
    memoria.set('ajedrez.v1.progreso', JSON.stringify({ 'caro-kann:b/b:caro-kann/avance-short': { fecha: 1 }, 'siciliana:w/siciliana/smith-morra': { fecha: 2 } }))
    memoria.set('ajedrez.v1.repaso', JSON.stringify({ 'siciliana:w/siciliana/smith-morra': { escalon: 3, proxima: '2026-11-05' } }))
    migrarAlModeloDeFavoritas()
    expect(JSON.parse(memoria.get('ajedrez.v1.progreso')!)).toEqual({ 'caro-kann:b/b:caro-kann/avance-short': { fecha: 1 }, 'siciliana:w/w:siciliana/smith-morra': { fecha: 2 } })
    expect(JSON.parse(memoria.get('ajedrez.v1.repaso')!)).toEqual({ 'siciliana:w/w:siciliana/smith-morra': { escalon: 3, proxima: '2026-11-05' } })
    expect(memoria.has('ajedrez.v1.favoritas')).toBe(false)
    expect(memoria.get('ajedrez.v1.modelo')).toBe('2')
    // lo de antes no se borra
    expect(memoria.has('ajedrez.v1.repertorio')).toBe(true)
    // una segunda vez no cambia nada
    memoria.set('ajedrez.v1.progreso', JSON.stringify({ 'x:w/raro': { fecha: 3 } }))
    migrarAlModeloDeFavoritas()
    expect(JSON.parse(memoria.get('ajedrez.v1.progreso')!)).toEqual({ 'x:w/raro': { fecha: 3 } })
  })

  it('sin nada guardado (la primera vez) no falla', () => {
    migrarAlModeloDeFavoritas()
    expect(JSON.parse(memoria.get('ajedrez.v1.progreso')!)).toEqual({})
  })
})
