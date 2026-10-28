import { useCallback, useEffect, useRef, useState } from 'react'
import { CLAVES, guardar, leer } from '../estado/almacen.ts'
import { ajedrezDe, conJugada, deshacer as deshacerModelo, rendirse as rendirseModelo, nuevaPartida, OPCIONES_POR_DEFECTO, type OpcionesPartida, type PartidaGuardada } from './modelo.ts'
import { personajePorId } from '../bots/personajes.ts'
import { nivelDe } from '../motor/niveles.ts'
import { jugadaDelBot, esperaDelBot, type FuenteJugadas } from '../motor/bot.ts'
import { obtenerMotor, estadoMotor, alCambiarMotor, type EstadoMotor } from '../motor/navegador.ts'
import { libroDe } from '../bots/libros.ts'
import { lineasDeLibro } from '../bots/fuente-libros.ts'
import { intentar, type ColorCorto } from '../ajedrez/reglas.ts'
import { arrancar, finPorTiempo, pausar, restante, seAcabo } from '../reloj/reloj.ts'

export function partidaGuardada(): PartidaGuardada | null {
  const p = leer<PartidaGuardada | null>(CLAVES.partida, null)
  if (!p) return null
  // al volver a abrir, el reloj sigue donde se guardó por última vez (no cuenta el tiempo que la app estuvo cerrada)
  const reloj = p.reloj ? { ...p.reloj, corriendo: null, desde: null } : null
  // partidas guardadas antes de la guía: se completan
  return { ...p, reloj, opciones: p.opciones ?? OPCIONES_POR_DEFECTO, ayudas: p.ayudas ?? { pista: 0, respuesta: 0 } }
}

/** Lo último que escogí al empezar (guía, mis líneas) se recuerda. */
export function opcionesRecordadas(): OpcionesPartida {
  return leer<OpcionesPartida>('opciones-partida', OPCIONES_POR_DEFECTO)
}

/** El tiempo que escogí la última vez (la primera vez, "Sin tiempo"). */
export function tiempoRecordado(): string {
  return leer<string>('tiempo', 'sin')
}

export function empezarPartida(botId: string, color: ColorCorto | 'azar', fen?: string, opciones: OpcionesPartida = opcionesRecordadas(), tiempo: string = tiempoRecordado()): PartidaGuardada {
  const c: ColorCorto = color === 'azar' ? (Math.random() < 0.5 ? 'w' : 'b') : color
  guardar('opciones-partida', opciones)
  guardar('tiempo', tiempo)
  const p = nuevaPartida(botId, c, fen, opciones, tiempo)
  guardar(CLAVES.partida, p)
  return p
}

/** ¿Hay una partida a medias (empezada y sin terminar)? */
export function partidaEnCurso(): PartidaGuardada | null {
  const p = partidaGuardada()
  return p && !p.fin && p.jugadas.length > 0 ? p : null
}

/**
 * La partida contra el bot: guarda cada cambio en el navegador (recargar la deja igual),
 * y cuando le toca al bot, piensa (en el Web Worker) y juega entre 0.4 y 1.2 s después.
 */
