import { beforeEach, describe, expect, it } from 'vitest'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { execFileSync } from 'node:child_process'
import { esOtraJugada, migrarTodo, pasarTodas, TABLAS_DE_MUDANZA } from '../../src/aprender/migracion.ts'
import { BASE } from '../../src/base/base.ts'
import NOMBRES_PUBLICADOS_JSON from '../../src/curso/nombres-de-antes.json' with { type: 'json' }
import { exportar, importar } from '../../src/repertorio/edicion.ts'
import { guardar } from '../../src/estado/almacen.ts'
import { leerProgreso } from '../../src/repertorio/estado.ts'
import { Chess } from 'chess.js'
import { fichaDe, leerRepaso, paraHoy } from '../../src/repaso/repaso.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { avanceVariantes, CURSOS_NUEVOS, cursoNuevo, esOpcional, leccionIdDe, NOMBRES_DE_ANTES } from '../../src/curso/datos.ts'
import { CURSOS_DE_LA_LECCION_DE_ANTES, leerAvance, marcarVariante } from '../../src/curso/avance.ts'

/**
 * Lo guardado no se pierde ni se duplica (cierre de los cursos, 2026-11-25, `specs/cursos.md` §4).
 * §3.1: un Respaldo con los ids viejos, importado después de la migración, deja el Repaso y el avance igual que si se
 * hubiera migrado al abrir. §3.2: lo que la lección de antes marcó hecho sale terminado en la variante nueva de la misma
 * línea, en los siete cursos, sin contar dos veces.
 */

const NOMBRES_PUBLICADOS = NOMBRES_PUBLICADOS_JSON as Record<string, string[]>
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
      // lo que vino de otra jugada tuya no cuenta (`marcarOtraJugada`)
      const esperadas = c.variantes.filter((v) => hechas[leccionIdDe(c, v)] && !(hechas[leccionIdDe(c, v)] as { otraJugada?: boolean }).otraJugada).map((v) => v.id)
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

/**
 * La revisión del cierre (2026-11-25): lo que hay en el teléfono es lo publicado (`main` `1baf424`), no `main`. Ahí los
 * siete cursos usaban la lección de antes, que guardaba en el registro el nombre de la variante de la base. Un fallo
 * guardado así, después del último repaso, tiene que seguir regresando la ficha al escalón 1 después de la actualización.
 */
