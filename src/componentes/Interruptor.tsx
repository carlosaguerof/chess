/** Un interruptor con su etiqueta y una línea que explica qué hace. */
export function Interruptor(props: { etiqueta: string; detalle: string; activo: boolean; onCambiar: (v: boolean) => void; testid: string }) {
  return (
    <label className="interruptor">
      <span>
        <strong>{props.etiqueta}</strong>
        <small className="apagado">{props.detalle}</small>
      </span>
      <input type="checkbox" role="switch" checked={props.activo} onChange={(e) => props.onCambiar(e.target.checked)} data-testid={props.testid} />
      <i aria-hidden="true" />
    </label>
  )
}
