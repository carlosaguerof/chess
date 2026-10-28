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

describe('Nota 1 · las favoritas son el repertorio', () => {
  it('"Que juegue mis líneas": sin favoritas no hay jugada (el bot juega su libro); con la Caro-Kann, entra a ella', async () => {
    const { repertorioDeFavoritas } = await import('../../src/aprender/favoritas.ts')
    const { jugadaDeMisLineas } = await import('../../src/guia/guia.ts')
    expect(repertorioDeFavoritas([]).lineas).toHaveLength(0)
    expect(jugadaDeMisLineas(repertorioDeFavoritas([]), 'b', [], () => 0.5)).toBeNull()
    const ck = repertorioDeFavoritas(['caro-kann:b'])
    expect(ck.lineas).toHaveLength(22)
    expect(jugadaDeMisLineas(ck, 'b', [], () => 0.5)).toBe('e4')
    // tras 1.e4 c6, el bot sigue en alguna línea de la Caro-Kann
    const segunda = jugadaDeMisLineas(ck, 'b', ['e4', 'c6'], () => 0.5)
    expect(ck.lineas.some((l) => l.jugadas[2] === segunda)).toBe(true)
  })

  it('la guía reconoce cualquier apertura de la base aunque no esté en mis favoritas (L5, pase 2)', async () => {
    const { repertorioDeFavoritas } = await import('../../src/aprender/favoritas.ts')
    const { mensajeTrasMiJugada, ayudaEnMiTurno } = await import('../../src/guia/guia.ts')
    // sin favoritas, con negras: 1.e4 c6 se nombra, y no dice que me salí de nada
    const vacia = { base: BASE, rep: repertorioDeFavoritas([]), color: 'b' as const }
    const m = mensajeTrasMiJugada(vacia, ['e4', 'c6'])
    expect(m.texto).toContain('Estás en la Defensa Caro-Kann')
    expect(m.texto).not.toMatch(/saliste|repertorio/)
    // con la Caro-Kann en favoritas, jugando la Italiana con blancas: también la nombra
    const blancas = { base: BASE, rep: repertorioDeFavoritas(['caro-kann:b']), color: 'w' as const }
    expect(mensajeTrasMiJugada(blancas, ['e4', 'e5', 'Nf3', 'Nc6', 'Bc4']).texto).toContain('Italiana')
    // y si venía en mi línea y me salgo, sí lo dice
    const ck = { base: BASE, rep: repertorioDeFavoritas(['caro-kann:b']), color: 'b' as const }
    expect(mensajeTrasMiJugada(ck, ['e4', 'c6', 'd4', 'a6']).tipo).toBe('desvio')
    // la Respuesta, sin etiqueta de origen, y nombrando la apertura mientras la jugada sirve a varias variantes
    const r = ayudaEnMiTurno(vacia, ['e4'])
    expect(r.respuesta).not.toContain('(de la base)')
    expect(r.respuesta).toContain('Defensa Caro-Kann')
  })
})
