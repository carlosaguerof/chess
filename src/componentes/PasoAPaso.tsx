import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Texto } from './Notacion.tsx'
import { TableroMini } from './TableroMini.tsx'
import { fotosDePasos, soloPeones } from '../curso/pasos.ts'
import { marcasDelPaso, marcasNuevas } from '../curso/marcas.ts'
import { posicion } from '../curso/textos.ts'
import type { VerDelMomento } from '../curso/ver.ts'
import type { PasoAPaso } from '../curso/tipos.ts'

/** La última jugada de una línea, para el amarillo. */
function ultimaDe(jugadas: string[]): [string, string] | undefined {
  if (!jugadas.length) return undefined
  const m = posicion(jugadas, jugadas.length - 1).move(jugadas.at(-1)!)
  return [m.from, m.to]
}

/**
 * "Ver paso a paso" (correcciones de la Caro-Kann, C3; puntos 2 y 3 del feedback de Carlos): las páginas de leer
 * guardan su texto y suman este botón. Abre una ventana con un paso por vista: una frase, y el tablero hace o muestra lo
 * que dice. Abajo, en las esquinas, Atrás (no en el primero) y Siguiente, que en el último dice "Salir". Un toque fuera
 * (o Esc) la cierra. Como la ventana de "Cómo funciona" (`ComoFunciona.tsx`).
 */
export function BotonPasoAPaso(props: { titulo: string; pa: PasoAPaso; inicio?: string[]; orientacion: 'white' | 'black'; clase?: string }) {
  return <BotonVentana {...props} texto="Ver paso a paso" testid="ver-paso-a-paso" />
}

/**
 * "Ver qué pasa" (2026-10-30): la misma ventana, para una frase que dice qué pasaría si se jugara otra cosa. El título es
 * la frase y el tablero empieza en la posición de la que habla, con su última jugada en amarillo.
 */
export function BotonVerQuePasa({ ver, orientacion }: { ver: VerDelMomento; orientacion: 'white' | 'black' }) {
  return <BotonVentana titulo={ver.titulo} pa={ver.pa} inicio={ver.inicio} orientacion={orientacion} texto="Ver qué pasa" testid="ver-que-pasa" verQuePasa />
}

interface PropsVentana {
  titulo: string
  pa: PasoAPaso
  inicio?: string[]
  orientacion: 'white' | 'black'
  verQuePasa?: boolean
}

function BotonVentana({ texto, testid, clase, ...props }: PropsVentana & { texto: string; testid: string; clase?: string }) {
  const [abierta, setAbierta] = useState(false)
  return (
    <>
      <button type="button" className={`boton secundario ${clase ?? ''}`} onClick={() => setAbierta(true)} data-testid={testid}>
        {texto}
      </button>
      {abierta && <VentanaPasoAPaso {...props} onCerrar={() => setAbierta(false)} />}
    </>
  )
}

function VentanaPasoAPaso({ titulo, pa, inicio, orientacion, verQuePasa, onCerrar }: PropsVentana & { onCerrar: () => void }) {
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
      const reinicio = pa.pasos[j]!.reinicio
      if (reinicio) return verQuePasa ? ultimaDe([...(inicio ?? []), ...reinicio]) : undefined
    }
    return verQuePasa ? ultimaDe(inicio ?? []) : undefined
  }
  // en una ventana con dos frases, el título sigue a la frase de la que hablan los pasos
  const tituloDe = (k: number) => pa.pasos.slice(0, k + 1).findLast((p) => p.titulo)?.titulo ?? titulo
  const titulos = pa.pasos.flatMap((p) => (p.titulo ? [p.titulo] : []))
  const foto = fotos[i]!
  const fen = pa.soloPeones ? soloPeones(foto.fen) : foto.fen

  return createPortal(
    <div className="dialogo-fondo" onClick={onCerrar} data-testid="paso-a-paso-fondo">
      <div className={`dialogo paso-a-paso ${verQuePasa ? 'ver-que-pasa' : ''}`} role="dialog" aria-modal="true" aria-label={`${titulo}, paso a paso`} onClick={(e) => e.stopPropagation()} data-testid="paso-a-paso" data-paso={i + 1}>
        {titulos.length > 1 ? (
          <>
            <p className="paso-a-paso-nota" data-testid="paso-a-paso-cual">
              Frase {titulos.indexOf(tituloDe(i)) + 1} de {titulos.length}
            </p>
            {/* las frases en la misma celda: la ventana mide la más larga, y los botones no se mueven bajo el dedo al cambiar */}
            <h2 className="titulos-paso">
              {titulos.map((t) => (
                <span key={t} className={t === tituloDe(i) ? undefined : 'titulo-oculto'} data-testid={t === tituloDe(i) ? 'paso-a-paso-titulo' : undefined}>
                  <Texto t={t} />
                </span>
              ))}
            </h2>
          </>
        ) : (
          <h2 data-testid="paso-a-paso-titulo">
            <Texto t={tituloDe(i)} />
          </h2>
        )}
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
