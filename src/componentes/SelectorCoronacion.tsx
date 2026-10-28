import type { ColorLargo } from '../ajedrez/reglas.ts'
import { DibujoPieza } from './Tablero.tsx'

const OPCIONES = [
  { letra: 'q', tipo: 'queen', nombre: 'Dama' },
  { letra: 'r', tipo: 'rook', nombre: 'Torre' },
  { letra: 'b', tipo: 'bishop', nombre: 'Alfil' },
  { letra: 'n', tipo: 'knight', nombre: 'Caballo' },
] as const

/** Al coronar, escoges la pieza (sin dama automática). */
export function SelectorCoronacion(props: { color: ColorLargo; onEscoger: (letra: string) => void; onCancelar: () => void }) {
  return (
    <div className="coronacion-fondo">
      <div className="coronacion" role="dialog" aria-modal="true" aria-label="Coronación" data-testid="coronacion">
        <h2>Coronar: ¿qué pieza quieres?</h2>
        <div className="coronacion-opciones">
          {OPCIONES.map((o) => (
            <button key={o.letra} type="button" onClick={() => props.onEscoger(o.letra)} aria-label={o.nombre} data-testid={`coronar-${o.letra}`}>
              <DibujoPieza tipo={o.tipo} color={props.color} />
              {o.nombre}
            </button>
          ))}
        </div>
        <button type="button" className="cancelar" onClick={props.onCancelar}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
