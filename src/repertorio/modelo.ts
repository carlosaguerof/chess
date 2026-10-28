import type { Base, Variante } from '../base/tipos.ts'
import type { ColorCorto } from '../ajedrez/reglas.ts'

/**
 * Mi repertorio (nota 11): mi guía solo dice QUÉ aprendo; las líneas, planes y frecuencias salen de la base.
 * Esta es la lista de mi guía: con blancas, 1.e4 con la Italiana, la Alapin, el Avance contra la Caro-Kann y contra la
 * Francesa, la captura contra la Escandinava (y principios contra lo demás); con negras, la Caro-Kann y la Eslava
 * (y ...c6 + ...d5 contra lo demás).
 */
export interface EntradaGuia {
  color: ColorCorto
  apertura: string
  /** prefijo del id de las variantes que entran (vacío = todas) */
  prefijo: string
  /** cómo lo dice mi guía */
  nombreGuia: string
  /** el texto de mi guía para esa entrada (se muestra donde coincide con la teoría) */
  textoGuia: string
}

export const GUIA: EntradaGuia[] = [
  { color: 'w', apertura: 'italiana', prefijo: '', nombreGuia: 'Italiana', textoGuia: '2.Cf3 Cc6 3.Ac4 — apuntas el alfil a f7, desarrollo natural, enroque corto.' },
  { color: 'w', apertura: 'siciliana', prefijo: 'alapin', nombreGuia: 'Alapin', textoGuia: '2.c3 — construyes centro con d4, evitas toda la teoría Siciliana.' },
  { color: 'w', apertura: 'caro-kann', prefijo: 'avance', nombreGuia: 'Avance', textoGuia: '2.d4 d5 3.e5 — cierras centro, atacas flanco de rey con c3-Cf3-Ae2.' },
  { color: 'w', apertura: 'francesa', prefijo: '', nombreGuia: 'Avance', textoGuia: '2.d4 d5 3.e5 — mismo plan que contra Caro-Kann. Un solo esquema, dos defensas.' },
  { color: 'w', apertura: 'escandinava', prefijo: '', nombreGuia: 'Captura', textoGuia: '2.exd5 Dxd5 3.Cc3 — ganas tiempo atacando la dama, desarrollo y enroque.' },
  { color: 'w', apertura: 'otros-1e4', prefijo: '', nombreGuia: 'Principios', textoGuia: 'Desarrolla, controla el centro, enroca. No necesitas teoría específica.' },
  { color: 'b', apertura: 'caro-kann', prefijo: '', nombreGuia: 'Caro-Kann', textoGuia: '1...c6 — preparas ...d5 sólido, estructura clara, poca teoría.' },
  { color: 'b', apertura: 'eslava', prefijo: '', nombreGuia: 'Eslava', textoGuia: '1...d5 2.c4 c6 — defiendes d5 con peón, tu alfil de casillas blancas sale a f5.' },
  { color: 'b', apertura: 'otros-negras', prefijo: '', nombreGuia: 'Principios', textoGuia: '1.c4, 1.Cf3, 1.b3 — juega ...c6 + ...d5 y normalmente transpone a estructuras conocidas.' },
]

export interface LineaRepertorio {
  id: string
  color: ColorCorto
  apertura: string
  /** SAN en inglés desde la posición inicial */
  jugadas: string[]
  familia: string
  nombre: string
  plan: string
  autorPlan: 'ia' | 'guia' | 'yo'
  frecuencia: number
  /** de dónde salió: una variante de la base, o una línea que agregué jugándola */
  origen: 'base' | 'propia'
  claveBase?: string
}

export interface Repertorio {
  version: 1
  lineas: LineaRepertorio[]
}

const ladoAColor = (v: Variante, color: ColorCorto) => v.lado === 'ambos' || (v.lado === 'blancas' ? color === 'w' : color === 'b')

/**
 * La frecuencia de una variante es la del lado de su apertura (p. ej. la guía da cuánto escoge blancas el Avance contra
 * MI Caro-Kann). Si la juego del otro lado, esa frecuencia no aplica: va 3 (sin dato).
 */
export function frecuenciaPara(v: Variante, color: ColorCorto, ladoApertura: Variante['lado']): number {
  if (ladoApertura === 'ambos') return v.frecuencia
  const miLado = color === 'w' ? 'blancas' : 'negras'
  return ladoApertura === miLado ? v.frecuencia : 3
}

export function lineaDeVariante(v: Variante, color: ColorCorto, apertura: string, ladoApertura: Variante['lado'] = 'ambos'): LineaRepertorio {
  return {
    id: `${color}:${v.clave}`,
    color,
    apertura,
    jugadas: [...v.jugadas],
    familia: v.familia,
    nombre: v.nombre,
    plan: v.plan,
    autorPlan: 'ia',
    frecuencia: frecuenciaPara(v, color, ladoApertura),
    origen: 'base',
    claveBase: v.clave,
  }
}

/** El repertorio original: las aperturas de mi guía con sus variantes de la base. */
export function repertorioInicial(base: Base): Repertorio {
  const lineas: LineaRepertorio[] = []
  for (const g of GUIA) {
    const a = base.aperturas.find((x) => x.id === g.apertura)
    if (!a) continue
    for (const v of a.variantes) {
      if (!v.id.startsWith(g.prefijo)) continue
      if (!ladoAColor(v, g.color)) continue
      lineas.push(lineaDeVariante(v, g.color, a.id, a.lado))
    }
  }
  return { version: 1, lineas }
}

