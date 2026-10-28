import { useEffect, useRef, type ReactNode } from 'react'

/** Ventana de confirmación (N5): lo que no tiene vuelta se pregunta antes. */
export function Dialogo(props: {
  titulo: string
  children?: ReactNode
  confirmar: string
  cancelar?: string
  peligro?: boolean
  onConfirmar: () => void
  onCancelar: () => void
}) {
  const boton = useRef<HTMLButtonElement>(null)
  useEffect(() => boton.current?.focus(), [])
  return (
    <div className="dialogo-fondo" onClick={props.onCancelar}>
      <div className="dialogo" role="dialog" aria-modal="true" aria-label={props.titulo} onClick={(e) => e.stopPropagation()}>
        <h2>{props.titulo}</h2>
        {props.children && <div className="dialogo-texto">{props.children}</div>}
        <div className="dialogo-botones">
          <button type="button" className="boton secundario" onClick={props.onCancelar} ref={boton}>
            {props.cancelar ?? 'Cancelar'}
          </button>
          <button type="button" className={`boton ${props.peligro ? 'peligro' : 'primario'}`} onClick={props.onConfirmar}>
            {props.confirmar}
          </button>
        </div>
      </div>
    </div>
  )
}
