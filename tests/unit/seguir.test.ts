import { beforeEach, describe, expect, it } from 'vitest'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { ORDEN_SEGUIR, seguir } from '../../src/curso/seguir.ts'
import { cursos, cursoPorId } from '../../src/cursos/datos.ts'
import { CURSOS_NUEVOS, cursoNuevo, obligatorias, opcionales } from '../../src/curso/datos.ts'
import { cursoQueQueda } from '../../src/curso/queda.ts'
import { pasosDelCurso } from '../../src/pantallas/CursoPagina.tsx'
import { leerAvance, type AvanceCurso } from '../../src/curso/avance.ts'
import type { DatosCurso } from '../../src/curso/tipos.ts'

/** "Seguir" (vuelta 5, escalón 1): `specs/aprender.md`, "Seguir". */

const P = 'ajedrez.v1.'
let local: Map<string, string>
let sesion: Map<string, string>

function instalarSessionStorage(): Map<string, string> {
  const m = new Map<string, string>()
  ;(globalThis as unknown as { sessionStorage: Storage }).sessionStorage = {
    getItem: (k: string) => (m.has(k) ? m.get(k)! : null),
    setItem: (k: string, v: string) => void m.set(k, String(v)),
    removeItem: (k: string) => void m.delete(k),
    clear: () => m.clear(),
    key: (i: number) => [...m.keys()][i] ?? null,
    get length() {
      return m.size
    },
  } as Storage
  return m
}

beforeEach(() => {
  local = instalarLocalStorage()
  sesion = instalarSessionStorage()
})

/** El curso nuevo detrás de una tarjeta (la Caro-Kann abre el curso por estructuras). */
const nuevo = (id: string): DatosCurso => cursoNuevo(cursoQueQueda(id) ?? id)!
const guardarAvance = (cursoId: string, a: AvanceCurso) => local.set(`${P}curso:${cursoId}`, JSON.stringify(a))
const terminado = (c: DatosCurso): AvanceCurso => ({ piezas: { idea: 1, estructura: 1, errores: 1, repaso: 1 }, variantes: Object.fromEntries(obligatorias(c).map((v) => [v.id, { aprendida: 1, terminada: 1 }])), errores: {} })
const terminar = (id: string) => guardarAvance(nuevo(id).id, terminado(nuevo(id)))
const otros = () => cursoPorId('otros-1e4:w')!
const guardarProgreso = (ids: string[]) => local.set(`${P}progreso`, JSON.stringify(Object.fromEntries(ids.map((id) => [id, { fecha: 1 }]))))
const terminarLosOchoNuevos = () => ORDEN_SEGUIR.slice(0, 8).forEach(terminar)
const url = (c: DatosCurso, resto: string) => `/curso/${encodeURIComponent(c.id)}${resto}`

describe('Seguir · el orden', () => {
  it('son los nueve cursos de Aprender, cada uno una tarjeta que existe, en el orden que escogió Carlos', () => {
    expect(ORDEN_SEGUIR).toHaveLength(9)
    expect(new Set(ORDEN_SEGUIR).size).toBe(9)
    expect([...ORDEN_SEGUIR].sort()).toEqual(cursos().map((c) => c.id).sort())
    // los nombres de las tarjetas, como los dice la regla
    expect(ORDEN_SEGUIR.map((id) => cursoPorId(id)!.nombre)).toEqual([
      'Defensa Caro-Kann',
      'Apertura Italiana',
      'Contra la Caro-Kann',
      'Contra la Francesa',
      'Contra la Siciliana',
      'Contra la Escandinava',
      'Defensa Eslava',
      'Otras aperturas de blancas',
      'Otras defensas contra 1.e4',
    ])
  })
  it('los ocho primeros abren un curso nuevo (la Caro-Kann, el que queda); el noveno sigue con la lección de antes', () => {
    for (const id of ORDEN_SEGUIR.slice(0, 8)) expect(nuevo(id), id).toBeDefined()
    expect(nuevo('caro-kann:b').id).toBe('caro-kann-estructuras:b')
    expect(cursoNuevo('otros-1e4:w')).toBeUndefined()
    expect(otros().lecciones.filter((l) => !l.opcional)).toHaveLength(8)
  })
})

