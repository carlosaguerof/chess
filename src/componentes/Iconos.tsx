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
