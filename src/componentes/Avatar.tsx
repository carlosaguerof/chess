import type { Personaje } from '../bots/personajes.ts'

/** Avatar propio: la inicial del personaje sobre su color (R4 lo cambia por un dibujo generado). */
export function Avatar({ personaje, tam = 40, yo = false }: { personaje?: Personaje; tam?: number; yo?: boolean }) {
  const color = yo ? '#5d9948' : (personaje?.color ?? '#555')
  return (
    <svg className="avatar" width={tam} height={tam} viewBox="0 0 40 40" role="img" aria-label={yo ? 'Tú' : (personaje?.nombre ?? 'Bot')}>
      <rect width="40" height="40" rx="6" fill={color} />
      {yo ? (
        <g fill="#fff">
          <circle cx="20" cy="15" r="7" />
          <path d="M7 36c1.5-8 7-12 13-12s11.5 4 13 12z" />
        </g>
      ) : (
        <text x="20" y="21" textAnchor="middle" dominantBaseline="middle" fontFamily="Inter, sans-serif" fontWeight="700" fontSize={20} fill="#fff">
          {personaje?.nombre[0] ?? '?'}
        </text>
      )}
    </svg>
  )
}
