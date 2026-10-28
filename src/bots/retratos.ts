import { useEffect, useState } from 'react'
import { createAvatar } from '@dicebear/core'
import * as toonHead from '@dicebear/toon-head'
import * as avataaars from '@dicebear/avataaars'
import * as openPeeps from '@dicebear/open-peeps'
import { guardar, leer } from '../estado/almacen.ts'
import type { Personaje } from './personajes.ts'

/**
 * L1: el retrato de cada personaje, en uno de tres estilos de colecciones libres (licencias en LICENCIAS.md).
 * Se dibuja en el código a partir del aspecto del personaje (personajes.json): siempre el mismo retrato para el mismo
 * personaje y estilo, sin internet. Lo que el aspecto no fija lo decide el id del personaje, nunca el azar.
 */
export type EstiloRetrato = 'toon' | 'avataaars' | 'peeps'

export const ESTILOS: { id: EstiloRetrato; nombre: string; autor: string }[] = [
  { id: 'toon', nombre: 'Ilustrado', autor: 'Toon Head, de Johan Melin' },
  { id: 'avataaars', nombre: 'Caricatura', autor: 'Avataaars, de Pablo Stanley' },
  { id: 'peeps', nombre: 'Dibujado a mano', autor: 'Open Peeps, de Pablo Stanley' },
]

/** El recomendado: el que más se parece a un retrato de busto ilustrado y expresivo. */
export const ESTILO_RECOMENDADO: EstiloRetrato = 'toon'

export type Edad = 'nino' | 'joven' | 'adulto' | 'mayor'
export type Peinado = 'corto' | 'rapado' | 'calvo' | 'puntas' | 'largo' | 'ondulado' | 'rizado' | 'chongo' | 'melena' | 'afro' | 'trenzas' | 'flequillo'
export type ColorPelo = 'negro' | 'castano' | 'castano-claro' | 'rubio' | 'pelirrojo' | 'canoso' | 'blanco' | 'morado'
export type Ropa = 'playera' | 'camisa' | 'sueter' | 'saco' | 'sudadera' | 'vestido' | 'cuello'
export type Gesto = 'sonrisa' | 'risa' | 'serio' | 'picaro' | 'retador' | 'tranquilo'

export interface Aspecto {
  edad: Edad
  /** 1 (clara) a 5 (oscura) */
  piel: 1 | 2 | 3 | 4 | 5
  peinado: Peinado
  colorPelo: ColorPelo
  ropa: Ropa
  gesto: Gesto
  barba?: 'bigote' | 'candado' | 'chivo' | 'completa' | 'larga'
  lentes?: 'redondos' | 'cuadrados' | 'sol'
  gorro?: 'gorra' | 'gorro' | 'sombrero' | 'turbante' | 'hiyab'
}

const PELO: Record<ColorPelo, string> = {
  negro: '2c1b18',
  castano: '5a3825',
  'castano-claro': 'a55728',
  rubio: 'd6b370',
  pelirrojo: 'b5441d',
  canoso: 'a7a7a7',
  blanco: 'e6e3dc',
  morado: '7e4bb5',
}

function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/** Escoge una de varias opciones según el id (siempre la misma para el mismo personaje). */
const una = <T,>(id: string, xs: readonly T[]): T => xs[hash(id) % xs.length]!
const sinGato = (c: string) => c.replace('#', '')

// ------------------------------------------------------------------ Toon Head (Johan Melin, CC BY 4.0)

function opcionesToon(p: Personaje, a: Aspecto) {
  const pelo: Record<Peinado, [string | null, string | null]> = {
    corto: ['sideComed', null],
    flequillo: ['sideComed', 'neckHigh'],
    rapado: ['undercut', null],
    calvo: [null, null],
    puntas: ['spiky', null],
    largo: ['sideComed', 'longStraight'],
    ondulado: ['sideComed', 'longWavy'],
    rizado: ['spiky', 'shoulderHigh'],
    chongo: ['bun', null],
    melena: ['sideComed', 'shoulderHigh'],
    afro: ['spiky', 'neckHigh'],
    trenzas: ['bun', 'longWavy'],
  }
  const [hair, rearHair] = pelo[a.peinado]
  const gestos: Record<Gesto, { eyes: string; eyebrows: string; mouth: string }> = {
    sonrisa: { eyes: 'happy', eyebrows: 'neutral', mouth: 'smile' },
    risa: { eyes: 'happy', eyebrows: 'happy', mouth: 'laugh' },
    serio: { eyes: 'humble', eyebrows: 'neutral', mouth: 'smile' },
    picaro: { eyes: 'wink', eyebrows: 'raised', mouth: 'smile' },
    retador: { eyes: 'wide', eyebrows: 'angry', mouth: 'smile' },
    tranquilo: { eyes: 'bow', eyebrows: 'happy', mouth: 'smile' },
  }
  const g = gestos[a.gesto]
  const barba = { bigote: 'moustacheTwirl', candado: 'chinMoustache', chivo: 'chin', completa: 'fullBeard', larga: 'longBeard' } as const
  const ropa = { playera: 'tShirt', camisa: 'shirt', sueter: 'turtleNeck', saco: 'openJacket', sudadera: 'tShirt', vestido: 'dress', cuello: 'turtleNeck' } as const
  return {
    seed: p.id,
    skinColor: [['f1c3a5', 'd9a07f', 'b98e6a', 'a36b4f', '5c3829'][a.piel - 1]!],
    hair: hair ? [hair] : undefined,
    hairProbability: hair ? 100 : 0,
    rearHair: rearHair ? [rearHair] : undefined,
    rearHairProbability: rearHair ? 100 : 0,
    hairColor: [PELO[a.colorPelo]],
    beard: a.barba ? [barba[a.barba]] : undefined,
    beardProbability: a.barba ? 100 : 0,
    clothes: [ropa[a.ropa]],
    clothesColor: [sinGato(p.color)],
    eyes: [g.eyes],
    eyebrows: [g.eyebrows],
    mouth: [g.mouth],
  }
}

