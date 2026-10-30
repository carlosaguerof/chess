import type { DatosCurso, LineaCurso, Marca, MarcasPorFrase, PasoAPaso } from './tipos.ts'
import type { EstadoCiclo } from './ciclo.ts'
import { textoRival } from './datos.ts'
import { frasesDe, posicion } from './textos.ts'
import { frasesDespues, marcaAdelanta } from './adelantar.ts'

/**
 * Las marcas en el tablero (correcciones de la Caro-Kann, C5; reglas de las marcas v1.3, 2026-10-30), sin pantalla:
 * qué se ve en cada momento y cómo se dibuja. Cada marca nace de su frase (`tipo` A1–A7) y aparece junto con ella; las
 * de una misma jugada se acumulan, hasta cuatro, y el tablero se limpia en la siguiente. Antes de tu jugada, solo lo
 * del rival; después, lo tuyo. Lo pegado no se marca, salvo la casilla vacía que te quitan (A5).
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
/** Corta un texto en frases (vive en textos.ts: lo usa también la explicación de Practicar). */
export { frasesDe }

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
 * Lo que se ve en el tablero en un momento de la lección (reglas v1.3: lo del rival antes de tu jugada, lo tuyo después):
 * - **Aprender**, en mi turno: solo lo del rival, las marcas de su frase. "Te toca" no lleva marcas mías: la A1 sale solo
 *   con la Respuesta (o con "Flechas de la siguiente jugada", si las prendí en Ajustes). Pista: nada; Otra pista: se
 *   ilumina la pieza (salvo que su flecha ya se vea); Respuesta: la A1.
 * - **Practicar** y los «¿Y si…?», en mi turno: nada. Otra pista: la pieza; Respuesta: la A1 (R7).
 * - Después de mi jugada: las de su explicación, frase por frase (en Practicar también las de "qué hace", y sin las de
 *   las frases que no se muestran porque adelantan una jugada; `frasesDespues`).
 * - Mientras dura la línea, ninguna flecha apunta a una jugada mía que viene más adelante (R7, `marcaAdelanta`).
 * - El plan: las de su frase y la del rival (la línea ya terminó). El error, la flecha roja de lo que jugué; la buena de
 *   otra línea, la verde.
 */
export function marcasDelMomento(c: DatosCurso, l: LineaCurso, e: EstadoCiclo, opciones: { flechasSiguiente?: boolean } = {}): Marca[] {
  const aprender = e.vuelta === 'aprender' && l.tipo === 'variante'
  const r: Marca[] = []
  if (e.momento === 'tuTurno' && l.jugadas[e.ply]) {
    const a1 = flechaDe(l, e.ply)
    // en un «¿Y si…?» tampoco: se pregunta por la jugada que castiga, y una flecha la insinuaría (pase visual 1)
    if (aprender) {
      const p = rivalAntes(l, e.ply)
      // antes de tu jugada, solo lo del rival (v1.3, R7): rojo, y nada que adelante una jugada mía
      if (p !== null) r.push(...todas(textoRival(c, l.jugadas, p)?.marcas).filter((m) => m.color === 'rojo' && !marcaAdelanta(l, e.ply, m)))
      if (opciones.flechasSiguiente) r.push(a1)
    }
    const flechaVisible = r.some((m) => m.de === a1.de && m.a === a1.a)
    if (e.ayuda === 2 && !flechaVisible) r.push({ en: a1.de, color: 'verde' })
    if (e.ayuda === 3) r.push(a1)
  } else if ((e.momento === 'error' || e.momento === 'buena') && e.intento) {
    r.push({ de: e.intento.desde, a: e.intento.hasta, color: e.momento === 'error' ? 'rojo' : 'verde' })
  } else if (e.momento === 'leer' && e.ultima !== null) {
    // la A1 no va: la jugada ya la enseña el amarillo de la última jugada
    const ultima = e.ultima
    r.push(...frasesDespues(c, l, e.vuelta, ultima).flatMap((f) => f.marcas).filter((m) => m.tipo !== 'A1' && !marcaAdelanta(l, ultima + 1, m)))
  } else if (e.momento === 'plan' && l.variante) {
    r.push(...todas(l.variante.plan.marcasDe?.tuyo), ...todas(l.variante.plan.marcasDe?.rival))
  }
  return sinRepetir(r)
}

/**
 * Las marcas que se ven en el paso `i` del paso a paso: las suyas y las de los pasos de antes desde la última jugada,
 * pero solo si la frase de ahora sigue con lo mismo: trae marcas, y las de antes son de su mismo lado (verde o rojo).
 * En el paso a paso se ve una frase a la vez: una marca de antes en un paso que habla de otra cosa se quedaba sin su
 * frase ("Tu alfil de h7 sigue mirando la diagonal hacia b1" con la flecha de ...cxd4; pase visual de la v1.3).
 */