describe('Seguir · qué toca', () => {
  it('nada hecho: Defensa Caro-Kann, La idea', () => {
    const d = seguir()
    const ck = nuevo('caro-kann:b')
    expect(d).toEqual({ fin: false, cursoId: 'caro-kann:b', curso: 'Defensa Caro-Kann', paso: ck.piezas.idea.titulo, url: url(ck, '/leer/idea') })
  })

  it('un curso a medias: el primer paso pendiente, igual que el "Seguir" de su página', () => {
    const ck = nuevo('caro-kann:b')
    const [v1, v2] = obligatorias(ck)
    guardarAvance(ck.id, { piezas: { idea: 1, estructura: 1 }, variantes: { [v1!.id]: { terminada: 1 } }, errores: {} })
    const d = seguir()
    expect(d).toMatchObject({ cursoId: 'caro-kann:b', paso: v2!.nombre, url: url(ck, `/linea/${encodeURIComponent(`v:${v2!.id}`)}`) })
  })

  it('una lección a medias en el curso en turno: regresa a ella, aunque haya pasos antes sin hacer', () => {
    const ck = nuevo('caro-kann:b')
    const v3 = obligatorias(ck)[2]!
    guardarAvance(ck.id, { piezas: { idea: 1 }, variantes: {}, errores: {}, enCurso: { linea: `v:${v3.id}`, vuelta: 'practicar', ply: 5, fecha: 1 } })
    expect(seguir()).toMatchObject({ cursoId: 'caro-kann:b', paso: v3.nombre, url: url(ck, `/linea/${encodeURIComponent(`v:${v3.id}`)}`) })
  })

  it('una opcional a medias no cuenta: sigue lo primero pendiente', () => {
    const ck = nuevo('caro-kann:b')
    const op = opcionales(ck)[0]!
    guardarAvance(ck.id, { piezas: { idea: 1 }, variantes: {}, errores: {}, enCurso: { linea: `v:${op.id}`, vuelta: 'aprender', ply: 3, fecha: 1 } })
    expect(seguir()).toMatchObject({ cursoId: 'caro-kann:b', paso: ck.piezas.estructura.titulo })
  })

  it('una lección a medias en un curso de más adelante espera su turno; cuando llega, empieza en ella', () => {
    const it = nuevo('italiana:w')
    const v = obligatorias(it)[3]!
    guardarAvance(it.id, { piezas: {}, variantes: {}, errores: {}, enCurso: { linea: `v:${v.id}`, vuelta: 'aprender', ply: 4, fecha: 1 } })
    expect(seguir()).toMatchObject({ cursoId: 'caro-kann:b', paso: 'La idea' })
    terminar('caro-kann:b')
    expect(seguir()).toMatchObject({ cursoId: 'italiana:w', curso: 'Apertura Italiana', paso: v.nombre })
  })

  it('un curso de más adelante ya terminado se salta', () => {
    terminar('caro-kann:b')
    terminar('italiana:w')
    terminar('caro-kann:w')
    terminar('siciliana:w') // el 5, terminado antes del 4
    expect(seguir()).toMatchObject({ cursoId: 'francesa:w', curso: 'Contra la Francesa', paso: 'La idea' })
    terminar('francesa:w')
    expect(seguir()).toMatchObject({ cursoId: 'escandinava:w', curso: 'Contra la Escandinava' })
  })

  it('lo de un curso de más adelante no se pierde: sus lecciones hechas no se repiten cuando llega', () => {
    const es = nuevo('escandinava:w')
    const [a, b] = obligatorias(es)
    guardarAvance(es.id, { piezas: { idea: 1, estructura: 1 }, variantes: { [a!.id]: { terminada: 1 } }, errores: {} })
    for (const id of ORDEN_SEGUIR.slice(0, 5)) terminar(id)
    expect(seguir()).toMatchObject({ cursoId: 'escandinava:w', paso: b!.nombre })
  })

  it('la Caro-Kann cuenta lo que terminé en el curso de antes (leerAvance)', () => {
    const ck = nuevo('caro-kann:b')
    const v1 = obligatorias(ck)[0]!
    guardarAvance(ck.id, { piezas: { idea: 1, estructura: 1 }, variantes: {}, errores: {} })
    guardarAvance('caro-kann:b', { piezas: {}, variantes: { [v1.id]: { terminada: 1 } }, errores: {} })
    expect(leerAvance(ck.id).variantes[v1.id]?.terminada).toBe(1)
    expect(seguir()).toMatchObject({ cursoId: 'caro-kann:b', paso: obligatorias(ck)[1]!.nombre })
  })

  it('un curso que viene de la lección de antes cuenta sus lecciones hechas, pero no sus páginas de leer', () => {
    terminar('caro-kann:b')
    const it = nuevo('italiana:w')
    const ids = cursoPorId('italiana:w')!.lecciones.map((l) => l.id)
    guardarProgreso(ids)
    expect(seguir()).toMatchObject({ cursoId: 'italiana:w', paso: 'La idea' })
    guardarAvance(it.id, { piezas: { idea: 1, estructura: 1 }, variantes: {}, errores: {} })
    expect(seguir()).toMatchObject({ cursoId: 'italiana:w', paso: it.piezas.errores.titulo, url: url(it, '/errores') })
  })

  it('el paso es el mismo que el "Seguir" de la página de cada curso, en los ocho', () => {
    for (const [i, id] of ORDEN_SEGUIR.slice(0, 8).entries()) {
      local.clear()
      for (const antes of ORDEN_SEGUIR.slice(0, i)) terminar(antes)
      const c = nuevo(id)
      const primero = pasosDelCurso(c, leerAvance(c.id))[0]!
      expect(seguir(), id).toMatchObject({ fin: false, cursoId: id, paso: primero.nombre, url: primero.url })
    }
  })
})

