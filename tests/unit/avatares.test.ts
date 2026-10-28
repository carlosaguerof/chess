import { describe, expect, it } from 'vitest'
import { PERSONAJES } from '../../src/bots/personajes.ts'
import { ESTILOS, opcionesRetrato, svgRetrato } from '../../src/bots/retratos.ts'

describe('L1 · retratos de los personajes en tres estilos', () => {
  it('son 47 personajes, cada uno con su aspecto', () => {
    expect(PERSONAJES).toHaveLength(47)
    for (const p of PERSONAJES) expect(p.aspecto, p.id).toBeTruthy()
  })

  for (const e of ESTILOS)
    it(`${e.nombre}: los 47 se ven distintos entre sí, y siempre igual el mismo`, () => {
      // lo que fija el dibujo (sin la semilla) es distinto para cada personaje…
      const firmas = PERSONAJES.map((p) => {
        const { seed: _seed, ...resto } = opcionesRetrato(e.id, p)
        return JSON.stringify(resto)
      })
      expect(new Set(firmas).size).toBe(47)
      // …y el dibujo también
      const svgs = PERSONAJES.map((p) => svgRetrato(e.id, p))
      expect(new Set(svgs).size).toBe(47)
      // el mismo personaje, el mismo dibujo
      expect(svgRetrato(e.id, PERSONAJES[5]!)).toBe(svgs[5])
      // sin imágenes de fuera: todo es dibujo en el SVG
      for (const s of svgs) expect(s).not.toMatch(/<image\b/)
    })

  it('variados: edades, pieles, pelo y accesorios', () => {
    const cuenta = <K extends string | number>(f: (p: (typeof PERSONAJES)[number]) => K | undefined) => {
      const m = new Map<K, number>()
      for (const p of PERSONAJES) {
        const k = f(p)
        if (k !== undefined) m.set(k, (m.get(k) ?? 0) + 1)
      }
      return m
    }
    const edades = cuenta((p) => p.aspecto.edad)
    expect([...edades.keys()].sort()).toEqual(['adulto', 'joven', 'mayor', 'nino'])
    for (const n of edades.values()) expect(n).toBeGreaterThanOrEqual(4)
    expect(cuenta((p) => p.aspecto.piel).size).toBe(5)
    for (const n of cuenta((p) => p.aspecto.piel).values()) expect(n).toBeGreaterThanOrEqual(4)
    expect(cuenta((p) => p.aspecto.colorPelo).size).toBeGreaterThanOrEqual(7)
    expect(cuenta((p) => p.aspecto.peinado).size).toBeGreaterThanOrEqual(10)
    expect(PERSONAJES.filter((p) => p.aspecto.lentes).length).toBeGreaterThanOrEqual(10)
    expect(PERSONAJES.filter((p) => p.aspecto.barba).length).toBeGreaterThanOrEqual(10)
    expect(PERSONAJES.filter((p) => p.aspecto.gorro).length).toBeGreaterThanOrEqual(4)
  })

  it('las frases son de personalidad: sin nombres de aperturas, jugadas ni inglés', () => {
    const prohibidas = /siciliana|caro|kann|francesa|escandinava|eslava|italiana|londres|gambito|alapin|\b[RDTAC]?[a-h][1-8]\b|0-0|\bRapid\b|\bBlitz\b|\bBullet\b/i
    for (const p of PERSONAJES) expect(p.frase, p.id).not.toMatch(prohibidas)
  })
})
