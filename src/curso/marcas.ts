import type { DatosCurso, LineaCurso, Marca, MarcasPorFrase, PasoAPaso } from './tipos.ts'
import type { EstadoCiclo } from './ciclo.ts'
import { textoMio, textoRival } from './datos.ts'
import { posicion } from './textos.ts'

/**
 * Las marcas en el tablero (correcciones de la Caro-Kann, C5; reglas de las marcas v1.1, aprobadas por Carlos el
 * 2026-10-29), sin pantalla: qué se ve en cada momento y cómo se dibuja. Cada marca nace de su frase (`tipo` A1–A6) y
 * aparece junto con ella; las de una misma jugada se acumulan, hasta cuatro, y el tablero se limpia en la siguiente.
 */

// ---------------------------------------------------------------- el interruptor interno
/** Prendido con el "publica" de la torre (C7). `chess.interno.marcas` = "0" las apaga, "1" las prende (pruebas y capturas). */
export const MARCAS_NUEVAS_DE_ENTRADA = true
const CLAVE_INTERRUPTOR = 'chess.interno.marcas'

export function marcasNuevas(): boolean {
  try {
    const v = localStorage.getItem(CLAVE_INTERRUPTOR)
    if (v === '1') return true
    if (v === '0') return false
  } catch {
    /* sin almacenamiento: lo de entrada */
  }
  return MARCAS_NUEVAS_DE_ENTRADA
}

// ---------------------------------------------------------------- las frases de un texto
/** Corta un texto en frases: donde un punto va seguido de espacio y mayúscula ("1...c6" y "3.Cd2" no cortan). */
export function frasesDe(texto: string): string[] {
  return texto.split(/(?<=[.!?])\s+(?=[A-ZÁÉÍÓÚÑ¿«])/).filter(Boolean)
}

const todas = (m?: MarcasPorFrase): Marca[] => (m ?? []).flat()
const igual = (x: Marca, y: Marca) => x.de === y.de && x.a === y.a && x.en === y.en
/** Sin repetir (R3): la misma flecha o la misma casilla, una vez. */
const sinRepetir = (ms: Marca[]) => ms.filter((m, i) => ms.findIndex((n) => igual(m, n)) === i)

/** La flecha de una jugada (de su casilla de salida a la de llegada). */
function flechaDe(l: LineaCurso, ply: number): Marca {
  const m = posicion(l.jugadas, ply).move(l.jugadas[ply]!)
  return { tipo: 'A1', de: m.from, a: m.to, color: 'verde' }
}

/** El índice de la jugada del rival que se narra en mi turno (la de justo antes), si la hay. */
function rivalAntes(l: LineaCurso, ply: number): number | null {
  const p = ply - 1
  return p >= l.desde && p >= 0 && (p % 2 === 0 ? 'w' : 'b') !== l.lado ? p : null
}

/**
 * Lo que se ve en el tablero en un momento de la lección:
 * - **Aprender**, en mi turno: las marcas de la frase del rival y las de "Te toca" (la A1 de las jugadas clave, con lo
 *   que dice la frase). Pista: nada; Otra pista: se ilumina la pieza (salvo que su flecha ya se vea); Respuesta: la A1.
 * - **Practicar** y los «¿Y si…?», en mi turno: nada. Otra pista: la pieza; Respuesta: la A1 (R7).
 * - Después de mi jugada: las de su explicación (en Practicar también las de "qué hace", sin la A1: ya la enseña el
 *   amarillo de la última jugada).
 * - El plan: las de su frase y la del rival. El error, la flecha roja de lo que jugué; la buena de otra línea, la verde.
 */
export function marcasDelMomento(c: DatosCurso, l: LineaCurso, e: EstadoCiclo, opciones: { flechasSiguiente?: boolean } = {}): Marca[] {
  const practicar = e.vuelta === 'practicar' && l.tipo === 'variante'
  const aprender = e.vuelta === 'aprender' && l.tipo === 'variante'
  const r: Marca[] = []
  if (e.momento === 'tuTurno' && l.jugadas[e.ply]) {
    const mia = textoMio(c, l.jugadas, e.ply)
    const a1 = flechaDe(l, e.ply)
    // en un «¿Y si…?» tampoco: se pregunta por la jugada que castiga, y una flecha la insinuaría (pase visual 1)
    if (aprender) {
      const p = rivalAntes(l, e.ply)
      if (p !== null) r.push(...todas(textoRival(c, l.jugadas, p)?.marcas))
      r.push(...todas(mia?.marcasDe?.hace))
      if (opciones.flechasSiguiente) r.push(a1)
    }
    const flechaVisible = r.some((m) => m.de === a1.de && m.a === a1.a)
    if (e.ayuda === 2 && !flechaVisible) r.push({ en: a1.de, color: 'verde' })
    if (e.ayuda === 3) r.push(a1)
  } else if ((e.momento === 'error' || e.momento === 'buena') && e.intento) {
    r.push({ de: e.intento.desde, a: e.intento.hasta, color: e.momento === 'error' ? 'rojo' : 'verde' })
  } else if (e.momento === 'leer' && e.ultima !== null) {
    const de = textoMio(c, l.jugadas, e.ultima)?.marcasDe
    if (practicar) r.push(...todas(de?.hace).filter((m) => m.tipo !== 'A1'))
    r.push(...todas(de?.porque), ...todas(de?.prepara), ...todas(de?.cuidado))
  } else if (e.momento === 'plan' && l.variante) {
    r.push(...todas(l.variante.plan.marcasDe?.tuyo), ...todas(l.variante.plan.marcasDe?.rival))
  }
  return sinRepetir(r)
}

