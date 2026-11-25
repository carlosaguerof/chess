import { beforeEach, describe, expect, it } from 'vitest'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { migrarTodo, pasarTodas, TABLAS_DE_MUDANZA } from '../../src/aprender/migracion.ts'
import { exportar, importar } from '../../src/repertorio/edicion.ts'
import { guardar } from '../../src/estado/almacen.ts'
import { leerProgreso } from '../../src/repertorio/estado.ts'
import { leerRepaso, paraHoy } from '../../src/repaso/repaso.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { avanceVariantes, CURSOS_NUEVOS, cursoNuevo, esOpcional, leccionIdDe } from '../../src/curso/datos.ts'
import { CURSOS_DE_LA_LECCION_DE_ANTES, leerAvance, marcarVariante } from '../../src/curso/avance.ts'

/**
 * Lo guardado no se pierde ni se duplica (cierre de los cursos, 2026-11-25, `specs/cursos.md` §4).
 * §3.1: un Respaldo con los ids viejos, importado después de la migración, deja el Repaso y el avance igual que si se
 * hubiera migrado al abrir. §3.2: lo que la lección de antes marcó hecho sale terminado en la variante nueva de la misma
 * línea, en los siete cursos, sin contar dos veces.
 */

const HOY = '2026-11-25'
const cursoDe = (prefijo: string) => prefijo.slice(0, prefijo.indexOf('/'))

/** Lo de un teléfono de antes de la actualización: cada lección vieja de la tabla, hecha y con su ficha vencida. */
function guardadoViejo(prefijo: string, tabla: Record<string, string>) {
  const viejas = Object.keys(tabla)
  return {
    progreso: Object.fromEntries(viejas.map((k, i) => [prefijo + k, { fecha: 1000 + i }])),
    repaso: Object.fromEntries(viejas.map((k, i) => [prefijo + k, { escalon: 1 + (i % 3), proxima: '2026-11-20' }])),
  }
}

/** Lo que Carlos ve de un curso: lo guardado, el Repaso de hoy y el avance de la página del curso. */
function foto(cursoId: string) {
  const lecciones = cursos().flatMap((c) => c.lecciones)
  const c = cursoNuevo(cursoId)!
  const a = leerAvance(cursoId)
  return {
    progreso: leerProgreso(),
    repaso: leerRepaso(),
    hoy: paraHoy(leerRepaso(), leerProgreso(), lecciones, HOY, []).map((l) => l.id),
    avance: avanceVariantes(c, a),
    variantes: a.variantes,
  }
}

beforeEach(() => {
  instalarLocalStorage()
  ;(globalThis as unknown as { window: EventTarget }).window = new EventTarget()
})

describe('§3.1 · un Respaldo viejo no pierde el Repaso', () => {
  it('hay una tabla por cada curso que mudó lecciones (la Caro-Kann y los siete)', () => {
    expect(TABLAS_DE_MUDANZA.map((t) => cursoDe(t.prefijo)).sort()).toEqual(['caro-kann:b', 'caro-kann:w', 'escandinava:w', 'eslava:b', 'francesa:w', 'italiana:w', 'otros-negras:b', 'siciliana:w'])
  })

  for (const { prefijo, tabla } of TABLAS_DE_MUDANZA) {
    const id = cursoDe(prefijo)
    it(`${id}: importado después de la migración, queda igual que migrado al abrir`, async () => {
      const { cargarRespaldo } = await import('../../src/estado/respaldo.ts')
      const viejo = guardadoViejo(prefijo, tabla)

      // A: el teléfono abre la app con lo viejo y migra
      guardar('progreso', viejo.progreso)
      guardar('repaso', viejo.repaso)
      migrarTodo()
      const alAbrir = foto(id)

      // B: la app ya migró (marcas puestas) y después se importa un Respaldo hecho antes de la actualización
      instalarLocalStorage()
      migrarTodo()
      cargarRespaldo(importar(exportar({ favoritas: [], progreso: viejo.progreso, registro: [], repaso: viejo.repaso })))
      const alImportar = foto(id)

      expect(alImportar).toEqual(alAbrir)
      // la prueba mide algo: lo viejo sí se mudó y sale en el Repaso de hoy
      const nuevas = new Set(Object.values(tabla).map((n) => prefijo + n))
      expect(Object.keys(alAbrir.repaso).some((k) => nuevas.has(k))).toBe(true)
      expect(alAbrir.hoy.some((l) => nuevas.has(l))).toBe(true)
      // nada se borra: las mismas fichas, con otro id
      expect(Object.keys(alAbrir.progreso)).toHaveLength(Object.keys(viejo.progreso).length)
      expect(Object.keys(alAbrir.repaso)).toHaveLength(Object.keys(viejo.repaso).length)
    })
  }

  it('las mudanzas son idempotentes: dos veces dan lo mismo que una', () => {
    const todo = Object.assign({}, ...TABLAS_DE_MUDANZA.map((t) => guardadoViejo(t.prefijo, t.tabla).repaso)) as Record<string, unknown>
    const una = pasarTodas(todo)
    expect(pasarTodas(una)).toEqual(una)
    expect(Object.keys(una)).toHaveLength(Object.keys(todo).length)
  })

  it('un Respaldo ya migrado no cambia al importarlo (exportar → importar → exportar da los mismos bytes)', () => {
    const t = TABLAS_DE_MUDANZA[1]!
    const migrado = pasarTodas(guardadoViejo(t.prefijo, t.tabla).repaso)
    const archivo = exportar({ favoritas: [], progreso: {}, registro: [], repaso: migrado })
    const r = importar(archivo)
    expect(exportar(r)).toBe(archivo)
  })

  it('ningún id viejo de una tabla es hoy una lección de un curso: mudar al importar nunca mueve algo vigente', () => {
    const vigentes = new Set(Object.values(CURSOS_NUEVOS).flatMap((c) => c.variantes.map((v) => leccionIdDe(c, v))))
    for (const { prefijo, tabla } of TABLAS_DE_MUDANZA) for (const viejo of Object.keys(tabla)) expect(vigentes.has(prefijo + viejo), prefijo + viejo).toBe(false)
  })

  it('un Respaldo con lo nuevo y lo viejo de la misma lección no duplica: lo nuevo se queda y lo viejo también, sin moverse', () => {
    const p = 'italiana:w/w:italiana/'
    const r = importar(exportar({ favoritas: [], progreso: { [p + 'paris']: { fecha: 1 }, [p + 'curso-paris']: { fecha: 2 } }, registro: [], repaso: {} }))
    expect(r.progreso).toEqual({ [p + 'paris']: { fecha: 1 }, [p + 'curso-paris']: { fecha: 2 } })
  })
})

