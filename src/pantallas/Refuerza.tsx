import { useMemo, useState } from 'react'
import type { DrawShape } from 'chessground/draw'
import type { Key } from 'chessground/types'
import { repertorioCompleto, useRepertorioFavoritas } from '../aprender/favoritas.ts'
import type { Repertorio } from '../repertorio/modelo.ts'
import { leerRegistro } from '../registro/almacen-registro.ts'
import { jugadasParaRefuerza, ordenRefuerza, textoConteo, nombreDeJugada, lineaCompleta, type JugadaARepasar } from '../registro/refuerza.ts'
import { aperturaPorId } from '../base/base.ts'

const nombreAp = (id: string) => aperturaPorId(id)?.nombre ?? id
import { registrarPasoRefuerza } from '../registro/eventos.ts'
import { intentar, pista, respuesta, marcarPista, marcarRespuesta, type EstadoLeccion, type Leccion } from '../cursos/modelo.ts'
import { siguientesEnRepertorio } from '../repertorio/modelo.ts'
import { jugadaNumerada, sanAEspanol } from '../ajedrez/notacion.ts'
import { uciAObjeto } from '../ajedrez/reglas.ts'
import { TableroJugable } from '../componentes/TableroJugable.tsx'
import { ListaJugadas } from '../componentes/ListaJugadas.tsx'
import { jugadasEnEspanol } from '../ajedrez/reglas.ts'
import { IconoAtras, IconoFoco, IconoOjo } from '../componentes/Iconos.tsx'
import { Chess } from 'chess.js'

const POR_RONDA = 10

