import type { Mensaje, Ayuda } from '../guia/guia.ts'
import { IconoFoco, IconoOjo } from './Iconos.tsx'

/** La guía de aperturas en la partida (N8: su mensaje y dos botones, Pista y Respuesta). */
export function PanelGuia(props: {
  mensaje: Mensaje | null
  ayuda: { tipo: 'pista' | 'respuesta'; datos: Ayuda } | null
  miTurno: boolean
  desvioPendiente: boolean
  onPista: () => void
  onRespuesta: () => void
  onSeguir: () => void
  onDeshacer: () => void
}) {
  return (
    <div className="panel-guia" data-testid="panel-guia">
      {props.mensaje && (
        <div className={`mensaje-guia ${props.mensaje.tipo}`} data-testid="mensaje-guia" data-tipo={props.mensaje.tipo} role="status">
          <p>{props.mensaje.texto}</p>
          {props.desvioPendiente && (
            <div className="botones-desvio">
              <button type="button" className="boton secundario chico" onClick={props.onSeguir} data-testid="seguir-desvio">
                Seguir así
              </button>
              <button type="button" className="boton primario chico" onClick={props.onDeshacer} data-testid="deshacer-desvio">
                Deshacer mi jugada
              </button>
            </div>
          )}
        </div>
      )}
      {props.ayuda && (
        <p className={`aviso-leccion ${props.ayuda.tipo}`} data-testid="ayuda-guia" data-origen={props.ayuda.datos.origen}>
          {props.ayuda.tipo === 'pista' ? props.ayuda.datos.pista : props.ayuda.datos.respuesta}
        </p>
      )}
      <div className="botones-ayuda">
        <button type="button" className="boton-icono" onClick={props.onPista} disabled={!props.miTurno || props.desvioPendiente} data-testid="pista">
          <IconoFoco />
          <span>Pista</span>
        </button>
        <button type="button" className="boton-icono" onClick={props.onRespuesta} disabled={!props.miTurno || props.desvioPendiente} data-testid="respuesta">
          <IconoOjo />
          <span>Respuesta</span>
        </button>
      </div>
    </div>
  )
}
