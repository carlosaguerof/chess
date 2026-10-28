import { useState, type ReactNode } from 'react'
import { IconoArbol, IconoCasa, IconoJugar, IconoLibro, IconoMas } from './Iconos.tsx'

export interface EntradaMenu {
  ruta: string
  nombre: string
  icono: ReactNode
}

/** Las secciones de la app. Se agregan conforme existen (C2: nada que no esté en el MVP). */
export const SECCIONES: EntradaMenu[] = [
  { ruta: '/', nombre: 'Inicio', icono: <IconoCasa /> },
  { ruta: '/bots', nombre: 'Jugar', icono: <IconoJugar /> },
]

export const SECCIONES_FUTURAS = { aprender: { ruta: '/cursos', nombre: 'Aprender', icono: <IconoLibro /> }, repertorio: { ruta: '/repertorio', nombre: 'Repertorio', icono: <IconoArbol /> } }

/** Lo secundario va en el menú "Más" (nota 5). */
export interface EntradaMas {
  nombre: string
  href?: string
  ruta?: string
  externo?: boolean
}

export function Marco(props: { actual: string; secciones: EntradaMenu[]; mas: EntradaMas[]; children: ReactNode }) {
  const [abierto, setAbierto] = useState(false)
  const activo = (r: string) => (r === '/' ? props.actual === '/' : props.actual.startsWith(r))
  return (
    <div className="marco">
      <nav className="navegacion" aria-label="Secciones">
        <a className="marca" href="#/">
          <span className="marca-pieza">♞</span>
          <span className="marca-texto">Mis aperturas</span>
        </a>
        {props.secciones.map((s) => (
          <a key={s.ruta} href={'#' + s.ruta} className={`nav-item ${activo(s.ruta) ? 'activo' : ''}`} aria-current={activo(s.ruta) ? 'page' : undefined}>
            {s.icono}
            <span>{s.nombre}</span>
          </a>
        ))}
        <button type="button" className="nav-item" onClick={() => setAbierto(!abierto)} aria-expanded={abierto} aria-haspopup="menu">
          <IconoMas />
          <span>Más</span>
        </button>
      </nav>
      {abierto && (
        <div className="menu-mas-fondo" onClick={() => setAbierto(false)}>
          <div className="menu-mas" role="menu" onClick={(e) => e.stopPropagation()}>
            {props.mas.map((m) => (
              <a
                key={m.nombre}
                role="menuitem"
                href={m.href ?? '#' + m.ruta}
                target={m.externo ? '_blank' : undefined}
                rel={m.externo ? 'noreferrer' : undefined}
                onClick={() => setAbierto(false)}
              >
                {m.nombre}
              </a>
            ))}
          </div>
        </div>
      )}
      <main className="contenido">{props.children}</main>
    </div>
  )
}
