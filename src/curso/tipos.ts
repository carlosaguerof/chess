/**
 * El curso del escalón 1 (diseño §3 y §4): el formato del curso piloto de la Caro-Kann. El contenido vive en
 * `conocimiento/cursos/<apertura>.json`; aquí, la forma. Los textos van en la notación de las guías (R D T A C) y la
 * pantalla los convierte (`ajedrez/mostrar.ts`). `fuente` y `motor` son de la base interna: en la app no se cita nada.
 */

/**
 * Una marca en el tablero: una flecha (de → a) o una casilla (en).
 *
 * Las de las correcciones (C5; reglas de las marcas v1.3, 2026-10-30) traen `tipo`, lo que afirma su frase: A1 tu
 * jugada (solo como Respuesta), A2 tu pieza ataca o apoya una casilla desde lejos o saltando, A3 tu plan o una ruta
 * (punteada verde), A4 una pieza del rival controla, ataca o defiende desde lejos o saltando, A5 el rival te quita una
 * casilla vacía (la casilla y la flecha de tu pieza a ella), A6 la casilla clave, A7 el plan o la amenaza del rival
 * (punteada roja, una flecha por paso, hasta dos). Solo verde (lo tuyo) y rojo (lo del rival). Las de antes, sin
 * `tipo`, se ven mientras el interruptor siga apagado.
 */
export interface Marca {
  de?: string
  a?: string
  en?: string
  color?: 'verde' | 'rojo' | 'azul' | 'amarillo'
  tipo?: 'A1' | 'A2' | 'A3' | 'A4' | 'A5' | 'A6' | 'A7'
  /** "después": un plan, una ruta o una amenaza (A3 verde, A7 roja) */
  punteada?: boolean
  /** la esquina de la L de un caballo, si su camino de siempre pasa sobre la pieza de la que sale otra flecha */
  por?: string
}

/** Los campos de la explicación de una jugada mía, en el orden en que se leen. */
export type CampoMio = 'hace' | 'porque' | 'prepara' | 'cuidado'

/** Las marcas de un texto, frase por frase (la frase 0 primero). */
export type MarcasPorFrase = Marca[][]

export interface TableroLeer {
  /** las jugadas desde el inicio (SAN inglés) o una posición */
  jugadas?: string[]
  fen?: string
  /** solo los peones (la ficha de la estructura) */
  soloPeones?: boolean
  marcas?: Marca[]
}

/**
 * Un paso del "Ver paso a paso" (correcciones, C3; puntos 2 y 3 del feedback de Carlos): una frase, y lo que el
 * tablero hace en ese momento. Lo que dice la frase sale del texto de su página (o de su plan), ya con su fuente.
 */
export interface PasoLeer {
  /** una frase, en la notación de las guías */
  frase: string
  /** antes de jugar, el tablero vuelve a esta posición: las jugadas desde la salida del paso a paso */
  reinicio?: string[]
  /**
   * las jugadas que el tablero hace en este paso (SAN inglés), desde la posición del paso anterior. En un paso a paso
   * ilustrativo, las de negras van con "..." ("...Bd6") y las de blancas sin nada: así se sabe de qué color es cada una
   */
  jugadas?: string[]
  /** las marcas de esta frase (correcciones, C5) */
  marcas?: Marca[]
  /** en una ventana que cubre dos frases ("Ver qué pasaría"), la frase de la que hablan los pasos desde aquí: es el título */
  titulo?: string
  /** de dónde sale esta frase y qué comprobó el motor ("Ver qué pasaría"; en los demás pasos, los trae su página o su plan) */
  fuente?: string[]
  motor?: string[]
}

/**
 * "Ver qué pasaría" (Carlos, 2026-10-30, en el curso: "lo leo y no lo veo"): los pasos de una frase que dice qué pasaría si
 * se jugara otra cosa, en la misma ventana del "Ver paso a paso". Las jugadas de los dos lados se juegan, una por paso, y
 * el último paso dice la consecuencia. Va junto a su frase, en `ver` y `verErrores` de la jugada mía (`src/curso/ver.ts`).
 */
export interface VerQuePasa {
  /** la frase habla de la posición de antes de mi jugada ("Con ...e6 en vez de ...h5"); si no, de la de después */
  antes?: boolean
  pasos: PasoLeer[]
}

export interface PasoAPaso {
  /** la posición de salida (FEN); si no, la inicial, o el final de la variante en un plan */
  fen?: string
  /** solo los peones (la estructura) */
  soloPeones?: boolean
  /**
   * Un plan o una estructura: se mueven solo las piezas de las que habla la frase, aunque el mismo color juegue dos
   * veces seguidas, y no todas (no se juega lo que dejaría una pieza colgada). La ventana lo dice en su nota: "Es una
   * ilustración: el rival no contesta cada jugada."
   */
  ilustrativo?: boolean
  pasos: PasoLeer[]
}

export interface PaginaLeer {
  subtitulo?: string
  texto: string[]
  tablero?: TableroLeer
  /** una línea para mostrar en un renglón (el repaso) */
  linea?: string[]
  /** "Ver paso a paso" (correcciones, C3) */
  pasoAPaso?: PasoAPaso
  fuente: string[]
}

