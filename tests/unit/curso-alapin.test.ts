import { describe, expect, it } from 'vitest'
import { Chess, type Move } from 'chess.js'
import { CURSOS_NUEVOS, esLeccionOpcional, jugadasDeVariante, leccionIdDe, lineaPorId, misJugadas, obligatorias, opcionales, soloObligatorias } from '../../src/curso/datos.ts'
import { LECCIONES_ALAPIN, pasarAlapin } from '../../src/aprender/migracion.ts'
import { repertorioCompleto } from '../../src/aprender/favoritas.ts'
import { cursos } from '../../src/cursos/datos.ts'
import { BASE } from '../../src/base/base.ts'
import { readFileSync } from 'node:fs'

/** Las frecuencias del curso (`conocimiento/frecuencias/README.md`): por banda, el porcentaje (null: sin datos) y las partidas. */
const BANDAS = ['600-1000', '1000-1400'] as const
type Celda = { pct: number | null; n: number }
type Fila = Record<(typeof BANDAS)[number], Celda>
const F = JSON.parse(readFileSync(new URL('../../conocimiento/frecuencias/alapin.json', import.meta.url), 'utf8')) as {
  curso: string
  lecciones: Record<string, Fila & { forma: string; frecuencia: number | null }>
  formas: Record<string, Fila>
  otras: Record<string, Fila>
}

/**
 * Lo propio del curso de la Alapin contra la Siciliana, por estructuras (2026-11-25; `specs/cursos.md` §6 y su apartado de
 * la Alapin). El mapa, con su prueba y sus números: `iterations/v4/mapa-alapin.md`. Las pruebas de contenido corren
 * aparte sobre este curso (`vite.config.ts`, proyecto "curso alapin").
 */
const c = CURSOS_NUEVOS['siciliana:w']!
const jugar = (js: string[]) => {
  const ch = new Chess()
  const ms: Move[] = js.map((s) => ch.move(s))
  return { ch, ms }
}
const peones = (ch: Chess, color: 'w' | 'b') => ch.board().flat().filter((s) => s && s.type === 'p' && s.color === color).map((s) => s!.square).sort()
const material = (ch: Chess) => {
  const v: Record<string, number> = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 }
  let d = 0
  for (const s of ch.board().flat()) if (s) d += (s.color === 'w' ? 1 : -1) * v[s.type]!
  return d
}
const posicion = (js: string[]) => jugar(js).ch.fen().split(' ').slice(0, 4).join(' ')

/**
 * La entrada del mapa de una línea, mirando toda la línea (no solo su final). Los dos peones del centro (2026-11-25, con
 * sus lecciones): tu peón de e4 no se mueve en toda la línea y en algún momento tienes peones en e4 y d4 a la vez.
 */
function entrada(js: string[]): 'aislado' | 'cadena' | 'gambito' | 'centro' | 'otra' {
  const { ms } = jugar(js)
  const i = ms.findIndex((m) => m.color === 'w' && m.piece === 'p' && m.from === 'e4')
  if (i < 0) {
    const ch = new Chess()
    const juntos = js.some((s) => {
      ch.move(s)
      return ['e4', 'd4'].every((x) => ch.get(x as never)?.type === 'p' && ch.get(x as never)?.color === 'w')
    })
    return juntos ? 'centro' : 'otra'
  }
  if (ms[i]!.to === 'e5') return 'cadena'
  if (ms[i]!.to !== 'd5') return 'otra'
  const sig = ms[i + 1]
  if (!sig) return 'otra'
  if (sig.to !== 'd5') return 'gambito'
  return sig.piece === 'q' ? 'aislado' : 'otra'
}

