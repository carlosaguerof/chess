import { describe, expect, it } from 'vitest'
import { sanAEspanol } from '../../src/ajedrez/notacion.ts'
import { jugadaReducida } from '../../src/curso/adelantar.ts'
import { CURSOS_NUEVOS, lineasDe, misJugadas } from '../../src/curso/datos.ts'
import type { LineaCurso } from '../../src/curso/tipos.ts'

/**
 * En Practicar, el nombre de la lección no adelanta tu jugada (cierre de los cursos, 2026-11-25, §3.3; `specs/cursos.md`
 * §6). El nombre se ve arriba toda la vuelta (`nombre-linea` en `LeccionCurso.tsx`), antes de cada jugada tuya. Así que
 * no escribe una jugada tuya que la línea te va a pedir ("3...Ac5 4.c3 Cf6" pedía 4.c3) ni nombra una forma del mapa
 * que defines tú ("2...Cf6: La cadena", antes de 3.e5, en la Alapin). Recorre todos los cursos de `CURSOS_NUEVOS`.
 */

const MOVIDA = '(?:0-0-0|0-0|[RDTAC][a-h]?[1-8]?x?[a-h][1-8]|[a-h]x[a-h][1-8]|[a-h][1-8])(?:=[DTAC])?[+#]?'

interface Escrita {
  jugada: string
  color: 'w' | 'b'
  numero?: number
}

/**
 * Las jugadas que escribe un nombre, con su color y su número: "3...Ac5 4.c3 Cf6" es 3...Ac5, 4.c3 y 4...Cf6; "2.c4 c6"
 * es 2.c4 y 2...c6 (una jugada suelta después de una de blancas es la respuesta de negras); "...Cc6", de negras sin número.
 */
export function jugadasDelNombre(nombre: string): Escrita[] {
  const r: Escrita[] = []
  let ultima: { color: 'w' | 'b'; numero?: number } | undefined
  for (const crudo of nombre.split(/[\s,:;()«»]+/)) {
    const t = crudo.replace(/[.,]$/, '')
    let m: RegExpExecArray | null
    if ((m = new RegExp(`^(\\d+)?\\.\\.\\.(${MOVIDA})$`).exec(t))) {
      const e: Escrita = { jugada: jugadaReducida(m[2]!), color: 'b', ...(m[1] ? { numero: Number(m[1]) } : {}) }
      r.push(e)
      ultima = e
    } else if ((m = new RegExp(`^(\\d+)\\.(${MOVIDA})$`).exec(t))) {
      const e: Escrita = { jugada: jugadaReducida(m[2]!), color: 'w', numero: Number(m[1]) }
      r.push(e)
      ultima = e
    } else if (ultima && new RegExp(`^${MOVIDA}$`).test(t)) {
      // suelta, en una secuencia: la siguiente media jugada
      const e: Escrita = ultima.color === 'w' ? { jugada: jugadaReducida(t), color: 'b', numero: ultima.numero } : { jugada: jugadaReducida(t), color: 'w', ...(ultima.numero ? { numero: ultima.numero + 1 } : {}) }
      r.push(e)
      ultima = e
    } else ultima = undefined
  }
  return r
}

/** Mis jugadas que la línea me pide en Practicar (desde `desde`) y que el nombre escribe. */
function adelantaElNombre(l: LineaCurso): string[] {
  const escritas = jugadasDelNombre(l.nombre).filter((e) => e.color === l.lado)
  return misJugadas(l)
    .filter((p) => escritas.some((e) => e.jugada === jugadaReducida(sanAEspanol(l.jugadas[p]!)) && (e.numero === undefined || e.numero === Math.floor(p / 2) + 1)))
    .map((p) => l.jugadas[p]!)
}

/**
 * Las formas del mapa de cada curso que defines tú, con la frase del mapa que lo dice. Las de los demás cursos las define
 * el rival (el Avance: qué hace negras con d4; la Escandinava: a dónde va su dama; Otras aperturas de blancas: qué peón
 * de blancas ataca tu d5), y su nombre sí puede ir en una lección.
 */
const FORMAS_QUE_DEFINES_TU: Record<string, { formas: string[]; porque: string }> = {
  'caro-kann:b': { formas: ['Clásica'], porque: 'sus lecciones son las fichas de Repaso del curso que queda, con el mismo nombre' },
  'caro-kann-estructuras:b': { formas: ['Clásica'], porque: 'El mapa: "Tú lo capturaste en e4 y blancas retomó con una pieza: la Clásica."' },
  'eslava:b': { formas: ['Tensión', 'Checa', 'Pelea del lado de dama'], porque: 'El mapa: "Con e3, no tomas: [...] es la Tensión", "Y si tomaste, ¿alcanzó a jugar a4? Sí: la Checa. No: lo defiendes, y es la Pelea del lado de dama."' },
  'siciliana:w': { formas: ['aislado', 'cadena', 'dos peones del centro'], porque: 'El mapa: ¿qué pasó con tu peón de e4? Lo cambiaste en d5, lo avanzaste a e5 o sigue en e4.' },
  'italiana:w': { formas: ['Centro cerrado', 'Centro ideal', 'Centro abierto'], porque: 'El mapa: con blancas la forma la decides tú (d3, o d4 y cómo retomas).' },
}

