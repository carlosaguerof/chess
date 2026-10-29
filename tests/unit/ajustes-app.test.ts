import { beforeEach, describe, expect, it } from 'vitest'
import { instalarLocalStorage } from './memoria-navegador.ts'
import { BASE } from '../../src/base/base.ts'
import { cursosDeLaBase } from '../../src/cursos/modelo.ts'
import { cursos, cursoPorId } from '../../src/cursos/datos.ts'
import { cursoActivo, FAVORITAS_PRENDIDAS, MIS_APERTURAS, POPULARES, POPULARES_PRENDIDAS, TUS_DATOS_PRENDIDA } from '../../src/aprender/interruptores.ts'
import { misAperturas, repertorioCompleto, repertorioDeFavoritas } from '../../src/aprender/favoritas.ts'
import { migrarAlModeloDeFavoritas } from '../../src/aprender/migracion.ts'
import { jugadaDeMisLineas, resumenDePartida, ayudaEnMiTurno } from '../../src/guia/guia.ts'
import { jugadasFalladas } from '../../src/registro/refuerza.ts'
import { leerRegistro } from '../../src/registro/almacen-registro.ts'
import { leerProgreso } from '../../src/repertorio/estado.ts'
import { dia, leerRepaso, paraHoy } from '../../src/repaso/repaso.ts'
import { COMO_FUNCIONA_REFUERZA, COMO_FUNCIONA_REPASO } from '../../src/componentes/ComoFunciona.tsx'
import { ESCALONES } from '../../src/repaso/repaso.ts'

/** Ajustes de la app (2026-10-28): solo mis cursos, las favoritas apagadas y lo guardado de antes sin romperse. */
describe('ajustes de la app · solo mis cursos', () => {
  it('los interruptores internos están apagados', () => {
    expect(FAVORITAS_PRENDIDAS).toBe(false)
    expect(POPULARES_PRENDIDAS).toBe(false)
    expect(TUS_DATOS_PRENDIDA).toBe(false)
  })

  it('Aprender trae solo los cursos de mi árbol, en su orden', () => {
    const blancas = cursos().filter((c) => c.color === 'w').map((c) => c.id)
    const negras = cursos().filter((c) => c.color === 'b').map((c) => c.id)
    expect(blancas).toEqual(['italiana:w', 'siciliana:w', 'caro-kann:w', 'francesa:w', 'escandinava:w', 'otros-1e4:w'])
    expect(negras).toEqual(['caro-kann:b', 'eslava:b', 'otros-negras:b'])
    expect(cursos().filter((c) => c.color === 'w').map((c) => c.nombre)).toEqual(['Apertura Italiana', 'Contra la Siciliana', 'Contra la Caro-Kann', 'Contra la Francesa', 'Contra la Escandinava', 'Otras defensas contra 1.e4'])
    expect(cursos().filter((c) => c.color === 'b').map((c) => c.nombre)).toEqual(['Defensa Caro-Kann', 'Defensa Eslava', 'Otras aperturas de blancas'])
  })

  it('las 5 populares están apagadas, y todo curso de la base es mío o popular (nada queda suelto)', () => {
    expect(POPULARES).toEqual(['londres:w', 'gambito-dama:w', 'siciliana:b', 'escandinava:b', 'gambito-dama-declinado:b'])
    for (const id of POPULARES) {
      expect(cursoActivo(id), id).toBe(false)
      expect(cursoPorId(id), id).toBeUndefined()
    }
    for (const c of cursosDeLaBase(BASE)) expect(MIS_APERTURAS.includes(c.id) || POPULARES.includes(c.id), c.id).toBe(true)
    // siguen en la base (no se borró nada)
    expect(cursosDeLaBase(BASE).map((c) => c.id)).toEqual(expect.arrayContaining(POPULARES))
  })

  it('"Que juegue mis líneas" y la guía usan todas mis aperturas (sin favoritas)', () => {
    expect(misAperturas([])).toEqual(MIS_APERTURAS)
    // aunque hubiera favoritas guardadas de antes, con el interruptor apagado no cuentan
    expect(misAperturas(['londres:w'])).toEqual(MIS_APERTURAS)
    const rep = repertorioDeFavoritas(misAperturas())
    expect(new Set(rep.lineas.map((l) => `${l.apertura}:${l.color}`))).toEqual(new Set(MIS_APERTURAS))
    // con negras, el bot de "mis líneas" abre 1.e4, 1.d4 o lo demás de mi árbol
    expect(['e4', 'd4', 'c4', 'Nf3', 'b3', 'f4']).toContain(jugadaDeMisLineas(rep, 'b', [], () => 0.5))
    // con blancas, contesta a 1.e4 con alguna defensa de mi árbol (nunca se queda sin jugada)
    expect(jugadaDeMisLineas(rep, 'w', ['e4'], () => 0.5)).toBeTruthy()
    // lo ya practicado de Refuerza también es solo de mis cursos
    expect(new Set(repertorioCompleto().lineas.map((l) => `${l.apertura}:${l.color}`))).toEqual(new Set(MIS_APERTURAS))
  })

  it('la guía ya no ofrece practicar una popular apagada, pero sí nombra lo que se jugó', () => {
    const rep = repertorioDeFavoritas(misAperturas())
    // con mi repertorio, abrir 1.d4 es salirme de mi línea (1.e4)
    expect(resumenDePartida(rep, 'w', ['d4', 'd5', 'Bf4'], BASE).caso).toBe('me-sali')
    // sin repertorio (las favoritas prendidas y vacías), jugar el Londres lo nombra, sin línea para practicar
    const r = resumenDePartida(repertorioDeFavoritas([]), 'w', ['d4', 'Nf6', 'Bf4', 'g6'], BASE)
    expect(r.texto).toContain('Londres')
    expect(r.texto).toContain('No está en tus aperturas')
    expect(r.linea).toBeUndefined()
    // y en la partida, la Pista ya no sale del Londres ni del Gambito de Dama: fuera de teoría
    const a = ayudaEnMiTurno({ base: BASE, rep, color: 'w' }, ['d4', 'd5'])
    expect(a.origen).toBe('fuera')
    expect(a.nombre ?? '').not.toMatch(/Londres|Gambito de Dama/)
  })
})

