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

export function partidaGuardada(): PartidaGuardada | null {
  const p = leer<PartidaGuardada | null>(CLAVES.partida, null)
  // partidas guardadas antes de la guía: se completan
  return p ? { ...p, opciones: p.opciones ?? OPCIONES_POR_DEFECTO, ayudas: p.ayudas ?? { pista: 0, respuesta: 0 } } : null
}

/** Lo último que escogí al empezar (guía, mis líneas) se recuerda. */
export function opcionesRecordadas(): OpcionesPartida {
  return leer<OpcionesPartida>('opciones-partida', OPCIONES_POR_DEFECTO)
}

export function empezarPartida(botId: string, color: ColorCorto | 'azar', fen?: string, opciones: OpcionesPartida = opcionesRecordadas()): PartidaGuardada {
  const c: ColorCorto = color === 'azar' ? (Math.random() < 0.5 ? 'w' : 'b') : color
  guardar('opciones-partida', opciones)
  const p = nuevaPartida(botId, c, fen, opciones)
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
    jugadaDelBot(c, nivelDe(bot.elo), obtenerMotor, { misLineas: partida.opciones.misLineas ? (opcionesRef.current.misLineas?.(partida) ?? null) : null, libro: libroDe(bot, colorBot, lineasDeLibro) })
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

  return {
    partida,
    bot,
    chess,
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
