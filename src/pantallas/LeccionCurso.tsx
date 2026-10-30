import { useEffect, useMemo, useRef, useState } from 'react'
import { Texto } from '../componentes/Notacion.tsx'
import type { DrawShape } from 'chessground/draw'
import type { Key } from 'chessground/types'
import { uciAObjeto } from '../ajedrez/reglas.ts'
import { TableroJugable } from '../componentes/TableroJugable.tsx'
import { Dialogo } from '../componentes/Dialogo.tsx'
import { IconoAtras, IconoFoco, IconoOjo, IconoReiniciar } from '../componentes/Iconos.tsx'
import { navegar } from '../ruta.ts'
import { marcarLeccion } from '../repertorio/estado.ts'
import { registrarPasoCurso } from '../registro/eventos.ts'
import { evaluar } from '../ayudas/analisis.ts'
import { cursoNuevo, jugadasDeLaBaseEn, lineaPorId, lineasDe, textoMio, textoRival } from '../curso/datos.ts'
import type { DatosCurso, LineaCurso } from '../curso/tipos.ts'
import { atras, continuar, empezar, empezarDeNuevo, intentar, jugarRival, pedirPista, pedirRespuesta, plyDeAtras, progreso, reintentar, retomar, tropiezos, type EstadoCiclo, type Vuelta } from '../curso/ciclo.ts'
import { borrarEnCurso, guardarEnCurso, leerAvance, marcarError, marcarPieza, marcarVariante } from '../curso/avance.ts'
import { formas, jugadaEs, lineaHasta, porQueNo, posicion } from '../curso/textos.ts'
import { explicacionDespues, INTRO_PRACTICAR, vistaTuTurno } from '../curso/turno.ts'
import { flechasPrendidas } from '../curso/flechas.ts'
import { BotonPasoAPaso } from '../componentes/PasoAPaso.tsx'
import { marcasDelMomento, marcasNuevas } from '../curso/marcas.ts'

/** El rival contesta "como un segundo después" (diseño §4). */
const PAUSA_RIVAL_MS = 900

/** Las dos opciones del interruptor de la vuelta, con los colores de los chips de antes. */
const VUELTAS: { id: Vuelta; nombre: string; chip: string }[] = [
  { id: 'aprender', nombre: 'Aprender', chip: 'chip-rep' },
  { id: 'practicar', nombre: 'Practicar', chip: 'chip-base' },
]

/** La lección nueva (C3, diseño §4): una variante del curso o un "¿Y si…?" de Errores y trampas. */
export function LeccionCurso({ cursoId, lineaId }: { cursoId: string; lineaId: string }) {
  const c = cursoNuevo(cursoId)
  const l = c ? lineaPorId(c, lineaId) : undefined
  if (!c || !l)
    return (
      <p className="vacio">
        No encontré esa lección. <a href="#/cursos/negras">Ver mis cursos</a>
      </p>
    )
  return <Linea key={l.id} c={c} l={l} />
}

/** Un renglón del espacio de mensajes. */
interface Mensaje {
  tipo: 'info' | 'rival' | 'pregunta' | 'correcta' | 'incorrecta' | 'buena' | 'pista' | 'respuesta' | 'explica'
  texto: string
  /** la jugada, en negritas, antes del texto */
  jugada?: string
}