// ------------------------------------------------------------------ Avataaars (Pablo Stanley)

function opcionesAvataaars(p: Personaje, a: Aspecto) {
  const canas = a.colorPelo === 'canoso' || a.colorPelo === 'blanco'
  const peinados: Record<Peinado, string[]> = {
    corto: ['shortFlat', 'shortRound', 'theCaesarAndSidePart', 'shortWaved'],
    flequillo: ['straightAndStrand'],
    rapado: ['theCaesar'],
    calvo: canas ? ['sides'] : [],
    puntas: ['frizzle', 'shaggyMullet'],
    largo: ['straight01', 'straight02', 'longButNotTooLong'],
    ondulado: ['curvy', 'shaggy', 'bigHair'],
    rizado: ['curly', 'shortCurly'],
    chongo: ['bun'],
    melena: ['bob', 'miaWallace'],
    afro: ['fro', 'froBand'],
    trenzas: ['dreads01', 'dreads02', 'dreads'],
  }
  const gorros = { gorra: ['winterHat02'], gorro: ['winterHat1', 'winterHat03', 'winterHat04'], sombrero: ['hat'], turbante: ['turban'], hiyab: ['hijab'] }
  const tops = a.gorro ? gorros[a.gorro] : peinados[a.peinado]
  const gestos: Record<Gesto, { eyes: string; eyebrows: string; mouth: string }> = {
    sonrisa: { eyes: 'default', eyebrows: 'defaultNatural', mouth: 'smile' },
    risa: { eyes: 'happy', eyebrows: 'raisedExcitedNatural', mouth: 'smile' },
    serio: { eyes: 'default', eyebrows: 'flatNatural', mouth: 'serious' },
    picaro: { eyes: 'wink', eyebrows: 'upDownNatural', mouth: 'twinkle' },
    retador: { eyes: 'squint', eyebrows: 'angryNatural', mouth: 'smile' },
    tranquilo: { eyes: 'happy', eyebrows: 'defaultNatural', mouth: 'default' },
  }
  const g = gestos[a.gesto]
  const barba = { bigote: ['moustacheFancy', 'moustacheMagnum'], candado: ['beardLight'], chivo: ['beardLight'], completa: ['beardMedium'], larga: ['beardMajestic'] }
  const lentes = { redondos: ['round'], cuadrados: ['prescription01', 'prescription02', 'wayfarers'], sol: ['sunglasses'] }
  const ropa = {
    playera: a.edad === 'nino' ? ['overall', 'shirtCrewNeck'] : ['shirtCrewNeck'],
    camisa: ['shirtVNeck'],
    sueter: ['collarAndSweater'],
    saco: ['blazerAndShirt', 'blazerAndSweater'],
    sudadera: ['hoodie'],
    vestido: ['shirtScoopNeck'],
    cuello: ['collarAndSweater'],
  }
  return {
    seed: p.id,
    skinColor: [['ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '614335'][a.piel - 1]!],
    top: tops.length ? [una(p.id, tops)] : undefined,
    topProbability: tops.length ? 100 : 0,
    hairColor: [PELO[a.colorPelo]],
    hatColor: [sinGato(p.color)],
    facialHair: a.barba ? [una(p.id, barba[a.barba])] : undefined,
    facialHairProbability: a.barba ? 100 : 0,
    facialHairColor: [PELO[a.colorPelo]],
    accessories: a.lentes ? [una(p.id, lentes[a.lentes])] : undefined,
    accessoriesProbability: a.lentes ? 100 : 0,
    accessoriesColor: ['262e33'],
    clothing: [una(p.id, ropa[a.ropa])],
    clothesColor: [sinGato(p.color)],
    eyes: [g.eyes],
    eyebrows: [g.eyebrows],
    mouth: [g.mouth],
  }
}

// ------------------------------------------------------------------ Open Peeps (Pablo Stanley, CC0)

function opcionesPeeps(p: Personaje, a: Aspecto) {
  const canas = a.colorPelo === 'canoso' || a.colorPelo === 'blanco'
  const peinados: Record<Peinado, string[]> = {
    corto: canas ? ['grayShort'] : ['short1', 'short2', 'short3', 'short4', 'short5'],
    flequillo: ['bangs', 'bangs2'],
    rapado: ['shaved1', 'shaved2', 'shaved3'],
    calvo: ['noHair1', 'noHair2', 'noHair3'],
    puntas: ['mohawk', 'mohawk2', 'flatTop'],
    largo: ['long', 'mediumStraight', 'longBangs'],
    ondulado: canas ? ['grayMedium'] : ['medium1', 'medium2', 'medium3'],
    rizado: ['longCurly', 'twists'],
    chongo: canas ? ['grayBun'] : ['bun', 'bun2', 'buns'],
    melena: canas ? ['grayMedium'] : ['mediumBangs', 'mediumBangs2', 'mediumBangs3'],
    afro: ['afro', 'longAfro'],
    trenzas: ['cornrows', 'cornrows2', 'bantuKnots', 'twists2', 'dreads1'],
  }
  const gorros = { gorra: ['hatHip'], gorro: ['hatBeanie'], sombrero: ['hatHip'], turbante: ['turban'], hiyab: ['hijab'] }
  const caras: Record<Gesto, string[]> = {
    sonrisa: ['smile'],
    risa: ['smileBig', 'smileLOL'],
    serio: ['serious', 'solemn'],
    picaro: ['cheeky'],
    retador: ['driven', 'suspicious'],
    tranquilo: a.edad === 'mayor' ? ['old', 'calm'] : ['calm'],
  }
  const barba = {
    bigote: ['moustache1', 'moustache2', 'moustache3', 'moustache4', 'moustache5', 'moustache6', 'moustache7', 'moustache8', 'moustache9'],
    candado: ['goatee1', 'goatee2'],
    chivo: ['chin'],
    completa: ['full', 'full2'],
    larga: ['full3', 'full4'],
  }
  const lentes = { redondos: ['glasses'], cuadrados: ['glasses2', 'glasses3', 'glasses4', 'glasses5'], sol: ['sunglasses', 'sunglasses2'] }
  return {
    seed: p.id,
    skinColor: [['ffdbb4', 'edb98a', 'd08b5b', 'ae5d29', '694d3d'][a.piel - 1]!],
    head: [una(p.id, a.gorro ? gorros[a.gorro] : peinados[a.peinado])],
    headContrastColor: [PELO[a.colorPelo]],
    face: [una(p.id, caras[a.gesto])],
    facialHair: a.barba ? [una(p.id, barba[a.barba])] : undefined,
    facialHairProbability: a.barba ? 100 : 0,
    accessories: a.lentes ? [una(p.id, lentes[a.lentes])] : undefined,
    accessoriesProbability: a.lentes ? 100 : 0,
    maskProbability: 0,
    clothingColor: [sinGato(p.color)],
  }
}

/** Las opciones con las que se dibuja un personaje en un estilo (lo que fija su retrato). */
export function opcionesRetrato(estilo: EstiloRetrato, p: Personaje): Record<string, unknown> {
  const a = p.aspecto
  if (estilo === 'avataaars') return opcionesAvataaars(p, a)
  if (estilo === 'peeps') return opcionesPeeps(p, a)
  return opcionesToon(p, a)
}

const cache = new Map<string, string>()

/** El SVG del retrato (texto). */
export function svgRetrato(estilo: EstiloRetrato, p: Personaje): string {
  const o = opcionesRetrato(estilo, p)
  // las opciones sin valor se quitan: DiceBear tomaría las de por defecto
  const limpias = Object.fromEntries(Object.entries(o).filter(([, v]) => v !== undefined))
  if (estilo === 'avataaars') return createAvatar(avataaars, limpias).toString()
  if (estilo === 'peeps') return createAvatar(openPeeps, limpias).toString()
  return createAvatar(toonHead, limpias).toString()
}

/** El retrato como imagen (data URI), guardado en memoria. */
export function retrato(estilo: EstiloRetrato, p: Personaje): string {
  const k = `${estilo}:${p.id}`
  let uri = cache.get(k)
  if (!uri) {
    uri = 'data:image/svg+xml;utf8,' + encodeURIComponent(svgRetrato(estilo, p))
    cache.set(k, uri)
  }
  return uri
}

// ------------------------------------------------------------------ el estilo escogido (Más → Ajustes)

const CLAVE = 'estilo-retratos'
const EVENTO = 'estilo-retratos'

export function estiloRetratos(): EstiloRetrato {
  const e = leer<string>(CLAVE, ESTILO_RECOMENDADO)
  return ESTILOS.some((x) => x.id === e) ? (e as EstiloRetrato) : ESTILO_RECOMENDADO
}

export function cambiarEstiloRetratos(e: EstiloRetrato): void {
  guardar(CLAVE, e)
  window.dispatchEvent(new Event(EVENTO))
}

/** El estilo actual; cambia al instante en toda la app cuando se escoge otro en Ajustes. */
export function useEstiloRetratos(): EstiloRetrato {
  const [e, setE] = useState(estiloRetratos)
  useEffect(() => {
    const cambio = () => setE(estiloRetratos())
    window.addEventListener(EVENTO, cambio)
    return () => window.removeEventListener(EVENTO, cambio)
  }, [])
  return e
}
