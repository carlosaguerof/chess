import { useCallback, useEffect, useRef, useState } from 'react'
import { CLAVES, guardar, leer } from '../estado/almacen.ts'
import { ajedrezDe, conJugada, deshacer as deshacerModelo, rendirse as rendirseModelo, nuevaPartida, type PartidaGuardada } from './modelo.ts'
import { personajePorId } from '../bots/personajes.ts'
import { nivelDe } from '../motor/niveles.ts'
import { jugadaDelBot, esperaDelBot, type FuenteJugadas } from '../motor/bot.ts'
import { obtenerMotor, estadoMotor, alCambiarMotor, type EstadoMotor } from '../motor/navegador.ts'
import { libroDe } from '../bots/libros.ts'
import { lineasDeLibro } from '../bots/fuente-libros.ts'
import { intentar, type ColorCorto } from '../ajedrez/reglas.ts'

export function partidaGuardada(): PartidaGuardada | null {
  return leer<PartidaGuardada | null>(CLAVES.partida, null)
}

export function empezarPartida(botId: string, color: ColorCorto | 'azar', fen?: string): PartidaGuardada {
  const c: ColorCorto = color === 'azar' ? (Math.random() < 0.5 ? 'w' : 'b') : color
  const p = nuevaPartida(botId, c, fen)
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
export function usePartidaBot(opciones: { misLineas?: () => FuenteJugadas | null } = {}) {
  const [partida, setPartida] = useState<PartidaGuardada | null>(partidaGuardada)
  const [pensando, setPensando] = useState(false)
  const [motor, setMotor] = useState<EstadoMotor>(estadoMotor())
  const [reintento, setReintento] = useState(0)
  const opcionesRef = useRef(opciones)
  opcionesRef.current = opciones

  useEffect(() => alCambiarMotor(setMotor), [])

  const cambiar = useCallback((p: PartidaGuardada | null) => {
    setPartida(p)
    if (p) guardar(CLAVES.partida, p)
  }, [])

  const bot = personajePorId(partida?.botId)
  const chess = partida ? ajedrezDe(partida) : null
  const turnoBot = !!partida && !partida.fin && !!chess && chess.turn() !== partida.colorHumano

  // el turno del bot
  useEffect(() => {
    if (!partida || !bot || !turnoBot) return
    let vigente = true
    setPensando(true)
    const t0 = performance.now()
    const colorBot: ColorCorto = partida.colorHumano === 'w' ? 'b' : 'w'
    const c = ajedrezDe(partida)
    jugadaDelBot(c, nivelDe(bot.elo), obtenerMotor, { misLineas: opcionesRef.current.misLineas?.() ?? null, libro: libroDe(bot, colorBot, lineasDeLibro) })
      .then((j) => {
        if (!vigente || !j) return
        const espera = esperaDelBot(performance.now() - t0)
        setTimeout(() => {
          if (!vigente) return
          setPensando(false)
          cambiar(conJugada(partida, j.uci))
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
    (uci: string) => {
      if (!partida || partida.fin || pensando) return
      const c = ajedrezDe(partida)
      if (c.turn() !== partida.colorHumano) return
      if (!intentar(c, uci)) return
      cambiar(conJugada(partida, uci))
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
    reemplazar: cambiar,
  }
}
