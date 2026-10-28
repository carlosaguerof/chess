import { guardar, leer } from '../estado/almacen.ts'

/** Las ayudas de chess.com (T15), apagadas por defecto, desde un solo botón (N8). */
export interface AjustesAyudas {
  barra: boolean
  amenazas: boolean
  sugerencia: boolean
}

export const SIN_AYUDAS: AjustesAyudas = { barra: false, amenazas: false, sugerencia: false }

export function leerAyudas(): AjustesAyudas {
  return { ...SIN_AYUDAS, ...leer<Partial<AjustesAyudas>>('ayudas', {}) }
}

export function guardarAyudas(a: AjustesAyudas): void {
  guardar('ayudas', a)
}

export function MenuAyudas(props: { ajustes: AjustesAyudas; onCambiar: (a: AjustesAyudas) => void; onCerrar: () => void }) {
  const fila = (clave: keyof AjustesAyudas, etiqueta: string, detalle: string) => (
    <label className="interruptor">
      <span>
        <strong>{etiqueta}</strong>
        <small className="apagado">{detalle}</small>
      </span>
      <input type="checkbox" role="switch" checked={props.ajustes[clave]} onChange={(e) => props.onCambiar({ ...props.ajustes, [clave]: e.target.checked })} data-testid={`ayuda-${clave}`} />
      <i aria-hidden="true" />
    </label>
  )
  return (
    <div className="dialogo-fondo" onClick={props.onCerrar}>
      <div className="dialogo" role="dialog" aria-modal="true" aria-label="Ayudas" onClick={(e) => e.stopPropagation()}>
        <h2>Ayudas</h2>
        <p className="apagado">Cuentan para las estrellas: con barra o flechas, ganar da 2.</p>
        {fila('barra', 'Barra de ventaja', 'Quién va ganando, según el motor a toda fuerza')}
        {fila('amenazas', 'Flechas de amenaza', 'Tus piezas atacadas sin defensa suficiente')}
        {fila('sugerencia', 'Sugerencia', 'La mejor jugada del motor para ti')}
        <button type="button" className="boton primario" onClick={props.onCerrar}>
          Listo
        </button>
      </div>
    </div>
  )
}

/** La barra de quién va ganando (blancas abajo si juego con blancas). */
export function BarraEvaluacion({ porcentajeBlancas, deBlancas, horizontal }: { porcentajeBlancas: number; deBlancas: boolean; horizontal?: boolean }) {
  const mio = deBlancas ? porcentajeBlancas : 100 - porcentajeBlancas
  return (
    <div className={`barra-eval ${horizontal ? 'horizontal' : ''} ${deBlancas ? '' : 'negras'}`} data-testid="barra-eval" data-blancas={Math.round(porcentajeBlancas)} role="meter" aria-label="Ventaja" aria-valuenow={Math.round(mio)} aria-valuemin={0} aria-valuemax={100}>
      <i style={horizontal ? { width: `${mio}%` } : { height: `${mio}%` }} />
    </div>
  )
}