/** "Refuerza lo que fallas" (nota 1): primero lo que más fallo, después lo que llevo más tiempo sin practicar. */
export function Refuerza() {
  const rep = useRepertorioFavoritas()
  const [ronda, setRonda] = useState<JugadaARepasar[] | null>(null)
  const [vuelta, setVuelta] = useState(0)
  const orden = useMemo(() => ordenRefuerza(jugadasParaRefuerza(rep, repertorioCompleto(), leerRegistro())), [rep, vuelta, ronda]) // eslint-disable-line react-hooks/exhaustive-deps
  if (ronda) return <Ronda jugadas={ronda} rep={repertorioCompleto()} onTerminar={() => (setRonda(null), setVuelta(vuelta + 1))} />
  const falladas = orden.filter((j) => j.fallos > 0).length
  const nunca = orden.filter((j) => j.intentos === 0).length
  // sin nada practicado ni favoritas, no hay qué reforzar: se dice y se lleva a Aprender
  if (orden.length === 0)
    return (
      <div className="refuerza vacio" data-testid="refuerza-vacia">
        <h1>Refuerza lo que fallas</h1>
        <p className="apagado">Todavía no hay jugadas para reforzar.</p>
        <a className="boton primario" href="#/cursos">
          Ir a Aprender
        </a>
      </div>
    )
  return (
    <div className="refuerza">
      <h1>Refuerza lo que fallas</h1>
      <p className="apagado">
        {falladas > 0 ? `${falladas} ${falladas === 1 ? 'jugada que has fallado' : 'jugadas que has fallado'}` : 'Aún no has fallado jugadas'} · {nunca} sin practicar todavía
      </p>
      <button type="button" className="boton primario grande" onClick={() => setRonda(orden.slice(0, POR_RONDA))} data-testid="empezar-refuerza">
        Empezar ({Math.min(POR_RONDA, orden.length)} jugadas)
      </button>
      <ol className="lista-refuerza" data-testid="lista-refuerza">
        {orden.slice(0, POR_RONDA).map((j) => (
          <li key={j.fen + j.esperada} data-testid="jugada-refuerza">
            <span className="nombre">{nombreDeJugada(j, nombreAp)}</span>
            <span className="apagado">
              {posicionCorta(j)} · <span className={j.fallos > 0 ? 'conteo-fallo' : ''}>{textoConteo(j)}</span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  )
}

function posicionCorta(j: JugadaARepasar): string {
  const ultima = j.camino.length > 0 ? jugadaNumerada(sanAEspanol(j.camino[j.camino.length - 1]!), j.camino.length - 1) : 'inicio'
  return j.camino.length > 0 ? `después de ${ultima}` : 'tu primera jugada'
}

function Ronda({ jugadas, rep, onTerminar }: { jugadas: JugadaARepasar[]; rep: Repertorio; onTerminar: () => void }) {
  const [i, setI] = useState(0)
  const actual = jugadas[i]
  const leccion: Leccion | null = actual
    ? { id: 'refuerza', cursoId: 'refuerza', nombre: actual.linea.nombre, familia: actual.linea.familia, plan: actual.linea.plan, autorPlan: actual.linea.autorPlan, frecuencia: actual.linea.frecuencia, color: actual.linea.color, jugadas: lineaCompleta(actual) }
    : null
  const [estado, setEstado] = useState<EstadoLeccion>(() => ({ fase: 'preguntar', ply: actual?.camino.length ?? 0, paso: { fallos: 0, pista: false, respuesta: false }, ultimo: null }))
  const [aviso, setAviso] = useState<{ tipo: string; texto: string } | null>(null)
  const [flecha, setFlecha] = useState<DrawShape | null>(null)
  if (!actual || !leccion) {
    return (
      <div className="refuerza">
        <h1>Listo por ahora</h1>
        <p className="apagado">Repasaste {jugadas.length} jugadas. Lo que fallaste vuelve primero la próxima vez.</p>
        <button type="button" className="boton primario grande" onClick={onTerminar} data-testid="otra-ronda">
          Volver a Refuerza
        </button>
      </div>
    )
  }
  const chess = new Chess()
  for (const s of actual.camino) chess.move(s)
  const color = actual.linea.color
  const alJugar = (uci: string) => {
    let san: string
    try {
      san = new Chess(chess.fen()).move(uciAObjeto(uci)).san
    } catch {
      return
    }
    const alternativas = siguientesEnRepertorio(rep, color, actual.camino).map((o) => o.san)
    const r = intentar(leccion, estado, san, alternativas)
    if (r.resultado === 'incorrecta') {
      setEstado(r.estado)
      setAviso({ tipo: 'incorrecta', texto: `Incorrecta: ${jugadaNumerada(sanAEspanol(san), actual.camino.length)} no es la de tu línea. Intenta otra vez.` })
      return
    }
    registrarPasoRefuerza({ fen: chess.fen(), esperada: actual.esperada, paso: r.pasoTerminado ?? estado.paso, linea: actual.linea.nombre, camino: actual.camino })
    setAviso(null)
    setFlecha(null)
    setI(i + 1)
    setEstado({ fase: 'preguntar', ply: jugadas[i + 1]?.camino.length ?? 0, paso: { fallos: 0, pista: false, respuesta: false }, ultimo: null })
  }
  return (
    <div className="leccion" data-testid="ronda-refuerza">
      <div className="leccion-columna">
        <div className="partida-arriba">
          <button type="button" className="salir" onClick={onTerminar} aria-label="Salir de Refuerza">
            <IconoAtras />
          </button>
          <div className="leccion-titulo">
            <span className="apagado">
              Refuerza · {i + 1} de {jugadas.length}
            </span>
            <strong data-testid="nombre-linea">{nombreDeJugada(actual, nombreAp)}</strong>
          </div>
        </div>
        <div className="partida-tablero">
          <TableroJugable key={i} chess={chess} orientacion={color === 'w' ? 'white' : 'black'} puedeMover={color === 'w' ? 'white' : 'black'} onJugada={alJugar} flechas={flecha ? [flecha] : []} />
        </div>
      </div>
      <aside className="partida-panel leccion-panel">
        <p className="leccion-instruccion">
          <strong>¿Qué harías?</strong>
        </p>
        <p className="apagado">
          {textoConteo(actual)} · {actual.familias.size > 1 ? `está en ${actual.familias.size} variantes, como ${actual.linea.nombre}` : actual.linea.nombre}
        </p>
        <ListaJugadas sanes={jugadasEnEspanol(chess)} />
        {aviso && (
          <p className={`aviso-leccion ${aviso.tipo}`} role="status" data-testid="aviso-leccion" data-resultado={aviso.tipo}>
            {aviso.texto}
          </p>
        )}
        <div className="botones-ayuda">
          <button type="button" className="boton-icono" data-testid="pista" onClick={() => (setEstado(marcarPista(estado)), setAviso({ tipo: 'pista', texto: pista(leccion, estado) }))}>
            <IconoFoco />
            <span>Pista</span>
          </button>
          <button
            type="button"
            className="boton-icono"
            data-testid="respuesta"
            onClick={() => {
              const r = respuesta(leccion, estado)
              if (!r) return
              setEstado(marcarRespuesta(estado))
              setFlecha({ orig: r.desde as Key, dest: r.hasta as Key, brush: 'blue' })
              setAviso({ tipo: 'respuesta', texto: `${r.texto} — ${r.nombre}` })
            }}
          >
            <IconoOjo />
            <span>Respuesta</span>
          </button>
        </div>
      </aside>
    </div>
  )
}
