import type { ReactNode } from 'react'
import type { Personaje } from '../bots/personajes.ts'
import { Avatar } from './Avatar.tsx'

/** El jugador arriba o abajo del tablero: avatar, nombre, nivel y, si es el bot, si está pensando. */
export function BarraJugador(props: { personaje?: Personaje; yo?: boolean; estado?: string; pensando?: boolean; testid?: string; reloj?: ReactNode }) {
  return (
    <div className="barra-jugador" data-testid={props.testid}>
      <Avatar personaje={props.personaje} yo={props.yo} tam={36} />
      <div className="barra-nombre">
        <span className="nombre">{props.yo ? 'Tú' : props.personaje?.nombre}</span>
        {!props.yo && props.personaje && <span className="nivel">({props.personaje.elo})</span>}
      </div>
      {props.estado && (
        <div className={`barra-estado ${props.pensando ? 'pensando' : ''}`} data-testid={props.pensando ? 'pensando' : 'estado-bot'} role="status">
          {props.estado}
          {props.pensando && (
            <span className="puntos" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
          )}
        </div>
      )}
      {props.reloj}
    </div>
  )
}
