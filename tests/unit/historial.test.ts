import { describe, expect, it, beforeEach } from 'vitest'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { anotarPartida, dondeMeSalgo, leerHistorial, totales } from '../../src/historial/historial.ts'

describe('R2 · historial de partidas', () => {
  beforeEach(() => {
    instalarLocalStorage()
  })
  it('guarda las partidas y cuenta en qué líneas me salgo más', () => {
    const base = { botId: 'brisa', colorHumano: 'b' as const, fin: 'Jaque mate', jugadas: 30 }
    anotarPartida({ ...base, id: 'a', resultado: 'perdi', fecha: 1, resumen: { caso: 'me-sali', linea: 'Variante del Avance' } })
    anotarPartida({ ...base, id: 'b', resultado: 'gane', fecha: 2, resumen: { caso: 'se-salio-rival' } })
    anotarPartida({ ...base, id: 'c', resultado: 'tablas', fecha: 3, resumen: { caso: 'me-sali', linea: 'Variante del Avance' } })
    anotarPartida({ ...base, id: 'd', resultado: 'perdi', fecha: 4, resumen: { caso: 'me-sali', linea: 'Variante Clásica' } })
    anotarPartida({ ...base, id: 'd', resultado: 'perdi', fecha: 4, resumen: { caso: 'me-sali', linea: 'Variante Clásica' } }) // la misma no se duplica
    const h = leerHistorial()
    expect(h).toHaveLength(4)
    expect(h[0]!.id).toBe('d')
    expect(dondeMeSalgo(h)).toEqual([
      { linea: 'Variante del Avance', veces: 2 },
      { linea: 'Variante Clásica', veces: 1 },
    ])
    expect(totales(h)).toEqual({ gane: 1, perdi: 2, tablas: 1 })
  })
})
