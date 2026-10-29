import { useEffect, useMemo, useState } from 'react'
import type { DrawShape } from 'chessground/draw'
import type { Key } from 'chessground/types'
import { usePartidaBot, empezarPartida } from '../partida/usePartidaBot.ts'
import { resultadoPara, puedeDeshacer, ayudasUsadas, ajedrezDe } from '../partida/modelo.ts'
import { estrellas as calcularEstrellas } from '../estrellas/estrellas.ts'
import { anotarEstrellas } from '../estrellas/almacen.ts'
import { anotarPartida } from '../historial/historial.ts'
import { Estrellas } from '../componentes/Estrellas.tsx'
import { MenuAyudas, BarraEvaluacion, leerAyudas, guardarAyudas } from '../componentes/Ayudas.tsx'
import { amenazas, porcentajeBlancas } from '../ayudas/amenazas.ts'
import { evaluar } from '../ayudas/analisis.ts'
import { obtenerMotor } from '../motor/navegador.ts'
import { largo, jugadasEnEspanol } from '../ajedrez/reglas.ts'
import { TableroJugable } from '../componentes/TableroJugable.tsx'
import { ListaJugadas } from '../componentes/ListaJugadas.tsx'
import { BarraJugador } from '../componentes/BarraJugador.tsx'
import { Dialogo } from '../componentes/Dialogo.tsx'
import { Avatar } from '../componentes/Avatar.tsx'
import { IconoAtras, IconoBandera, IconoCerrar, IconoDeshacer, IconoVoltear, IconoFoco } from '../componentes/Iconos.tsx'
import { navegar } from '../ruta.ts'
import { cursos as listaCursos } from '../cursos/datos.ts'
import { BASE } from '../base/base.ts'
import { useMiRepertorio } from '../aprender/favoritas.ts'
import { siguientesEnRepertorio } from '../repertorio/modelo.ts'
import { ayudaEnMiTurno, jugadaDeMisLineas, mensajeTrasMiJugada, resumenDePartida, type Ayuda, type Contexto } from '../guia/guia.ts'
import { registrarJugadaPartida } from '../registro/eventos.ts'
import { PanelGuia } from '../componentes/PanelGuia.tsx'
import { Reloj } from '../componentes/Reloj.tsx'
import { uciAObjeto } from '../ajedrez/reglas.ts'
import { Chess } from 'chess.js'

const TITULO = { gane: '¡Ganaste!', perdi: 'Perdiste', tablas: 'Tablas' } as const

