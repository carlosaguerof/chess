import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { alRepasar, dia, ESCALONES, fichaDe, minutos, paraHoy, sumarDias, type EstadoRepaso } from '../../src/repaso/repaso.ts'
import type { Leccion } from '../../src/cursos/modelo.ts'

const leccion = (id: string, jugadas = ['e4', 'c6', 'd4', 'd5']): Leccion => ({ id, cursoId: 'c', nombre: id, familia: id, plan: '', autorPlan: 'ia', frecuencia: 3, color: 'b', jugadas })
const A = leccion('caro-kann:b/avance')
const B = leccion('caro-kann:b/clasica')
const NUNCA = leccion('caro-kann:b/cambio')

describe('R7 · repaso espaciado (con un reloj falso)', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 9, 28, 10, 0))
  })
  afterEach(() => vi.useRealTimers())

  it('una línea aprendida hoy vuelve mañana; sin ayuda sube los cinco escalones: 1, 3, 7, 14 y 30 días', () => {
    const hechas = { [A.id]: { fecha: Date.now() } }
    let e: EstadoRepaso = {}
    const hoy = dia()
    expect(hoy).toBe('2026-10-28')
    expect(paraHoy(e, hechas, [A], hoy)).toEqual([])
    vi.setSystemTime(new Date(2026, 9, 29, 9, 0)) // mañana
    expect(paraHoy(e, hechas, [A], dia())).toEqual([A])
    // cuatro repasos limpios: el siguiente toca en 3, 7, 14 y 30 días; luego se queda en 30
    const vistos: number[] = []
    for (let i = 0; i < 5; i++) {
      const d = dia()
      e = alRepasar(e, A.id, d, true, hechas)
      const f = fichaDe(e, A.id, hechas)!
      const espera = Math.round((new Date(f.proxima).getTime() - new Date(d).getTime()) / 86_400_000)
      vistos.push(espera)
      expect(paraHoy(e, hechas, [A], d)).toEqual([]) // ya salió de la lista de hoy
      vi.setSystemTime(new Date(`${f.proxima}T09:00:00`))
      expect(paraHoy(e, hechas, [A], dia())).toEqual([A])
    }
    expect([1, ...vistos.slice(0, 4)]).toEqual([...ESCALONES])
    expect(vistos[4]).toBe(30)
  })

  it('un error, una Pista o una Respuesta la regresan al primer escalón: vuelve mañana', () => {
    const hechas = { [A.id]: { fecha: new Date(2026, 8, 1).getTime() } }
    let e: EstadoRepaso = { [A.id]: { escalon: 4, proxima: '2026-10-28' } }
    e = alRepasar(e, A.id, '2026-10-28', false, hechas) // fallé una jugada, o pedí Pista o Respuesta
    expect(e[A.id]).toMatchObject({ escalon: 1, proxima: '2026-10-29' })
    expect(paraHoy(e, hechas, [A], '2026-10-28')).toEqual([])
    expect(paraHoy(e, hechas, [A], '2026-10-29')).toEqual([A])
  })

  it('una línea que no he aprendido no entra al repaso, y las que ya tocaban salen primero', () => {
    const hechas = { [A.id]: { fecha: new Date(2026, 9, 20).getTime() }, [B.id]: { fecha: new Date(2026, 9, 26).getTime() } }
    expect(paraHoy({}, hechas, [NUNCA, B, A], '2026-10-28')).toEqual([A, B])
    expect(paraHoy({}, hechas, [NUNCA], '2027-01-01')).toEqual([])
  })

  it('cuenta los minutos (unos 10 segundos por jugada mía) y cruza bien fin de mes', () => {
    expect(minutos([A, B])).toBe(1)
    expect(minutos(Array.from({ length: 12 }, (_, i) => leccion(`x${i}`, ['e4', 'c6', 'd4', 'd5', 'e5', 'Bf5', 'Nf3', 'e6'])))).toBe(8)
    expect(sumarDias('2026-10-31', 1)).toBe('2026-11-01')
    expect(sumarDias('2026-12-20', 14)).toBe('2027-01-03')
  })
})