export interface PiezaLeer {
  titulo: string
  paginas: PaginaLeer[]
}

/** La explicación de una jugada mía (§4.2 de la investigación). */
export interface JugadaMia {
  /** la jugada que define la línea: su texto puede pasar de 40 palabras */
  clave?: boolean
  /** lo que se pregunta en Practicar: la meta, sin decir la jugada */
  pregunta: string
  /** la Pista (primer escalón): la idea en palabras */
  pista?: string
  /** jugadas buenas en esta posición que la base no trae (SAN inglés): salen como "buena de otra línea", no en rojo */
  buenas?: string[]
  hace: string
  porque?: string
  prepara?: string
  /** el error típico de esta posición, con su castigo */
  cuidado?: string
  /** por qué no, para jugadas equivocadas conocidas (SAN inglés → texto) */
  errores?: Record<string, string>
  /** las de antes (sin frase): se ven después de jugar mientras el interruptor de las marcas siga apagado */
  marcas?: Marca[]
  /**
   * las marcas de cada frase (correcciones, C5; reglas v1.3), medidas en la posición después de la jugada. `hace` es
   * "Te toca" en Aprender, antes de jugar, y ahí no se ven: sus marcas salen en Practicar, después de jugar
   */
  marcasDe?: Partial<Record<CampoMio, MarcasPorFrase>>
  /**
   * las jugadas mías que cada frase describe sin escribirlas (SAN inglés), frase por frase: "Tu alfil podrá esconderse
   * en h7" describe ...Bh7. En Practicar, una frase que escribe o describe una jugada que la línea todavía me va a pedir
   * no se muestra (Carlos, 2026-10-30: "en Practicar no se dan pistas que no pedí"; `src/curso/adelantar.ts`)
   */
  describe?: Partial<Record<CampoMio, string[][]>>
  /** "Ver qué pasaría" de cada frase, en su orden (`null`: esa frase no lleva); `hace` no: es "Te toca", antes de jugar */
  ver?: Partial<Record<Exclude<CampoMio, 'hace'>, (VerQuePasa | null)[]>>
  /** "Ver qué pasaría" de las explicaciones de `errores` (SAN inglés → sus pasos) */
  verErrores?: Record<string, VerQuePasa>
  fuente: string[]
  motor?: string[]
}

export interface JugadaRival {
  texto: string
  /** las marcas de cada frase de `texto`, con su jugada en negritas (correcciones, C5) */
  marcas?: MarcasPorFrase
  fuente: string[]
  motor?: string[]
}

export interface PlanVariante {
  tuyo: string
  rival: string
  /** las de antes (sin frase) */
  marcas: Marca[]
  /** las marcas de cada frase de `tuyo` y de `rival` (correcciones, C5) */
  marcasDe?: Partial<Record<'tuyo' | 'rival', MarcasPorFrase>>
  /** "Ver paso a paso" (correcciones, C3): sale del final de la variante */
  pasoAPaso?: PasoAPaso
  fuente: string[]
}

export interface VarianteCurso {
  id: string
  /** la variante de la base que trae la línea (`scripts/base/definiciones/<apertura>.json`) */
  base: string
  nombre: string
  /** cuántas medias jugadas ya están en el tablero al empezar (el tronco que ya se aprendió) */
  desde: number
  intro: string
  /** la idea clave, para el resumen */
  idea: string
  plan: PlanVariante
  regla: string
  frecuencia: number
  fuenteFrecuencia: string
}

export interface ErrorCurso {
  id: string
  de: 'tuyo' | 'rival'
  titulo: string
  jugadas: string[]
  desde: number
  /** quién castiga: con ese color juegas tú */
  lado: 'w' | 'b'
  intro: string
  final: string
  fuente: string[]
  motor?: string[]
}

export interface DatosCurso {
  id: string
  apertura: string
  color: 'w' | 'b'
  nombre: string
  version: string
  fuentes: Record<string, string>
  piezas: {
    idea: PiezaLeer
    estructura: PiezaLeer
    errores: { titulo: string; intro: string; lista: ErrorCurso[] }
    repaso: PiezaLeer
  }
  variantes: VarianteCurso[]
  /** la explicación de cada jugada del rival, por las jugadas hasta ella ("e4 c6 d4") */
  rival: Record<string, JugadaRival>
  /** la de cada jugada mía (o de quien castiga en Errores y trampas) */
  mias: Record<string, JugadaMia>
  glosario: { termino: string; definicion: string }[]
}

/** Una línea interactiva: una variante (con su línea de la base) o un "¿Y si…?" de Errores y trampas. */
export interface LineaCurso {
  /** "v:avance-short" o "e:tal-e6" */
  id: string
  tipo: 'variante' | 'error'
  nombre: string
  jugadas: string[]
  desde: number
  /** el color con que juegas tú en esta línea */
  lado: 'w' | 'b'
  intro: string
  /** el id de la lección (para el registro, el Repaso y Refuerza) */
  leccionId?: string
  variante?: VarianteCurso
  error?: ErrorCurso
}
