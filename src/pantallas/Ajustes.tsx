import { useState } from 'react'
import { Interruptor } from '../componentes/Interruptor.tsx'
import { sonidoPrendido, prenderSonido } from '../sonido/sonido.ts'
import { repasoActivo, activarRepaso } from '../repaso/repaso.ts'

/** Ajustes de la app (menú Más). Cada interruptor se guarda en el navegador. */
export function Ajustes() {
  const [sonido, setSonido] = useState(sonidoPrendido)
  const [repaso, setRepaso] = useState(repasoActivo)
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
        <Interruptor
          etiqueta="Repaso de hoy en el inicio"
          detalle="Las líneas que ya aprendiste vuelven justo antes de olvidarlas (1, 3, 7, 14 y 30 días)"
          activo={repaso}
          onCambiar={(v) => {
            activarRepaso(v)
            setRepaso(v)
          }}
          testid="ajuste-repaso"
        />
      </div>
    </div>
  )
}