/** Las marcas que se ven en el paso `i` del paso a paso: las suyas y las de los pasos de antes desde la última jugada. */
export function marcasDelPaso(pa: PasoAPaso, i: number): Marca[] {
  const r: Marca[] = []
  for (let j = i; j >= 0; j--) {
    const p = pa.pasos[j]!
    r.unshift(...(p.marcas ?? []))
    if (p.jugadas?.length || p.reinicio) break
  }
  return sinRepetir(r)
}

// ---------------------------------------------------------------- el dibujo (R5 y R6)
/** Solo dos colores, siempre los mismos: verde lo tuyo, rojo lo del rival contra ti (R5). */
export const COLORES = { verde: '#15781B', rojo: '#C62828' } as const
export const colorDe = (m: Marca): string => (m.color === 'rojo' ? COLORES.rojo : COLORES.verde)

/** El centro de una casilla, en un tablero de 8 × 8 que empieza arriba a la izquierda, según hacia dónde mira. */
export function centro(casilla: string, orientacion: 'white' | 'black'): [number, number] {
  const col = casilla.charCodeAt(0) - 97
  const fila = Number(casilla[1]) - 1
  return orientacion === 'white' ? [col + 0.5, 7 - fila + 0.5] : [7 - col + 0.5, fila + 0.5]
}

/** Un salto de caballo: una casilla para un lado y dos para el otro. */
export function esSaltoDeCaballo(de: string, a: string): boolean {
  const dx = Math.abs(de.charCodeAt(0) - a.charCodeAt(0))
  const dy = Math.abs(Number(de[1]) - Number(a[1]))
  return (dx === 1 && dy === 2) || (dx === 2 && dy === 1)
}

const casilla = (col: number, fila: number) => `${String.fromCharCode(97 + col)}${fila}`

/**
 * Los dos caminos posibles de la L de un caballo: primero el tramo largo, o primero el corto. De cada uno, su esquina y
 * las casillas por las que pasa (sin la de salida ni la de llegada).
 */
export function caminosDeCaballo(de: string, a: string): { esquina: string; pasa: string[] }[] {
  const [c0, f0, c1, f1] = [de.charCodeAt(0) - 97, Number(de[1]), a.charCodeAt(0) - 97, Number(a[1])]
  if (Math.abs(f1 - f0) === 2) {
    const medio = (f0 + f1) / 2
    return [
      { esquina: casilla(c0, f1), pasa: [casilla(c0, medio), casilla(c0, f1)] },
      { esquina: casilla(c1, f0), pasa: [casilla(c1, f0), casilla(c1, medio)] },
    ]
  }
  const medio = (c0 + c1) / 2
  return [
    { esquina: casilla(c1, f0), pasa: [casilla(medio, f0), casilla(c1, f0)] },
    { esquina: casilla(c0, f1), pasa: [casilla(c0, f1), casilla(medio, f1)] },
  ]
}

/**
 * Los puntos de una flecha: recta, o en L si es un salto de caballo (R6). La L va primero por el tramo largo, como el
 * dibujo de Carlos (g8→g6→f6), salvo que el otro camino estorbe menos (pase visual 1): que no doble encima de una pieza
 * (parece que esa pieza es la que se mueve) y que pase por menos piezas. Depende solo del tablero, no de las otras
 * flechas: una marca que se queda de un paso a otro no cambia de forma (pase visual 2).
 */
export function puntosDeFlecha(de: string, a: string, orientacion: 'white' | 'black', ocupada: (casilla: string) => boolean = () => false): [number, number][] {
  const p0 = centro(de, orientacion)
  const p1 = centro(a, orientacion)
  if (!esSaltoDeCaballo(de, a)) return [p0, p1]
  const costo = (c: { esquina: string; pasa: string[] }) => (ocupada(c.esquina) ? 2 : 0) + c.pasa.filter(ocupada).length
  const [larga, corta] = caminosDeCaballo(de, a)
  const camino = costo(corta!) < costo(larga!) ? corta! : larga!
  return [p0, centro(camino.esquina, orientacion), p1]
}
