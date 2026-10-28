/** Íconos propios en SVG (trazos simples, sin archivos de fuera). */
type P = { className?: string }
const base = { width: 24, height: 24, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, 'aria-hidden': true }
export const IconoDeshacer = (p: P) => (<svg {...base} {...p}><path d="M9 14 4 9l5-5" /><path d="M4 9h10a6 6 0 0 1 0 12h-3" /></svg>)
export const IconoVoltear = (p: P) => (<svg {...base} {...p}><path d="M7 4v16" /><path d="m3 8 4-4 4 4" /><path d="M17 20V4" /><path d="m21 16-4 4-4-4" /></svg>)
export const IconoBandera = (p: P) => (<svg {...base} {...p}><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></svg>)
export const IconoAtras = (p: P) => (<svg {...base} {...p}><path d="M15 18 9 12l6-6" /></svg>)
export const IconoCasa = (p: P) => (<svg {...base} {...p}><path d="M3 11 12 4l9 7" /><path d="M5 10v10h14V10" /></svg>)
export const IconoJugar = (p: P) => (<svg {...base} {...p}><circle cx="12" cy="6" r="3" /><path d="M9 21h6" /><path d="M10 9.5 8.5 18h7L14 9.5" /></svg>)
export const IconoLibro = (p: P) => (<svg {...base} {...p}><path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z" /><path d="M4 19V5" /></svg>)
export const IconoArbol = (p: P) => (<svg {...base} {...p}><circle cx="6" cy="5" r="2" /><circle cx="6" cy="19" r="2" /><circle cx="18" cy="12" r="2" /><path d="M6 7v10" /><path d="M6 12h10" /></svg>)
export const IconoMas = (p: P) => (<svg {...base} {...p}><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></svg>)
export const IconoCerrar = (p: P) => (<svg {...base} {...p}><path d="M6 6l12 12M18 6 6 18" /></svg>)
export const IconoFoco = (p: P) => (<svg {...base} {...p}><path d="M9 18h6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-4 10.5c.7.7 1 1.5 1 2.5h6c0-1 .3-1.8 1-2.5A6 6 0 0 0 12 3z" /></svg>)
export const IconoOjo = (p: P) => (<svg {...base} {...p}><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></svg>)
export const IconoOpciones = (p: P) => (<svg {...base} {...p}><path d="M4 7h10" /><path d="M18 7h2" /><circle cx="16" cy="7" r="2" /><path d="M4 17h4" /><path d="M12 17h8" /><circle cx="10" cy="17" r="2" /></svg>)
export const IconoAbajo = (p: P) => (<svg {...base} {...p}><path d="m6 9 6 6 6-6" /></svg>)
export const IconoAdelante = (p: P) => (<svg {...base} {...p}><path d="m9 18 6-6-6-6" /></svg>)
export const IconoInicio = (p: P) => (<svg {...base} {...p}><path d="M6 6v12" /><path d="m17 18-6-6 6-6" /></svg>)
export const IconoFinal = (p: P) => (<svg {...base} {...p}><path d="M18 6v12" /><path d="m7 18 6-6-6-6" /></svg>)
/** El corazón de las favoritas: sin rellenar, o relleno al guardarla (Nota 1). */
export const IconoCorazon = ({ lleno, className }: { lleno: boolean; className?: string }) => (<svg {...base} className={className} fill={lleno ? 'currentColor' : 'none'}><path d="M12 20.5s-7.5-4.6-9.2-9.4C1.7 7.8 3.9 4.5 7.3 4.5c2 0 3.6 1.1 4.7 2.7 1.1-1.6 2.7-2.7 4.7-2.7 3.4 0 5.6 3.3 4.5 6.6-1.7 4.8-9.2 9.4-9.2 9.4z" /></svg>)

/** El rey para escoger color (dibujo propio): relleno blanco o negro, con contorno. */
const TrazosRey = ({ color }: { color: 'w' | 'b' }) => (
  <g fill={color === 'w' ? '#f4f4f2' : '#262522'} stroke={color === 'w' ? '#262522' : '#f4f4f2'} strokeWidth="1.6" strokeLinejoin="round" strokeLinecap="round">
    <path d="M18 3v6M15 6h6" fill="none" />
    <path d="M18 10.5c-1.8 0-3 1.2-3 2.6 0 .8.3 1.4.7 1.9H12.3c-1.6 0-2.8 1.3-2.5 2.9l1.4 6.6h13.6l1.4-6.6c.3-1.6-.9-2.9-2.5-2.9h-3.4c.4-.5.7-1.1.7-1.9 0-1.4-1.2-2.6-3-2.6z" />
    <path d="M11.2 24.5h13.6v2.8H11.2z" />
    <path d="M9.6 27.3h16.8l-1 4.7H10.6z" />
  </g>
)
export const IconoRey = ({ color }: { color: 'w' | 'b' }) => (
  <svg width="40" height="40" viewBox="0 0 36 36" aria-hidden="true">
    <TrazosRey color={color} />
  </svg>
)
/** "Al azar": el rey mitad blanco y mitad negro. */
export const IconoAzar = () => (
  <svg width="40" height="40" viewBox="0 0 36 36" aria-hidden="true">
    <clipPath id="rey-izquierda">
      <rect x="0" y="0" width="18" height="36" />
    </clipPath>
    <clipPath id="rey-derecha">
      <rect x="18" y="0" width="18" height="36" />
    </clipPath>
    <g clipPath="url(#rey-izquierda)">
      <TrazosRey color="w" />
    </g>
    <g clipPath="url(#rey-derecha)">
      <TrazosRey color="b" />
    </g>
  </svg>
)
