import { useState } from 'react'
import { Texto } from '../componentes/Notacion.tsx'
import { Chess } from 'chess.js'
import type { Key } from 'chessground/types'
import { TableroMini } from '../componentes/TableroMini.tsx'
import { BotonPasoAPaso } from '../componentes/PasoAPaso.tsx'
import { IconoAtras } from '../componentes/Iconos.tsx'
import { navegar } from '../ruta.ts'
import { cursoNuevo, lineasDe } from '../curso/datos.ts'
import type { DatosCurso, PaginaLeer, TableroLeer } from '../curso/tipos.ts'
import { marcarPieza, useAvance, type AvanceCurso, type PiezaLeerId } from '../curso/avance.ts'
import { formas, lineaHasta } from '../curso/textos.ts'
import { soloPeones } from '../curso/pasos.ts'
import { marcasNuevas } from '../curso/marcas.ts'

/**
 * C6 (diseño §7): la página de un curso nuevo. Las piezas en orden (La idea, La estructura, las variantes, Errores y
 * trampas, Repaso), cada una con su estado, y un botón grande: "Empezar", "Seguir" con el nombre de lo que sigue abajo, o
 * "Repasar el curso".
 */
type Paso = { id: string; nombre: string; url: string; hecho: boolean }

const url = (c: DatosCurso, resto: string) => `/curso/${encodeURIComponent(c.id)}${resto}`

/** Todo el curso en orden, con lo hecho y lo pendiente. */
export function pasosDelCurso(c: DatosCurso, a: AvanceCurso): Paso[] {
  return [
    { id: 'idea', nombre: c.piezas.idea.titulo, url: url(c, '/leer/idea'), hecho: !!a.piezas.idea },
    { id: 'estructura', nombre: c.piezas.estructura.titulo, url: url(c, '/leer/estructura'), hecho: !!a.piezas.estructura },
    ...c.variantes.map((v) => ({ id: `v:${v.id}`, nombre: v.nombre, url: url(c, `/linea/${encodeURIComponent(`v:${v.id}`)}`), hecho: !!a.variantes[v.id]?.terminada })),
    { id: 'errores', nombre: c.piezas.errores.titulo, url: url(c, '/errores'), hecho: !!a.piezas.errores },
    { id: 'repaso', nombre: c.piezas.repaso.titulo, url: url(c, '/leer/repaso'), hecho: !!a.piezas.repaso },
  ]
}

/** "3 de 16 variantes" */
export function avanceVariantes(c: DatosCurso, a: AvanceCurso): string {
  const n = c.variantes.filter((v) => a.variantes[v.id]?.terminada).length
  return `${n} de ${c.variantes.length} variantes`
}

/** Lo que sigue: la variante a medias, o lo primero pendiente. */
export function siguientePaso(c: DatosCurso, a: AvanceCurso): Paso | undefined {
  const pasos = pasosDelCurso(c, a)
  if (a.enCurso) {
    const p = pasos.find((x) => x.id === a.enCurso!.linea)
    if (p && !p.hecho) return p
  }
  return pasos.find((x) => !x.hecho)
}

const fenDe = (jugadas: string[] = []) => {
  const ch = new Chess()
  for (const s of jugadas) ch.move(s)
  return ch.fen()
}

