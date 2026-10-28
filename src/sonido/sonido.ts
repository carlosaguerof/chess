import { guardar, leer } from '../estado/almacen.ts'

/** R6: sonido al mover y al capturar, generado con el navegador (sin archivos de fuera). Apagado por defecto. */
const CLAVE = 'sonido'

export function sonidoPrendido(): boolean {
  return leer<boolean>(CLAVE, false)
}

export function prenderSonido(v: boolean): void {
  guardar(CLAVE, v)
}

let ctx: AudioContext | null = null

export function sonar(tipo: 'mover' | 'capturar'): void {
  if (!sonidoPrendido()) return
  try {
    ctx ??= new AudioContext()
    // Safari deja el audio suspendido hasta que se reanuda desde un toque: cada jugada mía es un toque
    if (ctx.state === 'suspended') void ctx.resume()
    const o = ctx.createOscillator()
    const g = ctx.createGain()
    o.type = 'triangle'
    o.frequency.value = tipo === 'capturar' ? 220 : 440
    g.gain.setValueAtTime(0.0001, ctx.currentTime)
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (tipo === 'capturar' ? 0.18 : 0.09))
    o.connect(g).connect(ctx.destination)
    o.start()
    o.stop(ctx.currentTime + 0.2)
  } catch {
    /* sin audio: no pasa nada */
  }
}
