/**
 * R4: avatares originales en SVG, generados en el código a partir del id del personaje (formas y colores; sin imágenes
 * de fuera). Siempre la misma cara para el mismo personaje.
 */
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

const PIELES = ['#f5d0b5', '#e8b996', '#d29a6f', '#b07650', '#8a5a3b', '#62402a']
const PELOS = ['#2b1d14', '#5a3a22', '#8b5a2b', '#c08a3e', '#e3c16f', '#9a9a9a', '#1c1c1c', '#a13d2d']
const ACCESORIOS = ['nada', 'lentes', 'gorra', 'nada', 'aretes', 'nada', 'barba', 'lentes-sol']

/** Los rasgos de la cara de un personaje (siempre los mismos para el mismo id). */
export function rasgos(id: string) {
  const h = hash(id)
  return {
    piel: PIELES[h % PIELES.length]!,
    pelo: PELOS[(h >> 3) % PELOS.length]!,
    peinado: (h >> 6) % 5,
    accesorio: ACCESORIOS[(h >> 9) % ACCESORIOS.length]!,
    boca: (h >> 12) % 3,
    ojos: (h >> 14) % 2,
  }
}

export function CaraGenerada({ id, fondo, tam = 40, etiqueta }: { id: string; fondo: string; tam?: number; etiqueta: string }) {
  const { piel, pelo, peinado, accesorio, boca, ojos } = rasgos(id)
  return (
    <svg className="avatar" width={tam} height={tam} viewBox="0 0 40 40" role="img" aria-label={etiqueta} data-cara={id}>
      <rect width="40" height="40" rx="6" fill={fondo} />
      {/* hombros */}
      <path d="M6 40c1.5-7 7-10.5 14-10.5S32.5 33 34 40z" fill={pelo} opacity="0.85" />
      {/* cuello y cara */}
      <rect x="17" y="24" width="6" height="6" rx="2" fill={piel} />
      <ellipse cx="20" cy="18" rx="8.5" ry="9.5" fill={piel} />
      {/* pelo */}
      {peinado === 0 && <path d="M11.5 16c0-6 4-9.5 8.5-9.5s8.5 3.5 8.5 9.5c-2-3-5-4.5-8.5-4.5s-6.5 1.5-8.5 4.5z" fill={pelo} />}
      {peinado === 1 && <path d="M11 18c-1-8 4-12 9-12s10 4 9 12c-1-4-3-6-9-6s-8 2-9 6z" fill={pelo} />}
      {peinado === 2 && <path d="M11 20c-2-9 3-14 9-14s11 5 9 14l-2-6c-2-2-5-3-7-3s-5 1-7 3z" fill={pelo} />}
      {peinado === 3 && <path d="M10.5 26c-2-12 2-19 9.5-19s11.5 7 9.5 19l-1.5-9c-2-3-5-4-8-4s-6 1-8 4z" fill={pelo} />}
      {peinado === 4 && <path d="M12 13c2-4 5-5.5 8-5.5s6 1.5 8 5.5c-3-1-5-1.5-8-1.5s-5 .5-8 1.5z" fill={pelo} />}
      {/* ojos */}
      {ojos === 0 ? (
        <>
          <circle cx="16.5" cy="18.5" r="1.2" fill="#2a2420" />
          <circle cx="23.5" cy="18.5" r="1.2" fill="#2a2420" />
        </>
      ) : (
        <>
          <path d="M15 18.8q1.5-1.6 3 0" stroke="#2a2420" strokeWidth="1.1" fill="none" />
          <path d="M22 18.8q1.5-1.6 3 0" stroke="#2a2420" strokeWidth="1.1" fill="none" />
        </>
      )}
      {/* boca */}
      {boca === 0 && <path d="M17 23q3 2.2 6 0" stroke="#7a3b2e" strokeWidth="1.2" fill="none" strokeLinecap="round" />}
      {boca === 1 && <path d="M17.5 23.2h5" stroke="#7a3b2e" strokeWidth="1.2" strokeLinecap="round" />}
      {boca === 2 && <ellipse cx="20" cy="23.3" rx="1.6" ry="1.1" fill="#7a3b2e" />}
      {/* accesorio */}
      {accesorio === 'lentes' && (
        <g stroke="#1b1b1b" strokeWidth="1" fill="none">
          <circle cx="16.5" cy="18.5" r="2.6" />
          <circle cx="23.5" cy="18.5" r="2.6" />
          <path d="M19.1 18.5h1.8" />
        </g>
      )}
      {accesorio === 'lentes-sol' && (
        <g fill="#1b1b1b">
          <rect x="13.5" y="16.8" width="5.5" height="3.4" rx="1.2" />
          <rect x="21" y="16.8" width="5.5" height="3.4" rx="1.2" />
          <rect x="18.8" y="17.8" width="2.4" height="0.9" />
        </g>
      )}
      {accesorio === 'gorra' && <path d="M10.5 14c1-5 5-7.5 9.5-7.5s8.5 2.5 9.5 7.5zM26 13.5h7v2h-7z" fill="#2f5d8a" />}
      {accesorio === 'aretes' && (
        <g fill="#f6c33b">
          <circle cx="11.6" cy="21" r="1" />
          <circle cx="28.4" cy="21" r="1" />
        </g>
      )}
      {accesorio === 'barba' && <path d="M12.5 21c1 6 4 8 7.5 8s6.5-2 7.5-8c-2 2-4.5 3-7.5 3s-5.5-1-7.5-3z" fill={pelo} />}
    </svg>
  )
}
