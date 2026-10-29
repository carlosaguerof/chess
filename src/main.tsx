import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import './estilos.css'
import { App } from './App.tsx'
import { migrarAlCursoCaroKann, migrarAlModeloDeFavoritas } from './aprender/migracion.ts'

// Nota 1: lo guardado pasa al modelo de favoritas (una sola vez)
migrarAlModeloDeFavoritas()
migrarAlCursoCaroKann()

createRoot(document.getElementById('raiz')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// R1: en la app construida, el service worker guarda lo que se usa para que funcione sin internet
if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL }).catch(() => undefined)
  })
}
