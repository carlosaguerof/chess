import { Chess, type Square } from 'chess.js'
import type { Vuelta } from './ciclo.ts'
import { adelanta, frasesDespues } from './adelantar.ts'
import { misJugadas, textoMio } from './datos.ts'
import { fotosDePasos } from './pasos.ts'
import { frasesDe, posicion } from './textos.ts'
import type { DatosCurso, LineaCurso, PasoAPaso, PasoLeer, VerQuePasa } from './tipos.ts'

/**
 * "Ver qué pasa" (Carlos, 2026-10-30), sin pantalla: qué ventana abre el botón en cada momento de la lección.
 * - **Sale con las frases que se muestran:** las que Practicar oculta por adelantar una jugada no traen botón.
 * - **En Practicar** tampoco va si la línea del "Ver" (sus jugadas, sus flechas verdes o su texto) contiene una jugada
 *   mía que la línea todavía me va a pedir, con la misma pieza y a la misma casilla: sería darme la respuesta. Con un
 *   error a la vista, cuenta también la jugada que falta, y una jugada del rival a su casilla. En Aprender sí va: ahí ya
 *   se me dice la jugada.
 * - **Dos frases con "Ver" en un momento** van una tras otra en la misma ventana, y el título cambia con la frase. La
 *   segunda vuelve a su posición (`reinicio`), salvo que siga la línea de la primera: entonces continúa desde ahí.
 */

/** Una frase con su "Ver qué pasa", y la posición de la que habla. */
export interface FraseConVer {
  clave: string
  /** el campo de la jugada, o `errores` */
  campo: 'porque' | 'prepara' | 'cuidado' | 'errores'
  /** su lugar en el campo; en `errores`, la jugada equivocada (SAN inglés) */
  i: number | string
  frase: string
  ver: VerQuePasa
  inicio: string[]
}

/** Todos los "Ver qué pasa" de un curso, con su frase: para las pruebas, el inventario y la lista de marcas. */
export function todosLosVer(c: DatosCurso): FraseConVer[] {
  const r: FraseConVer[] = []
  for (const [clave, m] of Object.entries(c.mias)) {
    const jugadas = clave.split(' ')
    const inicioDe = (v: VerQuePasa) => (v.antes ? jugadas.slice(0, -1) : jugadas)
    for (const campo of ['porque', 'prepara', 'cuidado'] as const)
      m.ver?.[campo]?.forEach((ver, i) => {
        if (ver) r.push({ clave, campo, i, frase: frasesDe(m[campo] ?? '')[i] ?? '', ver, inicio: inicioDe(ver) })
      })
    for (const [san, ver] of Object.entries(m.verErrores ?? {})) r.push({ clave, campo: 'errores', i: san, frase: m.errores?.[san] ?? '', ver, inicio: inicioDe(ver) })
  }
  return r
}

/**
 * Lo que la línea del "Ver" adelanta de mis jugadas de `l` desde la `desde`: las que hace, las que señala con una flecha
 * verde y las que su texto escribe (misma pieza, misma casilla). Vacío si no adelanta nada. `conError`: `desde` es la
 * jugada que falta, y una jugada del rival a esa casilla también la delata (la Van der Wiel: si juegas 7...Cc6, 8.h5
 * enseña h5, y la frase del error evita decir esa casilla).
 */
export function verAdelanta(l: LineaCurso, desde: number, inicio: string[], ver: VerQuePasa, conError = false): string[] {
  const pedidas = misJugadas(l)
    .filter((p) => p >= desde)
    .map((p) => {
      const m = posicion(l.jugadas, p).move(l.jugadas[p]!)
      return { pieza: m.piece as string, a: m.to as string, san: l.jugadas[p]! }
    })
  const r = new Set<string>()
  const contra = (pieza: string, a: string) => pedidas.filter((x) => x.pieza === pieza && x.a === a).forEach((x) => r.add(x.san))
  const fotos = fotosDePasos({ pasos: ver.pasos }, inicio)
  ver.pasos.forEach((p, i) => {
    for (const m of fotos[i]!.hechas) {
      if (m.color === l.lado) contra(m.piece, m.to)
      else if (conError && m.to === pedidas[0]?.a) r.add(pedidas[0].san)
    }
    const tablero = new Chess(fotos[i]!.fen)
    for (const f of p.marcas ?? []) {
      const pieza = f.color === 'verde' && f.de && f.a ? tablero.get(f.de as Square) : undefined
      if (pieza) contra(pieza.type, f.a!)
    }
    for (const s of adelanta(l, desde - 1, p.frase)) r.add(s)
  })
  return [...r]
}

