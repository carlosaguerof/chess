import { describe, expect, it } from 'vitest'
import { Chess } from 'chess.js'
import { BASE } from '../../src/base/base.ts'
import { CURSOS_NUEVOS, jugadasDeLaBaseEn, lineasDe, misJugadas, textoMio, textoRival } from '../../src/curso/datos.ts'
import { despues, palabras } from '../../src/curso/textos.ts'
import { sanAEspanol } from '../../src/ajedrez/notacion.ts'

/**
 * C4: el contenido del curso de la Caro-Kann. Cada jugada es legal y está en la base; cada jugada mía trae su texto;
 * ningún texto pasa de 40 palabras salvo las jugadas clave; ningún texto trae símbolos de evaluación; la pregunta de
 * Practicar no delata la jugada.
 */
const c = CURSOS_NUEVOS['caro-kann:b']!
const lineas = lineasDe(c)
const variantes = lineas.filter((l) => l.tipo === 'variante')
const fenCorto = (f: string) => f.split(' ').slice(0, 4).join(' ')

/** Todos los textos del curso, con su lugar (para las reglas de forma). */
function todosLosTextos(): { donde: string; texto: string; clave?: boolean }[] {
  const r: { donde: string; texto: string; clave?: boolean }[] = []
  for (const [k, m] of Object.entries(c.mias)) {
    r.push({ donde: `mias[${k}].pregunta`, texto: m.pregunta })
    if (m.pista) r.push({ donde: `mias[${k}].pista`, texto: m.pista })
    r.push({ donde: `mias[${k}] explicación`, texto: [m.hace, ...despues(m)].join(' '), clave: m.clave })
    for (const [s, t] of Object.entries(m.errores ?? {})) r.push({ donde: `mias[${k}].errores[${s}]`, texto: t })
  }
  for (const [k, x] of Object.entries(c.rival)) r.push({ donde: `rival[${k}]`, texto: x.texto })
  for (const v of c.variantes) {
    r.push({ donde: `${v.id}.intro`, texto: v.intro })
    r.push({ donde: `${v.id}.idea`, texto: v.idea })
    r.push({ donde: `${v.id}.plan`, texto: `${v.plan.tuyo} ${v.plan.rival}`, clave: true })
    r.push({ donde: `${v.id}.regla`, texto: v.regla })
  }
  for (const p of [c.piezas.idea, c.piezas.estructura, c.piezas.repaso]) for (const g of p.paginas) for (const t of g.texto) r.push({ donde: p.titulo, texto: t, clave: true })
  for (const e of c.piezas.errores.lista) r.push({ donde: `${e.id}.intro`, texto: e.intro }, { donde: `${e.id}.final`, texto: e.final })
  for (const g of c.glosario) r.push({ donde: `glosario ${g.termino}`, texto: g.definicion })
  return r
}