describe('ajustes de la app · lo guardado de la versión anterior no rompe nada', () => {
  let memoria: Map<string, string>
  beforeEach(() => {
    memoria = instalarLocalStorage()
  })

  it('favoritas, avance, repaso y pestaña de antes: se leen sin errores y el avance de mis cursos se conserva', () => {
    const miLeccion = cursoPorId('caro-kann:b')!.lecciones[0]!.id
    const leccionPopular = cursosDeLaBase(BASE).find((c) => c.id === 'londres:w')!.lecciones[0]!.id
    memoria.set('ajedrez.v1.modelo', '2')
    memoria.set('ajedrez.v1.favoritas', JSON.stringify(['londres:w', 'caro-kann:b', 'siciliana:b']))
    memoria.set('ajedrez.v1.progreso', JSON.stringify({ [miLeccion]: { fecha: Date.UTC(2026, 9, 20) }, [leccionPopular]: { fecha: Date.UTC(2026, 9, 20) } }))
    memoria.set('ajedrez.v1.repaso', JSON.stringify({ [leccionPopular]: { escalon: 2, proxima: '2026-10-25' } }))
    memoria.set('ajedrez.v1.pestana-aprender', JSON.stringify('todas'))
    memoria.set('ajedrez.v1.registro', JSON.stringify([{ fen: 'basura', esperada: 'Qh5', resultado: 'fallo', lugar: 'curso', fecha: 1 }]))
    expect(() => migrarAlModeloDeFavoritas()).not.toThrow()
    // mi avance sigue ahí; el de la popular no se borra (vuelve si se prende el interruptor)
    expect(Object.keys(leerProgreso())).toEqual([miLeccion, leccionPopular])
    expect(memoria.get('ajedrez.v1.favoritas')).toBe(JSON.stringify(['londres:w', 'caro-kann:b', 'siciliana:b']))
    // el repaso solo trae lecciones de mis cursos: la del Londres no vuelve, la mía sí
    const lecciones = cursos().flatMap((c) => c.lecciones)
    const hoy = paraHoy(leerRepaso(), leerProgreso(), lecciones, dia(Date.UTC(2026, 9, 28)), leerRegistro())
    expect(hoy.map((l) => l.id)).toEqual([miLeccion])
    // Refuerza con un registro raro de antes: nada que no sea de mis líneas
    expect(jugadasFalladas(repertorioCompleto(), leerRegistro())).toEqual([])
  })

  it('un navegador con datos de la v1 (antes de las favoritas) también abre', () => {
    memoria.set('ajedrez.v1.repertorio', JSON.stringify({ version: 1, lineas: [] }))
    memoria.set('ajedrez.v1.progreso', JSON.stringify({ 'caro-kann:b/b:caro-kann/avance-short': { fecha: 1 }, 'londres:w/londres/d5-e6': { fecha: 2 } }))
    expect(() => migrarAlModeloDeFavoritas()).not.toThrow()
    expect(Object.keys(leerProgreso())).toContain('caro-kann:b/b:caro-kann/avance-short')
    expect(misAperturas()).toEqual(MIS_APERTURAS)
  })

  it('datos dañados en el navegador no rompen nada', () => {
    memoria.set('ajedrez.v1.favoritas', '{no es json')
    memoria.set('ajedrez.v1.progreso', 'null')
    expect(() => migrarAlModeloDeFavoritas()).not.toThrow()
    expect(misAperturas()).toEqual(MIS_APERTURAS)
  })
})

describe('Nota 1 · "cómo funciona" dice lo que hace el código', () => {
  it('el Repaso nombra sus plazos reales y que es opcional', () => {
    expect(COMO_FUNCIONA_REPASO.pasos.join(' ')).toContain(ESCALONES.join(', ').replace(/, (\d+)$/, ' y $1'))
    expect(COMO_FUNCIONA_REPASO.pasos.at(-1)).toMatch(/opcional/)
    expect(COMO_FUNCIONA_REPASO.enlace).toBe('Ver cómo funciona el Repaso de hoy')
  })

  it('Refuerza dice que Pista y Respuesta cuentan como fallo, y que es opcional', () => {
    expect(COMO_FUNCIONA_REFUERZA.pasos.join(' ')).toMatch(/Pista o Respuesta también cuenta como fallo/)
    expect(COMO_FUNCIONA_REFUERZA.pasos.at(-1)).toMatch(/opcional/)
    expect(COMO_FUNCIONA_REFUERZA.enlace).toBe('Ver cómo funciona Refuerza')
  })
})

