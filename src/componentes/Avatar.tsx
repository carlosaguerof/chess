import type { Personaje } from '../bots/personajes.ts'
import { retrato, useEstiloRetratos, type EstiloRetrato } from '../bots/retratos.ts'

/** Avatar propio: el mío es una silueta; el de cada personaje, su retrato en el estilo escogido en Ajustes (L1). */
export function Avatar({ personaje, tam = 40, yo = false, estilo }: { personaje?: Personaje; tam?: number; yo?: boolean; estilo?: EstiloRetrato }) {
  const actual = useEstiloRetratos()
  if (!yo && personaje) {
    const e = estilo ?? actual
    return <img className="avatar retrato" src={retrato(e, personaje)} width={tam} height={tam} alt={personaje.nombre} data-retrato={personaje.id} data-estilo={e} draggable={false} />
  }
  return (
    <svg className="avatar" width={tam} height={tam} viewBox="0 0 40 40" role="img" aria-label={yo ? 'Tú' : 'Bot'}>
      <rect width="40" height="40" rx="6" fill={yo ? '#5d9948' : '#555'} />
      <g fill="#fff">
        <circle cx="20" cy="15" r="7" />
        <path d="M7 36c1.5-8 7-12 13-12s11.5 4 13 12z" />
      </g>
    </svg>
  )
}
