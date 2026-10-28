import { describe, expect, it } from 'vitest'
import { conJugada, deshacer, nuevaPartida, puedeDeshacer, rendirse, resultadoPara } from '../../src/partida/modelo.ts'
import { gruposDePersonajes, personajesDisponibles, recomendado, PERSONAJES } from '../../src/bots/personajes.ts'
import { libroDe } from '../../src/bots/libros.ts'
import { lineasDeLibro } from '../../src/bots/fuente-libros.ts'
import { azarConSemilla } from '../../src/motor/elegir.ts'

describe('la partida contra el bot', () => {
  it('deshacer regresa mi jugada y la respuesta del bot (dos medias jugadas)', () => {
    let p = nuevaPartida('brisa', 'w')
    for (const u of ['e2e4', 'e7e5', 'g1f3', 'b8c6']) p = conJugada(p, u)
    p = deshacer(p)
    expect(p.jugadas).toEqual(['e2e4', 'e7e5'])
    expect(p.deshechas).toBe(1)
  })
  it('si el bot no alcanzó a contestar, deshacer quita solo mi jugada', () => {
    let p = nuevaPartida('brisa', 'w')
    for (const u of ['e2e4', 'e7e5', 'g1f3']) p = conJugada(p, u)
    expect(deshacer(p).jugadas).toEqual(['e2e4', 'e7e5'])
  })
  it('con negras, si solo jugó el bot, no hay nada que deshacer', () => {
    let p = nuevaPartida('brisa', 'b')
    p = conJugada(p, 'e2e4')
    expect(puedeDeshacer(p)).toBe(false)
    p = conJugada(conJugada(p, 'c7c6'), 'd2d4')
    expect(deshacer(p).jugadas).toEqual(['e2e4'])
  })
  it('rendirse termina la partida como derrota', () => {
    const p = rendirse(conJugada(nuevaPartida('brisa', 'w'), 'e2e4'))
    expect(p.fin?.tipo).toBe('rendicion')
    expect(resultadoPara(p)).toBe('perdi')
    expect(puedeDeshacer(p)).toBe(false)
  })
  it('el mate del pastor termina la partida y gano', () => {
    let p = nuevaPartida('brisa', 'w')
    for (const u of ['e2e4', 'e7e5', 'd1h5', 'b8c6', 'f1c4', 'g8f6', 'h5f7']) p = conJugada(p, u)
    expect(p.fin?.nombre).toBe('Jaque mate')
    expect(resultadoPara(p)).toBe('gane')
  })
})

describe('personajes', () => {
  it('son 47, con la distribución pedida, y nombres únicos', () => {
    expect(PERSONAJES).toHaveLength(47)
    const por = (elo: number) => PERSONAJES.filter((p) => p.elo === elo).length
    for (const e of [100, 200, 300, 400]) expect(por(e)).toBe(1)
    for (const e of [500, 600, 700, 800, 900, 1000]) expect(por(e)).toBe(3)
    for (const e of [1100, 1200, 1300, 1400, 1500]) expect(por(e)).toBe(2)
    for (let e = 1600; e <= 3000; e += 100) expect(por(e)).toBe(1)
    expect(new Set(PERSONAJES.map((p) => p.nombre)).size).toBe(47)
  })
  it('solo se escogen los de niveles calibrados (T13: los 47), con mi zona primero y un 700 recomendado', async () => {
    const { NIVELES } = await import('../../src/motor/niveles.ts')
    const calibrados = new Set(NIVELES.filter((n) => (n as { calibrado?: boolean }).calibrado !== false).map((n) => n.elo))
    const disp = personajesDisponibles()
    expect(disp.every((p) => calibrados.has(p.elo))).toBe(true)
    expect(disp).toHaveLength(PERSONAJES.filter((p) => calibrados.has(p.elo)).length)
    expect(gruposDePersonajes()[0]!.titulo).toBe('Tu zona')
    expect(gruposDePersonajes()[0]!.personajes.every((p) => p.elo >= 500 && p.elo <= 1000)).toBe(true)
    expect(recomendado().elo).toBe(700)
  })
  it('el libro juega las jugadas de su lado y se calla fuera de sus líneas', () => {
    const brisa = PERSONAJES.find((p) => p.id === 'brisa')!
    const libroBlancas = libroDe(brisa, 'w', lineasDeLibro)
    const azar = azarConSemilla(2)
    expect(libroBlancas([], azar)).toBe('e4')
    expect(libroBlancas(['e4'], azar)).toBeNull() // le toca a negras
    expect(libroBlancas(['e4', 'e5'], azar)).toBe('Nf3')
    expect(libroBlancas(['e4', 'a5'], azar)).toBeNull()
  })
})