function Linea({ c, l }: { c: DatosCurso; l: LineaCurso }) {
  const [e, setE] = useState<EstadoCiclo>(() => {
    const g = leerAvance(c.id).enCurso
    return g && g.linea === l.id ? retomar(l, g.vuelta, g.ply) : empezar(l, 'aprender')
  })
  const [confirmar, setConfirmar] = useState(false)
  const [notaMotor, setNotaMotor] = useState<string | null>(null)
  const turnoError = useRef(0)
  const narracion = useRef<HTMLDivElement>(null)
  const linea = useRef<HTMLParagraphElement>(null)
  const tablero = useMemo(() => posicion(l.jugadas, e.ply), [l, e.ply])
  const lineas = useMemo(() => lineasDe(c), [c])
  const esVariante = l.tipo === 'variante'
  const lista = lineas.filter((x) => x.tipo === l.tipo)
  const indice = lista.findIndex((x) => x.id === l.id)
  const esperada = e.momento === 'tuTurno' || e.momento === 'error' || e.momento === 'buena' ? l.jugadas[e.ply] : undefined
  const mia = esperada ? textoMio(c, l.jugadas, e.ply) : undefined

  // la máquina juega la del rival, como un segundo después
  useEffect(() => {
    if (e.momento !== 'rival') return
    const t = setTimeout(() => setE((x) => jugarRival(l, x)), PAUSA_RIVAL_MS)
    return () => clearTimeout(t)
  }, [e.momento, e.ply, l])

  // en el iPhone la narración tiene altura fija y se desplaza: cada momento nuevo se lee desde arriba,
  // y la ayuda que pides (Pista, Otra pista, Respuesta) se lleva a la vista
  useEffect(() => {
    narracion.current?.scrollTo?.({ top: 0 })
    if (e.momento !== 'tuTurno' || e.ayuda === 0) return
    const ayudas = narracion.current?.querySelectorAll('[data-tipo="pista"], [data-tipo="respuesta"]')
    ayudas?.[ayudas.length - 1]?.scrollIntoView?.({ block: 'nearest' })
  }, [e.momento, e.ply, e.ayuda])

  // en el celular la línea va en un renglón que se desliza (para que la lección quepa en la pantalla): la última jugada, a la vista
  useEffect(() => {
    linea.current?.scrollTo?.({ left: linea.current.scrollWidth })
  }, [e.ply])

  // el avance se guarda en el teléfono: se retoma donde me quedé
  useEffect(() => {
    if (esVariante && e.momento === 'tuTurno') guardarEnCurso(c.id, l.id, e.vuelta, e.ply)
  }, [esVariante, e.momento, e.vuelta, e.ply, c.id, l.id])

  // al terminar una vuelta: aprendida o terminada (y entra al Repaso de hoy)
  useEffect(() => {
    if (e.momento === 'plan' && l.variante) marcarVariante(c.id, l.variante.id, 'aprendida')
    if (e.momento !== 'fin') return
    if (l.variante) {
      marcarVariante(c.id, l.variante.id, 'terminada')
      if (l.leccionId) marcarLeccion(l.leccionId)
      borrarEnCurso(c.id, l.id)
    } else if (l.error) {
      const a = marcarError(c.id, l.error.id)
      if (c.piezas.errores.lista.every((x) => a.errores[x.id])) marcarPieza(c.id, 'errores')
    }
  }, [e.momento, c, l])

  // saltar a la otra vuelta (2026-10-30): empieza desde su primera jugada, sin preguntar; al volver, retomo en ella
  const cambiarVuelta = (v: Vuelta) => {
    if (v === e.vuelta) return
    guardarEnCurso(c.id, l.id, v, l.desde)
    setE(empezar(l, v))
  }

  const alJugar = (uci: string) => {
    if (e.momento !== 'tuTurno') return
    let j
    try {
      j = posicion(l.jugadas, e.ply).move(uciAObjeto(uci))
    } catch {
      return
    }
    const ply = e.ply
    const buenas = new Set([...jugadasDeLaBaseEn(tablero.fen()), ...(textoMio(c, l.jugadas, ply)?.buenas ?? [])].filter((s) => s !== l.jugadas[ply]))
    // con algo que leer después de la jugada (en Aprender y, desde las correcciones, también en Practicar), espera a "Siguiente"
    const r = intentar(l, e, { san: j.san, desde: j.from, hasta: j.to }, { buenas, esperar: explicacionDespues(c, l, e.vuelta, ply).length > 0 })
    setNotaMotor(null)
    if (r.resultado === 'correcta' && esVariante && e.vuelta === 'practicar')
      registrarPasoCurso({ fen: tablero.fen(), esperada: l.jugadas[ply]!, paso: r.estado.pasos[ply]!, linea: l.nombre, camino: l.jugadas.slice(0, ply) })
    if (r.resultado === 'error') revisarConMotor(ply, j.san)
    setE(r.estado)
  }

  // "Si el motor ve que pierde algo, lo dice" (diseño §4): se compara con la jugada de la lección, sin esperar
  const revisarConMotor = (ply: number, san: string) => {
    const turno = ++turnoError.current
    const tras = (s: string) => {
      const p = posicion(l.jugadas, ply)
      p.move(s)
      return p.fen()
    }
    const lado = l.lado === 'w' ? 1 : -1
    Promise.all([evaluar(tras(l.jugadas[ply]!)), evaluar(tras(san))])
      .then(([bien, mal]) => {
        if (turno !== turnoError.current) return
        const valor = (x: { cpBlancas: number; mate: number | null }) => (x.mate !== null ? Math.sign(x.mate) * 10000 : x.cpBlancas) * lado
        const pierde = valor(bien) - valor(mal)
        // en un «¿Y si…?» se compara con la jugada que castiga: la tuya puede no perder nada, solo no castigar
        if (pierde >= 150) setNotaMotor(esVariante ? 'El motor ve que esa jugada pierde material.' : 'El motor ve otra jugada que gana material: esta no castiga el error.')
        else if (pierde >= 60) setNotaMotor(esVariante ? 'El motor ve que esa jugada te deja peor.' : 'El motor ve otra jugada que castiga mejor.')
      })
      .catch(() => {})
  }

  // ---------------------------------------------------------------- el tablero
  // C5: con el interruptor prendido, las marcas nuevas (pegadas a su frase) reemplazan a las flechas de antes
  const nuevas = marcasNuevas()
  const marcas = nuevas ? marcasDelMomento(c, l, e, { flechasSiguiente: flechasPrendidas() }) : undefined
  const flechas: DrawShape[] = []
  const flecha = (orig: string, dest: string | undefined, brush: string) => flechas.push({ orig: orig as Key, dest: dest as Key | undefined, brush })
  const turno = e.momento === 'tuTurno' && esperada ? vistaTuTurno(c, l, e.vuelta, e.ply, e.ayuda) : null
  if (!nuevas && turno && esperada) {
    const m = posicion(l.jugadas, e.ply).move(esperada)
    if (e.vuelta === 'aprender' && flechasPrendidas()) flecha(m.from, m.to, 'green')
    if (turno.pieza) flecha(turno.pieza, undefined, 'yellow')
    if (turno.flecha) flecha(turno.flecha.de, turno.flecha.a, 'blue')
  }
  if (!nuevas && e.intento) flecha(e.intento.desde, e.intento.hasta, e.momento === 'error' ? 'red' : 'blue')
  if (!nuevas && e.momento === 'leer' && e.ultima !== null) for (const f of formas(textoMio(c, l.jugadas, e.ultima)?.marcas)) flecha(f.orig, f.dest, f.brush)
  if (!nuevas && e.momento === 'plan' && l.variante) for (const f of formas(l.variante.plan.marcas)) flecha(f.orig, f.dest, f.brush)

  // ---------------------------------------------------------------- el espacio de mensajes (narra; no se quita solo)
  const mensajes: Mensaje[] = []
  const rivalAntes = e.ply - 1 >= l.desde && e.ply - 1 >= 0 && (e.ply - 1) % 2 === (l.lado === 'w' ? 1 : 0) ? e.ply - 1 : null
  const anotarRival = () => {
    if (rivalAntes === null) return
    const t = textoRival(c, l.jugadas, rivalAntes)
    // la jugada en negritas, salvo que la frase ya la diga
    const j = jugadaEs(l.jugadas[rivalAntes]!, rivalAntes)
    mensajes.push({ tipo: 'rival', jugada: t?.texto.includes(j) ? undefined : j, texto: t?.texto ?? '' })
  }
  let boton: { texto: string; testid: string; accion: () => void } | null = null
  if (e.momento === 'intro') {
    mensajes.push({ tipo: 'info', texto: e.vuelta === 'aprender' ? l.intro : INTRO_PRACTICAR })
    boton = { texto: 'Empezar', testid: 'empezar-vuelta', accion: () => setE(continuar(l, e)) }
  } else if (e.momento === 'rival') {
    // solo "Correcto": la explicación ya se leyó con "Siguiente"; la jugada del rival llega en 0.9 s
    if (e.ultima !== null) mensajes.push({ tipo: 'correcta', jugada: jugadaEs(l.jugadas[e.ultima]!, e.ultima), texto: 'Correcto.' })
    else mensajes.push({ tipo: 'info', texto: 'Juega el rival…' })
  } else if (e.momento === 'tuTurno' && turno && mia) {
    anotarRival()
    // Aprender dice la jugada; Practicar no dice nada de ella, salvo la ayuda que pido (src/curso/turno.ts)
    mensajes.push(...turno.textos)
  } else if (e.momento === 'leer' && e.ultima !== null) {
    mensajes.push({ tipo: 'correcta', jugada: jugadaEs(l.jugadas[e.ultima]!, e.ultima), texto: 'Correcto.' })
    for (const t of explicacionDespues(c, l, e.vuelta, e.ultima)) mensajes.push({ tipo: 'explica', texto: t })
    boton = { texto: 'Siguiente', testid: 'siguiente', accion: () => setE(continuar(l, e)) }
  } else if (e.momento === 'error' && e.intento && esperada) {
    mensajes.push({ tipo: 'incorrecta', jugada: `Esa no es: ${jugadaEs(e.intento.san, e.ply)}`, texto: porQueNo(c, l, e.ply, e.intento.san, e.vuelta) })
    if (notaMotor) mensajes.push({ tipo: 'incorrecta', texto: notaMotor })
    boton = { texto: 'Reintentar', testid: 'reintentar', accion: () => setE(reintentar(e)) }
  } else if (e.momento === 'buena' && e.intento) {
    mensajes.push({ tipo: 'buena', jugada: jugadaEs(e.intento.san, e.ply), texto: 'Buena jugada, pero esta lección enseña otra línea. Prueba de nuevo.' })
    boton = { texto: 'Reintentar', testid: 'reintentar', accion: () => setE(reintentar(e)) }
  } else if (e.momento === 'plan' && l.variante) {
    mensajes.push({ tipo: 'info', texto: 'Ya terminó la apertura.' }, { tipo: 'explica', jugada: 'Tu plan:', texto: l.variante.plan.tuyo }, { tipo: 'explica', jugada: 'El de blancas:', texto: l.variante.plan.rival })
    boton = { texto: 'Ahora, Practicar', testid: 'a-practicar', accion: () => setE(empezar(l, 'practicar')) }
  }

  // Pista y Respuesta, a la mano también con un error a la vista (lo quitan y ayudan en un solo toque)
  const conAyuda = e.momento === 'tuTurno' || e.momento === 'error' || e.momento === 'buena'
  const { n, m } = progreso(l, e)
  const atrasA = plyDeAtras(l, e)
  const urlCurso = `#/curso/${encodeURIComponent(c.id)}`
  const siguienteLinea = lista[indice + 1]

  return (
    <div className="leccion leccion-curso" data-testid="leccion-curso" data-momento={e.momento} data-vuelta={e.vuelta} data-ply={e.ply}>
      <div className="leccion-columna">
        <div className="partida-arriba">
          <a className="salir" href={esVariante ? urlCurso : `${urlCurso}/errores`} aria-label="Volver al curso">
            <IconoAtras />
          </a>
          <div className="leccion-titulo">
            <span className="apagado" data-testid="cual-variante">
              {esVariante ? `Variante ${indice + 1} de ${lista.length}` : `¿Y si…? ${indice + 1} de ${lista.length}`}
            </span>
            <strong data-testid="nombre-linea"><Texto t={l.nombre} /></strong>
          </div>
        </div>
        <div className="partida-tablero">
          <TableroJugable chess={tablero} orientacion={l.lado === 'w' ? 'white' : 'black'} puedeMover={e.momento === 'tuTurno' ? (l.lado === 'w' ? 'white' : 'black') : undefined} onJugada={alJugar} flechas={flechas} marcas={marcas} />
        </div>
      </div>
      <aside className="partida-panel leccion-panel">
        {e.momento === 'fin' ? (
          <Resumen
            l={l}
            e={e}
            siguiente={siguienteLinea ? () => navegar(`/curso/${encodeURIComponent(c.id)}/linea/${encodeURIComponent(siguienteLinea.id)}`) : () => navegar(`/curso/${encodeURIComponent(c.id)}${esVariante ? '/errores' : ''}`)}
            // Nota 1 (2026-10-29): solo "Siguiente variante"; su nombre se ve al abrirla
            textoSiguiente={siguienteLinea ? (esVariante ? 'Siguiente variante' : 'Siguiente «¿Y si…?»') : esVariante ? 'Errores y trampas' : 'Volver al curso'}
            repetir={() => setE(empezar(l, 'aprender'))}
            urlCurso={urlCurso}
          />
        ) : (
          <>
            <div className="leccion-fase" data-testid="fase">
              {/* en una variante, la etiqueta de la vuelta es un interruptor (2026-10-30); un «¿Y si…?» se queda con su chip */}
              {esVariante ? (
                <div className="vueltas" role="radiogroup" aria-label="Vuelta" data-testid="interruptor-vuelta">
                  {VUELTAS.map((v) => (
                    <button key={v.id} type="button" role="radio" aria-checked={e.vuelta === v.id} className={`chip ${e.vuelta === v.id ? v.chip : ''}`} onClick={() => cambiarVuelta(v.id)} data-testid={`vuelta-${v.id}`}>
                      {v.nombre}
                    </button>
                  ))}
                </div>
              ) : (
                <span className={`chip ${e.vuelta === 'aprender' ? 'chip-rep' : 'chip-base'}`}>Castígalo</span>
              )}
              <span className="apagado" data-testid="jugada-n-de-m">
                Jugada {n} de {m}
              </span>
            </div>
            <p className="linea-jugadas linea-leccion" ref={linea} data-testid="linea">
              {e.ply > 0 ? <Texto t={lineaHasta(l.jugadas, e.ply)} /> : ' '}
            </p>
            <div className="narracion" ref={narracion} data-testid="narracion" role="status" aria-live="polite">
              {mensajes.map((x, i) => (
                <p key={i} className={`mensaje-curso ${x.tipo}`} data-tipo={x.tipo}>
                  {x.jugada && (
                    <strong>
                      <Texto t={x.jugada} />
                      {/[:.]$/.test(x.jugada) ? ' ' : '. '}
                    </strong>
                  )}
                  <Texto t={x.texto} />
                </p>
              ))}
              {/* en el iPhone, una franja a todo lo ancho: el texto que pasa debajo del botón no se asoma a su lado */}
              {boton && (
                <div className={`narracion-pie ${e.momento === 'plan' && l.variante?.plan.pasoAPaso ? 'dos-botones' : ''}`}>
                  {/* correcciones, C3: el plan también se ve paso a paso, desde el final de la variante */}
                  {e.momento === 'plan' && l.variante?.plan.pasoAPaso && <BotonPasoAPaso titulo="Tu plan" pa={l.variante.plan.pasoAPaso} inicio={l.jugadas} orientacion={l.lado === 'w' ? 'white' : 'black'} />}
                  <button type="button" className="boton primario" onClick={boton.accion} data-testid={boton.testid}>
                    {boton.texto}
                  </button>
                </div>
              )}
            </div>
            <div className="botones-ayuda botones-curso">
              <button type="button" className="boton-icono" onClick={() => setE(pedirPista(e))} disabled={!conAyuda || e.ayuda >= 2} data-testid="pista">
                <IconoFoco />
                <span>{e.ayuda >= 1 ? 'Otra pista' : 'Pista'}</span>
              </button>
              <button type="button" className="boton-icono" onClick={() => setE(pedirRespuesta(e))} disabled={!conAyuda} data-testid="respuesta">
                <IconoOjo />
                <span>Respuesta</span>
              </button>
              <button type="button" className="boton-icono" onClick={() => setE(atras(l, e))} disabled={atrasA === null || e.momento === 'rival'} data-testid="atras">
                <IconoAtras />
                <span>Atrás</span>
              </button>
              {/* antes era un enlace debajo de la fila y la página ya no cabía en el iPhone (2026-10-29); pregunta antes, igual */}
              <button type="button" className="boton-icono" onClick={() => setConfirmar(true)} data-testid="reiniciar">
                <IconoReiniciar />
                <span>Reiniciar</span>
              </button>
            </div>
          </>
        )}
      </aside>
      {confirmar && (
        <Dialogo
          titulo="¿Empezar de nuevo?"
          confirmar="Empezar de nuevo"
          onCancelar={() => setConfirmar(false)}
          onConfirmar={() => {
            setConfirmar(false)
            setE(empezarDeNuevo(l, e))
          }}
        >
          <p>Vuelves a la primera jugada de {esVariante ? (e.vuelta === 'aprender' ? 'Aprender' : 'Practicar') : 'este «¿Y si…?»'}.</p>
        </Dialogo>
      )}
    </div>
  )
}

