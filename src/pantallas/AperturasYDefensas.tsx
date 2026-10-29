import { Chess } from 'chess.js'
import { Texto } from '../componentes/Notacion.tsx'
import { cursos, cursoPorId } from '../cursos/datos.ts'
import type { Curso } from '../cursos/modelo.ts'
import { planDeMiLado, siguienteLeccion } from '../cursos/modelo.ts'
import { alternarFavorita, useFavoritas } from '../aprender/favoritas.ts'
import { FAVORITAS_PRENDIDAS } from '../aprender/interruptores.ts'
import { leerProgreso } from '../repertorio/estado.ts'
import { aperturaPorId, variantePorClave } from '../base/base.ts'
import { lineaEnEspanol } from '../ajedrez/notacion.ts'
import { TableroMini } from '../componentes/TableroMini.tsx'
import { IconoAdelante, IconoAtras, IconoCorazon, IconoFinal, IconoInicio } from '../componentes/Iconos.tsx'
import { guardar, leer } from '../estado/almacen.ts'
import { navegar } from '../ruta.ts'
import { useEffect, useState } from 'react'
import { cursoNuevo } from '../curso/datos.ts'
import { leerAvance } from '../curso/avance.ts'

/**
 * Nota 1 (L3): "Aperturas y defensas", la sección Aprender. Arriba, "Con blancas" y "Con negras"; cada apertura mía en
 * una tarjeta con su tablero, su nombre y mi avance. Al tocarla, su página; al tocar una variante, su línea.
 * Con las favoritas prendidas (`aprender/interruptores.ts`), arriba van "Mis favoritas" y "Todas", y cada tarjeta
 * lleva su corazón.
 */
export type Pestana = 'blancas' | 'negras' | 'favoritas' | 'todas'

/** La pestaña de una ruta de Aprender ("/cursos", "/cursos/negras", "/cursos/todas"). */
export function pestanaDe(segunda: string | undefined): Pestana {
  if (FAVORITAS_PRENDIDAS) return segunda === 'todas' ? 'todas' : 'favoritas'
  return segunda === 'negras' ? 'negras' : 'blancas'
}

const fenDe = (jugadas: string[] = []) => {
  const c = new Chess()
  for (const s of jugadas) c.move(s)
  return c.fen()
}
const ultimaDe = (jugadas: string[]): [string, string] | undefined => {
  if (jugadas.length === 0) return undefined
  const c = new Chess()
  for (const s of jugadas.slice(0, -1)) c.move(s)
  const m = c.move(jugadas[jugadas.length - 1]!)
  return [m.from, m.to]
}
const orientacion = (c: Curso) => (c.color === 'w' ? 'white' : 'black')
const aprendidas = (c: Curso, hechas: Record<string, unknown>) => c.lecciones.filter((l) => hechas[l.id]).length
const avance = (c: Curso, hechas: Record<string, unknown>) => {
  // C6: el curso piloto lleva su propio avance (variantes terminadas en sus dos vueltas)
  const n = cursoNuevo(c.id)
  if (n) return `${n.variantes.filter((v) => leerAvance(n.id).variantes[v.id]?.terminada).length} de ${n.variantes.length} variantes`
  return `${aprendidas(c, hechas)} de ${c.lecciones.length} ${c.lecciones.length === 1 ? 'variante aprendida' : 'variantes aprendidas'}`
}
const enlaceCurso = (id: string) => `#/curso/${encodeURIComponent(id)}`

function Corazon({ id, favorita }: { id: string; favorita: boolean }) {
  return (
    <button
      type="button"
      className={`corazon ${favorita ? 'lleno' : ''}`}
      aria-pressed={favorita}
      aria-label={favorita ? 'Quitar de mis favoritas' : 'Guardar en mis favoritas'}
      onClick={() => alternarFavorita(id)}
      data-testid={`corazon-${id}`}
    >
      <IconoCorazon lleno={favorita} />
    </button>
  )
}

