import { useMemo, useState } from 'react'
import { FEN_INICIAL, finPorReglas, intentar, partidaDesde, jugadasEnEspanol, type ColorLargo } from '../ajedrez/reglas.ts'
import { TableroJugable } from '../componentes/TableroJugable.tsx'
import { ListaJugadas } from '../componentes/ListaJugadas.tsx'

/**
 * Tablero para las pruebas de reglas: mueven los dos lados. Solo existe en desarrollo (no se ve en la app construida).
 * `#/libre?fen=<FEN>` empieza desde esa posición.
 */
export function TableroLibre({ fenInicial }: { fenInicial?: string }) {
  const inicio = fenInicial || FEN_INICIAL
  const [jugadas, setJugadas] = useState<string[]>([])
  const [orientacion, setOrientacion] = useState<ColorLargo>('white')
  const chess = useMemo(() => partidaDesde(inicio, jugadas), [inicio, jugadas])
  const fin = finPorReglas(chess)
  const primeraEsNegras = inicio.split(' ')[1] === 'b'
  return (
    <div className="libre">
      <div className="libre-tablero">
        <TableroJugable
          chess={chess}
          orientacion={orientacion}
          puedeMover={fin ? undefined : 'both'}
          onJugada={(uci) => {
            const prueba = partidaDesde(inicio, jugadas)
            if (intentar(prueba, uci)) setJugadas([...jugadas, uci])
          }}
        />
      </div>
      <div className="libre-panel">
        {fin && (
          <div className="aviso-fin" data-testid="fin" role="status">
            {fin.nombre}
            {fin.ganador ? ` · ganan ${fin.ganador === 'w' ? 'blancas' : 'negras'}` : ''}
          </div>
        )}
        {!fin && chess.inCheck() && (
          <div className="aviso-jaque" data-testid="jaque">
            Jaque
          </div>
        )}
        <ListaJugadas sanes={jugadasEnEspanol(chess)} primeraEsNegras={primeraEsNegras} numeroInicial={Number(inicio.split(' ')[5] ?? 1)} />
        <div className="botones">
          <button type="button" onClick={() => setOrientacion(orientacion === 'white' ? 'black' : 'white')}>
            Voltear
          </button>
          <button type="button" onClick={() => setJugadas(jugadas.slice(0, -1))} disabled={jugadas.length === 0}>
            Deshacer
          </button>
        </div>
      </div>
    </div>
  )
}