describe('lo publicado → hoy · los fallos guardados con los nombres publicados siguen contando en el Repaso', () => {
  const T0 = Date.parse('2026-11-10T12:00:00Z')
  const T1 = Date.parse('2026-11-20T12:00:00Z')
  const fenCorto = (ch: Chess) => ch.fen().split(' ').slice(0, 4).join(' ')
  const leccion = (id: string) => cursos().flatMap((c) => c.lecciones).find((x) => x.id === id)
  /** Un fallo en la jugada `ply` de una línea, guardado con el nombre `linea`. */
  const falloEn = (jugadas: string[], ply: number, linea: string) => {
    const ch = new Chess()
    for (const s of jugadas.slice(0, ply)) ch.move(s)
    return [{ fen: fenCorto(ch), esperada: jugadas[ply]!, resultado: 'fallo' as const, lugar: 'curso' as const, fecha: T1, linea }]
  }
  const ficha = { escalon: 4, proxima: '2026-12-20', ultima: T0 }

  for (const { prefijo, tabla } of TABLAS_DE_MUDANZA) {
    const curso = cursoDe(prefijo)
    const apertura = prefijo.slice(prefijo.lastIndexOf(':') + 1, -1)
    it(`${curso}: cada lección vieja, hecha y con su ficha, y un fallo con su nombre publicado: al migrar, su ficha nueva regresa al escalón 1`, () => {
      let revisadas = 0
      for (const [vieja, nueva] of Object.entries(tabla)) {
        const base = BASE.aperturas.find((a) => a.id === apertura)!
        const v = base.variantes.find((x) => x.id === vieja)
        const n = base.variantes.find((x) => x.id === nueva)!
        if (!v) continue
        instalarLocalStorage()
        guardar('progreso', { [prefijo + vieja]: { fecha: T0 } })
        guardar('repaso', { [prefijo + vieja]: ficha })
        // la primera jugada tuya que las dos líneas comparten: ahí falló en la lección de antes
        const ply = n.jugadas.findIndex((s, i) => (i % 2 === 0 ? 'w' : 'b') === prefijo[prefijo.indexOf(':') + 1] && v.jugadas.slice(0, i + 1).join(' ') === n.jugadas.slice(0, i + 1).join(' '))
        expect(ply, `${vieja}: comparte una jugada tuya con ${nueva}`).toBeGreaterThanOrEqual(0)
        const registro = falloEn(n.jugadas, ply, v.nombre)
        migrarTodo()
        const l = leccion(prefijo + nueva)!
        expect(l, prefijo + nueva).toBeDefined()
        expect(l.nombresAntes ?? [], `${vieja}: «${v.nombre}»`).toContain(v.nombre)
        expect(fichaDe(leerRepaso(), l.id, leerProgreso(), registro, l)!.escalon, `${vieja} → ${nueva}`).toBe(1)
        // un fallo con el nombre de otra lección no cuenta
        expect(fichaDe(leerRepaso(), l.id, leerProgreso(), falloEn(n.jugadas, ply, 'Otra lección'), l)!.escalon).toBe(4)
        revisadas++
      }
      expect(revisadas).toBeGreaterThan(0)
    })
  }

  it('y cada lección que ya era lección con su id (lo publicado de la misma variante): cada nombre suyo publicado cuenta', () => {
    let revisadas = 0
    for (const id of Object.keys(NOMBRES_PUBLICADOS)) {
      const l = leccion(id)
      if (!l) continue // una opcional de hoy no está en cursos() con ficha: no sale en el Repaso
      for (const nombre of NOMBRES_PUBLICADOS[id]!) {
        const ply = l.jugadas.findIndex((_, i) => (i % 2 === 0 ? 'w' : 'b') === l.color)
        const e = { [id]: ficha }
        expect(fichaDe(e, id, { [id]: { fecha: T0 } }, falloEn(l.jugadas, ply, nombre), l)!.escalon, `${id}: «${nombre}»`).toBe(1)
        revisadas++
      }
    }
    expect(revisadas).toBeGreaterThan(50)
  })

  it('los nombres publicados incluyen los que citó la revisión', () => {
    expect(NOMBRES_PUBLICADOS['siciliana:w/w:siciliana/alapin-curso-cambio-central']).toContain('Variante Alapin: Defensa Barmen, Cambio Central')
    expect(NOMBRES_PUBLICADOS['italiana:w/w:italiana/curso-paris']).toContain('Defensa París')
    expect(NOMBRES_PUBLICADOS['caro-kann:b/b:caro-kann/curso-clasica']).toContain('Clásica: 3.Cc3')
  })

  it('el archivo de nombres publicados está al día con su script (si este clon tiene el commit publicado)', () => {
    let hay = true
    try {
      execFileSync('git', ['cat-file', '-e', '1baf424^{commit}'], { stdio: 'ignore' })
    } catch {
      hay = false // una copia sin la historia (la corrida de GitHub clona solo la punta)
    }
    if (!hay) return
    const salida = execFileSync('node', ['scripts/nombres-publicados.ts'], { encoding: 'utf8' })
    expect(JSON.parse(salida)).toEqual(NOMBRES_PUBLICADOS)
  })
})

describe('el avance de varias lecciones viejas a una: solo cuenta la misma línea', () => {
  it('son otra jugada tuya la Semieslava, la Clavada, la Stoltz y la Heidenfeld (en los siete cursos, solo esas)', () => {
    const otras = TABLAS_DE_MUDANZA.filter((t) => cursoDe(t.prefijo) !== 'caro-kann:b').flatMap((t) => Object.entries(t.tabla).filter(([v, n]) => esOtraJugada(t.prefijo, v, n)).map(([v]) => v))
    expect(otras.sort()).toEqual(['alapin-cf6-heidenfeld', 'alapin-cf6-stoltz', 'semieslava', 'tranquila-clavada'])
  })

  for (const [curso, vieja, nuevaId] of [
    ['eslava:b', 'semieslava', 'checa'],
    ['eslava:b', 'tranquila-clavada', 'tranquila-schallopp'],
    ['siciliana:w', 'alapin-cf6-stoltz', 'cf6-d4'],
    ['siciliana:w', 'alapin-cf6-heidenfeld', 'cf6-d4'],
  ] as const)
    it(`${curso}: hecha solo ${vieja} → su ficha se muda, pero «${nuevaId}» no sale "Hecha"; al abrir y al importar`, async () => {
      const c = cursoNuevo(curso)!
      const v = c.variantes.find((x) => x.id === nuevaId)!
      const prefijo = `${curso}/${c.color}:${c.apertura}/`
      // al abrir
      guardar('progreso', { [prefijo + vieja]: { fecha: 5 } })
      guardar('repaso', { [prefijo + vieja]: { escalon: 2, proxima: '2026-11-20' } })
      migrarTodo()
      expect(leerRepaso()[leccionIdDe(c, v)]).toEqual({ escalon: 2, proxima: '2026-11-20' })
      expect(leerProgreso()[leccionIdDe(c, v)]).toEqual({ fecha: 5, otraJugada: true })
      expect(leerAvance(curso).variantes[v.id]).toBeUndefined()
      // al importar un Respaldo viejo
      const { cargarRespaldo } = await import('../../src/estado/respaldo.ts')
      instalarLocalStorage()
      migrarTodo()
      cargarRespaldo(importar(exportar({ favoritas: [], progreso: { [prefijo + vieja]: { fecha: 5 } }, registro: [], repaso: {} })))
      expect(leerAvance(curso).variantes[v.id]).toBeUndefined()
      // si después la termino en el curso nuevo, sí cuenta
      marcarVariante(curso, v.id, 'terminada', 9)
      expect(leerAvance(curso).variantes[v.id]).toEqual({ terminada: 9 })
    })

  it('la misma línea sí cuenta: hecha la Checa de antes → «5.a4» sale "Hecha"', () => {
    guardar('progreso', { 'eslava:b/b:eslava/checa': { fecha: 3 } })
    migrarTodo()
    expect(leerAvance('eslava:b').variantes.checa).toEqual({ terminada: 3 })
  })
})