function Tarjeta({ curso, favorita, hechas }: { curso: Curso; favorita: boolean; hechas: Record<string, unknown> }) {
  return (
    <li className={`tarjeta-apertura ${FAVORITAS_PRENDIDAS ? 'con-corazon' : ''}`} data-testid={`tarjeta-${curso.id}`}>
      <a href={enlaceCurso(curso.id)} className="tarjeta-apertura-enlace">
        <strong>{curso.nombre}</strong>
        <TableroMini fen={fenDe(curso.raiz)} orientacion={orientacion(curso)} etiqueta={curso.nombre} />
        <span className="apagado">{avance(curso, hechas)}</span>
      </a>
      {FAVORITAS_PRENDIDAS && <Corazon id={curso.id} favorita={favorita} />}
    </li>
  )
}

function Grupos({ lista, favoritas, hechas }: { lista: Curso[]; favoritas: string[]; hechas: Record<string, unknown> }) {
  return (
    <>
      {(
        [
          ['w', 'Para jugar con blancas'],
          ['b', 'Para jugar con negras'],
        ] as const
      ).map(([color, titulo]) => {
        const del = lista.filter((c) => c.color === color)
        if (del.length === 0) return null
        return (
          <section key={color} aria-label={titulo} className="grupo-aperturas">
            <h2>{titulo}</h2>
            <ul className="cuadricula-aperturas">
              {del.map((c) => (
                <Tarjeta key={c.id} curso={c} favorita={favoritas.includes(c.id)} hechas={hechas} />
              ))}
            </ul>
          </section>
        )
      })}
    </>
  )
}

export function AperturasYDefensas({ pestana }: { pestana: Pestana }) {
  useEffect(() => {
    guardar('pestana-aprender', pestana)
  }, [pestana])
  return pestana === 'blancas' || pestana === 'negras' ? <PorColor color={pestana === 'blancas' ? 'w' : 'b'} /> : <ConFavoritas pestana={pestana} />
}

/** Mis aperturas de un color: "Con blancas" o "Con negras". */
function PorColor({ color }: { color: 'w' | 'b' }) {
  const hechas = leerProgreso()
  return (
    <div className="aprender">
      <h1>Aperturas y defensas</h1>
      <div className="pestanas" role="tablist" aria-label="Aperturas y defensas">
        <a role="tab" aria-selected={color === 'w'} className={color === 'w' ? 'activo' : ''} href="#/cursos" data-testid="pestana-blancas">
          Con blancas
        </a>
        <a role="tab" aria-selected={color === 'b'} className={color === 'b' ? 'activo' : ''} href="#/cursos/negras" data-testid="pestana-negras">
          Con negras
        </a>
      </div>
      <ul className="cuadricula-aperturas" data-testid="lista-aperturas">
        {cursos()
          .filter((c) => c.color === color)
          .map((c) => (
            <Tarjeta key={c.id} curso={c} favorita={false} hechas={hechas} />
          ))}
      </ul>
    </div>
  )
}

/** Con las favoritas prendidas: "Mis favoritas" y "Todas", agrupadas por color. */
function ConFavoritas({ pestana }: { pestana: 'favoritas' | 'todas' }) {
  const favoritas = useFavoritas()
  const hechas = leerProgreso()
  const mias = cursos().filter((c) => favoritas.includes(c.id))
  return (
    <div className="aprender">
      <h1>Aperturas y defensas</h1>
      <div className="pestanas" role="tablist" aria-label="Aperturas y defensas">
        <a role="tab" aria-selected={pestana === 'favoritas'} className={pestana === 'favoritas' ? 'activo' : ''} href="#/cursos" data-testid="pestana-favoritas">
          Mis favoritas
        </a>
        <a role="tab" aria-selected={pestana === 'todas'} className={pestana === 'todas' ? 'activo' : ''} href="#/cursos/todas" data-testid="pestana-todas">
          Todas
        </a>
      </div>
      {pestana === 'favoritas' && mias.length === 0 ? (
        <div className="favoritas-vacia" data-testid="favoritas-vacia">
          <p>Toca el ♡ en Todas para guardar las que quieres aprender.</p>
          <a className="boton primario" href="#/cursos/todas" data-testid="ir-a-todas">
            Ver todas
          </a>
        </div>
      ) : (
        <Grupos lista={pestana === 'favoritas' ? mias : cursos()} favoritas={favoritas} hechas={hechas} />
      )}
    </div>
  )
}

