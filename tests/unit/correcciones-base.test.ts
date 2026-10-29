import { describe, expect, it } from 'vitest'
import { BASE } from '../../src/base/base.ts'

/**
 * C1 (curso de la Caro-Kann): las correcciones que encontró la investigación del porqué en los planes de la base,
 * cada una comprobada con el motor (la tabla está en `iterations/v3/correcciones-de-la-base.md`). Estas pruebas cuidan
 * que los errores no vuelvan.
 */
const plan = (apertura: string, id: string) => BASE.aperturas.find((a) => a.id === apertura)!.variantes.find((v) => v.id === id)!.plan
const idea = (apertura: string) => BASE.aperturas.find((a) => a.id === apertura)!.idea

describe('C1: los errores de ajedrez de la base no vuelven', () => {
  it('Escandinava, Grünfeld: la única casilla buena del alfil es e6', () => {
    expect(plan('escandinava', 'da5-grunfeld')).toContain('7...Ae6')
    expect(plan('escandinava', 'da5-grunfeld')).not.toContain('completa con ...e6')
  })
  it('Italiana: ...a6 no amenaza ...b5; 4.Cc3 contra el Rousseau es un error', () => {
    expect(plan('italiana', 'giuoco-pianissimo-principal')).not.toContain('amenaza ...b5')
    expect(plan('italiana', 'rousseau')).toContain('4.Cc3 es un error')
  })
  it('Caro-Kann: nunca ...Dc7 en el Cambio, nunca 4...e6 contra la Tal, 6...h5 contra h4 en la Bayoneta', () => {
    expect(plan('caro-kann', 'cambio-rubinstein')).toContain('nunca con ...Dc7')
    expect(plan('caro-kann', 'avance-tal')).toContain('Nunca 4...e6')
    expect(plan('caro-kann', 'avance-bayoneta')).toContain('6...h5, no 6...h6')
    expect(plan('caro-kann', 'avance-botvinnik-carls')).not.toContain('gasta un tiempo')
  })
  it('Eslava: no copiar a blancas en el Cambio; el alfil a f5 tiene su momento; la Semieslava no es error', () => {
    expect(plan('eslava', 'cambio')).not.toContain('Desarrolla igual que blancas')
    expect(idea('eslava')).not.toContain('Es la misma estructura de la Caro-Kann')
    expect(plan('eslava', 'tranquila-schallopp')).toContain('Semieslava')
  })
  it('Francesa: el Milner-Barry es un gambito legítimo; no tomar en h6', () => {
    expect(plan('francesa', 'principal-a3')).not.toContain('Evita 6.Ad3')
    expect(plan('francesa', 'lputian')).toContain('7.Axh6')
  })
  it('Alapin: sin las dos frases que no tenían fuente', () => {
    expect(plan('siciliana', 'alapin-cf6-stoltz')).not.toContain('apunta al enroque')
    expect(plan('siciliana', 'alapin-d5-g6')).not.toContain('con c4')
  })
  it('Otras con negras: contra 1.b3, 1.g3 y 1.f4 no se llega a la Eslava; 2.e4 d5 es el Panov acelerado', () => {
    expect(idea('otros-negras')).toContain('1.b3, 1.g3 y 1.f4 no')
    expect(plan('otros-negras', 'inglesa-caro-kann')).toContain('Panov acelerado')
  })
})
