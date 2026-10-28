/**
 * Cliente UCI mínimo, igual en el navegador (Web Worker) y en Node (calibración).
 * Lo que cambia entre los dos es solo el "transporte": cómo se mandan comandos y se reciben líneas.
 */
export interface Transporte {
  enviar(comando: string): void
  alRecibir(cb: (linea: string) => void): void
  cerrar(): void
}

export interface Candidata {
  /** jugada en UCI ("e2e4") */
  uci: string
  /** evaluación en centipeones desde el lado que mueve; un mate se vuelve ±(32000 − 100·n) */
  cp: number
  /** mate en n (positivo: lo da quien mueve), o null */
  mate: number | null
  profundidad: number
  pv: string[]
}

export interface OpcionesAnalisis {
  profundidad?: number
  nodos?: number
  tiempoMs?: number
  multipv?: number
  /** si viene, se activa UCI_LimitStrength con este UCI_Elo (1320–3190 en Stockfish 19) */
  uciElo?: number | null
  /** borrar la memoria del motor (tabla hash) antes de buscar: cada jugada se piensa desde cero */
  limpiar?: boolean
}

export interface Analisis {
  candidatas: Candidata[]
  mejor: string | null
}

export const CP_MATE = 32000

export function cpDeMate(n: number): number {
  return n > 0 ? CP_MATE - 100 * n : -CP_MATE - 100 * n
}

/** Lee una línea "info ... multipv 2 score cp 34 ... pv e2e4 e7e5" */
export function leerInfo(linea: string): (Candidata & { multipv: number }) | null {
  if (!linea.startsWith('info ') || !linea.includes(' pv ')) return null
  const t = linea.split(' ')
  let profundidad = 0
  let multipv = 1
  let cp: number | null = null
  let mate: number | null = null
  let pv: string[] = []
  for (let i = 1; i < t.length; i++) {
    const k = t[i]
    if (k === 'depth') profundidad = Number(t[++i])
    else if (k === 'multipv') multipv = Number(t[++i])
    else if (k === 'score') {
      const tipo = t[++i]
      const v = Number(t[++i])
      if (tipo === 'cp') cp = v
      else if (tipo === 'mate') mate = v
      // "lowerbound"/"upperbound" se ignoran: el valor ya se leyó
    } else if (k === 'pv') {
      pv = t.slice(i + 1)
      break
    }
  }
  if (pv.length === 0 || (cp === null && mate === null)) return null
  return { uci: pv[0]!, cp: mate !== null ? cpDeMate(mate) : (cp as number), mate, profundidad, pv, multipv }
}

export class MotorUci {
  version = ''
  private cola: Promise<unknown> = Promise.resolve()
  private oyente: ((linea: string) => void) | null = null
  private ultimas = new Map<string, string>()
  private transporte: Transporte

  constructor(transporte: Transporte) {
    this.transporte = transporte
    transporte.alRecibir((linea) => this.oyente?.(linea))
  }

  private esperar(condicion: (linea: string) => boolean, alLeer?: (linea: string) => void): Promise<string> {
    return new Promise((resolver) => {
      this.oyente = (linea) => {
        alLeer?.(linea)
        if (condicion(linea)) {
          this.oyente = null
          resolver(linea)
        }
      }
    })
  }

  /** Arranca el motor y devuelve su nombre y versión ("Stockfish 19 Lite WASM"). */
  iniciar(): Promise<string> {
    return this.enCola(async () => {
      const listo = this.esperar(
        (l) => l === 'uciok',
        (l) => {
          if (l.startsWith('id name ')) this.version = l.slice(8)
        },
      )
      this.transporte.enviar('uci')
      await listo
      await this.listo()
      return this.version
    })
  }

  private async listo() {
    const r = this.esperar((l) => l === 'readyok')
    this.transporte.enviar('isready')
    await r
  }

  private opcion(nombre: string, valor: string | number | boolean) {
    const v = String(valor)
    if (this.ultimas.get(nombre) === v) return
    this.ultimas.set(nombre, v)
    this.transporte.enviar(`setoption name ${nombre} value ${v}`)
  }

  private enCola<T>(trabajo: () => Promise<T>): Promise<T> {
    const r = this.cola.then(trabajo, trabajo)
    this.cola = r.catch(() => undefined)
    return r
  }

  nuevaPartida(): Promise<void> {
    return this.enCola(async () => {
      this.transporte.enviar('ucinewgame')
      await this.listo()
    })
  }

  /** Analiza una posición: las mejores `multipv` jugadas con su evaluación. */
  analizar(fen: string, o: OpcionesAnalisis): Promise<Analisis> {
    return this.enCola(async () => {
      this.opcion('MultiPV', o.multipv ?? 1)
      if (o.uciElo) {
        this.opcion('UCI_LimitStrength', true)
        this.opcion('UCI_Elo', Math.max(1320, Math.min(3190, Math.round(o.uciElo))))
      } else this.opcion('UCI_LimitStrength', false)
      if (o.limpiar) this.transporte.enviar('setoption name Clear Hash')
      const porLinea = new Map<number, Candidata>()
      const fin = this.esperar(
        (l) => l.startsWith('bestmove'),
        (l) => {
          const c = leerInfo(l)
          if (c) {
            const { multipv, ...resto } = c
            porLinea.set(multipv, resto)
          }
        },
      )
      this.transporte.enviar(`position fen ${fen}`)
      if (o.profundidad) this.transporte.enviar(`go depth ${o.profundidad}`)
      else if (o.nodos) this.transporte.enviar(`go nodes ${o.nodos}`)
      else this.transporte.enviar(`go movetime ${o.tiempoMs ?? 100}`)
      const linea = await fin
      const mejor = linea.split(' ')[1]
      const candidatas = [...porLinea.entries()].sort((a, b) => a[0] - b[0]).map(([, c]) => c)
      return { candidatas, mejor: mejor && mejor !== '(none)' ? mejor : null }
    })
  }

  cerrar() {
    this.transporte.cerrar()
  }
}