/** A dónde regresa "Volver": a la pestaña de donde vine (sin favoritas, a la del color de la apertura). */
const volverASeccion = (c: Curso) => {
  if (!FAVORITAS_PRENDIDAS) return c.color === 'b' ? '#/cursos/negras' : '#/cursos'
  return leer<string>('pestana-aprender', 'favoritas') === 'todas' ? '#/cursos/todas' : '#/cursos'
}

/** La página de una apertura: el tablero, sus variantes de la más común a la más rara, y empezar a aprenderla. */
export function PaginaApertura({ id }: { id: string }) {
  const favoritas = useFavoritas()
  const curso = cursoPorId(id)
  const hechas = leerProgreso()
  if (!curso) return <NoEncontre />
  const a = aperturaPorId(curso.apertura)
  const siguiente = siguienteLeccion(curso, hechas)
  // L5: la idea general de la apertura, en una frase y solo de mi lado (la de la Caro-Kann es de negras: no va en "Contra la Caro-Kann")
  const deMiLado = a && (a.lado === 'ambos' || (a.lado === 'blancas') === (curso.color === 'w'))
  const idea = deMiLado ? (planDeMiLado(a.idea, curso.color).split(/(?<=\.)\s+/)[0] ?? '') : ''
  const empezar = () => navegar(`/leccion/${encodeURIComponent(curso.id)}/${curso.lecciones.indexOf(siguiente ?? curso.lecciones[0]!)}`)
  return (
    <div className="pagina-apertura">
      <a className="volver" href={volverASeccion(curso)}>
        <IconoAtras /> Aperturas y defensas
      </a>
      <div className="pagina-apertura-tablero">
        <TableroMini fen={fenDe(curso.raiz)} orientacion={orientacion(curso)} ultima={ultimaDe(curso.raiz ?? [])} etiqueta={curso.nombre} />
      </div>
      <div className="titulo-con-corazon">
        <div>
          <h1>{curso.nombre}</h1>
          <p className="apagado" data-testid="avance">
            {avance(curso, hechas)}
          </p>
        </div>
        {FAVORITAS_PRENDIDAS && <Corazon id={curso.id} favorita={favoritas.includes(curso.id)} />}
      </div>
      {idea && (
        <p className="plan-corto" data-testid="idea">
          <Texto t={idea} />
        </p>
      )}
      <div className="empezar">
        <button type="button" className="boton primario grande" onClick={empezar} data-testid="empezar-leccion">
          {aprendidas(curso, hechas) > 0 ? 'Seguir aprendiendo' : 'Empezar a aprender'}
        </button>
        {siguiente && aprendidas(curso, hechas) > 0 && <p className="apagado">Sigue: <Texto t={siguiente.nombre} /></p>}
      </div>
      <ol className="lista-variantes">
        {curso.lecciones.map((l, i) => (
          <li key={l.id}>
            <a href={`${enlaceCurso(curso.id)}/${i}`} className="fila-variante" data-testid="variante" data-frecuencia={l.frecuencia}>
              <span className="nombre"><Texto t={l.nombre} /></span>
              <span className={hechas[l.id] ? 'aprendida' : 'apagado'}>{hechas[l.id] ? 'Aprendida' : 'Por aprender'}</span>
            </a>
          </li>
        ))}
      </ol>
      {a && (
        <details className="detalles">
          <summary>Detalles</summary>
          <dl>
            <dt>En inglés</dt>
            <dd>{a.nombreIngles}</dd>
            <dt>Código ECO</dt>
            <dd>{a.eco}</dd>
            <dt>Fuente</dt>
            <dd>Lista abierta de aperturas de lichess (CC0)</dd>
          </dl>
        </details>
      )}
    </div>
  )
}

