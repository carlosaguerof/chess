import { useState } from 'react'
import { Interruptor } from '../componentes/Interruptor.tsx'
import { Avatar } from '../componentes/Avatar.tsx'
import { sonidoPrendido, prenderSonido } from '../sonido/sonido.ts'
import { repasoActivo, activarRepaso } from '../repaso/repaso.ts'
import { ESTILOS, cambiarEstiloRetratos, useEstiloRetratos } from '../bots/retratos.ts'
import { personajePorId } from '../bots/personajes.ts'
import { SeccionRespaldo } from '../componentes/SeccionRespaldo.tsx'

const MUESTRA = ['brisa', 'octavio', 'citlali'].map((id) => personajePorId(id)!)

/** Ajustes de la app (menú Más). Cada ajuste se guarda en el navegador. */
export function Ajustes() {
  const [sonido, setSonido] = useState(sonidoPrendido)
  const [repaso, setRepaso] = useState(repasoActivo)
  const estilo = useEstiloRetratos()
  return (
    <div className="ajustes">
      <h1>Ajustes</h1>
      <section className="ajuste-estilo" aria-labelledby="titulo-estilo">
        <h2 id="titulo-estilo">Estilo de los personajes</h2>
        <div className="opciones-estilo" role="radiogroup" aria-labelledby="titulo-estilo">
          {ESTILOS.map((e) => (
            <button key={e.id} type="button" role="radio" aria-checked={estilo === e.id} className={estilo === e.id ? 'activo' : ''} onClick={() => cambiarEstiloRetratos(e.id)} data-testid={`estilo-${e.id}`}>
              <span className="muestra-estilo" aria-hidden="true">
                {MUESTRA.map((p) => (
                  <Avatar key={p.id} personaje={p} tam={44} estilo={e.id} />
                ))}
              </span>
              <span>{e.nombre}</span>
            </button>
          ))}
        </div>
      </section>
      <div className="tarjeta">
        <Interruptor
          etiqueta="Sonido al mover"
          detalle="Un clic en cada jugada"
          activo={sonido}
          onCambiar={(v) => {
            prenderSonido(v)
            setSonido(v)
          }}
          testid="ajuste-sonido"
        />
        <Interruptor
          etiqueta="Repaso de hoy en el inicio"
          detalle="Lo que toca repasar"
          activo={repaso}
          onCambiar={(v) => {
            activarRepaso(v)
            setRepaso(v)
          }}
          testid="ajuste-repaso"
        />
      </div>
      <SeccionRespaldo
        onCargado={() => {
          // lo importado puede traer otros ajustes: se vuelven a leer
          setSonido(sonidoPrendido())
          setRepaso(repasoActivo())
        }}
      />
    </div>
  )
}
