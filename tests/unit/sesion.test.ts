import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import type { Base } from '../../src/base/tipos.ts'
import { repertorioInicial } from '../../src/repertorio/modelo.ts'
import { cursosDe } from '../../src/cursos/modelo.ts'
import { actualizarFalladas, siguienteEnSesion } from '../../src/cursos/sesion.ts'

const base = JSON.parse(readFileSync('conocimiento/base.json', 'utf8')) as Base
const ck = cursosDe(base, repertorioInicial(base)).find((c) => c.id === 'caro-kann:b')!

describe('T18 · la línea fallada vuelve antes en la misma sesión', () => {
  it('después de otra lección, regresa la que fallé antes que las siguientes', () => {
    const [l0, l1, l2] = ck.lecciones
    let falladas = actualizarFalladas([], l0!.id, 2) // fallé la 1
    expect(siguienteEnSesion(ck, {}, l0!, falladas)!.id).toBe(l1!.id) // no se repite de inmediato
    expect(siguienteEnSesion(ck, {}, l1!, falladas)!.id).toBe(l0!.id) // vuelve antes que l2
    falladas = actualizarFalladas(falladas, l0!.id, 0) // la repetí bien: sale
    expect(siguienteEnSesion(ck, { [l0!.id]: 1, [l1!.id]: 1 }, l0!, falladas)!.id).toBe(l2!.id)
  })
  it('una fallada de otro curso no le quita el turno a la fallada de este curso (pase 1 de la T22)', () => {
    const [l0, l1] = ck.lecciones
    const falladas = ['eslava:b/x', l0!.id]
    expect(siguienteEnSesion(ck, {}, l1!, falladas)!.id).toBe(l0!.id)
  })
})
