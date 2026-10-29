import { describe, expect, it } from 'vitest'
import { CURSOS_NUEVOS, lineaPorId, misJugadas, textoMio } from '../../src/curso/datos.ts'
import { continuar, empezar, intentar, jugarRival, pedirPista, pedirRespuesta, type EstadoCiclo } from '../../src/curso/ciclo.ts'
import { despues, posicion } from '../../src/curso/textos.ts'
import { explicacionDespues, INTRO_PRACTICAR, vistaTuTurno } from '../../src/curso/turno.ts'
import { sanAEspanol } from '../../src/ajedrez/notacion.ts'

/**
 * Correcciones de la Caro-Kann, C2 (punto 5 del feedback): Practicar sin ayudas que no pediste. Los escalones de
 * ayuda, sin pantalla. "Aprender" no cambia.
 */
const c = CURSOS_NUEVOS['caro-kann:b']!
const tal = lineaPorId(c, 'v:avance-tal')!
const errorTal = lineaPorId(c, 'e:tal-e6')!
const hastaMiTurno = (e: EstadoCiclo) => {
  let x = e
  for (let i = 0; i < 10 && x.momento !== 'tuTurno'; i++) x = x.momento === 'rival' ? jugarRival(tal, x) : continuar(tal, x)
  return x
}
const vista = (e: EstadoCiclo) => vistaTuTurno(c, tal, e.vuelta, e.ply, e.ayuda)

describe('Correcciones · C2 · Practicar sin ayudas que no pediste', () => {
  it('en mi turno de Practicar no hay ningún texto sobre mi jugada, ni marca, ni flecha', () => {
    for (const l of [tal, lineaPorId(c, 'v:avance-short')!, lineaPorId(c, 'v:clasica')!])
      for (const ply of misJugadas(l)) {
        const v = vistaTuTurno(c, l, 'practicar', ply, 0)
        expect(v, `${l.id} ${ply}`).toEqual({ textos: [], pieza: null, flecha: null })
      }
  })

  it('Pista: la meta en palabras (lo que antes era la pregunta); otra vez: se marca la pieza, sin más texto', () => {
    let e = hastaMiTurno(empezar(tal, 'practicar'))
    const mia = textoMio(c, tal.jugadas, e.ply)!
    e = pedirPista(e)
    expect(e.ayuda).toBe(1)
    expect(vista(e)).toEqual({ textos: [{ tipo: 'pista', texto: `Pista: ${mia.pregunta}` }], pieza: null, flecha: null })
    e = pedirPista(e)
    expect(e.ayuda).toBe(2)
    // 3...Af5: se marca el alfil de c8; el texto sigue siendo solo la pista
    expect(vista(e)).toEqual({ textos: [{ tipo: 'pista', texto: `Pista: ${mia.pregunta}` }], pieza: 'c8', flecha: null })
    // y no dice la jugada
    expect(JSON.stringify(vista(e))).not.toContain('f5')
  })

  it('Respuesta: solo la flecha, sin repetir texto', () => {
    let e = hastaMiTurno(empezar(tal, 'practicar'))
    e = pedirRespuesta(e)
    expect(vista(e)).toEqual({ textos: [], pieza: null, flecha: { de: 'c8', a: 'f5' } })
    // también después de las dos pistas
    let p = hastaMiTurno(empezar(tal, 'practicar'))
    p = pedirRespuesta(pedirPista(pedirPista(p)))
    expect(vista(p)).toEqual({ textos: [], pieza: null, flecha: { de: 'c8', a: 'f5' } })
  })

  it('después de mi jugada (correcta, o tras la Respuesta) espera "Siguiente" con la explicación: qué hace, por qué ahora y qué prepara', () => {
    for (const ply of misJugadas(tal)) {
      const m = textoMio(c, tal.jugadas, ply)!
      const t = explicacionDespues(c, tal, 'practicar', ply)
      expect(t[0]).toBe(m.hace)
      expect(t.slice(1)).toEqual(despues(m))
      if (m.porque) expect(t).toContain(m.porque)
      if (m.prepara) expect(t).toContain(m.prepara)
    }
    let e = pedirRespuesta(hastaMiTurno(empezar(tal, 'practicar')))
    const j = posicion(tal.jugadas, e.ply).move(tal.jugadas[e.ply]!)
    const r = intentar(tal, e, { san: j.san, desde: j.from, hasta: j.to }, { esperar: explicacionDespues(c, tal, e.vuelta, e.ply).length > 0 })
    expect(r.resultado).toBe('correcta')
    expect(r.estado.momento).toBe('leer')
    // cuenta igual como Respuesta vista (Refuerza y el Repaso)
    expect(r.estado.pasos[5]).toEqual({ fallos: 0, pista: false, respuesta: true })
    e = r.estado
    expect(continuar(tal, e).momento).toBe('rival')
  })

  it('"Aprender" no cambia: "Te toca" con qué hace; Pista, Otra pista con su texto, y la Respuesta con su porqué', () => {
    let e = hastaMiTurno(empezar(tal, 'aprender'))
    const m = textoMio(c, tal.jugadas, e.ply)!
    expect(vista(e).textos).toEqual([{ tipo: 'pregunta', jugada: 'Te toca: 3...Af5', texto: m.hace }])
    e = pedirPista(e)
    expect(vista(e).textos.map((t) => t.tipo)).toEqual(['pregunta', 'pista'])
    expect(vista(e).textos[1]!.texto).toBe(`Pista: ${m.pista}`)
    e = pedirPista(e)
    expect(vista(e).textos.map((t) => t.texto)).toContain('Otra pista: Se mueve el alfil de c8.')
    expect(vista(e).pieza).toBe('c8')
    e = pedirRespuesta(e)
    expect(vista(e).textos).toEqual([
      { tipo: 'pregunta', jugada: 'Te toca: 3...Af5', texto: m.hace },
      { tipo: 'respuesta', jugada: 'Respuesta: 3...Af5', texto: [m.hace, m.porque].filter(Boolean).join(' ') },
    ])
    expect(vista(e).flecha).toEqual({ de: 'c8', a: 'f5' })
    // la explicación de después, la de siempre: por qué ahora, qué prepara, cuidado
    expect(explicacionDespues(c, tal, 'aprender', 5)).toEqual(despues(m))
  })

  it('un «¿Y si…?» no es Practicar: sigue preguntando por la meta', () => {
    const ply = misJugadas(errorTal)[0]!
    const m = textoMio(c, errorTal.jugadas, ply)!
    expect(vistaTuTurno(c, errorTal, 'aprender', ply, 0).textos).toEqual([{ tipo: 'pregunta', texto: m.pregunta }])
  })

  it('la introducción de Practicar ya no promete preguntar por la meta, y no nombra jugadas', () => {
    expect(INTRO_PRACTICAR).not.toMatch(/meta|pregunto/)
    expect(INTRO_PRACTICAR).not.toMatch(/\d\./)
  })

  it('la frase del rival, lo único que se lee en mi turno de Practicar, no nombra mi jugada', () => {
    for (const l of [tal, lineaPorId(c, 'v:avance-short')!])
      for (const ply of misJugadas(l)) {
        const antes = c.rival[l.jugadas.slice(0, ply).join(' ')]
        if (!antes) continue
        const mia = sanAEspanol(l.jugadas[ply]!)
        expect(antes.texto, `${l.id} ${ply}`).not.toContain(`...${mia}`)
      }
  })
})