export function CursoPagina({ id }: { id: string }) {
  const c = cursoNuevo(id)!
  const a = useAvance(c.id)
  const pasos = pasosDelCurso(c, a)
  const sigue = siguientePaso(c, a)
  const alguno = pasos.some((p) => p.hecho) || !!a.enCurso
  const estado = (p: Paso) => (p.hecho ? 'Hecha' : p.id.startsWith('v:') && a.variantes[p.id.slice(2)]?.aprendida ? 'Aprendida' : 'Pendiente')
  const fila = (p: Paso, n?: number) => (
    <li key={p.id}>
      <a href={'#' + p.url} className="fila-variante fila-curso" data-testid={`paso-${p.id}`} data-estado={p.hecho ? 'hecha' : 'pendiente'}>
        <span className="nombre">
          {n !== undefined && <span className="numero-variante">{n}. </span>}
          <Texto t={p.nombre} />
        </span>
        <span className={p.hecho ? 'aprendida' : 'apagado'}>{estado(p)}</span>
      </a>
    </li>
  )
  return (
    <div className="pagina-apertura pagina-curso" data-testid="pagina-curso">
      <a className="volver" href={c.color === 'b' ? '#/cursos/negras' : '#/cursos'}>
        <IconoAtras /> Aperturas y defensas
      </a>
      <div className="pagina-apertura-tablero">
        {/* con coordenadas, como los tableros de leer: todo tablero del curso las lleva (punto 1 del feedback; 2026-10-30) */}
        <TableroMini fen={fenDe(['e4', 'c6'])} orientacion={c.color === 'w' ? 'white' : 'black'} etiqueta={c.nombre} coordenadas />
      </div>
      <div>
        <h1>{c.nombre}</h1>
        <p className="apagado" data-testid="avance">
          {avanceVariantes(c, a)}
        </p>
      </div>
      <div className="empezar">
        <button type="button" className="boton primario grande" onClick={() => navegar(sigue ? sigue.url : url(c, '/leer/repaso'))} data-testid="empezar-curso">
          {!alguno ? (
            'Empezar'
          ) : sigue ? (
            // en un solo elemento: .boton es inline-flex y cada trozo (las letras, la figura ♘) sería una columna aparte (Nota 1).
            // Dos renglones: "Seguir", grande, y abajo dónde retomo, chico y en uno solo (2026-10-29)
            <span className="boton-seguir">
              <span>Seguir</span>
              <span className="boton-seguir-nombre" data-testid="seguir-nombre">
                <Texto t={sigue.nombre} />
              </span>
            </span>
          ) : (
            'Repasar el curso'
          )}
        </button>
      </div>
      <ol className="lista-variantes lista-curso" data-testid="piezas-curso">
        {fila(pasos[0]!)}
        {fila(pasos[1]!)}
        <li className="titulo-grupo">
          <h2>Las variantes</h2>
        </li>
        {pasos.slice(2, 2 + c.variantes.length).map((p, i) => fila(p, i + 1))}
        <li className="titulo-grupo" aria-hidden="true" />
        {fila(pasos[pasos.length - 2]!)}
        {fila(pasos[pasos.length - 1]!)}
      </ol>
      <details className="detalles">
        <summary>Palabras del curso</summary>
        <dl data-testid="glosario">
          {c.glosario.map((g) => (
            <div key={g.termino}>
              <dt>{g.termino}</dt>
              <dd>{g.definicion}</dd>
            </div>
          ))}
        </dl>
      </details>
    </div>
  )
}

/** Un tablero de las piezas de leer: la posición clave, o solo los peones, con sus marcas y sus coordenadas (C1). */
function TableroDeLeer({ t, orientacion }: { t: TableroLeer; orientacion: 'white' | 'black' }) {
  const fen = t.soloPeones ? soloPeones(t.fen ?? fenDe(t.jugadas)) : (t.fen ?? fenDe(t.jugadas))
  // C5: con las marcas nuevas, el tablero de la página queda limpio; las marcas van con su frase, en el paso a paso
  const sh = marcasNuevas() ? [] : formas(t.marcas).map((f) => ({ orig: f.orig as Key, dest: f.dest as Key | undefined, brush: f.brush }))
  return <TableroMini fen={fen} orientacion={orientacion} flechas={sh} testid="tablero-leer" coordenadas />
}