describe('punto 4 (opción A) · Respaldo: el archivo trae todo y se carga de vuelta', () => {
  let memoria: Map<string, string>
  beforeEach(() => {
    memoria = instalarLocalStorage()
    // guardarFavoritas y cargarRespaldo avisan a la página con eventos
    ;(globalThis as unknown as { window: EventTarget }).window = new EventTarget()
  })

  it('exportar trae avance, registro, repaso, partidas y ajustes; no la partida a medias', async () => {
    const { textoDelRespaldo } = await import('../../src/estado/respaldo.ts')
    memoria.set('ajedrez.v1.progreso', JSON.stringify({ 'caro-kann:b/b:caro-kann/avance-short': { fecha: 1 } }))
    memoria.set('ajedrez.v1.registro', JSON.stringify([{ fen: 'x', esperada: 'c6', resultado: 'fallo', lugar: 'curso', fecha: 2 }]))
    memoria.set('ajedrez.v1.repaso', JSON.stringify({ 'caro-kann:b/b:caro-kann/avance-short': { escalon: 2, proxima: '2026-11-01' } }))
    memoria.set('ajedrez.v1.historial', JSON.stringify([{ id: 'p1', botId: 'brisa', colorHumano: 'w', resultado: 'gane', fin: 'jaque mate', jugadas: 20, fecha: 3 }]))
    memoria.set('ajedrez.v1.sonido', 'true')
    memoria.set('ajedrez.v1.estilo-retratos', JSON.stringify('peeps'))
    memoria.set('ajedrez.v1.estrellas', JSON.stringify({ brisa: 3 }))
    memoria.set('ajedrez.v1.partida', JSON.stringify({ id: 'a-medias' }))
    memoria.set('otra-app.algo', '1')
    const r = JSON.parse(textoDelRespaldo())
    expect(r).toMatchObject({ app: 'chess-mis-aperturas', version: 2 })
    expect(Object.keys(r.progreso)).toHaveLength(1)
    expect(r.registro).toHaveLength(1)
    expect(r.repaso['caro-kann:b/b:caro-kann/avance-short'].escalon).toBe(2)
    expect(r.historial).toHaveLength(1)
    expect(r.ajustes).toEqual({ 'estilo-retratos': 'peeps', estrellas: { brisa: 3 }, sonido: true })
  })

  it('importar reemplaza con lo del archivo (y un archivo sin partidas no borra las que hay)', async () => {
    const { textoDelRespaldo, cargarRespaldo, resumenDelRespaldo } = await import('../../src/estado/respaldo.ts')
    const { importar } = await import('../../src/repertorio/edicion.ts')
    memoria.set('ajedrez.v1.progreso', JSON.stringify({ a: { fecha: 1 }, b: { fecha: 2 } }))
    memoria.set('ajedrez.v1.historial', JSON.stringify([{ id: 'p1' }]))
    memoria.set('ajedrez.v1.sonido', 'true')
    const archivo = textoDelRespaldo()
    // pasa a "otro teléfono": vacío
    memoria.clear()
    const r = importar(archivo)
    expect(resumenDelRespaldo(r)).toBe('2 lecciones aprendidas y 1 partida')
    cargarRespaldo(r)
    expect(JSON.parse(memoria.get('ajedrez.v1.progreso')!)).toEqual({ a: { fecha: 1 }, b: { fecha: 2 } })
    expect(JSON.parse(memoria.get('ajedrez.v1.historial')!)).toEqual([{ id: 'p1' }])
    expect(memoria.get('ajedrez.v1.sonido')).toBe('true')
    // un archivo de antes (sin partidas ni ajustes) se lee y deja las partidas como están
    const viejo = JSON.stringify({ app: 'chess-mis-aperturas', version: 2, favoritas: [], progreso: { c: { fecha: 3 } }, registro: [], repaso: {} })
    const rv = importar(viejo)
    expect(resumenDelRespaldo(rv)).toBe('1 lección aprendida')
    cargarRespaldo(rv)
    expect(JSON.parse(memoria.get('ajedrez.v1.progreso')!)).toEqual({ c: { fecha: 3 } })
    expect(JSON.parse(memoria.get('ajedrez.v1.historial')!)).toEqual([{ id: 'p1' }])
    // un archivo no puede pisar el avance desde "ajustes"
    cargarRespaldo({ ...rv, ajustes: { progreso: { trampa: { fecha: 0 } }, partida: { id: 'x' } } })
    expect(JSON.parse(memoria.get('ajedrez.v1.progreso')!)).toEqual({ c: { fecha: 3 } })
    expect(memoria.has('ajedrez.v1.partida')).toBe(false)
  })
})
