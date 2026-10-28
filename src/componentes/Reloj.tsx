import { formato } from '../reloj/reloj.ts'

/** El reloj junto a su jugador (T14). */
export function Reloj({ ms, corriendo, testid }: { ms: number; corriendo: boolean; testid: string }) {
  return (
    <span className={`reloj ${corriendo ? 'corriendo' : ''} ${ms < 20_000 ? 'poco' : ''}`} data-testid={testid} role="timer" aria-live="off">
      {formato(ms)}
    </span>
  )
}