const variantes = Object.values(CURSOS_NUEVOS).flatMap((c) => lineasDe(c).filter((l) => l.tipo === 'variante').map((l) => ({ c, l })))

describe('§3.3 · en Practicar, el nombre de la lección no adelanta tu jugada', () => {
  it('el detector lee las jugadas de un nombre, con su color y su número', () => {
    expect(jugadasDelNombre('3...Ac5 4.c3 Cf6 (Giuoco Pianissimo)')).toEqual([
      { jugada: 'A:c5', color: 'b', numero: 3 },
      { jugada: 'c3', color: 'w', numero: 4 },
      { jugada: 'C:f6', color: 'b', numero: 4 },
    ])
    expect(jugadasDelNombre('Réti: 2.c4 c6 3.b3').map((e) => `${e.numero}${e.color}:${e.jugada}`)).toEqual(['2w:c4', '2b:c6', '3w:b3'])
    expect(jugadasDelNombre('2...d5, con ...Cc6')).toEqual([
      { jugada: 'd5', color: 'b', numero: 2 },
      { jugada: 'C:c6', color: 'b' },
    ])
    expect(jugadasDelNombre('Avance: 4.Cc3 (Van der Wiel)')).toEqual([{ jugada: 'C:c3', color: 'w', numero: 4 }])
  })

  it('atrapa los nombres de antes (la prueba falla con ellos)', () => {
    const conNombre = (curso: string, id: string, nombre: string) => ({ ...lineasDe(CURSOS_NUEVOS[curso]!).find((l) => l.id === `v:${id}`)!, nombre })
    expect(adelantaElNombre(conNombre('italiana:w', 'principal', '3...Ac5 4.c3 Cf6 (Giuoco Pianissimo)'))).toEqual(['c3'])
    expect(adelantaElNombre(conNombre('italiana:w', 'dos-caballos-d3', 'Dos Caballos: 4.d3'))).toEqual(['d3'])
    expect(adelantaElNombre(conNombre('caro-kann:w', 'af5', '3...Af5 4.c3'))).toEqual(['c3'])
    expect(adelantaElNombre(conNombre('otros-negras:b', 'reti-bogoljubow', 'Réti: 2.c4 c6 3.b3'))).toEqual(['c6'])
    expect(adelantaElNombre(conNombre('otros-negras:b', 'inglesa-anglo-eslava-g3', 'Inglesa: 2.Cf3 d5 3.g3'))).toEqual(['d5'])
    // un número que no es el de la línea no cuenta: "(1...e6)" habla de otra apertura
    expect(adelantaElNombre(conNombre('caro-kann-estructuras:b', 'avance-short', 'Avance: 4.Cf3 (no 9...e6)'))).toEqual([])
  })

  for (const { c, l } of variantes)
    it(`${c.id} · «${l.nombre}»: no escribe una jugada tuya que la línea te va a pedir`, () => {
      expect(adelantaElNombre(l)).toEqual([])
    })

  for (const { c, l } of variantes) {
    const f = FORMAS_QUE_DEFINES_TU[c.id]
    if (!f) continue
    it(`${c.id} · «${l.nombre}»: no nombra una forma que defines tú`, () => {
      for (const forma of f.formas) expect(l.nombre.toLowerCase().includes(forma.toLowerCase()), `${forma}: ${f.porque}`).toBe(false)
    })
  }

  it('atrapa una forma tuya en el nombre ("2...Cf6: La cadena", el hallazgo 4 de la Alapin)', () => {
    const f = FORMAS_QUE_DEFINES_TU['siciliana:w']!
    expect(f.formas.some((x) => '2...Cf6: La cadena'.toLowerCase().includes(x.toLowerCase()))).toBe(true)
    expect(FORMAS_QUE_DEFINES_TU['caro-kann-estructuras:b']!.formas.some((x) => 'Clásica: 3.Cc3'.includes(x))).toBe(true)
  })

  it('Practicar no muestra otra etiqueta con la forma: la estructura de la lección va solo en la página del curso', async () => {
    const { readFileSync } = await import('node:fs')
    const pantalla = readFileSync(new URL('../../src/pantallas/LeccionCurso.tsx', import.meta.url), 'utf8')
    expect(pantalla).not.toMatch(/\.estructura\b/)
  })
})