describe('§3.2 · el avance de las lecciones viejas, una sola regla', () => {
  it('son los siete cursos que dejaron la lección de antes el 2026-11-25, y la Caro-Kann no', () => {
    expect([...CURSOS_DE_LA_LECCION_DE_ANTES].sort()).toEqual(['caro-kann:w', 'escandinava:w', 'eslava:b', 'francesa:w', 'italiana:w', 'otros-negras:b', 'siciliana:w'])
    for (const id of CURSOS_DE_LA_LECCION_DE_ANTES) expect(cursoNuevo(id), id).toBeDefined()
  })

  for (const { prefijo, tabla } of TABLAS_DE_MUDANZA) {
    const id = cursoDe(prefijo)
    const cuenta = (CURSOS_DE_LA_LECCION_DE_ANTES as readonly string[]).includes(id)
    it(`${id}: una lección vieja hecha ${cuenta ? 'sale terminada en la nueva de la misma línea' : 'no cambia el avance (empieza en cero, C3)'}`, () => {
      const c = cursoNuevo(id)!
      const viejo = guardadoViejo(prefijo, tabla)
      guardar('progreso', viejo.progreso)
      migrarTodo()
      const a = leerAvance(id)
      const hechas = leerProgreso()
      const esperadas = c.variantes.filter((v) => hechas[leccionIdDe(c, v)]).map((v) => v.id)
      if (!cuenta) {
        expect(a.variantes).toEqual({})
        return
      }
      expect(esperadas.length).toBeGreaterThan(0)
      expect(Object.keys(a.variantes).sort()).toEqual([...esperadas].sort())
      for (const v of esperadas) expect(a.variantes[v]).toEqual({ terminada: hechas[leccionIdDe(c, c.variantes.find((x) => x.id === v)!)]!.fecha })
      // "N de M" cuenta solo las obligatorias
      const n = c.variantes.filter((v) => esperadas.includes(v.id) && !esOpcional(c, v.id)).length
      expect(avanceVariantes(c, a)).toMatch(new RegExp(`^${n} de `))
    })
  }

  it('sin contar dos veces: terminada aquí y hecha antes es una sola variante, y gana la fecha de aquí', () => {
    const c = cursoNuevo('siciliana:w')!
    const v = c.variantes.find((x) => !esOpcional(c, x.id))!
    guardar('progreso', { [leccionIdDe(c, v)]: { fecha: 5 } })
    marcarVariante('siciliana:w', v.id, 'terminada', 9)
    const a = leerAvance('siciliana:w')
    expect(a.variantes[v.id]).toEqual({ terminada: 9 })
    expect(avanceVariantes(c, a)).toMatch(/^1 de /)
  })

  it('no se guarda: lo del curso se queda como estaba (se calcula al leer)', () => {
    const c = cursoNuevo('italiana:w')!
    const v = c.variantes[0]!
    guardar('progreso', { [leccionIdDe(c, v)]: { fecha: 5 } })
    expect(leerAvance('italiana:w').variantes[v.id]).toEqual({ terminada: 5 })
    expect(localStorage.getItem('ajedrez.v1.curso:italiana:w')).toBeNull()
  })

  it('un Respaldo viejo, importado después de la migración, también cuenta en la página del curso', async () => {
    const { cargarRespaldo } = await import('../../src/estado/respaldo.ts')
    migrarTodo()
    const p = 'escandinava:w/w:escandinava/'
    cargarRespaldo(importar(exportar({ favoritas: [], progreso: { [p + 'dd8-valenciana']: { fecha: 7 } }, registro: [], repaso: {} })))
    const c = cursoNuevo('escandinava:w')!
    const v = c.variantes.find((x) => x.base === 'curso-valenciana')!
    expect(leerAvance('escandinava:w').variantes[v.id]).toEqual({ terminada: 7 })
  })
})