describe('C4 · el curso de la Caro-Kann', () => {
  it('trae las seis piezas y una lección por variante, de la más común a la más rara', () => {
    expect(c.piezas.idea.paginas.length).toBeGreaterThan(0)
    expect(c.piezas.estructura.paginas.length).toBeGreaterThan(0)
    expect(c.piezas.errores.lista.length).toBeGreaterThanOrEqual(2)
    expect(c.piezas.errores.lista.length).toBeLessThanOrEqual(4)
    expect(c.piezas.repaso.paginas.length).toBeGreaterThan(0)
    expect(c.variantes.length).toBeGreaterThanOrEqual(10)
    const f = c.variantes.map((v) => v.frecuencia)
    expect([...f].sort((a, b) => b - a)).toEqual(f)
    for (const v of c.variantes) expect(v.plan.tuyo.length, v.id).toBeGreaterThan(0)
    expect(c.glosario.length).toBeGreaterThan(5)
  })

  it('primero los errores tuyos y luego los del rival', () => {
    const de = c.piezas.errores.lista.map((e) => e.de)
    expect(de.indexOf('rival')).toBeGreaterThan(de.lastIndexOf('tuyo'))
  })

  it('cada jugada de cada línea es legal, y las de las variantes están en la base', () => {
    for (const l of lineas) {
      const ch = new Chess()
      for (const s of l.jugadas) expect(() => ch.move(s), `${l.id}: ${s}`).not.toThrow()
    }
    for (const l of variantes) {
      const ch = new Chess()
      l.jugadas.forEach((s) => {
        expect(jugadasDeLaBaseEn(ch.fen()).has(s), `${l.id}: ${s} no está en la base`).toBe(true)
        ch.move(s)
      })
      // y la variante de la base es de la Caro-Kann, con negras
      const v = BASE.aperturas.find((a) => a.id === 'caro-kann')!.variantes.find((x) => x.id === l.variante!.base)!
      expect(v.lado === 'negras' || v.lado === 'ambos', l.id).toBe(true)
    }
  })

  it('máximo 8 jugadas mías por variante', () => {
    for (const l of variantes) expect(misJugadas(l).length, l.id).toBeLessThanOrEqual(8)
    for (const l of variantes) expect(misJugadas(l).length, l.id).toBeGreaterThanOrEqual(1)
  })

  it('cada jugada mía trae su explicación y su pregunta, y cada jugada del rival su frase', () => {
    for (const l of lineas)
      for (let ply = l.desde; ply < l.jugadas.length; ply++) {
        const mia = (ply % 2 === 0 ? 'w' : 'b') === l.lado
        if (mia) {
          const m = textoMio(c, l.jugadas, ply)
          expect(m, `${l.id}: falta el texto de ${l.jugadas.slice(0, ply + 1).join(' ')}`).toBeDefined()
          expect(m!.hace.length).toBeGreaterThan(0)
          expect(m!.pregunta.length).toBeGreaterThan(0)
          expect(m!.fuente.length, `${l.id} ply ${ply}: sin fuente`).toBeGreaterThan(0)
        } else expect(textoRival(c, l.jugadas, ply), `${l.id}: falta la frase del rival en ${l.jugadas.slice(0, ply + 1).join(' ')}`).toBeDefined()
      }
  })

  it('cada fuente citada existe en la lista de fuentes', () => {
    const usadas = new Set<string>()
    for (const m of Object.values(c.mias)) m.fuente.forEach((f) => usadas.add(f))
    for (const x of Object.values(c.rival)) x.fuente.forEach((f) => usadas.add(f))
    for (const v of c.variantes) v.plan.fuente.forEach((f) => usadas.add(f))
    for (const f of usadas) expect(c.fuentes[f], f).toBeDefined()
  })

  it('cada jugada mía trae su propia Pista (la de respaldo, por tipo de jugada, daba ideas falsas: C7)', () => {
    expect(Object.entries(c.mias).filter(([, m]) => !m.pista?.trim()).map(([k]) => k)).toEqual([])
  })

  it('las jugadas buenas que la base no trae son legales y no son la de la lección', () => {
    for (const l of lineas)
      for (const ply of misJugadas(l)) {
        const m = textoMio(c, l.jugadas, ply)
        if (!m?.buenas) continue
        const pos = new Chess()
        l.jugadas.slice(0, ply).forEach((s) => pos.move(s))
        for (const b of m.buenas) {
          expect(b, l.id).not.toBe(l.jugadas[ply])
          expect(() => new Chess(pos.fen()).move(b), `${l.id}: ${b}`).not.toThrow()
        }
      }
  })

  it('ningún texto pasa de 40 palabras, salvo las jugadas clave (hasta 100)', () => {
    for (const t of todosLosTextos()) expect(palabras(t.texto), `${t.donde}: ${t.texto}`).toBeLessThanOrEqual(t.clave ? 100 : 40)
  })

  it('ningún texto trae símbolos de evaluación', () => {
    // los signos de una pregunta (¿…?) no son símbolos de evaluación
    const simbolo = /[±∓⩲⩱]|\+\/[-−]|[-−]\/\+|(?:[a-h][1-8]|0-0)[+#]?(?:!!|\?\?|!\?|\?!|!|\?)|\b(?:[+−-]\d+\.\d+)\b/
    for (const t of todosLosTextos()) expect(t.texto.replace(/¿[^?]*\?/g, ''), t.donde).not.toMatch(simbolo)
  })

  it('la pregunta de Practicar y la Pista no delatan la jugada (ni su casilla de destino)', () => {
    for (const l of lineas)
      for (let ply = l.desde; ply < l.jugadas.length; ply++) {
        if ((ply % 2 === 0 ? 'w' : 'b') !== l.lado) continue
        const m = textoMio(c, l.jugadas, ply)!
        const ch = new Chess()
        l.jugadas.slice(0, ply).forEach((s) => ch.move(s))
        const j = ch.move(l.jugadas[ply]!)
        const es = sanAEspanol(j.san).replace(/[+#]/g, '')
        // lo que se ve en Practicar antes de jugar: la frase de la jugada del rival, la pregunta y la Pista
        const antes = ply > l.desde ? (textoRival(c, l.jugadas, ply - 1)?.texto ?? '') : ''
        for (const t of [antes, m.pregunta, m.pista ?? '']) {
          expect(t, `${l.id} ${j.san}: el texto dice la jugada`).not.toContain(es)
          // la casilla de destino no se nombra; en una captura es donde ya está la pieza rival (contexto), y el enroque no tiene casilla
          if (!j.captured && !j.flags.includes('k') && !j.flags.includes('q')) expect(t, `${l.id} ${j.san}: el texto dice ${j.to}`).not.toMatch(new RegExp(`\\b${j.to}\\b`))
        }
      }
  })

  it('cada flecha sale de una casilla con pieza (o del final de la flecha anterior): en el plan, tras la línea; en una jugada, tras jugarla', () => {
    const revisar = (donde: string, ch: Chess, marcas: { de?: string; a?: string }[] = [], jugada?: { from: string; to: string }) => {
      // la flecha de la jugada recién hecha también vale (de dónde salió a dónde llegó)
      const destinos = new Set<string>(jugada ? [jugada.from] : [])
      for (const m of marcas) {
        if (!m.de || !m.a) continue
        expect(!!ch.get(m.de as never) || destinos.has(m.de), `${donde}: la flecha ${m.de}-${m.a} sale de una casilla vacía`).toBe(true)
        destinos.add(m.a)
      }
    }
    for (const l of variantes) {
      const ch = new Chess()
      l.jugadas.forEach((s) => ch.move(s))
      revisar(`${l.id} (plan)`, ch, l.variante!.plan.marcas)
    }
    for (const l of lineas) {
      const ch = new Chess()
      l.jugadas.forEach((s, ply) => {
        const j = ch.move(s)
        const m = textoMio(c, l.jugadas, ply)
        if (m && (ply % 2 === 0 ? 'w' : 'b') === l.lado) revisar(`${l.id} ${s}`, ch, m.marcas, j)
      })
    }
    for (const p of [c.piezas.idea, c.piezas.estructura])
      for (const g of p.paginas) {
        if (!g.tablero) continue
        const ch = g.tablero.fen ? new Chess(g.tablero.fen) : new Chess()
        if (!g.tablero.fen) (g.tablero.jugadas ?? []).forEach((s) => ch.move(s))
        revisar(`${p.titulo} ${g.subtitulo ?? ''}`, ch, g.tablero.marcas)
      }
  })

  it('La estructura del Avance: la cadena blanca d4-e5 contra c5, d5 y e6', () => {
    const ch = new Chess(c.piezas.estructura.paginas[0]!.tablero!.fen!)
    const peones = (color: 'w' | 'b') => ch.board().flat().filter((s) => s && s.type === 'p' && s.color === color).map((s) => s!.square).sort()
    expect(peones('w')).toEqual(['a2', 'b2', 'c2', 'd4', 'e5', 'f2', 'g2', 'h2'])
    expect(peones('b')).toEqual(['a7', 'b7', 'c5', 'd5', 'e6', 'f7', 'g7', 'h7'])
  })

  it('la notación de los textos es la de las guías (R D T A C): la pantalla la convierte', () => {
    for (const t of todosLosTextos()) expect(t.texto, t.donde).not.toMatch(/\b[KQBN][a-h]?[1-8]?x?[a-h][1-8]\b|♔|♕|♖|♗|♘/)
  })
})
