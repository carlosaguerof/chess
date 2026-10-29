import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Texto } from './Notacion.tsx'
import { TableroMini } from './TableroMini.tsx'
import { fotosDePasos, soloPeones } from '../curso/pasos.ts'
import { marcasDelPaso, marcasNuevas } from '../curso/marcas.ts'
import type { PasoAPaso } from '../curso/tipos.ts'

/**
 * "Ver paso a paso" (correcciones de la Caro-Kann, C3; puntos 2 y 3 del feedback de Carlos): las páginas de leer
 * guardan su texto y suman este botón. Abre una ventana con un paso por vista: una frase, y el tablero hace o muestra lo
 * que dice. Abajo, en las esquinas, Atrás (no en el primero) y Siguiente, que en el último dice "Salir". Un toque fuera
 * (o Esc) la cierra. Como la ventana de "Cómo funciona" (`ComoFunciona.tsx`).
 */
export function BotonPasoAPaso(props: { titulo: string; pa: PasoAPaso; inicio?: string[]; orientacion: 'white' | 'black'; clase?: string }) {
  const [abierta, setAbierta] = useState(false)
  return (
    <>
      <button type="button" className={`boton secundario ${props.clase ?? ''}`} onClick={() => setAbierta(true)} data-testid="ver-paso-a-paso">
        Ver paso a paso
      </button>
      {abierta && <VentanaPasoAPaso {...props} onCerrar={() => setAbierta(false)} />}
    </>
  )
}

function VentanaPasoAPaso({ titulo, pa, inicio, orientacion, onCerrar }: { titulo: string; pa: PasoAPaso; inicio?: string[]; orientacion: 'white' | 'black'; onCerrar: () => void }) {
  const [i, setI] = useState(0)
  const fotos = useMemo(() => fotosDePasos(pa, inicio), [pa, inicio])
  const ultimo = i === pa.pasos.length - 1
  const siguiente = useRef<HTMLButtonElement>(null)
  useEffect(() => siguiente.current?.focus(), [i])
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    window.addEventListener('keydown', tecla)
    return () => window.removeEventListener('keydown', tecla)
  }, [onCerrar])

  // la última jugada en amarillo: la de este paso, o la del último paso que movió (el que solo explica no la borra)
  const ultimaJugada = (k: number): [string, string] | undefined => {
    for (let j = k; j >= 0; j--) {
      const m = fotos[j]!.hechas.at(-1)
      if (m) return [m.from, m.to]
      if (pa.pasos[j]!.reinicio) return undefined
    }
    return undefined
  }
  const foto = fotos[i]!
  const fen = pa.soloPeones ? soloPeones(foto.fen) : foto.fen

  return createPortal(
    <div className="dialogo-fondo" onClick={onCerrar} data-testid="paso-a-paso-fondo">
      <div className="dialogo paso-a-paso" role="dialog" aria-modal="true" aria-label={`${titulo}, paso a paso`} onClick={(e) => e.stopPropagation()} data-testid="paso-a-paso" data-paso={i + 1}>
        <h2>
          <Texto t={titulo} />
        </h2>
        {pa.ilustrativo && <p className="paso-a-paso-nota">Es una ilustración: el rival no contesta cada jugada.</p>}
        {/* C5: las marcas de la frase, que se acumulan hasta que el tablero vuelve a mover (detrás del interruptor) */}
        <TableroMini fen={fen} orientacion={orientacion} ultima={ultimaJugada(i)} testid="tablero-paso-a-paso" coordenadas marcas={marcasNuevas() ? marcasDelPaso(pa, i) : undefined} />
        <p className="paso-a-paso-frase" data-testid="paso-a-paso-frase" aria-live="polite">
          <Texto t={pa.pasos[i]!.frase} />
        </p>
        <div className="como-funciona-botones">
          {i > 0 ? (
            <button type="button" className="boton secundario" onClick={() => setI(i - 1)} data-testid="pap-atras">
              Atrás
            </button>
          ) : (
            <span />
          )}
          <span className="apagado como-funciona-cuenta">
            {i + 1} de {pa.pasos.length}
          </span>
          <button type="button" className="boton primario" ref={siguiente} onClick={() => (ultimo ? onCerrar() : setI(i + 1))} data-testid="pap-siguiente">
            {ultimo ? 'Salir' : 'Siguiente'}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