describe('La Alapin · el mapa contra las líneas (chess.js)', () => {
  const ETIQUETA: Record<string, string> = { aislado: 'El rival retoma en d5 con la dama', cadena: 'El rival ataca tu e4 con el caballo', gambito: 'El rival no recupera el peón (gambito)', centro: 'El rival no ataca tu e4 de entrada' }

  it('cada lección cae en una sola entrada, y su etiqueta lo dice', () => {
    const vistas: Record<string, string[]> = {}
    for (const v of c.variantes) {
      const e = entrada(jugadasDeVariante(c, v))
      ;(vistas[e] ??= []).push(v.id)
      expect(v.estructura, v.id).toBe(ETIQUETA[e])
    }
    expect(vistas).toEqual({ aislado: ['cambio-central', 'moderna', 'cc6', 'g6'], cadena: ['cf6-d4'], centro: ['centro-cc6', 'centro-d6'], gambito: ['gambito'] })
  })

  it('El aislado: al final de sus cuatro lecciones, tu peón de d4 no tiene peones propios en c ni en e (hallazgo 10 del gate)', () => {
    for (const v of c.variantes.filter((x) => entrada(jugadasDeVariante(c, x)) === 'aislado')) {
      const { ch } = jugar(jugadasDeVariante(c, v))
      const w = peones(ch, 'w')
      expect(w, v.id).toContain('d4')
      expect(w.filter((s) => s[0] === 'c' || s[0] === 'e'), v.id).toEqual([])
    }
  })

  it('La cadena: llega intacta al final (d4 y e5), y la siguiente natural, 8...dxe5 9.Cxe5, la deshace: por eso su "pero…"', () => {
    const js = jugadasDeVariante(c, c.variantes.find((v) => v.id === 'cf6-d4')!)
    expect(peones(jugar(js).ch, 'w')).toEqual(expect.arrayContaining(['d4', 'e5']))
    const despues = jugar([...js, 'dxe5', 'Nxe5']).ch
    expect(peones(despues, 'w').filter((s) => s[0] === 'c' || s[0] === 'e')).toEqual([])
    expect(c.variantes.find((v) => v.id === 'cf6-d4')!.intro).toContain('pero')
  })

  it('El gambito: desde 3...Cf6, después de cada jugada tuya sigues con un peón de más', () => {
    const js = jugadasDeVariante(c, c.variantes.find((v) => v.id === 'gambito')!)
    // a media captura (7...Axc4, antes de 8.Dxc4) no cuenta: se mide cuando ya jugaste
    for (let n = js.indexOf('Nf6') + 2; n <= js.length; n += 2) expect(material(jugar(js.slice(0, n)).ch), js.slice(0, n).join(' ')).toBeGreaterThanOrEqual(1)
    expect(material(jugar(js).ch)).toBe(1)
  })

  it('Los dos peones del centro: tu peón de e4 sigue en e4 al final de sus dos lecciones, y cada una aplica la regla del caballo de su página', () => {
    const cc6 = jugadasDeVariante(c, c.variantes.find((v) => v.id === 'centro-cc6')!)
    const d6 = jugadasDeVariante(c, c.variantes.find((v) => v.id === 'centro-d6')!)
    for (const js of [cc6, d6]) expect(jugar(js).ch.get('e4'), js.join(' ')).toMatchObject({ type: 'p', color: 'w' })
    // en 2...Cc6, su caballo de f6 ataca e4 y su caballo de dama está en c6: d5 contra él
    const antesD5 = jugar(cc6.slice(0, -1)).ch
    expect(antesD5.attackers('e4' as never, 'b')).toContain('f6')
    expect(antesD5.get('c6')).toMatchObject({ type: 'n', color: 'b' })
    expect(cc6.at(-1)).toBe('d5')
    // y si el caballo de f6 se come e4, tu peón de d5 se come el de c6
    expect(jugar([...cc6, 'Nxe4']).ch.moves()).toContain('dxc6')
    // en 2...d6, su caballo ataca e4 y su caballo de dama sigue en b8: defiendes e4 con el caballo de b1
    const i = d6.indexOf('Nc3')
    const antesCc3 = jugar(d6.slice(0, i)).ch
    expect(antesCc3.attackers('e4' as never, 'b')).toContain('f6')
    expect(antesCc3.get('b8')).toMatchObject({ type: 'n', color: 'b' })
    expect(jugar(d6.slice(0, i + 1)).ch.attackers('e4' as never, 'w')).toContain('c3')
    // la página ya no dice que no tiene lección, y el mapa tampoco
    expect(c.piezas.estructura.paginas[3]!.texto.join(' ')).not.toContain('no trae lección')
    expect(c.piezas.estructura.paginas[3]!.texto.join(' ')).toContain('Sus dos lecciones')
    expect(c.piezas.estructura.paginas[0]!.texto.join(' ')).not.toContain('no tiene lección')
  })

  it('las páginas de La estructura: El mapa, El aislado, La cadena y Los dos peones del centro (sin la del gambito)', () => {
    expect(c.piezas.estructura.paginas.map((p) => p.subtitulo)).toEqual(['El mapa', 'El aislado', 'La cadena', 'Los dos peones del centro'])
    const fen = (i: number) => new Chess(c.piezas.estructura.paginas[i]!.tablero!.fen!)
    expect(peones(fen(1), 'w')).toEqual(['a2', 'b2', 'd4', 'f2', 'g2', 'h2'])
    expect(peones(fen(2), 'w')).toEqual(['a2', 'b2', 'd4', 'e5', 'f2', 'g2', 'h2'])
    expect(peones(fen(3), 'w')).toEqual(['a2', 'b2', 'd4', 'e4', 'f2', 'g2', 'h2'])
    // el rival, sin peón en c (y en El aislado, tampoco en d)
    for (const i of [1, 2, 3]) expect(peones(fen(i), 'b').some((s) => s[0] === 'c'), `página ${i}`).toBe(false)
    expect(peones(fen(1), 'b').some((s) => s[0] === 'd')).toBe(false)
  })

  it('lo que dicen las páginas de las transposiciones es cierto: 2...Cc6 al Cambio Central y 2...e6 al Avance contra la Francesa', () => {
    expect(posicion(['e4', 'c5', 'c3', 'Nc6', 'd4', 'cxd4', 'cxd4', 'd5', 'exd5', 'Qxd5', 'Nf3'])).toBe(posicion(['e4', 'c5', 'c3', 'd5', 'exd5', 'Qxd5', 'd4', 'cxd4', 'cxd4', 'Nc6', 'Nf3']))
    expect(posicion(['e4', 'c5', 'c3', 'e6', 'd4', 'd5', 'e5'])).toBe(posicion(['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3']))
    // con 3...cxd4 4.cxd4 d5 5.e5 hay cadena, pero no es la misma posición (hallazgo 8): la página no dice que lo sea
    expect(posicion(['e4', 'c5', 'c3', 'e6', 'd4', 'cxd4', 'cxd4', 'd5', 'e5'])).not.toBe(posicion(['e4', 'e6', 'd4', 'd5', 'e5', 'c5', 'c3']))
    expect(c.piezas.estructura.paginas[1]!.texto.join(' ')).toContain('Con 2...Cc6 3.d4 cxd4 4.cxd4 d5 5.exd5 Dxd5 6.Cf3 llegas a la misma posición del Cambio Central')
    expect(c.piezas.estructura.paginas[2]!.texto.join(' ')).toContain('Con 2...e6 3.d4 d5 4.e5 llegas a la misma posición de tu Avance contra la Francesa')
  })

  it('la regla de la jugada 3 se dice como lo que es: para tu jugada 3', () => {
    expect(c.piezas.estructura.paginas[0]!.texto.join(' ')).toContain('la regla para tu jugada 3')
    expect(c.mias['e4 c5 c3 d5 exd5']!.hace).toContain('para tu jugada 3')
    expect(c.mias['e4 c5 c3 Nf6 e5']!.porque).toContain('para tu jugada 3')
    // y con los dos peones del centro, a un caballo que ataque e4 no se le echa
    expect(c.piezas.estructura.paginas[3]!.texto.join(' ')).toContain('Si ya salió a c6, avanzas tu peón de d4 a d5 contra él, salvo con tu alfil en d3 y su peón en e6')
    expect(c.piezas.estructura.paginas[3]!.texto.join(' ')).toContain('Si sacas antes el caballo de g1, ese peón se come tu e4')
    expect(c.piezas.estructura.paginas[3]!.texto.join(' ')).toContain('Tras 2...d6, avanzar a e5 te cuesta un peón')
  })
})

