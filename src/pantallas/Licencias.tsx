import { useEffect, useState } from 'react'
import { alCambiarMotor, estadoMotor } from '../motor/navegador.ts'

const REPO = 'https://github.com/carlosaguerof/chess'

/** "Código fuente y licencias" (nota 7): se abre desde el menú Más. */
export function Licencias() {
  const [motor, setMotor] = useState(estadoMotor())
  useEffect(() => alCambiarMotor(setMotor), [])
  return (
    <div className="licencias">
      <h1>Código fuente y licencias</h1>
      <p>
        Esta app es software libre bajo la licencia <strong>GPL-3.0 o posterior</strong>. Su código fuente completo está en GitHub.
      </p>
      <p>
        <a className="boton secundario" href={REPO} target="_blank" rel="noreferrer">
          Ver el código fuente
        </a>{' '}
        <a className="boton secundario" href={`${REPO}/blob/main/LICENCIAS.md`} target="_blank" rel="noreferrer">
          Ver las licencias
        </a>
      </p>
      <ul className="apagado">
        <li>Motor: Stockfish 19 lite (GPL-3.0){motor.tipo === 'listo' ? ` · cargado: ${motor.version}` : ''}.</li>
        <li>Tablero: chessground de lichess (GPL-3.0). Piezas cburnett (CC BY-SA 3.0).</li>
        <li>Aperturas: lista abierta de lichess (CC0). Planes redactados por la IA.</li>
      </ul>
    </div>
  )
}
