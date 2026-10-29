import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { IconoInfo } from './Iconos.tsx'

/**
 * "Cómo funciona" (Nota 1 de los ajustes de la app, 2026-10-29): un ⓘ junto al título. Al tocarlo, un globito con un
 * enlace; al tocar el enlace, una ventana con la explicación en pasos cortos, uno por vista, con Atrás y Siguiente
 * abajo (en el último, Salir). Un toque fuera cierra el globito y la ventana.
 */
export interface Explicacion {
  /** para el testid: "repaso", "refuerza" */
  id: string
  titulo: string
  enlace: string
  pasos: string[]
}

/** Cómo funciona el Repaso de hoy: lo que hace `repaso/repaso.ts`, en palabras de usuario. */
export const COMO_FUNCIONA_REPASO: Explicacion = {
  id: 'repaso',
  titulo: 'Cómo funciona el Repaso de hoy',
  enlace: 'Ver cómo funciona el Repaso de hoy',
  pasos: [
    'Va por lección: cada variante que aprendes es una lección.',
    'Una lección entra al repaso cuando la terminas por primera vez.',
    'Si la contestas sin ayuda, vuelve cada vez más tarde: a los 1, 3, 7, 14 y 30 días.',
    'Si fallas o pides Pista o Respuesta, vuelve mañana.',
    'Si te atrasas, te espera. El siguiente plazo cuenta desde el día en que la repasas.',
    'Puedes apagarlo en Ajustes.',
    'Es opcional: úsalo si te sirve, como gustes.',
  ],
}

/** Cómo funciona Refuerza: lo que hacen `registro/` y `registro/refuerza.ts`, en palabras de usuario. */
export const COMO_FUNCIONA_REFUERZA: Explicacion = {
  id: 'refuerza',
  titulo: 'Cómo funciona Refuerza',
  enlace: 'Ver cómo funciona Refuerza',
  pasos: [
    'Cada jugada que fallas se guarda: en los cursos, en el repaso, en las partidas con la guía y aquí mismo.',
    'Pedir Pista o Respuesta también cuenta como fallo.',
    'Aquí salen primero las que más fallas, con cuántas veces las has fallado.',
    'Practicas cada jugada desde su posición: el tablero queda justo antes de ella.',
    'Es opcional: úsalo si te sirve, como gustes.',
  ],
}

/** El ⓘ con su globito y su ventana. */
export function Info({ explicacion }: { explicacion: Explicacion }) {
  // dónde está el ⓘ en la pantalla cuando el globito está abierto
  const [globo, setGlobo] = useState<DOMRect | null>(null)
  const [ventana, setVentana] = useState(false)
  return (
    <span className="info">
      <button
        type="button"
        className="info-boton"
        aria-label={explicacion.titulo}
        aria-expanded={!!globo}
        onClick={(e) => {
          // dentro de una tarjeta que es enlace, el ⓘ no la abre
          e.preventDefault()
          e.stopPropagation()
          setGlobo(globo ? null : e.currentTarget.getBoundingClientRect())
        }}
        data-testid={`info-${explicacion.id}`}
      >
        <IconoInfo />
      </button>
      {globo &&
        createPortal(
          <div className="globo-fondo" onClick={() => setGlobo(null)} data-testid="globo-fondo">
            <Globo
              explicacion={explicacion}
              junto={globo}
              onVer={() => {
                setGlobo(null)
                setVentana(true)
              }}
            />
          </div>,
          document.body,
        )}
      {ventana && <VentanaPasos explicacion={explicacion} onCerrar={() => setVentana(false)} />}
    </span>
  )
}

/** El globito, debajo del ⓘ que lo abrió, sin salirse de la pantalla (16 px de margen a cada lado). */
function Globo({ explicacion, junto, onVer }: { explicacion: Explicacion; junto: DOMRect; onVer: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null)
  useEffect(() => {
    const ancho = ref.current?.offsetWidth ?? 240
    const left = Math.min(Math.max(16, junto.left + junto.width / 2 - ancho / 2), window.innerWidth - ancho - 16)
    setPos({ top: junto.bottom + 8, left })
  }, [junto])
  return (
    <div ref={ref} className="globo" role="dialog" aria-label={explicacion.titulo} style={pos ? { top: pos.top, left: pos.left } : { visibility: 'hidden' }} onClick={(e) => e.stopPropagation()} data-testid="globo">
      <button type="button" className="enlace-chico" onClick={onVer} data-testid={`ver-como-funciona-${explicacion.id}`}>
        {explicacion.enlace}
      </button>
    </div>
  )
}

/** La ventana con los pasos: uno por vista; Atrás a la izquierda (no en el primero) y Siguiente a la derecha (Salir en el último). */
function VentanaPasos({ explicacion, onCerrar }: { explicacion: Explicacion; onCerrar: () => void }) {
  const [i, setI] = useState(0)
  const ultimo = i === explicacion.pasos.length - 1
  const siguiente = useRef<HTMLButtonElement>(null)
  useEffect(() => siguiente.current?.focus(), [i])
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])
  return createPortal(
    <div className="dialogo-fondo" onClick={onCerrar} data-testid="como-funciona-fondo">
      <div className="dialogo como-funciona" role="dialog" aria-modal="true" aria-label={explicacion.titulo} onClick={(e) => e.stopPropagation()} data-testid="como-funciona" data-paso={i + 1}>
        <h2>{explicacion.titulo}</h2>
        <p className="como-funciona-paso" data-testid="como-funciona-paso">
          {explicacion.pasos[i]}
        </p>
        <div className="como-funciona-botones">
          {i > 0 ? (
            <button type="button" className="boton secundario" onClick={() => setI(i - 1)} data-testid="paso-atras">
              Atrás
            </button>
          ) : (
            <span />
          )}
          <span className="apagado como-funciona-cuenta">
            {i + 1} de {explicacion.pasos.length}
          </span>
          <button type="button" className="boton primario" ref={siguiente} onClick={() => (ultimo ? onCerrar() : setI(i + 1))} data-testid="paso-siguiente">
            {ultimo ? 'Salir' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
