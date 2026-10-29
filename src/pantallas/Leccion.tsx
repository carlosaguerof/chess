import { useEffect, useMemo, useState } from 'react'
import { mostrarTexto } from '../ajedrez/mostrar.ts'
import type { DrawShape } from 'chessground/draw'
import type { Key } from 'chessground/types'
import { leerProgreso, marcarLeccion } from '../repertorio/estado.ts'
import { cursoPorId } from '../cursos/datos.ts'
import { alternativasEn, intentar, marcarPista, marcarRespuesta, nuevoEstado, estadoDeRepaso, planDeMiLado, pista, posicion, respuesta, siguienteLeccion, type Curso, type Leccion as TLeccion, type EstadoLeccion } from '../cursos/modelo.ts'
import { COMO_FUNCIONA_REPASO, Info } from '../componentes/ComoFunciona.tsx'
import { registrarPasoCurso } from '../registro/eventos.ts'
import { jugadaNumerada, sanAEspanol } from '../ajedrez/notacion.ts'
import { jugadasEnEspanol, uciAObjeto } from '../ajedrez/reglas.ts'
import { TableroJugable } from '../componentes/TableroJugable.tsx'
import { ListaJugadas } from '../componentes/ListaJugadas.tsx'
import { IconoAtras, IconoFoco, IconoOjo } from '../componentes/Iconos.tsx'
import { navegar } from '../ruta.ts'
import { siguienteEnSesion, actualizarFalladas, leerFalladas, guardarFalladas } from '../cursos/sesion.ts'

const PAUSA_RIVAL_MS = 450

type Aviso = { tipo: 'correcta' | 'incorrecta' | 'alternativa' | 'pista' | 'respuesta' | 'info'; texto: string } | null

export function Leccion({ cursoId, indice }: { cursoId: string; indice: number }) {
  const curso = cursoPorId(cursoId)
  const leccion = curso?.lecciones[indice]
  if (!curso || !leccion) return <p className="vacio">No encontré esa lección. <a href="#/cursos">Ver los cursos</a></p>
  return <Practica key={leccion.id} curso={curso} leccion={leccion} indice={indice} />
}

/** R7: la lección como repaso (solo preguntas). Al terminar dice si fue limpia y quien la usa decide qué sigue. */
export interface ModoRepaso {
  indice: number
  total: number
  /** limpia = sin fallos, sin Pista y sin Respuesta; devuelve el texto de cuándo vuelve */
  onTerminar: (limpia: boolean) => string
  onSiguiente: () => void
}

