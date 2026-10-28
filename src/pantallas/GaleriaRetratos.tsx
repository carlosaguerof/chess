import { PERSONAJES } from '../bots/personajes.ts'
import { ESTILOS, type EstiloRetrato } from '../bots/retratos.ts'
import { Avatar } from '../componentes/Avatar.tsx'

/** Solo en desarrollo: los 47 personajes en un estilo, para la captura de la L1. */
export function GaleriaRetratos({ estilo }: { estilo: EstiloRetrato }) {
  const e = ESTILOS.find((x) => x.id === estilo) ?? ESTILOS[0]!
  return (
    <main className="galeria-retratos">
      <h1>
        {e.nombre} <small className="apagado">{e.autor}</small>
      </h1>
      <ul>
        {PERSONAJES.map((p) => (
          <li key={p.id}>
            <Avatar personaje={p} tam={96} estilo={e.id} />
            <span>
              {p.nombre} <span className="nivel">{p.elo}</span>
            </span>
          </li>
        ))}
      </ul>
    </main>
  )
}