describe('R7 · las fechas del repaso entran al exportar e importar', () => {
  it('exportar → importar conserva los escalones y las fechas', async () => {
    const { exportar, importar } = await import('../../src/repertorio/edicion.ts')
    const repaso = { 'caro-kann:b/avance': { escalon: 3, proxima: '2026-11-04' } }
    const texto = exportar({ favoritas: [], progreso: {}, registro: [], repaso })
    const leido = importar(texto)
    expect(leido.repaso).toEqual(repaso)
    expect(exportar(leido)).toBe(texto)
  })
})

describe('R7 · sobre el registro de la nota 1 (pase 1 de la T22)', () => {
  it('un fallo, una Pista o una Respuesta en una jugada de la línea, después de su último repaso, la regresan al escalón 1', () => {
    const hechas = { [A.id]: { fecha: new Date(2026, 9, 1).getTime() } }
    // repasada limpia el 20: va en el escalón 3 y vuelve el 27
    const e: EstadoRepaso = { [A.id]: { escalon: 3, proxima: '2026-10-27', ultima: new Date(2026, 9, 20, 10).getTime() } }
    const posAntesDeC6 = 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -'
    for (const resultado of ['fallo', 'pista', 'respuesta'] as const) {
      // el 22, en Refuerza (o en una partida), fallé 1...c6
      const registro = [{ fen: posAntesDeC6, esperada: 'c6', resultado, lugar: 'refuerza' as const, fecha: new Date(2026, 9, 22, 18).getTime() }]
      expect(fichaDe(e, A.id, hechas, registro, A)).toMatchObject({ escalon: 1, proxima: '2026-10-23' })
      expect(paraHoy(e, hechas, [A], '2026-10-23', registro)).toEqual([A])
    }
    // un acierto no cuenta, ni un fallo de antes del último repaso
    const viejo = [{ fen: posAntesDeC6, esperada: 'c6', resultado: 'fallo' as const, lugar: 'curso' as const, fecha: new Date(2026, 9, 19).getTime() }]
    const acierto = [{ fen: posAntesDeC6, esperada: 'c6', resultado: 'acierto' as const, lugar: 'partida' as const, fecha: new Date(2026, 9, 22).getTime() }]
    expect(paraHoy(e, hechas, [A], '2026-10-23', [...viejo, ...acierto])).toEqual([])
  })
})

describe('R7 · el escalón que puso el registro se guarda (pase 2 de la T22)', () => {
  it('tras un fallo en Refuerza la línea vuelve al 1; repasada limpia sube al 2 (3 días), no salta al 4', () => {
    const hechas = { [A.id]: { fecha: new Date(2026, 9, 1).getTime() } }
    const e: EstadoRepaso = { [A.id]: { escalon: 3, proxima: '2026-10-27', ultima: new Date(2026, 9, 20, 10).getTime() } }
    const registro = [{ fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -', esperada: 'c6', resultado: 'fallo' as const, lugar: 'refuerza' as const, fecha: new Date(2026, 9, 22, 18).getTime() }]
    const tras = alRepasar(e, A.id, '2026-10-23', true, hechas, new Date(2026, 9, 23, 9).getTime(), registro, A)
    expect(tras[A.id]).toMatchObject({ escalon: 2, proxima: '2026-10-26' })
  })
  it('un fallo repasando OTRA línea (en su curso) no regresa esta', () => {
    const hechas = { [A.id]: { fecha: new Date(2026, 9, 1).getTime() } }
    const e: EstadoRepaso = { [A.id]: { escalon: 2, proxima: '2026-10-30', ultima: new Date(2026, 9, 27, 10).getTime() } }
    const deB = [{ fen: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq -', esperada: 'c6', resultado: 'fallo' as const, lugar: 'curso' as const, linea: B.nombre, fecha: new Date(2026, 9, 27, 10, 5).getTime() }]
    expect(fichaDe(e, A.id, hechas, deB, A)).toMatchObject({ escalon: 2, proxima: '2026-10-30' })
  })
})
