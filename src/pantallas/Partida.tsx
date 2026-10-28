import { useEffect, useState } from 'react'
import { usePartidaBot, empezarPartida } from '../partida/usePartidaBot.ts'
import { resultadoPara, puedeDeshacer } from '../partida/modelo.ts'
import { obtenerMotor } from '../motor/navegador.ts'
import { largo, jugadasEnEspanol } from '../ajedrez/reglas.ts'
import { TableroJugable } from '../componentes/TableroJugable.tsx'
import { ListaJugadas } from '../componentes/ListaJugadas.tsx'
import { BarraJugador } from '../componentes/BarraJugador.tsx'
import { Dialogo } from '../componentes/Dialogo.tsx'
import { Avatar } from '../componentes/Avatar.tsx'
import { IconoAtras, IconoBandera, IconoCerrar, IconoDeshacer, IconoVoltear } from '../componentes/Iconos.tsx'
import { navegar } from '../ruta.ts'

const TITULO = { gane: '¡Ganaste!', perdi: 'Perdiste', tablas: 'Tablas' } as const

export function Partida() {
  const pb = usePartidaBot()
  const [confirmarRendirse, setConfirmarRendirse] = useState(false)
  const [avisoCerrado, setAvisoCerrado] = useState<string | null>(null)

  // el motor empieza a cargar en cuanto se abre la partida
  useEffect(() => {
    obtenerMotor().catch(() => undefined)
  }, [])

  const { partida, bot, chess } = pb
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
  const barraRival = <BarraJugador personaje={bot} estado={estadoBot} pensando={!!estadoBot} testid="barra-rival" />
  const barraYo = <BarraJugador yo testid="barra-yo" />
  const verAviso = !!partida.fin && avisoCerrado !== partida.id

  const revancha = () => {
    pb.reemplazar(empezarPartida(bot.id, partida.colorHumano === 'w' ? 'b' : 'w'))
    setAvisoCerrado(null)
  }

  return (
    <div className="partida" data-testid="partida" data-motor={pb.motor.tipo === 'listo' ? pb.motor.version : pb.motor.tipo}>
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
        <div className="partida-tablero">
          <TableroJugable chess={chess} orientacion={partida.orientacion} puedeMover={!partida.fin && !pb.turnoBot ? colorHumano : undefined} onJugada={pb.jugar} />
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
        {partida.fin ? (
          <div className="panel-final">
            <p className="resultado" data-testid="resultado">
              {TITULO[resultado!]} · {partida.fin.tipo === 'rendicion' && resultado === 'perdi' ? 'Te rendiste' : partida.fin.nombre}
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
          <div className="botones-partida">
            <button type="button" className="boton-icono" onClick={() => pb.deshacer()} disabled={!puedeDeshacer(partida) || pb.turnoBot} data-testid="deshacer">
              <IconoDeshacer />
              <span>Deshacer</span>
            </button>
            <button type="button" className="boton-icono" onClick={() => pb.voltear()} data-testid="voltear">
              <IconoVoltear />
              <span>Voltear</span>
            </button>
            <button type="button" className="boton-icono" onClick={() => setConfirmarRendirse(true)} data-testid="rendirse">
              <IconoBandera />
              <span>Rendirse</span>
            </button>
          </div>
        )}
      </aside>

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
            <p className="apagado">{partida.fin!.tipo === 'rendicion' && resultado === 'perdi' ? 'Te rendiste' : partida.fin!.nombre}</p>
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
