import { describe, expect, it } from 'vitest'
import { CURSOS_NUEVOS, jugadasDeLaBaseEn, leccionesDe, lineaPorId } from '../../src/curso/datos.ts'
import { atras, continuar, empezar, empezarDeNuevo, intentar, jugarRival, pedirPista, pedirRespuesta, progreso, reintentar, retomar, tropiezos, type EstadoCiclo } from '../../src/curso/ciclo.ts'
import { posicion, porQueNo } from '../../src/curso/textos.ts'
import { registrarPasoCurso } from '../../src/registro/eventos.ts'
import { jugadasFalladas } from '../../src/registro/refuerza.ts'
import { repertorioDeFavoritas } from '../../src/aprender/favoritas.ts'
import { paraHoy, dia, sumarDias } from '../../src/repaso/repaso.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { LECCIONES_CARO_KANN, pasarCaroKann } from '../../src/aprender/migracion.ts'
import type { EntradaRegistro } from '../../src/registro/registro.ts'

/** C3: el ciclo de la lección nueva, sin pantalla; y el registro sigue alimentando Refuerza y el Repaso de hoy. */
const c = CURSOS_NUEVOS['caro-kann:b']!
const tal = lineaPorId(c, 'v:avance-tal')!
const mov = (san: string, e: EstadoCiclo) => {
  const m = posicion(tal.jugadas, e.ply).move(san)
  return { san: m.san, desde: m.from, hasta: m.to }
}
/** Hasta mi siguiente turno (la máquina juega lo del rival; "Siguiente" si hay que leer). */
const hastaMiTurno = (e: EstadoCiclo) => {
  let x = e
  for (let i = 0; i < 10 && x.momento !== 'tuTurno' && x.momento !== 'fin' && x.momento !== 'plan'; i++) x = x.momento === 'rival' ? jugarRival(tal, x) : continuar(tal, x)
  return x
}