/** Una variante: su línea en el tablero, para avanzar y regresar jugada por jugada; su plan corto y Practicar. */
export function PaginaVariante({ id, indice }: { id: string; indice: number }) {
  const curso = cursoPorId(id)
  const l = curso?.lecciones[indice]
  const [ply, setPly] = useState(l?.jugadas.length ?? 0)
  if (!curso || !l) return <NoEncontre />
  const v = variantePorClave(l.id.slice(l.id.indexOf('/') + 3))
  const jugadas = l.jugadas.slice(0, ply)
  const plan = planDeMiLado(l.plan, l.color)
    .split(/(?<=\.)\s+/)
    .slice(0, 2)
    .join(' ')
  return (
    <div className="pagina-variante">
      <a className="volver" href={enlaceCurso(curso.id)}>
        <IconoAtras /> {curso.nombre}
      </a>
      <h1><Texto t={l.nombre} /></h1>
      <div className="pagina-apertura-tablero">
        <TableroMini testid="tablero" fen={fenDe(jugadas)} orientacion={orientacion(curso)} ultima={ultimaDe(jugadas)} etiqueta={l.nombre} />
      </div>
      <div className="pasos" role="group" aria-label="Recorrer la línea">
        <button type="button" className="boton secundario" onClick={() => setPly(0)} disabled={ply === 0} aria-label="Al inicio" data-testid="al-inicio">
          <IconoInicio />
        </button>
        <button type="button" className="boton secundario" onClick={() => setPly(Math.max(0, ply - 1))} disabled={ply === 0} aria-label="Regresar una jugada" data-testid="regresar">
          <IconoAtras />
        </button>
        <button type="button" className="boton secundario" onClick={() => setPly(Math.min(l.jugadas.length, ply + 1))} disabled={ply === l.jugadas.length} aria-label="Avanzar una jugada" data-testid="avanzar">
          <IconoAdelante />
        </button>
        <button type="button" className="boton secundario" onClick={() => setPly(l.jugadas.length)} disabled={ply === l.jugadas.length} aria-label="Al final" data-testid="al-final">
          <IconoFinal />
        </button>
      </div>
      <p className="linea-jugadas" data-testid="linea">
        {lineaEnEspanol(l.jugadas)
          .split(' ')
          .map((t, i) => {
            // cada palabra es una media jugada ("1.e4" lleva su número pegado); la del tablero, resaltada
            const actual = i + 1 === ply
            return (
              <span key={i}>
                <span className={actual ? 'actual' : undefined}><Texto t={t} /></span>{' '}
              </span>
            )
          })}
      </p>
      {plan && <p className="plan-corto"><Texto t={plan} /></p>}
      <button type="button" className="boton primario grande" onClick={() => navegar(`/leccion/${encodeURIComponent(curso.id)}/${indice}`)} data-testid="practicar">
        Practicar
      </button>
      {v && (
        <details className="detalles">
          <summary>Detalles</summary>
          <dl>
            <dt>En inglés</dt>
            <dd>{v.nombreIngles}</dd>
            <dt>Código ECO</dt>
            <dd>{v.eco}</dd>
            <dt>Fuente</dt>
            <dd>
              {v.fuente.repo}: {v.fuente.name}
            </dd>
          </dl>
        </details>
      )}
    </div>
  )
}

function NoEncontre() {
  return (
    <p className="vacio">
      No encontré esa apertura. <a href={FAVORITAS_PRENDIDAS ? '#/cursos/todas' : '#/cursos'}>Ver mis aperturas</a>
    </p>
  )
}
