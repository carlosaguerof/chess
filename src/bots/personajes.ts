import datos from './personajes.json' with { type: 'json' }
import type { Temperamento } from '../motor/elegir.ts'
import { NIVELES } from '../motor/niveles.ts'
import type { Aspecto } from './retratos.ts'

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

/** El bot recomendado en el inicio: el primero de 700 (mi nivel). */
export function recomendado(): Personaje {
  return personajesDisponibles().find((p) => p.elo === 700) ?? personajesDisponibles()[0]!
}

export interface Grupo {
  titulo: string
  detalle: string
  personajes: Personaje[]
}

/** Mi zona (500–1000) primero; lo demás agrupado. */
export function gruposDePersonajes(lista = personajesDisponibles()): Grupo[] {
  const g = (titulo: string, detalle: string, f: (p: Personaje) => boolean): Grupo => ({ titulo, detalle, personajes: lista.filter(f) })
  return [
    g('Tu zona', '500 a 1000', (p) => p.elo >= 500 && p.elo <= 1000),
    g('Principiantes', '100 a 400', (p) => p.elo < 500),
    g('Intermedios', '1100 a 1500', (p) => p.elo >= 1100 && p.elo <= 1500),
    g('Avanzados', '1600 a 3000', (p) => p.elo >= 1600),
  ].filter((x) => x.personajes.length > 0)
}

export const NOMBRE_TEMPERAMENTO: Record<Temperamento, string> = {
  agresivo: 'Agresivo',
  equilibrado: 'Equilibrado',
  defensivo: 'Defensivo',
}