export function Partida() {
  // mi repertorio son las variantes de mis aperturas (con las favoritas prendidas, las de mis favoritas)
  const rep = useMiRepertorio()
  const pb = usePartidaBot({ misLineas: (p) => (historia, azar, preferidas) => jugadaDeMisLineas(rep, p.colorHumano, historia, azar, preferidas) })
  const [confirmarRendirse, setConfirmarRendirse] = useState(false)
  const [ayuda, setAyuda] = useState<{ tipo: 'pista' | 'respuesta'; datos: Ayuda; ply: number } | null>(null)
  // ---- ayudas de chess.com (T15): barra, amenazas y sugerencia, con un motor aparte a toda fuerza
  const [ajustes, setAjustes] = useState(leerAyudas)
  const [menuAyudas, setMenuAyudas] = useState(false)
  const [evaluacion, setEvaluacion] = useState<{ fen: string; pct: number; mejor: string | null } | null>(null)
  const fenActual = pb.chess?.fen()
  useEffect(() => {
    if (!fenActual || !(ajustes.barra || ajustes.sugerencia)) return
    let vigente = true
    evaluar(fenActual)
      .then((e) => vigente && setEvaluacion({ fen: fenActual, pct: porcentajeBlancas(e.cpBlancas, e.mate), mejor: e.mejor }))
      .catch(() => undefined)
    return () => {
      vigente = false
    }
  }, [fenActual, ajustes.barra, ajustes.sugerencia])
  // prender barra o flechas en una partida en curso cuenta para las estrellas
  useEffect(() => {
    const p = pb.partida
    if (p && !p.fin && (ajustes.barra || ajustes.amenazas || ajustes.sugerencia) && !p.usoBarraOFlechas) pb.reemplazar({ ...p, usoBarraOFlechas: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ajustes, pb.partida?.id, pb.partida?.fin])
  const [avisoCerrado, setAvisoCerrado] = useState<string | null>(null)

  // el motor empieza a cargar en cuanto se abre la partida
  useEffect(() => {
    obtenerMotor().catch(() => undefined)
  }, [])

  // al terminar: las estrellas (T16), una sola vez por partida, y la mejor se guarda por bot
  useEffect(() => {
    const p = pb.partida
    if (!p?.fin || p.estrellas !== undefined) return
    const r = resultadoPara(p)!
    const n = calcularEstrellas(r, ayudasUsadas(p))
    anotarEstrellas(p.botId, n)
    // R2: al historial, con el resumen de la apertura (aunque la guía estuviera apagada)
    const h = ajedrezDe(p).history()
    const rs = resumenDePartida(rep, p.colorHumano, h, BASE)
    anotarPartida({
      id: p.id,
      botId: p.botId,
      colorHumano: p.colorHumano,
      resultado: r,
      fin: p.fin.tipo === 'rendicion' && r === 'perdi' ? 'Te rendiste' : p.fin.nombre,
      jugadas: h.length,
      fecha: Date.now(),
      resumen: { caso: rs.caso, linea: rs.linea?.nombre, jugue: rs.salida?.jugue, tuLinea: rs.salida?.linea, ply: rs.salida?.ply },
    })
    pb.reemplazar({ ...p, estrellas: n })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pb.partida?.fin, pb.partida?.id])

  const { partida, bot, chess } = pb
  const historia = useMemo(() => chess?.history() ?? [], [chess])
  if (!partida || !bot || !chess) {
    return (
      <div className="vacio">
        <p>No hay una partida en curso.</p>
        <a className="boton primario" href="#/bots">
          Jugar contra un bot
        </a>
      </div>
    )
  }

  const colorHumano = largo(partida.colorHumano)
  const resultado = resultadoPara(partida)
  const errorMotor = pb.motor.tipo === 'error' && pb.turnoBot
  const estadoBot = partida.fin
    ? undefined
    : errorMotor
      ? undefined
      : pb.turnoBot
        ? pb.motor.tipo === 'cargando' || pb.motor.tipo === 'apagado'
          ? `Preparando a ${bot.nombre}`
          : `${bot.nombre} está pensando`
        : undefined
  const rivalArriba = partida.orientacion === colorHumano
  // ---- la guía de aperturas (T9): todo sale de mi repertorio y de la base, nunca del motor
  const ctx: Contexto = { base: BASE, rep, color: partida.colorHumano }
  const guia = partida.opciones.guia
  const inicio: 'w' | 'b' = partida.fenInicial.split(' ')[1] === 'b' ? 'b' : 'w'
  const quienMovio = (i: number) => (i % 2 === 0 ? inicio : inicio === 'w' ? 'b' : 'w')
  const ultimaFueMia = historia.length > 0 && quienMovio(historia.length - 1) === partida.colorHumano
  const mensaje = guia && ultimaFueMia ? mensajeTrasMiJugada(ctx, historia) : null
  const miTurno = !partida.fin && !pb.turnoBot && !partida.pausa && chess.turn() === partida.colorHumano
  const ayudaVigente = ayuda && ayuda.ply === historia.length ? ayuda : null
  const flechas: DrawShape[] = ayudaVigente?.tipo === 'respuesta' && ayudaVigente.datos.desde ? [{ orig: ayudaVigente.datos.desde as Key, dest: ayudaVigente.datos.hasta as Key, brush: 'blue' }] : []
  if (ajustes.amenazas && !partida.fin) for (const a of amenazas(chess, partida.colorHumano)) flechas.push({ orig: a.desde as Key, dest: a.hasta as Key, brush: 'red' })
  const sugerencia = ajustes.sugerencia && miTurno && evaluacion?.fen === chess.fen() ? evaluacion.mejor : null
  if (sugerencia) flechas.push({ orig: sugerencia.slice(0, 2) as Key, dest: sugerencia.slice(2, 4) as Key, brush: 'green' })
  // al terminar por mate la barra se llena del lado del ganador; en tablas, a la mitad
  const finBarra = partida.fin && (partida.fin.tipo === 'mate' || partida.fin.ganador === null) ? (partida.fin.ganador === 'w' ? 100 : partida.fin.ganador === 'b' ? 0 : 50) : null
  const barra = ajustes.barra ? (finBarra ?? evaluacion?.pct ?? null) : null
  const resumen = partida.fin && guia ? resumenDePartida(rep, partida.colorHumano, historia, BASE) : null
  // T18: del resumen a practicar justo esa línea
  const practicar = (() => {
    const l = resumen?.linea
    if (!l) return null
    const curso = listaCursos().find((c) => c.id === `${l.apertura}:${l.color}`)
    const i = curso ? curso.lecciones.findIndex((x) => x.id.endsWith('/' + l.id)) : -1
    return curso && i >= 0 ? `/leccion/${encodeURIComponent(curso.id)}/${i}` : null
  })()

  const alJugar = (uci: string) => {
    if (!guia) return pb.jugar(uci)
    // antes de mover: qué esperaba mi repertorio aquí (para el desvío y para el registro por jugada)
    const antes = historia
    const ops = siguientesEnRepertorio(rep, partida.colorHumano, antes)
    let san: string
    try {
      san = new Chess(chess.fen()).move(uciAObjeto(uci)).san
    } catch {
      return
    }
    const despues = [...antes, san]
    const m = mensajeTrasMiJugada(ctx, despues)
    if (ops.length > 0) {
      const jugada = ops.find((o) => o.san === san) ?? ops[0]!
      registrarJugadaPartida({ fen: chess.fen(), esperada: jugada.san, desvio: m.tipo === 'desvio', ayuda: ayudaVigente?.tipo ?? null, linea: jugada.lineas[0]!.nombre, camino: antes })
    }
    setAyuda(null)
    pb.jugar(uci, () => (m.tipo === 'desvio' ? { pausa: 'desvio' } : {}))
  }
  const pedirAyuda = (tipo: 'pista' | 'respuesta') => {
    setAyuda({ tipo, datos: ayudaEnMiTurno(ctx, historia), ply: historia.length })
    pb.contarAyuda(tipo)
  }
  const colorBot = partida.colorHumano === 'w' ? 'b' : 'w'
  const relojDe = (c: 'w' | 'b', testid: string) => (pb.tiempos ? <Reloj ms={pb.tiempos[c]} corriendo={pb.tiempos.corriendo === c} testid={testid} /> : undefined)
  const barraRival = <BarraJugador personaje={bot} estado={estadoBot} pensando={!!estadoBot} testid="barra-rival" reloj={relojDe(colorBot, 'reloj-rival')} />
  const barraYo = <BarraJugador yo testid="barra-yo" reloj={relojDe(partida.colorHumano, 'reloj-yo')} />
  const verAviso = !!partida.fin && avisoCerrado !== partida.id

  const revancha = () => {
    pb.reemplazar(empezarPartida(bot.id, partida.colorHumano === 'w' ? 'b' : 'w'))
    setAvisoCerrado(null)
  }

  return (
    <div className="partida" data-testid="partida" data-motor={pb.motor.tipo === 'listo' ? pb.motor.version : pb.motor.tipo} data-jugadas={historia.join(' ')}>
      <div className="partida-columna">
        <div className="partida-arriba">
          <a className="salir" href="#/" aria-label="Salir al inicio (la partida se guarda)" title="Salir al inicio (la partida se guarda)">
            <IconoAtras />
          </a>
          {rivalArriba ? barraRival : barraYo}
        </div>
        {errorMotor && (
          <div className="aviso-error" role="alert" data-testid="error-motor">
            <p>{pb.motor.tipo === 'error' ? pb.motor.mensaje : ''}</p>
            <button type="button" className="boton secundario chico" onClick={pb.reintentarMotor}>
              Reintentar
            </button>
          </div>
        )}
        {barra !== null && (
          <div className="solo-celular">
            <BarraEvaluacion porcentajeBlancas={barra} deBlancas={partida.orientacion === 'white'} horizontal />
          </div>
        )}
        <div className="tablero-con-barra">
          {barra !== null && (
            <div className="solo-escritorio barra-vertical">
              <BarraEvaluacion porcentajeBlancas={barra} deBlancas={partida.orientacion === 'white'} />
            </div>
          )}
          <div className="partida-tablero" data-testid="flechas" data-flechas={flechas.map((f) => `${f.brush}:${f.orig}${f.dest ?? ''}`).join(' ')}>
            <TableroJugable chess={chess} orientacion={partida.orientacion} puedeMover={miTurno ? colorHumano : undefined} onJugada={alJugar} flechas={flechas} />
          </div>
        </div>
        {rivalArriba ? barraYo : barraRival}
      </div>
      <aside className="partida-panel">
        <div className="panel-cabeza">
          <Avatar personaje={bot} tam={28} />
          <span>
            Contra {bot.nombre} ({bot.elo}) · juegas con {partida.colorHumano === 'w' ? 'blancas' : 'negras'}
          </span>
        </div>
        <ListaJugadas sanes={jugadasEnEspanol(chess)} primeraEsNegras={partida.fenInicial.split(' ')[1] === 'b'} />
        {guia && !partida.fin && (
          <PanelGuia
            mensaje={mensaje}
            ayuda={ayudaVigente}
            miTurno={miTurno}
            desvioPendiente={partida.pausa === 'desvio'}
            onPista={() => pedirAyuda('pista')}
            onRespuesta={() => pedirAyuda('respuesta')}
            onSeguir={() => pb.seguir()}
            onDeshacer={() => pb.deshacer()}
          />
        )}
        {resumen && (
          <div className="resumen-guia" data-testid="resumen" data-caso={resumen.caso}>
            <p className="panel-guia-titulo">Resumen de tu apertura</p>
            <p>{resumen.texto}</p>
            {practicar && (
              <button type="button" className="enlace-chico" onClick={() => navegar(practicar)}>
                Practicar esta línea
              </button>
            )}
          </div>
        )}
        {partida.fin ? (
          <div className="panel-final">
            <p className="resultado" data-testid="resultado">
              {TITULO[resultado!]} · {partida.fin.tipo === 'rendicion' && resultado === 'perdi' ? 'Te rendiste' : partida.fin.tipo === 'tiempo' && resultado === 'perdi' ? 'Se te acabó el tiempo' : partida.fin.nombre}
            </p>
            <div className="botones-partida">
              <button type="button" className="boton primario" onClick={revancha}>
                Revancha
              </button>
              <button type="button" className="boton secundario" onClick={() => navegar('/bots')}>
                Otro bot
              </button>
            </div>
          </div>
        ) : (
          <div className="botones-partida cuatro">
            <button type="button" className="boton-icono" onClick={() => pb.deshacer()} disabled={!puedeDeshacer(partida) || pb.turnoBot || pb.pensando} data-testid="deshacer">
              <IconoDeshacer />
              <span>Deshacer</span>
            </button>
            <button type="button" className="boton-icono" onClick={() => pb.voltear()} data-testid="voltear">
              <IconoVoltear />
              <span>Voltear</span>
            </button>
            <button type="button" className="boton-icono" onClick={() => setMenuAyudas(true)} data-testid="ayudas" aria-label="Ayudas: barra y flechas">
              <IconoFoco />
              <span>Ayudas</span>
            </button>
            <button type="button" className="boton-icono" onClick={() => setConfirmarRendirse(true)} data-testid="rendirse">
              <IconoBandera />
              <span>Rendirse</span>
            </button>
          </div>
        )}
      </aside>

      {menuAyudas && (
        <MenuAyudas
          ajustes={ajustes}
          onCambiar={(a) => {
            setAjustes(a)
            guardarAyudas(a)
          }}
          onCerrar={() => setMenuAyudas(false)}
        />
      )}
      {confirmarRendirse && (
        <Dialogo
          titulo="¿Rendirte?"
          confirmar="Rendirme"
          cancelar="Seguir jugando"
          peligro
          onConfirmar={() => {
            setConfirmarRendirse(false)
            pb.rendirse()
          }}
          onCancelar={() => setConfirmarRendirse(false)}
        >
          La partida termina y cuenta como derrota.
        </Dialogo>
      )}

      {verAviso && resultado && (
        <div className="dialogo-fondo">
          <div className={`dialogo aviso-final ${resultado}`} role="dialog" aria-modal="true" aria-label="Fin de la partida" data-testid="aviso-final">
            <button type="button" className="cerrar" aria-label="Cerrar y ver el tablero" onClick={() => setAvisoCerrado(partida.id)}>
              <IconoCerrar />
            </button>
            <h2>{TITULO[resultado]}</h2>
            {partida.estrellas !== undefined && <Estrellas n={partida.estrellas} tam={30} testid="estrellas-final" />}
            <p className="apagado">{partida.fin!.tipo === 'rendicion' && resultado === 'perdi' ? 'Te rendiste' : partida.fin!.tipo === 'tiempo' && resultado === 'perdi' ? 'Se te acabó el tiempo' : partida.fin!.nombre}</p>
            {resumen && (
              <p className="resumen-aviso" data-testid="resumen-aviso">
                {resumen.texto}
              </p>
            )}
            {practicar && (
              <button type="button" className="boton secundario chico" onClick={() => navegar(practicar)} data-testid="practicar-linea">
                Practicar esta línea
              </button>
            )}
            <div className="aviso-jugadores">
              <Avatar yo tam={56} />
              <span>vs</span>
              <Avatar personaje={bot} tam={56} />
            </div>
            <div className="dialogo-botones">
              <button type="button" className="boton primario" onClick={revancha} data-testid="revancha">
                Revancha
              </button>
              <button type="button" className="boton secundario" onClick={() => navegar('/bots')} data-testid="otro-bot">
                Otro bot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