/** Al terminar: la línea en un renglón, la idea clave y en qué me equivoqué, con tres salidas (diseño §4). */
function Resumen(props: { l: LineaCurso; e: EstadoCiclo; siguiente: () => void; textoSiguiente: string; repetir: () => void; urlCurso: string }) {
  const { l, e } = props
  const t = tropiezos(e)
  return (
    <div className="fin-leccion resumen-curso" data-testid="resumen-variante">
      {/* en el celular, el texto usa el espacio de la narración y se desliza por dentro; las salidas quedan abajo, a la vista (Nota 1) */}
      <div className="resumen-texto" data-testid="resumen-texto">
        <p className="etiqueta">{l.variante ? 'Variante terminada' : 'Bien castigado'}</p>
        <h2><Texto t={l.nombre} /></h2>
        <p className="linea-jugadas" data-testid="resumen-linea">
          <Texto t={lineaHasta(l.jugadas, l.jugadas.length)} />
        </p>
        <p data-testid="resumen-idea">
          <strong>La idea: </strong>
          <Texto t={l.variante ? l.variante.idea : (l.error?.final ?? '')} />
        </p>
        {l.variante && (
          <div data-testid="resumen-tropiezos">
            <strong>{t.length === 0 ? 'Sin errores ni ayuda en Practicar.' : 'En qué te equivocaste:'}</strong>
            {t.length > 0 && (
              <ul className="lista-tropiezos">
                {t.map((x) => (
                  <li key={x.ply}>
                    <Texto t={jugadaEs(l.jugadas[x.ply]!, x.ply)} />: {[x.paso.fallos > 0 ? `${x.paso.fallos} ${x.paso.fallos === 1 ? 'error' : 'errores'}` : null, x.paso.pista ? 'pediste Pista' : null, x.paso.respuesta ? 'viste la Respuesta' : null].filter(Boolean).join(', ')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
      <button type="button" className="boton primario" onClick={props.siguiente} data-testid="salida-siguiente">
        {props.textoSiguiente}
      </button>
      <button type="button" className="boton secundario" onClick={props.repetir} data-testid="salida-repetir">
        Repetir
      </button>
      <a className="enlace" href={props.urlCurso} data-testid="salida-curso">
        Volver al curso
      </a>
    </div>
  )
}