describe('la marca de la migración del Avance sube a 2', () => {
  it('una copia que ya abrió main (modelo-avance en 1) muda las opcionales nuevas de la Francesa al abrir', () => {
    guardar('modelo', 2)
    for (const m of ['modelo-caro-kann', 'modelo-italiana', 'modelo-eslava', 'modelo-escandinava', 'modelo-alapin', 'modelo-avance']) guardar(m, 1)
    guardar('progreso', { 'francesa:w/w:francesa/lputian': { fecha: 4 }, 'francesa:w/w:francesa/curso-paulsen': { fecha: 6 } })
    migrarTodo()
    expect(leerProgreso()).toEqual({ 'francesa:w/w:francesa/curso-lputian': { fecha: 4 }, 'francesa:w/w:francesa/curso-paulsen': { fecha: 6 } })
    expect(leerAvance('francesa:w').variantes.lputian).toEqual({ terminada: 4 })
    expect(localStorage.getItem('ajedrez.v1.modelo-avance')).toBe('2')
    // y no vuelve a correr
    guardar('progreso', { 'francesa:w/w:francesa/euwe': { fecha: 1 } })
    migrarTodo()
    expect(leerProgreso()).toEqual({ 'francesa:w/w:francesa/euwe': { fecha: 1 } })
  })
})

describe('§3.3 y el Repaso · una lección renombrada sigue reconociendo sus fallos de antes', () => {
  it('cada nombre de antes es de una variante que existe y que hoy se llama distinto', () => {
    for (const [curso, vs] of Object.entries(NOMBRES_DE_ANTES))
      for (const [id, nombres] of Object.entries(vs)) {
        const v = cursoNuevo(curso)!.variantes.find((x) => x.id === id)
        expect(v, `${curso} ${id}`).toBeDefined()
        for (const n of nombres) expect(n).not.toBe(v!.nombre)
      }
  })

  it('un fallo guardado con el nombre de antes («Clásica: 3.Cc3», ya publicada) regresa la ficha al escalón 1', () => {
    const l = cursos().find((x) => x.id === 'caro-kann:b')!.lecciones.find((x) => x.id.endsWith('/curso-clasica'))!
    expect(l.nombre).toBe('3.Cc3')
    expect(l.nombresAntes).toContain('Clásica: 3.Cc3')
    const ply = l.jugadas.indexOf('dxe4')
    const ch = new Chess()
    for (const s of l.jugadas.slice(0, ply)) ch.move(s)
    const fallo = (linea: string) => [{ fen: ch.fen().split(' ').slice(0, 4).join(' '), esperada: 'dxe4', resultado: 'fallo' as const, lugar: 'curso' as const, fecha: Date.parse('2026-11-20T12:00:00Z'), linea }]
    const e = { [l.id]: { escalon: 4, proxima: '2026-12-10', ultima: Date.parse('2026-11-10T12:00:00Z') } }
    const hechas = { [l.id]: { fecha: 1 } }
    expect(fichaDe(e, l.id, hechas, fallo('Clásica: 3.Cc3'), l)!.escalon).toBe(1)
    expect(fichaDe(e, l.id, hechas, fallo('3.Cc3'), l)!.escalon).toBe(1)
    // un nombre de otra lección no cuenta
    expect(fichaDe(e, l.id, hechas, fallo('Avance: 4.Cf3'), l)!.escalon).toBe(4)
  })
})