export function marcasDelPaso(pa: PasoAPaso, i: number): Marca[] {
  const propias = pa.pasos[i]!.marcas ?? []
  if (!propias.length) return []
  const lados = new Set(propias.map((m) => m.color))
  const r: Marca[] = [...propias]
  for (let j = i; j > 0; j--) {
    const p = pa.pasos[j]!
    if (p.jugadas?.length || p.reinicio) break
    // un paso de antes sin marcas de este lado ya limpió el tablero: lo de más atrás no regresa
    const antes = (pa.pasos[j - 1]!.marcas ?? []).filter((m) => lados.has(m.color))
    if (!antes.length) break
    r.unshift(...antes)
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
 * (parece que esa pieza es la que se mueve) y que pase por menos piezas. `usada`: las casillas por donde ya pasan las
 * flechas de antes (`puntosDeFlechas`), que estorban igual que una pieza. `por`: la esquina, si la marca la fija.
 */
export function puntosDeFlecha(de: string, a: string, orientacion: 'white' | 'black', ocupada: (casilla: string) => boolean = () => false, usada: (casilla: string) => boolean = () => false, por?: string): [number, number][] {
  const p0 = centro(de, orientacion)
  const p1 = centro(a, orientacion)
  if (!esSaltoDeCaballo(de, a)) return [p0, p1]
  return [p0, centro(caminoDeCaballo(de, a, ocupada, usada, por).esquina, orientacion), p1]
}

/** El camino que toma la L de un caballo (el de `puntosDeFlecha`). */
function caminoDeCaballo(de: string, a: string, ocupada: (casilla: string) => boolean, usada: (casilla: string) => boolean, por?: string) {
  const estorba = (c: string) => ocupada(c) || usada(c)
  const costo = (c: { esquina: string; pasa: string[] }) => (estorba(c.esquina) ? 2 : 0) + c.pasa.filter(estorba).length
  const [larga, corta] = caminosDeCaballo(de, a)
  if (por) return corta!.esquina === por ? corta! : larga!
  return costo(corta!) < costo(larga!) ? corta! : larga!
}

/** Las casillas por donde pasa una flecha, sin la de salida: las de en medio y la de llegada. */
function casillasDeFlecha(de: string, a: string, ocupada: (casilla: string) => boolean, usada: (casilla: string) => boolean, por?: string): string[] {
  if (esSaltoDeCaballo(de, a)) return [...caminoDeCaballo(de, a, ocupada, usada, por).pasa, a]
  const [c0, f0, c1, f1] = [de.charCodeAt(0) - 97, Number(de[1]), a.charCodeAt(0) - 97, Number(a[1])]
  const pasos = Math.max(Math.abs(c1 - c0), Math.abs(f1 - f0))
  return Array.from({ length: pasos }, (_, i) => casilla(c0 + (Math.sign(c1 - c0) * (i + 1) * Math.abs(c1 - c0)) / pasos, f0 + (Math.sign(f1 - f0) * (i + 1) * Math.abs(f1 - f0)) / pasos))
}

/**
 * Los puntos de varias flechas que se ven juntas, en su orden. Cada L de caballo evita, además de las piezas, el camino
 * de las flechas de antes (pase visual de la v1.3: la ruta f3→e5→g6 se encimaba en e5–f5 y se leía como una "T"; la L
 * f3→d4 doblaba sobre la flecha de la dama d1→d4). Las de antes no ven a las de después: una marca que se queda de un
 * paso al siguiente no cambia de forma (pase visual 2). La excepción: una L no llega por detrás de la flecha recta que
 * sale de su casilla (...c5 y ...♘c6: por c7, las dos se leían como una sola línea de c8 a c5). `por`: la esquina que
 * fija una marca, cuando su camino de siempre pasa sobre la pieza de la que sale otra flecha (6...♘c6 del 4.c3).
 */
export function puntosDeFlechas(flechas: { de: string; a: string; por?: string }[], orientacion: 'white' | 'black', ocupada: (casilla: string) => boolean = () => false): [number, number][][] {
  const usadas = new Set<string>()
  const atras = (f: { de: string; a: string }) => casilla(f.de.charCodeAt(0) - 97 - Math.sign(f.a.charCodeAt(0) - f.de.charCodeAt(0)), Number(f.de[1]) - Math.sign(Number(f.a[1]) - Number(f.de[1])))
  return flechas.map(({ de, a, por }) => {
    const siguen = new Set(flechas.filter((f) => f.de === a && !esSaltoDeCaballo(f.de, f.a)).map(atras))
    const usada = (c: string) => usadas.has(c) || siguen.has(c)
    const puntos = puntosDeFlecha(de, a, orientacion, ocupada, usada, por)
    for (const c of casillasDeFlecha(de, a, ocupada, usada, por)) usadas.add(c)
    return puntos
  })
}
