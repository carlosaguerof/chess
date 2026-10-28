import { useEffect, useMemo, useState } from 'react'
import type { DrawShape } from 'chessground/draw'
import type { Key } from 'chessground/types'
import { useRepertorio, leerProgreso, marcarLeccion } from '../repertorio/estado.ts'
import { cursos } from '../cursos/datos.ts'
import { alternativasEn, intentar, marcarPista, marcarRespuesta, nuevoEstado, pista, posicion, respuesta, siguienteLeccion, type Curso, type Leccion as TLeccion, type EstadoLeccion } from '../cursos/modelo.ts'
import { registrar, resultadoDelPaso } from '../registro/registro.ts'
import { jugadaNumerada, sanAEspanol } from '../ajedrez/notacion.ts'
import { jugadasEnEspanol, uciAObjeto } from '../ajedrez/reglas.ts'
import { TableroJugable } from '../componentes/TableroJugable.tsx'
import { ListaJugadas } from '../componentes/ListaJugadas.tsx'
import { IconoAtras, IconoFoco, IconoOjo } from '../componentes/Iconos.tsx'
import { navegar } from '../ruta.ts'

const PAUSA_RIVAL_MS = 450

type Aviso = { tipo: 'correcta' | 'incorrecta' | 'alternativa' | 'pista' | 'respuesta' | 'info'; texto: string } | null

export function Leccion({ cursoId, indice }: { cursoId: string; indice: number }) {
  const [rep] = useRepertorio()
  const curso = cursos(rep).find((c) => c.id === cursoId)
  const leccion = curso?.lecciones[indice]
  if (!curso || !leccion) return <p className="vacio">No encontré esa lección. <a href="#/cursos">Ver los cursos</a></p>
  return <Practica key={leccion.id} curso={curso} leccion={leccion} indice={indice} />
}

function Practica({ curso, leccion, indice }: { curso: Curso; leccion: TLeccion; indice: number }) {
  const [estado, setEstado] = useState<EstadoLeccion>(() => nuevoEstado(leccion))
  const [enTablero, setEnTablero] = useState(0)
  const [aviso, setAviso] = useState<Aviso>(null)
  const [flecha, setFlecha] = useState<DrawShape | null>(null)
  const [fasePrevia, setFasePrevia] = useState(estado.fase)
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
        marcarLeccion(leccion.id)
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
      setAviso({ tipo: 'incorrecta', texto: `Incorrecta: ${jugadaNumerada(sanAEspanol(san), ply)} no es la jugada de tu línea. Intenta otra vez.` })
      setEstado(r.estado)
      return
    }
    if (estado.fase === 'preguntar' && r.pasoTerminado) {
      registrar({ fen: posicion(leccion, ply).fen(), esperada: leccion.jugadas[ply]!, resultado: resultadoDelPaso(r.pasoTerminado), lugar: 'curso', linea: leccion.nombre, camino: leccion.jugadas.slice(0, ply) })
    }
    if (r.resultado === 'alternativa')
      setAviso({ tipo: 'alternativa', texto: `También es buena: ${jugadaNumerada(sanAEspanol(san), ply)} está en tu repertorio. Esta lección sigue con ${jugadaNumerada(sanAEspanol(leccion.jugadas[ply]!), ply)}.` })
    else setAviso({ tipo: 'correcta', texto: `¡Correcta! ${jugadaNumerada(sanAEspanol(san), ply)}` })
    setEnTablero(ply + 1)
    setEstado(r.estado)
  }

  const pedirPista = () => {
    setEstado(marcarPista(estado))
    setAviso({ tipo: 'pista', texto: pista(leccion, estado) })
  }
  const pedirRespuesta = () => {
    const r = respuesta(leccion, estado)
    if (!r) return
    setEstado(marcarRespuesta(estado))
    setFlecha({ orig: r.desde as Key, dest: r.hasta as Key, brush: 'blue' })
    setAviso({ tipo: 'respuesta', texto: `${r.texto} — ${r.nombre}. ${r.plan}` })
  }

  const hechas = leerProgreso()
  const siguiente = estado.fase === 'terminada' ? siguienteLeccion(curso, hechas, leccion.id) : undefined
  const pasosMios = leccion.jugadas.filter((_, i) => (i % 2 === 0 ? 'w' : 'b') === color).length
  const pasoActual = leccion.jugadas.slice(0, estado.ply).filter((_, i) => (i % 2 === 0 ? 'w' : 'b') === color).length + 1
  const instruccion =
    estado.fase === 'ensenar' ? (
      listo && esperada ? (
        <>
          Juega <strong>{jugadaNumerada(sanAEspanol(esperada), estado.ply)}</strong>
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
          <a className="salir" href={`#/curso/${encodeURIComponent(curso.id)}`} aria-label="Volver al curso">
            <IconoAtras />
          </a>
          <div className="leccion-titulo">
            <span className="apagado">{curso.nombre}</span>
            <strong data-testid="nombre-linea">{leccion.nombre}</strong>
          </div>
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
              <p className="plan">
                {leccion.plan} <span className="autor">{leccion.autorPlan === 'ia' ? 'redactado por la IA' : leccion.autorPlan === 'yo' ? 'escrito por ti' : 'de tu guía'}</span>
              </p>
            )}
            {aviso && (
              <p className={`aviso-leccion ${aviso.tipo}`} role="status" data-testid="aviso-leccion" data-resultado={aviso.tipo}>
                {aviso.texto}
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
        ) : (
          <div className="fin-leccion" data-testid="fin-leccion">
            <p className="etiqueta">Lección terminada</p>
            <h2>{leccion.nombre}</h2>
            {leccion.plan && <p className="plan">{leccion.plan}</p>}
            {siguiente && siguiente.id !== leccion.id ? (
              <button type="button" className="boton primario grande" onClick={() => navegar(`/leccion/${encodeURIComponent(curso.id)}/${curso.lecciones.indexOf(siguiente)}`)} data-testid="siguiente-leccion">
                Siguiente: {siguiente.nombre}
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
