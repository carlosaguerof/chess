import datos from './personajes.json' with { type: 'json' }
import type { Temperamento } from '../motor/elegir.ts'
import { NIVELES } from '../motor/niveles.ts'
import type { Aspecto } from './retratos.ts'
import { guardar, leer } from '../estado/almacen.ts'

export interface Personaje {
  id: string
  nombre: string
  elo: number
  temperamento: Temperamento
  color: string
  frase: string
  /** los rasgos de su retrato (L1) */
  aspecto: Aspecto
  /** sus aperturas: ids de la base. blancas = lo que abre; negras = cómo se defiende */
  estilo: { blancas: string[]; negras: string[] }
}

export const PERSONAJES = datos.personajes as unknown as Personaje[]

/** Niveles calibrados: solo esos personajes se pueden escoger (T4: 300–1200; T13 completa el resto). */
export const NIVELES_CALIBRADOS = new Set(NIVELES.filter((n) => (n as { calibrado?: boolean }).calibrado !== false).map((n) => n.elo))

export function personajesDisponibles(): Personaje[] {
  return PERSONAJES.filter((p) => NIVELES_CALIBRADOS.has(p.elo))
}

export function personajePorId(id: string | undefined | null): Personaje | undefined {
  return PERSONAJES.find((p) => p.id === id)
}

/** El bot recomendado la primera vez: el primero de 700 (mi nivel), Brisa. */
export function recomendado(): Personaje {
  return personajesDisponibles().find((p) => p.elo === 700) ?? personajesDisponibles()[0]!
}

export interface Grupo {
  titulo: string
  detalle: string
  personajes: Personaje[]
}

/** Los grupos de la pantalla Jugar (L2), como en "Play Bots": por nivel, de menos a más. */
export function gruposDePersonajes(lista = personajesDisponibles()): Grupo[] {
  const g = (titulo: string, desde: number, hasta: number): Grupo => ({ titulo, detalle: `${desde}–${hasta}`, personajes: lista.filter((p) => p.elo >= desde && p.elo <= hasta) })
  return [g('Principiante', 100, 800), g('Intermedio', 900, 1500), g('Avanzado', 1600, 2200), g('Maestro', 2300, 3000)].filter((x) => x.personajes.length > 0)
}

const CLAVE_ULTIMO = 'ultimo-bot'

/** El bot con el que entra Jugar (y el del inicio): el último con el que jugué o, la primera vez, Brisa (700). */
export function botParaJugar(): Personaje {
  return personajePorId(leer<string | null>(CLAVE_ULTIMO, null)) ?? recomendado()
}

export function anotarUltimoBot(id: string): void {
  guardar(CLAVE_ULTIMO, id)
}

export const NOMBRE_TEMPERAMENTO: Record<Temperamento, string> = {
  agresivo: 'Agresivo',
  equilibrado: 'Equilibrado',
  defensivo: 'Defensivo',
}