/** Lo que abre el botón: el título (la primera frase), los pasos y la salida (las jugadas desde el inicio). */
export interface VerDelMomento {
  titulo: string
  pa: PasoAPaso
  inicio: string[]
}

const jugadasDe = (v: VerQuePasa) => v.pasos.flatMap((p) => p.jugadas ?? [])

/** Si `b` sigue la línea de `a`, cuántos pasos de `b` ya se vieron (los de esas jugadas); si no, 0. */
function pasosYaVistos(a: VerQuePasa, b: VerQuePasa): number {
  const [ja, jb] = [jugadasDe(a), jugadasDe(b)]
  if (!!a.antes !== !!b.antes || !ja.length || ja.length >= jb.length || !ja.every((s, i) => s === jb[i])) return 0
  let hechas = 0
  for (const [i, p] of b.pasos.entries()) {
    hechas += p.jugadas?.length ?? 0
    if (hechas >= ja.length) return i + 1
  }
  return 0
}

/**
 * Las frases de un momento, una tras otra, en una sola ventana. Si alguna habla de antes de mi jugada, la ventana sale de
 * ahí, y las que hablan de después llevan mi jugada en su `reinicio`.
 */
function juntar(l: LineaCurso, ply: number, frases: Pick<FraseConVer, 'frase' | 'ver'>[]): VerDelMomento | null {
  if (!frases.length) return null
  const antes = frases.some((f) => f.ver.antes)
  const pasos: PasoLeer[] = []
  frases.forEach((f, k) => {
    const base = antes && !f.ver.antes ? [l.jugadas[ply]!] : []
    const vistos = k > 0 ? pasosYaVistos(frases[k - 1]!.ver, f.ver) : 0
    f.ver.pasos.slice(vistos).forEach((p, i) => {
      const q: PasoLeer = { ...p }
      if (i === 0) q.titulo = f.frase
      // la segunda frase siempre regresa el tablero, y lo dice
      if (i === 0 && k > 0 && !vistos) q.frase = p.frase.replace('Esta es la posición', 'Regresamos a la posición')
      if (p.reinicio) q.reinicio = [...base, ...p.reinicio]
      else if (i === 0 && !vistos && (k > 0 || base.length)) q.reinicio = base
      pasos.push(q)
    })
  })
  return { titulo: frases[0]!.frase, pa: { pasos }, inicio: l.jugadas.slice(0, antes ? ply : ply + 1) }
}

const enPracticar = (l: LineaCurso, vuelta: Vuelta) => vuelta === 'practicar' && l.tipo === 'variante'

/** El "Ver qué pasa" de la explicación de después de mi jugada `ply`, si la frases que se muestran lo traen. */
export function verDespues(c: DatosCurso, l: LineaCurso, vuelta: Vuelta, ply: number): VerDelMomento | null {
  const m = textoMio(c, l.jugadas, ply)
  if (!m?.ver) return null
  const frases: Pick<FraseConVer, 'frase' | 'ver'>[] = []
  for (const f of frasesDespues(c, l, vuelta, ply)) {
    const ver = f.campo === 'hace' ? null : m.ver[f.campo]?.[f.i]
    if (!ver) continue
    const inicio = l.jugadas.slice(0, ver.antes ? ply : ply + 1)
    if (enPracticar(l, vuelta) && verAdelanta(l, ply + 1, inicio, ver).length) continue
    frases.push({ frase: f.texto, ver })
  }
  return juntar(l, ply, frases)
}

/** El "Ver qué pasa" de una equivocada conocida (`errores`). Mi jugada sigue pendiente, así que también cuenta esa. */
export function verDelError(c: DatosCurso, l: LineaCurso, vuelta: Vuelta, ply: number, san: string): VerDelMomento | null {
  const m = textoMio(c, l.jugadas, ply)
  const ver = m?.verErrores?.[san]
  const frase = m?.errores?.[san]
  if (!ver || !frase) return null
  if (enPracticar(l, vuelta) && verAdelanta(l, ply, l.jugadas.slice(0, ply), ver, true).length) return null
  return juntar(l, ply, [{ frase, ver }])
}
