import { useMemo, useState } from 'react'
import { Chess } from 'chess.js'
import { TableroJugable } from '../componentes/TableroJugable.tsx'
import { ListaJugadas } from '../componentes/ListaJugadas.tsx'
import { jugadasEnEspanol, uciAObjeto, type ColorCorto } from '../ajedrez/reglas.ts'

/** Agregar una línea a mi repertorio jugándola en el tablero, desde un nodo. */
export function AgregarJugando(props: { color: ColorCorto; desde: string[]; onGuardar: (jugadas: string[], nombre: string) => void; onCancelar: () => void }) {
  const [extra, setExtra] = useState<string[]>([])
  const [nombre, setNombre] = useState('')
  const chess = useMemo(() => {
    const c = new Chess()
    for (const s of [...props.desde, ...extra]) c.move(s)
    return c
  }, [props.desde, extra])
  return (
    <div className="dialogo-fondo">
      <div className="dialogo agregar-jugando" role="dialog" aria-label="Agregar una línea jugando">
        <h2>Agregar una línea</h2>
        <p className="apagado">Juega las jugadas de los dos lados desde esta posición.</p>
        <div className="mini-tablero">
          <TableroJugable
            chess={chess}
            orientacion={props.color === 'w' ? 'white' : 'black'}
            puedeMover="both"
            onJugada={(uci) => {
              const c = new Chess(chess.fen())
              try {
                const m = c.move(uciAObjeto(uci))
                setExtra([...extra, m.san])
              } catch {
                /* ilegal: no pasa nada */
              }
            }}
          />
        </div>
        <ListaJugadas sanes={jugadasEnEspanol(chess)} />
        <label>
          Nombre de la línea
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Por ejemplo: mi línea contra 4.h4" data-testid="nombre-nueva" />
        </label>
        <div className="dialogo-botones">
          <button type="button" className="boton secundario" onClick={props.onCancelar}>
            Cancelar
          </button>
          <button type="button" className="boton primario" disabled={extra.length === 0} onClick={() => props.onGuardar([...props.desde, ...extra], nombre.trim() || 'Mi línea')} data-testid="guardar-nueva">
            Guardar en mi repertorio
          </button>
        </div>
      </div>
    </div>
  )
}