describe('La Alapin · obligatorio y opcional (§6, con las partidas de este curso)', () => {
  // Los números salen de `conocimiento/frecuencias/alapin.json` (`node scripts/frecuencias-cursos.mjs siciliana:w`, con el
  // método del mapa, `iterations/v4/mapa-alapin.md`): lichess 600–1000 y 1000–1400, siguiendo las jugadas del mapa.
  const max = (x: Fila) => Math.max(...BANDAS.map((b) => x[b].pct ?? 0))
  const FORMA_DE: Record<string, string> = { aislado: 'El aislado', cadena: 'La cadena', gambito: 'El gambito (la excepción)', centro: 'Los dos peones del centro' }
  const CENTRO = 'Los dos peones del centro'
  const TRANSPOSICION = '2...Cc6 3.d4 cxd4 4.cxd4 d5: con 5.exd5 Dxd5 6.Cf3 llega al Cambio Central'

  it('el archivo de frecuencias es de este curso: una fila por cada lección, y ninguna de más', () => {
    expect(F.curso).toBe('siciliana:w')
    expect(Object.keys(F.lecciones).sort()).toEqual(c.variantes.map((v) => v.id).sort())
    for (const v of c.variantes) expect(F.lecciones[v.id]!.forma, v.id).toBe(FORMA_DE[entrada(jugadasDeVariante(c, v))])
    expect(Object.keys(F.formas).sort()).toEqual(['El aislado', 'La cadena', CENTRO])
    // "sin datos" no es 0 %: un pct null va con n 0, y un pct con partidas
    for (const fila of [...Object.values(F.lecciones), ...Object.values(F.formas), ...Object.values(F.otras)])
      for (const b of BANDAS) expect(fila[b].pct === null, JSON.stringify(fila)).toBe(fila[b].n === 0)
  })

  it('la regla de la Caro-Kann, con los mismos cortes: la más jugada de cada forma de 5 % o más, y toda lección de 2 % o más', () => {
    const L = Object.entries(F.lecciones)
    const paso1 = Object.entries(F.formas).filter(([, p]) => max(p) >= 5).map(([f]) => L.filter(([, l]) => l.forma === f).sort((a, b) => max(b[1]) - max(a[1]))[0]![0])
    const paso2 = L.filter(([id, l]) => max(l) >= 2 && !paso1.includes(id)).map(([id]) => id)
    expect(paso1).toEqual(['cambio-central', 'cf6-d4', 'centro-cc6'])
    // 2...d6 entra por el paso 2: 2 % o más en una banda con 10 partidas o más (1000–1400)
    expect(paso2).toEqual(['centro-d6'])
    expect(F.lecciones['centro-d6']!['1000-1400'].n).toBeGreaterThanOrEqual(10)
    expect(obligatorias(c).map((v) => v.id)).toEqual([...paso1, ...paso2])
    expect(opcionales(c).map((v) => v.id)).toEqual(['moderna', 'cc6', 'g6', 'gambito'])
    expect(c.secciones!.map((s) => s.id)).toEqual(['base', 'frecuentes', 'opcional'])
    expect(c.secciones!.map((s) => s.variantes)).toEqual([paso1, paso2, ['moderna', 'cc6', 'g6', 'gambito']])
    expect(c.secciones!.find((s) => s.id === 'opcional')!.nota).toBe('No cuentan para terminar el curso.')
    // lo que más te va a salir ya tiene sus lecciones (D1 A de Carlos, 2026-11-25), y el gambito, la excepción, no tiene datos
    expect(max(F.formas[CENTRO]!)).toBeGreaterThanOrEqual(5)
    expect(L.filter(([, l]) => l.forma === CENTRO).map(([id]) => id)).toEqual(['centro-cc6', 'centro-d6'])
    expect(BANDAS.map((b) => F.otras['El gambito (la excepción)']![b].pct)).toEqual([null, null])
  })

  it('la frecuencia de cada lección es la de la tabla, y dice de dónde sale', () => {
    const t = (x: Celda) => `${x.pct!.toFixed(1)} %`
    for (const v of c.variantes) {
      const l = F.lecciones[v.id]!
      // la del curso es la de 1000–1400 con dos decimales; sin datos, 0
      expect(v.frecuencia, v.id).toBe(l.frecuencia ?? 0)
      expect(l.frecuencia === null, v.id).toBe(l['1000-1400'].pct === null)
      if (l.frecuencia !== null) expect(Math.abs(l.frecuencia - l['1000-1400'].pct!), v.id).toBeLessThanOrEqual(0.05 + 1e-9)
      expect(v.fuenteFrecuencia, v.id).toContain('lichess')
      // los números que cita el texto son los del archivo
      const alta = l['1000-1400']
      const baja = l['600-1000']
      if (alta.pct !== null) expect(v.fuenteFrecuencia, v.id).toContain(`1000–1400: ${t(alta)} de las partidas del curso (n ${alta.n})`)
      if (baja.pct !== null) expect(v.fuenteFrecuencia, v.id).toContain(`600–1000: ${t(baja)} (n ${baja.n})`)
      if (BANDAS.every((b) => l[b].pct === null)) expect(v.fuenteFrecuencia, v.id).toContain('sin datos en las dos bandas (n 0)')
    }
    const cc = c.variantes.find((v) => v.id === 'cambio-central')!.fuenteFrecuencia
    const tr = F.otras[TRANSPOSICION]!['1000-1400']
    expect(cc).toContain(`(${t(tr)}, n ${tr.n})`)
    expect(cc).toContain(`El aislado, ${t(F.formas['El aislado']!['1000-1400'])}`)
    const cf6 = c.variantes.find((v) => v.id === 'cf6-d4')!.fuenteFrecuencia
    expect(cf6).toContain(`600–1000: ${t(F.lecciones['cf6-d4']!['600-1000'])} (n ${F.lecciones['cf6-d4']!['600-1000'].n})`)
    expect(cf6).toContain(`la única de La cadena (${t(F.formas['La cadena']!['1000-1400'])} y ${t(F.formas['La cadena']!['600-1000'])})`)
  })

  it('las opcionales no salen en el Repaso ni en Refuerza: el filtro común (nota 6)', () => {
    for (const v of c.variantes) expect(esLeccionOpcional('siciliana', 'w', v.base), v.id).toBe(opcionales(c).includes(v))
    const curso = cursos().find((x) => x.id === 'siciliana:w')!
    expect(curso.lecciones.filter((l) => l.opcional).map((l) => l.id).sort()).toEqual(opcionales(c).map((v) => leccionIdDe(c, v)).sort())
    // en Refuerza, de la Alapin solo quedan las líneas de las dos obligatorias; las lecciones de antes salen
    const ids = soloObligatorias(repertorioCompleto()).lineas.filter((l) => l.apertura === 'siciliana' && l.color === 'w').map((l) => l.id).sort()
    expect(ids).toEqual(obligatorias(c).map((v) => `w:siciliana/${v.base}`).sort())
  })

  it('máximo 8 jugadas tuyas, desde 1.e4 c5 2.c3 (la primera, desde 1.e4)', () => {
    expect(c.variantes[0]!.desde).toBe(0)
    for (const v of c.variantes.slice(1)) expect(v.desde, v.id).toBe(3)
    for (const v of c.variantes) expect(misJugadas(lineaPorId(c, `v:${v.id}`)!).length, v.id).toBeLessThanOrEqual(8)
  })
})