describe('C3 · el ciclo de la lección nueva', () => {
  it('empieza con la introducción; la máquina juega lo del rival; me toca con "Jugada 1 de 4"', () => {
    let e = empezar(tal)
    expect(e.momento).toBe('intro')
    expect(e.ply).toBe(4)
    e = continuar(tal, e)
    expect(e.momento).toBe('rival')
    e = jugarRival(tal, e)
    expect(e.momento).toBe('tuTurno')
    expect(e.ply).toBe(5)
    expect(progreso(tal, e)).toEqual({ n: 1, m: 4 })
  })

  it('correcta: espera "Siguiente" si hay algo que leer (Aprender); si no, la máquina contesta', () => {
    const e = hastaMiTurno(empezar(tal))
    const a = intentar(tal, e, mov('Bf5', e), { esperar: true })
    expect(a.resultado).toBe('correcta')
    expect(a.estado.momento).toBe('leer')
    const b = intentar(tal, e, mov('Bf5', e), { esperar: false })
    expect(b.estado.momento).toBe('rival')
  })

  it('el error se queda hasta "Reintentar" y cuenta como fallo; la buena de otra línea, en otro estado y sin fallo', () => {
    const e = hastaMiTurno(empezar(tal))
    const mal = intentar(tal, e, mov('e6', e), { buenas: jugadasDeLaBaseEn(posicion(tal.jugadas, e.ply).fen()) })
    expect(mal.resultado).toBe('error')
    expect(mal.estado.momento).toBe('error')
    expect(mal.estado.intento!.san).toBe('e6')
    expect(mal.estado.pasos[5]!.fallos).toBe(1)
    expect(reintentar(mal.estado).momento).toBe('tuTurno')
    // 3...c5 es otra línea buena de la base
    const buenas = jugadasDeLaBaseEn(posicion(tal.jugadas, e.ply).fen())
    expect(buenas.has('c5')).toBe(true)
    const buena = intentar(tal, e, mov('c5', e), { buenas })
    expect(buena.resultado).toBe('buena')
    expect(buena.estado.pasos[5]?.fallos ?? 0).toBe(0)
  })

  it('por qué no: dice lo que deja sin defensa, sin decir la jugada en Practicar', () => {
    const e = hastaMiTurno(empezar(tal, 'practicar'))
    const t = porQueNo(c, tal, e.ply, 'Bg4', 'practicar')
    expect(t).not.toContain('Af5')
    const deja = porQueNo(c, tal, e.ply, 'Bh3', 'practicar')
    expect(deja).toMatch(/sin defensa/)
  })

  it('la ayuda va por escalones: Pista, Otra pista, Respuesta; y cuenta en el paso', () => {
    let e = hastaMiTurno(empezar(tal))
    e = pedirPista(e)
    expect(e.ayuda).toBe(1)
    e = pedirPista(e)
    expect(e.ayuda).toBe(2)
    expect(pedirPista(e).ayuda).toBe(2)
    e = pedirRespuesta(e)
    expect(e.ayuda).toBe(3)
    expect(e.pasos[5]).toEqual({ fallos: 0, pista: true, respuesta: true })
  })

  it('con un error a la vista, Respuesta y Pista lo quitan y ayudan en un solo toque (C7)', () => {
    const e = hastaMiTurno(empezar(tal))
    const mal = intentar(tal, e, mov('e6', e)).estado
    const r = pedirRespuesta(mal)
    expect(r.momento).toBe('tuTurno')
    expect(r.intento).toBeNull()
    expect(r.ayuda).toBe(3)
    expect(r.pasos[5]).toEqual({ fallos: 1, pista: false, respuesta: true })
    expect(pedirPista(mal).ayuda).toBe(1)
  })

  it('en un «¿Y si…?», el porqué de una jugada equivocada no dice la jugada (C7)', () => {
    for (const x of c.piezas.errores.lista) {
      const l = lineaPorId(c, `e:${x.id}`)!
      const ply = l.jugadas.findIndex((_, i) => i > l.desde && (i % 2 === 0 ? 'w' : 'b') === l.lado)
      const pos = posicion(l.jugadas, ply)
      const otra = pos.moves().find((s) => s !== l.jugadas[ply] && !c.mias[l.jugadas.slice(0, ply + 1).join(' ')]?.errores?.[s])!
      expect(porQueNo(c, l, ply, otra, 'aprender')).not.toMatch(/Esta lección juega/)
    }
  })

  it('una jugada buena que la base no trae (campo buenas) no sale en rojo (C7)', () => {
    const cambio = lineaPorId(c, 'v:cambio')!
    const ply = cambio.jugadas.indexOf('Qd7')
    const mia = c.mias[cambio.jugadas.slice(0, ply + 1).join(' ')]!
    expect(mia.buenas).toContain('Qc8')
    let e: EstadoCiclo = { ...empezar(cambio, 'practicar'), ply, momento: 'tuTurno' }
    const m = posicion(cambio.jugadas, ply).move('Qc8')
    const buenas = new Set([...jugadasDeLaBaseEn(posicion(cambio.jugadas, ply).fen()), ...mia.buenas!])
    e = intentar(cambio, e, { san: m.san, desde: m.from, hasta: m.to }, { buenas }).estado
    expect(e.momento).toBe('buena')
  })

  it('Atrás regresa una jugada mía; Empezar de nuevo, a la primera; retomar, donde me quedé', () => {
    let e = hastaMiTurno(empezar(tal))
    e = intentar(tal, e, mov('Bf5', e), { esperar: true }).estado
    expect(atras(tal, e).ply).toBe(5)
    e = hastaMiTurno(continuar(tal, e))
    expect(e.ply).toBe(7)
    expect(atras(tal, e).ply).toBe(5)
    expect(atras(tal, atras(tal, e)).ply).toBe(5) // no hay jugada mía antes
    expect(hastaMiTurno(empezarDeNuevo(tal, e)).ply).toBe(5)
    const r = retomar(tal, 'aprender', 7)
    expect(r.momento).toBe('tuTurno')
    expect(r.ply).toBe(7)
  })

  it('Aprender termina en el plan; Practicar, en el resumen con mis tropiezos', () => {
    let e = hastaMiTurno(empezar(tal))
    for (const s of ['Bf5', 'h5', 'Bxd3', 'e6']) e = hastaMiTurno(intentar(tal, e, mov(s, e), { esperar: true }).estado)
    expect(e.momento).toBe('plan')
    e = hastaMiTurno(empezar(tal, 'practicar'))
    e = pedirPista(e)
    for (const s of ['Bf5', 'h5', 'Bxd3', 'e6']) e = hastaMiTurno(intentar(tal, e, mov(s, e)).estado)
    expect(e.momento).toBe('fin')
    expect(tropiezos(e).map((t) => t.ply)).toEqual([5])
  })
})

