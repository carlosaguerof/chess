import { describe, expect, it, beforeEach } from 'vitest'
import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import type { Base } from '../../src/base/tipos.ts'
import { repertorioInicial, esMiPly } from '../../src/repertorio/modelo.ts'
import { alternativasEn, cursosDe, intentar, marcarPista, nuevoEstado, pista, posicion, respuesta, siguienteLeccion } from '../../src/cursos/modelo.ts'
import { instalarLocalStorage } from './memoria-navegador.ts'

const base = JSON.parse(readFileSync('conocimiento/base.json', 'utf8')) as Base
const rep = repertorioInicial(base)
const cursos = cursosDe(base, rep)
const ck = cursos.find((c) => c.id === 'caro-kann:b')!

describe('T8 · practicar con cursos', () => {
  it('un curso por apertura; primero los de mi repertorio, en el orden de mi guía', () => {
    expect(cursos.slice(0, 9).every((c) => c.enRepertorio)).toBe(true)
    expect(cursos.slice(9).every((c) => !c.enRepertorio)).toBe(true)
    expect(cursos[0]!.id).toBe('italiana:w')
    expect(cursos.map((c) => c.id)).toContain('caro-kann:b')
    expect(cursos.map((c) => c.id)).toContain('londres:w')
  })

  it('las lecciones van en el orden de su frecuencia (Caro-Kann: Avance 5, Clásica 4, Cambio 3, …, Dos Caballos 2)', () => {
    const f = ck.lecciones.map((l) => l.frecuencia)
    expect([...f].sort((a, b) => b - a)).toEqual(f)
    expect(ck.lecciones[0]!.familia).toBe('Variante del Avance')
    expect(ck.lecciones.at(-1)!.familia).toBe('Ataque de los Dos Caballos')
  })

  it('cada lección primero enseña y luego pregunta; termina al acabar las preguntas', () => {
    const l = ck.lecciones[0]!
    let e = nuevoEstado(l)
    expect(e.fase).toBe('ensenar')
    expect(e.ply).toBe(1) // 1.e4 lo juega la máquina; me toca 1...c6
    const mias = l.jugadas.map((s, i) => [s, i] as const).filter(([, i]) => esMiPly('b', i))
    for (const [s] of mias) e = intentar(l, e, s).estado
    expect(e.fase).toBe('preguntar')
    expect(e.ply).toBe(1)
    for (const [s] of mias) e = intentar(l, e, s).estado
    expect(e.fase).toBe('terminada')
  })

  it('lo correcto, lo incorrecto (se repite el paso) y la alternativa aceptada', () => {
    const clasica = ck.lecciones.find((l) => l.jugadas.join(' ').startsWith('e4 c6 d4 d5 Nd2 dxe4 Nxe4 Bf5'))!
    let e = nuevoEstado(clasica)
    for (let i = 0; i < 3; i++) e = intentar(clasica, e, clasica.jugadas[e.ply]!).estado // c6, d5, dxe4
    expect(e.ply).toBe(7) // le toca a negras su 4.ª
    expect(alternativasEn(ck, clasica, 7)).toContain('Nd7') // la Karpov también es mía
    const mal = intentar(clasica, e, 'h6', alternativasEn(ck, clasica, 7))
    expect(mal.resultado).toBe('incorrecta')
    expect(mal.estado.ply).toBe(7)
    expect(mal.estado.paso.fallos).toBe(1)
    const alt = intentar(clasica, mal.estado, 'Nd7', alternativasEn(ck, clasica, 7))
    expect(alt.resultado).toBe('alternativa')
    expect(alt.pasoTerminado?.fallos).toBe(1)
    const bien = intentar(clasica, e, 'Bf5', alternativasEn(ck, clasica, 7))
    expect(bien.resultado).toBe('correcta')
  })

  it('la Pista nunca dice la casilla de destino (en todas las lecciones de todos los cursos)', () => {
    let revisadas = 0
    for (const c of cursos)
      for (const l of c.lecciones)
        l.jugadas.forEach((san, ply) => {
          if (!esMiPly(l.color, ply)) return
          const e = { fase: 'preguntar' as const, ply, paso: { fallos: 0, pista: false, respuesta: false }, ultimo: null }
          const p = pista(l, e)
          const m = new Chess(posicion(l, ply).fen()).move(san)
          expect(p, `${l.nombre} ${san}: «${p}»`).not.toContain(m.to)
          expect(p.length).toBeGreaterThan(10)
          revisadas++
        })
    expect(revisadas).toBeGreaterThan(300)
  })

  it('la Respuesta da la jugada (para la flecha), su nombre y el plan; pedir Pista queda marcado', () => {
    const l = ck.lecciones[0]!
    const e = nuevoEstado(l)
    const r = respuesta(l, e)!
    expect(r).toMatchObject({ san: 'c6', desde: 'c7', hasta: 'c6', texto: '1...c6', nombre: l.nombre })
    expect(marcarPista(e).paso.pista).toBe(true)
  })

  describe('el avance se guarda', () => {
    beforeEach(() => {
      instalarLocalStorage()
    })
    it('marcar una lección la guarda y la siguiente salta las hechas', async () => {
      const { marcarLeccion, leerProgreso } = await import('../../src/repertorio/estado.ts')
      marcarLeccion(ck.lecciones[0]!.id, 1000)
      marcarLeccion(ck.lecciones[1]!.id, 2000)
      expect(leerProgreso()[ck.lecciones[0]!.id]).toEqual({ fecha: 1000 })
      expect(siguienteLeccion(ck, leerProgreso())!.id).toBe(ck.lecciones[2]!.id)
    })
  })
})
