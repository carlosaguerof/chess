import { useEffect, useState } from 'react'

/** Rutas con "#/" para que recargar deje la misma pantalla y funcione en cualquier servidor estático. */
export interface Ruta {
  /** "/", "/bots", "/bot/brisa", ... */
  camino: string
  partes: string[]
  consulta: URLSearchParams
}

export function leerRuta(hash = window.location.hash): Ruta {
  const sinGato = hash.replace(/^#/, '') || '/'
  const [camino = '/', q = ''] = sinGato.split('?')
  return { camino, partes: camino.split('/').filter(Boolean), consulta: new URLSearchParams(q) }
}

export function navegar(camino: string, reemplazar = false) {
  const destino = '#' + camino
  if (reemplazar) window.history.replaceState(null, '', destino)
  else window.history.pushState(null, '', destino)
  window.dispatchEvent(new HashChangeEvent('hashchange'))
}

export function useRuta(): Ruta {
  const [ruta, setRuta] = useState(leerRuta)
  useEffect(() => {
    const cambio = () => setRuta(leerRuta())
    window.addEventListener('hashchange', cambio)
    window.addEventListener('popstate', cambio)
    // por si la ruta cambió antes de empezar a escuchar (un efecto de un hijo corre antes que este)
    cambio()
    return () => {
      window.removeEventListener('hashchange', cambio)
      window.removeEventListener('popstate', cambio)
    }
  }, [])
  return ruta
}