export function usePartidaBot(opciones: { misLineas?: (p: PartidaGuardada) => FuenteJugadas | null } = {}) {
  const [partida, setPartida] = useState<PartidaGuardada | null>(partidaGuardada)
  const [pensando, setPensando] = useState(false)
  const [motor, setMotor] = useState<EstadoMotor>(estadoMotor())
  const [reintento, setReintento] = useState(0)
  const opcionesRef = useRef(opciones)
  opcionesRef.current = opciones
  const ultimaRef = useRef(partida)
  ultimaRef.current = partida

  useEffect(() => alCambiarMotor(setMotor), [])

  // ---- el reloj (T14)
  const [ahora, setAhora] = useState(() => Date.now())
  const relojActivo = !!partida?.reloj && !partida.fin
  useEffect(() => {
    if (!partida?.reloj || partida.fin) return
    const p = partida
    const turno = ajedrezDe(p).turn()
    // corre el reloj del que tiene el turno, solo con la app a la vista y sin la pausa por desvío
    // (si el bot jugó con la app oculta, su jugada arrancó mi reloj: aquí se vuelve a pausar)
    const debeCorrer = document.visibilityState === 'visible' && !p.pausa
    if (!debeCorrer && p.reloj!.corriendo) {
      cambiar({ ...p, reloj: pausar(p.reloj!, Date.now()) })
      return
    }
    if (debeCorrer && p.reloj!.corriendo !== turno) {
      cambiar({ ...p, reloj: arrancar(p.reloj!, turno, Date.now()) })
      return
    }
    const t = setInterval(() => {
      const n = Date.now()
      setAhora(n)
      const sin = seAcabo(ultimaRef.current!.reloj!, n)
      if (sin) {
        const actual = ultimaRef.current!
        cambiar({ ...actual, reloj: pausar(actual.reloj!, n), fin: finPorTiempo(ajedrezDe(actual), sin), pausa: null })
      }
    }, 100)
    const guardarCada = setInterval(() => {
      const actual = ultimaRef.current
      if (actual?.reloj?.corriendo) guardar(CLAVES.partida, { ...actual, reloj: { ...pausar(actual.reloj, Date.now()), corriendo: actual.reloj.corriendo, desde: Date.now() } })
    }, 1000)
    const alOcultar = () => {
      const actual = ultimaRef.current
      if (!actual?.reloj || actual.fin) return
      if (document.visibilityState === 'hidden') cambiar({ ...actual, reloj: pausar(actual.reloj, Date.now()) })
      else if (!actual.pausa) cambiar({ ...actual, reloj: arrancar(actual.reloj, ajedrezDe(actual).turn(), Date.now()) })
    }
    const alSalir = () => {
      const actual = ultimaRef.current
      if (actual?.reloj && !actual.fin) guardar(CLAVES.partida, { ...actual, reloj: pausar(actual.reloj, Date.now()) })
    }
    document.addEventListener('visibilitychange', alOcultar)
    window.addEventListener('pagehide', alSalir)
    return () => {
      clearInterval(t)
      clearInterval(guardarCada)
      document.removeEventListener('visibilitychange', alOcultar)
      window.removeEventListener('pagehide', alSalir)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partida?.id, partida?.jugadas.length, partida?.fin, partida?.reloj?.corriendo, partida?.pausa])

  const cambiar = useCallback((p: PartidaGuardada | null) => {
    setPartida(p)
    if (p) guardar(CLAVES.partida, p)
  }, [])

  const bot = personajePorId(partida?.botId)
  const chess = partida ? ajedrezDe(partida) : null
  const turnoBot = !!partida && !partida.fin && !partida.pausa && !!chess && chess.turn() !== partida.colorHumano

  // el turno del bot
  useEffect(() => {
    if (!partida || !bot || !turnoBot) return
    let vigente = true
    setPensando(true)
    const t0 = performance.now()
    const colorBot: ColorCorto = partida.colorHumano === 'w' ? 'b' : 'w'
    const c = ajedrezDe(partida)
    jugadaDelBot(c, nivelDe(bot.elo), obtenerMotor, { misLineas: partida.opciones.misLineas ? (opcionesRef.current.misLineas?.(partida) ?? null) : null, libro: libroDe(bot, colorBot, lineasDeLibro) }, Math.random, bot.temperamento)
      .then((j) => {
        if (!vigente || !j) return
        const espera = esperaDelBot(performance.now() - t0)
        setTimeout(() => {
          if (!vigente) return
          setPensando(false)
          // sobre la partida más reciente (p. ej. si volteé el tablero mientras pensaba)
          const ahora = ultimaRef.current ?? partida
          if (ahora.id !== partida.id || ahora.jugadas.length !== partida.jugadas.length) return
          cambiar(conJugada(ahora, j.uci))
        }, espera)
      })
      .catch(() => {
        if (vigente) setPensando(false)
      })
    return () => {
      vigente = false
      setPensando(false)
    }
    // se vuelve a pensar solo si cambió la partida (otra jugada, deshacer) o se pidió reintentar
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [partida?.id, partida?.jugadas.length, turnoBot, reintento])

  const jugar = useCallback(
    (uci: string, extra?: (p: PartidaGuardada) => Partial<PartidaGuardada>) => {
      if (!partida || partida.fin || pensando || partida.pausa) return
      const c = ajedrezDe(partida)
      if (c.turn() !== partida.colorHumano) return
      if (!intentar(c, uci)) return
      const nueva = conJugada(partida, uci)
      cambiar({ ...nueva, ...(extra ? extra(nueva) : {}) })
    },
    [partida, pensando, cambiar],
  )

  const tiempos = partida?.reloj ? { w: restante(partida.reloj, 'w', ahora), b: restante(partida.reloj, 'b', ahora), corriendo: partida.reloj.corriendo } : null

  return {
    partida,
    bot,
    chess,
    tiempos,
    relojActivo,
    pensando,
    turnoBot,
    motor,
    jugar,
    deshacer: () => partida && !pensando && cambiar(deshacerModelo(partida)),
    rendirse: () => partida && cambiar(rendirseModelo(partida)),
    voltear: () => partida && cambiar({ ...partida, orientacion: partida.orientacion === 'white' ? 'black' : 'white' }),
    reintentarMotor: () => setReintento((r) => r + 1),
    /** decidí seguir después de desviarme: el bot ya puede contestar */
    seguir: () => partida && cambiar({ ...partida, pausa: null }),
    /** pedí Pista o Respuesta (cuenta para las estrellas) */
    contarAyuda: (tipo: 'pista' | 'respuesta') => partida && cambiar({ ...partida, ayudas: { ...partida.ayudas, [tipo]: partida.ayudas[tipo] + 1 } }),
    reemplazar: cambiar,
  }
}