describe('C3 · el registro sigue alimentando Refuerza y el Repaso de hoy', () => {
  it('un fallo en Practicar entra al registro y sale en Refuerza', () => {
    let e = hastaMiTurno(empezar(tal, 'practicar'))
    e = intentar(tal, e, mov('e6', e)).estado // fallo
    e = reintentar(e)
    const fen = posicion(tal.jugadas, e.ply).fen()
    const r = intentar(tal, e, mov('Bf5', e))
    // lo mismo que registra la pantalla al acertar en Practicar
    const entrada: EntradaRegistro = registrarPasoCurso({ fen, esperada: tal.jugadas[e.ply]!, paso: r.estado.pasos[e.ply]!, linea: tal.nombre, camino: tal.jugadas.slice(0, e.ply) })
    expect(entrada.resultado).toBe('fallo')
    const falladas = jugadasFalladas(repertorioDeFavoritas(['caro-kann:b']), [entrada])
    expect(falladas.some((j) => j.esperada === 'Bf5')).toBe(true)
  })

  it('las variantes del curso son las lecciones de la Caro-Kann para el Repaso: al terminar una, vuelve mañana', () => {
    const ck = cursos().find((x) => x.id === 'caro-kann:b')!
    expect(ck.lecciones.map((l) => l.id)).toEqual(leccionesDe(c).map((l) => l.id))
    const l = ck.lecciones.find((x) => x.id.endsWith('/curso-avance-tal'))!
    expect(l.nombre).toBe(tal.nombre)
    const hoy = dia()
    const hechas = { [l.id]: { fecha: Date.now() } }
    expect(paraHoy({}, hechas, ck.lecciones, hoy)).toHaveLength(0)
    expect(paraHoy({}, hechas, ck.lecciones, sumarDias(hoy, 1)).map((x) => x.id)).toEqual([l.id])
  })

  it('lo que ya llevaba en el Repaso de la Caro-Kann vieja pasa a la lección nueva de la misma respuesta', () => {
    const viejo = { 'caro-kann:b/b:caro-kann/avance-tal': { escalon: 2 }, 'italiana:w/w:italiana/paris': { escalon: 1 } }
    const nuevo = pasarCaroKann(viejo)
    expect(nuevo['caro-kann:b/b:caro-kann/curso-avance-tal']).toEqual({ escalon: 2 })
    expect(nuevo['caro-kann:b/b:caro-kann/avance-tal']).toBeUndefined() // se mudó: no cuenta dos veces
    expect(nuevo['italiana:w/w:italiana/paris']).toEqual({ escalon: 1 })
  })

  it('ninguna lección vieja de la Caro-Kann se queda sin lección nueva (pase adversarial 1: la Karpov y la Botvinnik-Carls)', () => {
    // las 22 lecciones de antes (la base de main antes del curso), con negras
    const viejas = ['avance-short', 'avance-short-cf3', 'avance-van-der-wiel', 'avance-tal', 'avance-bayoneta', 'avance-bronstein', 'avance-botvinnik-carls', 'clasica', 'karpov', 'karpov-moderna', 'clasica-cc3', 'karpov-kasparov', 'cambio-rubinstein', 'panov-mieses', 'panov-principal', 'dos-caballos', 'dos-caballos-cf3', 'dos-caballos-cf3-apocalipsis', 'panov-acelerado', 'maroczy', 'breyer', 'hillbilly']
    const nuevas = new Set(leccionesDe(c).map((x) => x.id.split('/').pop()))
    for (const v of viejas) expect(nuevas.has(LECCIONES_CARO_KANN[v] ?? v), v).toBe(true)
    const r = pasarCaroKann({ 'caro-kann:b/b:caro-kann/karpov': { escalon: 3 } })
    expect(r['caro-kann:b/b:caro-kann/curso-clasica']).toEqual({ escalon: 3 })
  })
})
