import { useState } from 'react'
import { Interruptor } from '../componentes/Interruptor.tsx'
import { sonidoPrendido, prenderSonido } from '../sonido/sonido.ts'

/** Ajustes de la app (menú Más). Cada interruptor se guarda en el navegador. */
export function Ajustes() {
  const [sonido, setSonido] = useState(sonidoPrendido)
  return (
    <div className="ajustes">
      <h1>Ajustes</h1>
      <div className="tarjeta">
        <Interruptor
          etiqueta="Sonido al mover"
          detalle="Un clic en cada jugada y otro más grave al capturar"
          activo={sonido}
          onCambiar={(v) => {
            prenderSonido(v)
            setSonido(v)
          }}
          testid="ajuste-sonido"
        />
      </div>
    </div>
  )
}