describe('Seguir · Otras defensas contra 1.e4 (la lección de antes)', () => {
  it('con los ocho nuevos terminados: su primera lección, en el orden de su página', () => {
    terminarLosOchoNuevos()
    const o = otros()
    expect(seguir()).toEqual({ fin: false, cursoId: 'otros-1e4:w', curso: 'Otras defensas contra 1.e4', paso: o.lecciones[0]!.familia, url: `/leccion/${encodeURIComponent(o.id)}/0` })
  })
  it('la primera sin hacer', () => {
    terminarLosOchoNuevos()
    const o = otros()
    guardarProgreso([o.lecciones[0]!.id, o.lecciones[1]!.id, o.lecciones[3]!.id])
    expect(seguir()).toMatchObject({ url: `/leccion/${encodeURIComponent(o.id)}/2`, paso: o.lecciones[2]!.familia })
  })
  it('la que fallé en esta sesión vuelve antes (la regla del botón "Siguiente" de la lección)', () => {
    terminarLosOchoNuevos()
    const o = otros()
    guardarProgreso([o.lecciones[0]!.id, o.lecciones[1]!.id])
    sesion.set('ajedrez.v1.sesion-falladas', JSON.stringify(['eslava:b/x', o.lecciones[1]!.id]))
    expect(seguir()).toMatchObject({ url: `/leccion/${encodeURIComponent(o.id)}/1` })
  })
  it('con sus ocho hechas está terminado, aunque una fallada de la sesión siga en la lista: va al Repaso', () => {
    terminarLosOchoNuevos()
    const o = otros()
    guardarProgreso(o.lecciones.map((l) => l.id))
    sesion.set('ajedrez.v1.sesion-falladas', JSON.stringify([o.lecciones[4]!.id]))
    expect(seguir()).toEqual({ fin: true, url: '/repaso' })
  })
  it('lo hecho ahí antes de su turno espera: con un curso nuevo pendiente, "Seguir" no salta a Otras defensas', () => {
    const o = otros()
    guardarProgreso(o.lecciones.slice(0, 7).map((l) => l.id))
    expect(seguir()).toMatchObject({ cursoId: 'caro-kann:b' })
  })
  it('el nombre no adelanta tu jugada: solo la defensa del rival', () => {
    terminarLosOchoNuevos()
    const o = otros()
    for (const [i, l] of o.lecciones.entries()) {
      guardarProgreso(o.lecciones.slice(0, i).map((x) => x.id))
      const d = seguir()
      expect(d.fin).toBe(false)
      if (d.fin) continue
      expect(d.paso, l.nombre).toBe(l.familia)
      expect(d.paso).toMatch(/^Defensa [A-ZÁÉÍÓÚ][a-záéíóú]+( [A-Z][a-z]+)?$/)
      expect(l.nombre.startsWith(d.paso)).toBe(true)
    }
  })
})

describe('Seguir · todo terminado', () => {
  it('con los nueve terminados lleva al Repaso de hoy', () => {
    terminarLosOchoNuevos()
    guardarProgreso(otros().lecciones.map((l) => l.id))
    expect(seguir()).toEqual({ fin: true, url: '/repaso' })
  })
})

describe('Seguir · solo lee lo guardado', () => {
  const foto = () => JSON.stringify({ local: [...local.entries()].sort(), sesion: [...sesion.entries()].sort() })
  it('localStorage y sessionStorage quedan idénticos, en cada caso', () => {
    const casos: (() => void)[] = [
      () => {},
      () => guardarAvance(nuevo('caro-kann:b').id, { piezas: { idea: 1 }, variantes: {}, errores: {}, enCurso: { linea: `v:${obligatorias(nuevo('caro-kann:b'))[1]!.id}`, vuelta: 'practicar', ply: 3, fecha: 1 } }),
      () => {
        terminar('caro-kann:b')
        guardarProgreso(cursoPorId('italiana:w')!.lecciones.map((l) => l.id))
      },
      () => {
        terminarLosOchoNuevos()
        sesion.set('ajedrez.v1.sesion-falladas', JSON.stringify([otros().lecciones[0]!.id]))
        guardarProgreso([otros().lecciones[0]!.id])
      },
      () => {
        terminarLosOchoNuevos()
        guardarProgreso(otros().lecciones.map((l) => l.id))
      },
    ]
    for (const preparar of casos) {
      local.clear()
      sesion.clear()
      preparar()
      const antes = foto()
      seguir()
      seguir()
      expect(foto()).toBe(antes)
    }
  })
  it('cada curso nuevo de la app está en el orden (si se agrega uno, la prueba lo pide)', () => {
    const queSeVen = new Set(ORDEN_SEGUIR.map((id) => cursoQueQueda(id) ?? id))
    const ocultos = Object.keys(CURSOS_NUEVOS).filter((id) => cursoQueQueda(id))
    for (const id of Object.keys(CURSOS_NUEVOS)) expect(queSeVen.has(id) || ocultos.includes(id), id).toBe(true)
  })
})
