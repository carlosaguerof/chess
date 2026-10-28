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
    expect(e[A.id]).toEqual({ escalon: 1, proxima: '2026-10-29' })
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
    const texto = exportar({ repertorio: { version: 1, lineas: [] }, progreso: {}, registro: [], repaso })
    const leido = importar(texto)
    expect(leido.repaso).toEqual(repaso)
    expect(exportar(leido)).toBe(texto)
  })
})
