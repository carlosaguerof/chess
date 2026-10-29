/** ¿La página está abierta como app (desde la pantalla de inicio) y no en una pestaña de Safari? */
export function abiertaComoApp(): boolean {
  try {
    return window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true
  } catch {
    return false
  }
}
