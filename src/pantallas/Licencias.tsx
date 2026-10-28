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
        <li>Tipografías: Inter y JetBrains Mono (OFL-1.1), instaladas en la app.</li>
        <li>
          Retratos de los personajes, dibujados con DiceBear (MIT) y adaptados con rasgos y colores para cada personaje:{' '}
          <a href="https://www.figma.com/community/file/1589627891082866389" target="_blank" rel="noreferrer">
            ToonHead
          </a>{' '}
          de Johan Melin (
          <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
            CC BY 4.0
          </a>
          ),{' '}
          <a href="https://avataaars.com/" target="_blank" rel="noreferrer">
            Avataaars
          </a>{' '}
          de Pablo Stanley (libre para uso personal y comercial) y{' '}
          <a href="https://www.openpeeps.com/" target="_blank" rel="noreferrer">
            Open Peeps
          </a>{' '}
          de Pablo Stanley (CC0).
        </li>
        <li>Íconos y sonidos: hechos en el código de esta app (GPL-3.0 o posterior).</li>
      </ul>
    </div>
  )
}