describe('La Alapin · lo guardado de antes', () => {
  const P = 'siciliana:w/w:siciliana/'
  const viejas = BASE.aperturas.find((a) => a.id === 'siciliana')!.variantes.filter((v) => v.id.startsWith('alapin-') && !v.id.startsWith('alapin-curso-'))

  it('cada lección vieja de la Alapin tiene su lección nueva de la misma respuesta del rival', () => {
    expect(viejas.map((v) => v.id).sort()).toEqual(Object.keys(LECCIONES_ALAPIN).sort())
    const nuevas = new Set(c.variantes.map((v) => v.base))
    for (const [vieja, nueva] of Object.entries(LECCIONES_ALAPIN)) {
      expect(nuevas.has(nueva), `${vieja} → ${nueva}`).toBe(true)
      // la nueva empieza con la fila de la vieja, o es la de la misma respuesta del rival (Stoltz y Heidenfeld: 2...Cf6 3.e5 Cd5)
      const fila = viejas.find((v) => v.id === vieja)!.jugadas
      const linea = jugadasDeVariante(c, c.variantes.find((v) => v.base === nueva)!)
      const comunes = vieja.includes('stoltz') || vieja.includes('heidenfeld') ? 6 : fila.length
      expect(linea.slice(0, comunes), vieja).toEqual(fila.slice(0, comunes))
    }
  })

  it('se muda (no se copia), y si la nueva ya tenía algo, la vieja se queda como estaba', () => {
    const antes = { [`${P}alapin-d5-moderna`]: { escalon: 2 }, [`${P}alapin-cf6-d4`]: { escalon: 3 }, [`${P}alapin-cf6-stoltz`]: { escalon: 1 }, 'caro-kann:b/b:caro-kann/curso-clasica': { escalon: 4 } }
    const r = pasarAlapin(antes)
    expect(r).toEqual({ [`${P}alapin-curso-moderna`]: { escalon: 2 }, [`${P}alapin-curso-cf6-d4`]: { escalon: 3 }, [`${P}alapin-cf6-stoltz`]: { escalon: 1 }, 'caro-kann:b/b:caro-kann/curso-clasica': { escalon: 4 } })
    // la Heidenfeld sola sí se muda a la de 4.d4
    expect(pasarAlapin({ [`${P}alapin-cf6-heidenfeld`]: 7 })).toEqual({ [`${P}alapin-curso-cf6-d4`]: 7 })
    // el id nuevo es el de `leccionIdDe`: lo que se muda, el Repaso lo encuentra
    const ids = c.variantes.map((v) => leccionIdDe(c, v))
    for (const b of Object.values(LECCIONES_ALAPIN)) expect(ids).toContain(P + b)
    // las lecciones de Los dos peones del centro (2026-11-25) no tenían lección de antes: nada se muda a ellas
    expect(Object.values(LECCIONES_ALAPIN).filter((b) => b.includes('centro'))).toEqual([])
    // y todas las demás lecciones del curso sí reciben lo de una lección vieja
    for (const v of c.variantes.filter((x) => !x.id.startsWith('centro-'))) expect(Object.values(LECCIONES_ALAPIN).map((b) => P + b)).toContain(leccionIdDe(c, v))
  })
})
