/**
 * El curso del escalón 1 (diseño §3 y §4): el formato del curso piloto de la Caro-Kann. El contenido vive en
 * `conocimiento/cursos/<apertura>.json`; aquí, la forma. Los textos van en la notación de las guías (R D T A C) y la
 * pantalla los convierte (`ajedrez/mostrar.ts`). `fuente` y `motor` son de la base interna: en la app no se cita nada.
 */

/** Una marca en el tablero: una flecha (de → a) o una casilla encerrada (en). */
export interface Marca {
  de?: string
  a?: string
  en?: string
  color?: 'verde' | 'rojo' | 'azul' | 'amarillo'
}

export interface TableroLeer {
  /** las jugadas desde el inicio (SAN inglés) o una posición */
  jugadas?: string[]
  fen?: string
  /** solo los peones (la ficha de la estructura) */
  soloPeones?: boolean
  marcas?: Marca[]
}

export interface PaginaLeer {
  subtitulo?: string
  texto: string[]
  tablero?: TableroLeer
  /** una línea para mostrar en un renglón (el repaso) */
  linea?: string[]
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
  marcas?: Marca[]
  fuente: string[]
  motor?: string[]
}

export interface JugadaRival {
  texto: string
  fuente: string[]
  motor?: string[]
}

export interface PlanVariante {
  tuyo: string
  rival: string
  marcas: Marca[]
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
