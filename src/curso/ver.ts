import { Chess, type Square } from 'chess.js'
import type { Vuelta } from './ciclo.ts'
import { adelanta, frasesDespues } from './adelantar.ts'
import { misJugadas, textoMio } from './datos.ts'
import { fotosDePasos } from './pasos.ts'
import { frasesDe, posicion } from './textos.ts'
import type { DatosCurso, LineaCurso, PasoAPaso, VerQuePasa } from './tipos.ts'

/**
 * "Ver qué pasaría" (Carlos, 2026-10-30), sin pantalla: qué ventana abre cada botón de la lección.
 * - **Sale con las frases que se muestran:** las que Practicar oculta por adelantar una jugada no traen botón.
 * - **En Practicar** tampoco va si la línea del "Ver" (sus jugadas, sus flechas verdes o su texto) contiene una jugada
 *   mía que la línea todavía me va a pedir, con la misma pieza y a la misma casilla: sería darme la respuesta. Con un
 *   error a la vista, cuenta también la jugada que falta, y una jugada del rival a su casilla. En Aprender sí va: ahí ya
 *   se me dice la jugada.
 * - **Cada frase con "Ver" lleva su botón,** pegado a ella (`tramosDe`), y abre su propia ventana, desde su propia posición.
 */

/** Una frase con su "Ver qué pasaría", y la posición de la que habla. */
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

/** Todos los "Ver qué pasaría" de un curso, con su frase: para las pruebas, el inventario y la lista de marcas. */
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

/** Lo que abre el botón de una frase: el título (la frase), sus pasos y la salida (las jugadas desde el inicio). */
export interface VerDelMomento {
  titulo: string
  pa: PasoAPaso
  inicio: string[]
}

/** La ventana de una frase: sale de antes de mi jugada `ply` si la frase habla de ahí (`antes`); si no, de después. */
const verDeFrase = (l: LineaCurso, ply: number, frase: string, ver: VerQuePasa): VerDelMomento => ({ titulo: frase, pa: { pasos: ver.pasos }, inicio: l.jugadas.slice(0, ver.antes ? ply : ply + 1) })

const enPracticar = (l: LineaCurso, vuelta: Vuelta) => vuelta === 'practicar' && l.tipo === 'variante'

/** Los "Ver qué pasaría" de la explicación de después de mi jugada `ply`, en orden: uno por cada frase que se muestra y lo trae. */
export function verDespues(c: DatosCurso, l: LineaCurso, vuelta: Vuelta, ply: number): VerDelMomento[] {
  const m = textoMio(c, l.jugadas, ply)
  if (!m?.ver) return []
  const r: VerDelMomento[] = []
  for (const f of frasesDespues(c, l, vuelta, ply)) {
    const ver = f.campo === 'hace' ? null : m.ver[f.campo]?.[f.i]
    if (!ver) continue
    const v = verDeFrase(l, ply, f.texto, ver)
    if (enPracticar(l, vuelta) && verAdelanta(l, ply + 1, v.inicio, ver).length) continue
    r.push(v)
  }
  return r
}

/** El "Ver qué pasaría" de una equivocada conocida (`errores`). Mi jugada sigue pendiente, así que también cuenta esa. */
export function verDelError(c: DatosCurso, l: LineaCurso, vuelta: Vuelta, ply: number, san: string): VerDelMomento | null {
  const m = textoMio(c, l.jugadas, ply)
  const ver = m?.verErrores?.[san]
  const frase = m?.errores?.[san]
  if (!ver || !frase) return null
  if (enPracticar(l, vuelta) && verAdelanta(l, ply, l.jugadas.slice(0, ply), ver, true).length) return null
  return verDeFrase(l, ply, frase, ver)
}

/** Un trozo de un mensaje de la lección y, justo después de su punto final, su "Ver qué pasaría" si lo lleva. */
export interface Tramo {
  texto: string
  ver: VerDelMomento | null
}

/** Parte un mensaje después de cada frase que lleva "Ver": cada botón queda pegado a su frase, y el texto no cambia. */
export function tramosDe(texto: string, vers: VerDelMomento[]): Tramo[] {
  const r: Tramo[] = []
  let resto = texto
  for (const ver of vers) {
    const i = resto.indexOf(ver.titulo)
    if (i < 0) continue
    const fin = i + ver.titulo.length
    r.push({ texto: resto.slice(0, fin), ver })
    resto = resto.slice(fin).trimStart()
  }
  return resto ? [...r, { texto: resto, ver: null }] : r
}