/** Una pieza de leer (La idea, La estructura, Repaso): sus páginas, una por vista, con Atrás y Siguiente. */
export function PiezaDeLeer({ id, pieza }: { id: string; pieza: PiezaLeerId }) {
  const c = cursoNuevo(id)!
  const p = c.piezas[pieza]
  const [i, setI] = useState(0)
  const a = useAvance(c.id)
  const pag: PaginaLeer = p.paginas[i]!
  const ultima = i === p.paginas.length - 1
  const sigue = siguientePaso(c, { ...a, piezas: { ...a.piezas, [pieza]: a.piezas[pieza] ?? 1 } })
  const terminar = () => {
    marcarPieza(c.id, pieza)
    navegar(sigue ? sigue.url : url(c, ''))
  }
  return (
    <div className="pagina-variante pieza-leer" data-testid={`pieza-${pieza}`}>
      <a className="volver" href={'#' + url(c, '')}>
        <IconoAtras /> {c.nombre}
      </a>
      <h1>{p.titulo}</h1>
      {pag.subtitulo && <h2 className="subtitulo-pieza">{pag.subtitulo}</h2>}
      {pag.tablero && (
        <div className="pagina-apertura-tablero">
          <TableroDeLeer t={pag.tablero} orientacion={c.color === 'w' ? 'white' : 'black'} />
        </div>
      )}
      {pag.linea && (
        <p className="linea-jugadas" data-testid="linea-repaso">
          <Texto t={lineaHasta(pag.linea, pag.linea.length)} />
        </p>
      )}
      {/* correcciones, C3: el texto se queda, y además se puede ver paso a paso en el tablero */}
      {pag.pasoAPaso && <BotonPasoAPaso key={i} titulo={pag.subtitulo ?? p.titulo} pa={pag.pasoAPaso} orientacion={c.color === 'w' ? 'white' : 'black'} clase="ver-paso-a-paso" />}
      <div className="texto-pieza" data-testid="texto-pieza">
        {pag.texto.map((t, k) => (
          <p key={k}><Texto t={t} /></p>
        ))}
      </div>
      <div className="pasos-pieza">
        {p.paginas.length > 1 && (
          <span className="apagado" data-testid="pagina-n-de-m">
            {i + 1} de {p.paginas.length}
          </span>
        )}
        <div className="botones-pieza">
          {i > 0 && (
            <button type="button" className="boton secundario" onClick={() => setI(i - 1)} data-testid="pagina-atras">
              Atrás
            </button>
          )}
          <button type="button" className="boton primario" onClick={() => (ultima ? terminar() : setI(i + 1))} data-testid={ultima ? 'pieza-listo' : 'pagina-siguiente'}>
            {ultima ? (
              sigue ? (
                <span>
                  Listo · Sigue: <Texto t={sigue.nombre} />
                </span>
              ) : (
                'Listo'
              )
            ) : (
              'Siguiente'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/** Errores y trampas: los "¿Y si…?", primero los tuyos y luego los del rival. Cada uno se juega (castigas tú). */
export function ErroresDelCurso({ id }: { id: string }) {
  const c = cursoNuevo(id)!
  const a = useAvance(c.id)
  const errores = lineasDe(c).filter((l) => l.tipo === 'error')
  return (
    <div className="pagina-apertura pieza-errores" data-testid="pieza-errores">
      <a className="volver" href={'#' + url(c, '')}>
        <IconoAtras /> {c.nombre}
      </a>
      <h1>{c.piezas.errores.titulo}</h1>
      <p className="plan-corto"><Texto t={c.piezas.errores.intro} /></p>
      <ol className="lista-variantes">
        {errores.map((l) => (
          <li key={l.id}>
            <a href={'#' + url(c, `/linea/${encodeURIComponent(l.id)}`)} className="fila-variante" data-testid={`error-${l.error!.id}`}>
              <span className="nombre"><Texto t={l.nombre} /></span>
              <span className={a.errores[l.error!.id] ? 'aprendida' : 'apagado'}>{a.errores[l.error!.id] ? 'Hecho' : l.error!.de === 'tuyo' ? 'Error tuyo' : 'Del rival'}</span>
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
