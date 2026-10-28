import { CONTROLES, type ControlTiempo } from '../reloj/reloj.ts'

const GRUPOS = [
  { id: 'bullet', nombre: 'Bala' },
  { id: 'blitz', nombre: 'Relámpago' },
  { id: 'rapid', nombre: 'Rápida' },
] as const

/** La ventana "Elegir tiempo" (T14): tres grupos de 3 y "Sin tiempo". La escogida, con borde verde. */
export function ElegirTiempo(props: { actual: string; onEscoger: (c: ControlTiempo) => void; onCerrar: () => void }) {
  return (
    <div className="dialogo-fondo" onClick={props.onCerrar}>
      <div className="dialogo elegir-tiempo" role="dialog" aria-modal="true" aria-label="Elegir tiempo" onClick={(e) => e.stopPropagation()}>
        <h2>Elegir tiempo</h2>
        {GRUPOS.map((g) => (
          <section key={g.id} aria-label={g.nombre}>
            <h3>{g.nombre}</h3>
            <div className="opciones-tiempo">
              {CONTROLES.filter((c) => c.grupo === g.id).map((c) => (
                <button key={c.id} type="button" className={c.id === props.actual ? 'activo' : ''} aria-pressed={c.id === props.actual} onClick={() => props.onEscoger(c)} data-testid={`tiempo-${c.id}`}>
                  {c.nombre}
                </button>
              ))}
            </div>
          </section>
        ))}
        <div className="opciones-tiempo una">
          <button type="button" className={props.actual === 'sin' ? 'activo' : ''} aria-pressed={props.actual === 'sin'} onClick={() => props.onEscoger(CONTROLES.find((c) => c.id === 'sin')!)} data-testid="tiempo-sin">
            Sin tiempo
          </button>
        </div>
      </div>
    </div>
  )
}