export function Practica({ curso, leccion, indice, repaso }: { curso: Curso; leccion: TLeccion; indice: number; repaso?: ModoRepaso }) {
  const [estado, setEstado] = useState<EstadoLeccion>(() => (repaso ? estadoDeRepaso(leccion) : nuevoEstado(leccion)))
  const [ayudaUsada, setAyudaUsada] = useState(false)
  const [vuelve, setVuelve] = useState<string | null>(null)
  const [enTablero, setEnTablero] = useState(0)
  const [aviso, setAviso] = useState<Aviso>(null)
  const [flecha, setFlecha] = useState<DrawShape | null>(null)
  const [fasePrevia, setFasePrevia] = useState(estado.fase)
  // T18: cuántos pasos fallé en las preguntas de esta lección (la que fallo vuelve antes en la sesión)
  const [fallosLeccion, setFallosLeccion] = useState(0)
  const color = leccion.color

  // cuando cambia de fase (de enseñar a preguntar), el tablero vuelve al inicio
  useEffect(() => {
    if (estado.fase !== fasePrevia) {
      setFasePrevia(estado.fase)
      if (estado.fase === 'preguntar') {
        setEnTablero(0)
        setAviso({ tipo: 'info', texto: 'Ya la viste. Ahora sin ayuda: ¿qué harías en cada paso?' })
      }
      if (estado.fase === 'terminada') {
        if (repaso) setVuelve(repaso.onTerminar(fallosLeccion === 0 && !ayudaUsada))
        else {
          guardarFalladas(actualizarFalladas(leerFalladas(), leccion.id, fallosLeccion))
          marcarLeccion(leccion.id)
        }
        setEnTablero(leccion.jugadas.length)
      }
    }
  }, [estado.fase, fasePrevia, leccion])

  // las jugadas del rival se ven una por una
  useEffect(() => {
    const meta = estado.fase === 'terminada' ? leccion.jugadas.length : estado.ply
    if (enTablero >= meta) return
    const t = setTimeout(() => setEnTablero((n) => n + 1), enTablero === 0 && estado.fase === 'preguntar' ? 900 : PAUSA_RIVAL_MS)
    return () => clearTimeout(t)
  }, [enTablero, estado, leccion])

  const chess = useMemo(() => posicion(leccion, enTablero), [leccion, enTablero])
  const listo = estado.fase !== 'terminada' && enTablero === estado.ply
  const esperada = listo ? leccion.jugadas[estado.ply] : undefined
  const flechaEnsenar: DrawShape | null = useMemo(() => {
    if (!listo || estado.fase !== 'ensenar' || !esperada) return null
    const m = posicion(leccion, estado.ply).move(esperada)
    return { orig: m.from as Key, dest: m.to as Key, brush: 'green' }
  }, [listo, estado, esperada, leccion])

  const alJugar = (uci: string) => {
    if (!listo) return
    let san: string
    try {
      san = posicion(leccion, estado.ply).move(uciAObjeto(uci)).san
    } catch {
      return
    }
    const ply = estado.ply
    const r = intentar(leccion, estado, san, alternativasEn(curso, leccion, ply))
    setFlecha(null)
    if (r.resultado === 'incorrecta') {
      if (estado.fase === 'preguntar') setFallosLeccion((n) => n + 1)
      setAviso({ tipo: 'incorrecta', texto: `Incorrecta: ${jugadaNumerada(sanAEspanol(san), ply)} no es la jugada de tu línea. Intenta otra vez.` })
      setEstado(r.estado)
      return
    }
    if (estado.fase === 'preguntar' && r.pasoTerminado) {
      registrarPasoCurso({ fen: posicion(leccion, ply).fen(), esperada: leccion.jugadas[ply]!, paso: r.pasoTerminado, linea: leccion.nombre, camino: leccion.jugadas.slice(0, ply) })
    }
    if (r.resultado === 'alternativa')
      setAviso({ tipo: 'alternativa', texto: `También es buena: ${jugadaNumerada(sanAEspanol(san), ply)} es de otra variante de esta apertura. Esta lección sigue con ${jugadaNumerada(sanAEspanol(leccion.jugadas[ply]!), ply)}.` })
    else setAviso({ tipo: 'correcta', texto: `¡Correcta! ${jugadaNumerada(sanAEspanol(san), ply)}` })
    setEnTablero(ply + 1)
    setEstado(r.estado)
  }

  const pedirPista = () => {
    setAyudaUsada(true)
    setEstado(marcarPista(estado))
    setAviso({ tipo: 'pista', texto: pista(leccion, estado) })
  }
  const pedirRespuesta = () => {
    const r = respuesta(leccion, estado)
    if (!r) return
    setAyudaUsada(true)
    setEstado(marcarRespuesta(estado))
    setFlecha({ orig: r.desde as Key, dest: r.hasta as Key, brush: 'blue' })
    setAviso({ tipo: 'respuesta', texto: `${r.texto} — ${r.nombre}. ${r.plan}` })
  }

  const hechas = leerProgreso()
  const siguiente = estado.fase === 'terminada' ? (siguienteEnSesion(curso, hechas, leccion, leerFalladas()) ?? siguienteLeccion(curso, hechas, leccion.id)) : undefined
  const pasosMios = leccion.jugadas.filter((_, i) => (i % 2 === 0 ? 'w' : 'b') === color).length
  const pasoActual = leccion.jugadas.slice(0, estado.ply).filter((_, i) => (i % 2 === 0 ? 'w' : 'b') === color).length + 1
  const instruccion =
    estado.fase === 'ensenar' ? (
      listo && esperada ? (
        <>
          Juega <strong>{mostrarTexto(jugadaNumerada(sanAEspanol(esperada), estado.ply))}</strong>
        </>
      ) : (
        'Mira la jugada del rival…'
      )
    ) : estado.fase === 'preguntar' ? (
      listo ? (
        <strong>¿Qué harías?</strong>
      ) : (
        'Mira la jugada del rival…'
      )
    ) : null

  return (
    <div className="leccion" data-testid="leccion-pantalla" data-fase={estado.fase}>
      <div className="leccion-columna">
        <div className="partida-arriba">
          <a className="salir" href={repaso ? '#/' : `#/curso/${encodeURIComponent(curso.id)}`} aria-label={repaso ? 'Salir del repaso' : 'Volver al curso'}>
            <IconoAtras />
          </a>
          <div className="leccion-titulo">
            <span className="apagado">{repaso ? `Repaso de hoy · ${repaso.indice + 1} de ${repaso.total} · ${curso.nombre}` : curso.nombre}</span>
            <strong data-testid="nombre-linea">{mostrarTexto(leccion.nombre)}</strong>
          </div>
          {repaso && (
            <span className="info-arriba">
              <Info explicacion={COMO_FUNCIONA_REPASO} />
            </span>
          )}
        </div>
        <div className="partida-tablero">
          <TableroJugable
            chess={chess}
            orientacion={color === 'w' ? 'white' : 'black'}
            puedeMover={listo ? (color === 'w' ? 'white' : 'black') : undefined}
            onJugada={alJugar}
            flechas={[...(flechaEnsenar ? [flechaEnsenar] : []), ...(flecha ? [flecha] : [])]}
          />
        </div>
      </div>
      <aside className="partida-panel leccion-panel">
        {estado.fase !== 'terminada' ? (
          <>
            <div className="leccion-fase" data-testid="fase">
              <span className={`chip ${estado.fase === 'ensenar' ? 'chip-rep' : 'chip-base'}`}>{estado.fase === 'ensenar' ? 'Te la enseño' : 'Ahora tú'}</span>
              <span className="apagado">
                Paso {Math.min(pasoActual, pasosMios)} de {pasosMios}
              </span>
            </div>
            <p className="leccion-instruccion" data-testid="instruccion">
              {instruccion}
            </p>
            {estado.fase === 'ensenar' && estado.ply === leccion.jugadas.findIndex((_, i) => (i % 2 === 0 ? 'w' : 'b') === color) && leccion.plan && (
              <p className="plan-leccion">{mostrarTexto(planDeMiLado(leccion.plan, color))}</p>
            )}
            {aviso && (
              <p className={`aviso-leccion ${aviso.tipo}`} role="status" data-testid="aviso-leccion" data-resultado={aviso.tipo}>
                {mostrarTexto(aviso.texto)}
              </p>
            )}
            <div className="botones-ayuda">
              <button type="button" className="boton-icono" onClick={pedirPista} disabled={!listo} data-testid="pista">
                <IconoFoco />
                <span>Pista</span>
              </button>
              <button type="button" className="boton-icono" onClick={pedirRespuesta} disabled={!listo} data-testid="respuesta">
                <IconoOjo />
                <span>Respuesta</span>
              </button>
            </div>
          </>
        ) : repaso ? (
          <div className="fin-leccion" data-testid="fin-repaso">
            <p className="etiqueta">Línea repasada</p>
            <h2>{mostrarTexto(leccion.nombre)}</h2>
            {vuelve && <p data-testid="cuando-vuelve">{vuelve}</p>}
            <button type="button" className="boton primario grande" onClick={repaso.onSiguiente} data-testid="siguiente-repaso">
              {repaso.indice + 1 < repaso.total ? `Siguiente (quedan ${repaso.total - repaso.indice - 1})` : 'Terminar'}
            </button>
          </div>
        ) : (
          <div className="fin-leccion" data-testid="fin-leccion">
            <p className="etiqueta">Lección terminada</p>
            <h2>{mostrarTexto(leccion.nombre)}</h2>
            {leccion.plan && <p className="plan">{mostrarTexto(planDeMiLado(leccion.plan, color))}</p>}
            {siguiente && siguiente.id !== leccion.id ? (
              <button type="button" className="boton primario grande" onClick={() => navegar(`/leccion/${encodeURIComponent(curso.id)}/${curso.lecciones.indexOf(siguiente)}`)} data-testid="siguiente-leccion">
                Siguiente: {mostrarTexto(siguiente.nombre)}
              </button>
            ) : (
              <a className="boton primario grande" href={`#/curso/${encodeURIComponent(curso.id)}`}>
                Volver al curso
              </a>
            )}
            <button type="button" className="enlace" onClick={() => navegar(`/leccion/${encodeURIComponent(curso.id)}/${indice}?otra=${Date.now()}`)}>
              Repetir esta lección
            </button>
          </div>
        )}
        <ListaJugadas sanes={jugadasEnEspanol(chess)} />
      </aside>
    </div>
  )
}