/** ¿Esta media jugada (índice desde 0) es mía, jugando con `color`? */
export const esMiPly = (color: ColorCorto, ply: number) => (ply % 2 === 0 ? 'w' : 'b') === color

// ---------------------------------------------------------------- el árbol

export interface NodoArbol {
  /** SAN en inglés de la jugada que lleva aquí ('' en la raíz) */
  san: string
  ply: number
  camino: string[]
  hijos: NodoArbol[]
  /** está en mi repertorio (alguna línea mía pasa por aquí) */
  enRepertorio: boolean
  /** ids de las líneas de mi repertorio que pasan por aquí */
  lineas: string[]
  /** claves de variantes de la base que pasan por aquí y no están en mi repertorio */
  soloBase: string[]
  /** si aquí empieza una familia (variante con nombre), su nombre, plan y frecuencia */
  familia?: { nombre: string; plan: string; frecuencia: number; autorPlan: LineaRepertorio['autorPlan'] }
  /** si aquí termina una línea, su nombre */
  terminaLinea?: { id: string; nombre: string }
  /** jugada mía (del color del árbol) */
  mia: boolean
}

function nodo(san: string, ply: number, camino: string[], color: ColorCorto): NodoArbol {
  return { san, ply, camino, hijos: [], enRepertorio: false, lineas: [], soloBase: [], mia: ply >= 0 && esMiPly(color, ply) }
}

/**
 * El árbol de un color: mis líneas (en mi repertorio) y, colgando de ellas, las variantes de la base de ese color que
 * no están en mi repertorio ("solo en la base"), para poder agregarlas.
 */
export function arbolDe(rep: Repertorio, color: ColorCorto, base?: Base): NodoArbol {
  const raiz = nodo('', -1, [], color)
  const insertar = (jugadas: string[], marcar: (n: NodoArbol) => void) => {
    let n = raiz
    jugadas.forEach((san, i) => {
      let h = n.hijos.find((x) => x.san === san)
      if (!h) {
        h = nodo(san, i, jugadas.slice(0, i + 1), color)
        n.hijos.push(h)
      }
      marcar(h)
      n = h
    })
    return n
  }
  const mias = rep.lineas.filter((l) => l.color === color)
  for (const l of mias) {
    const fin = insertar(l.jugadas, (n) => {
      n.enRepertorio = true
      n.lineas.push(l.id)
    })
    fin.terminaLinea = { id: l.id, nombre: l.nombre }
  }
  if (base) {
    const enRep = new Set(mias.map((l) => l.claveBase).filter(Boolean))
    const tocaMias = (jugadas: string[]) => {
      // solo variantes que salen de un nodo de mi repertorio (comparten al menos la primera jugada)
      const primera = raiz.hijos.find((h) => h.san === jugadas[0])
      return !!primera?.enRepertorio
    }
    for (const a of base.aperturas)
      for (const v of a.variantes) {
        if (enRep.has(v.clave)) continue
        if (!ladoAColor(v, color)) continue
        if (!tocaMias(v.jugadas)) continue
        insertar(v.jugadas, (n) => {
          if (!n.enRepertorio) n.soloBase.push(v.clave)
        })
      }
  }
  // familias: el primer nodo donde todas las líneas mías que pasan son de una sola familia
  const familiaDe = new Map(mias.map((l) => [l.id, l]))
  const ponerFamilias = (n: NodoArbol, familiaPadre: string | null) => {
    for (const h of n.hijos) {
      const fams = new Set(h.lineas.map((id) => familiaDe.get(id)!.familia))
      let actual = familiaPadre
      if (fams.size === 1) {
        const f = [...fams][0]!
        if (f !== familiaPadre) {
          const ls = h.lineas.map((id) => familiaDe.get(id)!)
          const principal = ls.reduce((a, b) => (b.frecuencia > a.frecuencia ? b : a))
          h.familia = { nombre: f, plan: principal.plan, frecuencia: Math.max(...ls.map((l) => l.frecuencia)), autorPlan: principal.autorPlan }
          actual = f
        }
      } else actual = null
      ponerFamilias(h, actual)
    }
  }
  ponerFamilias(raiz, null)
  // orden: primero lo de mi repertorio, por frecuencia
  const frec = (n: NodoArbol): number => Math.max(0, ...n.lineas.map((id) => familiaDe.get(id)!.frecuencia))
  const ordenar = (n: NodoArbol) => {
    n.hijos.sort((a, b) => +b.enRepertorio - +a.enRepertorio || frec(b) - frec(a))
    n.hijos.forEach(ordenar)
  }
  ordenar(raiz)
  return raiz
}

/** Las jugadas de mi repertorio en una posición (por historial): mi jugada esperada y sus alternativas, o las del rival. */
export function siguientesEnRepertorio(rep: Repertorio, color: ColorCorto, historia: string[]): { san: string; lineas: LineaRepertorio[] }[] {
  const mapa = new Map<string, LineaRepertorio[]>()
  for (const l of rep.lineas) {
    if (l.color !== color || l.jugadas.length <= historia.length) continue
    if (historia.some((s, i) => l.jugadas[i] !== s)) continue
    const s = l.jugadas[historia.length]!
    mapa.set(s, [...(mapa.get(s) ?? []), l])
  }
  return [...mapa.entries()]
    .map(([san, lineas]) => ({ san, lineas }))
    .sort((a, b) => Math.max(...b.lineas.map((l) => l.frecuencia)) - Math.max(...a.lineas.map((l) => l.frecuencia)))
}
