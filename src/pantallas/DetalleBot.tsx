import { useState } from 'react'
import { personajePorId, NOMBRE_TEMPERAMENTO } from '../bots/personajes.ts'
import { nombreApertura } from '../bots/nombres-aperturas.ts'
import { Avatar } from '../componentes/Avatar.tsx'
import { Dialogo } from '../componentes/Dialogo.tsx'
import { empezarPartida, partidaEnCurso } from '../partida/usePartidaBot.ts'
import { navegar } from '../ruta.ts'
import { IconoAtras } from '../componentes/Iconos.tsx'

type Color = 'w' | 'azar' | 'b'

export function DetalleBot({ id }: { id: string }) {
  const bot = personajePorId(id)
  const [color, setColor] = useState<Color>('w')
  const [confirmar, setConfirmar] = useState(false)
  if (!bot) return <p>No encontré a ese bot. <a href="#/bots">Ver todos</a></p>
  const enCurso = partidaEnCurso()
  const jugar = () => {
    empezarPartida(bot.id, color)
    navegar('/partida')
  }
  return (
    <div className="detalle-bot">
      <a className="volver" href="#/bots">
        <IconoAtras /> Bots
      </a>
      <div className="detalle-cabeza">
        <Avatar personaje={bot} tam={128} />
        <h1>
          {bot.nombre} <span className="nivel">{bot.elo}</span>
        </h1>
        <p className="frase">“{bot.frase}”</p>
        <p className="estilo">
          <span className="chip">{NOMBRE_TEMPERAMENTO[bot.temperamento]}</span>
          Con blancas: {bot.estilo.blancas.map(nombreApertura).join(', ')} · Con negras: {bot.estilo.negras.map(nombreApertura).join(', ')}
        </p>
      </div>
      <div className="selector-color" role="radiogroup" aria-label="Tu color">
        {(
          [
            ['w', 'Blancas'],
            ['azar', 'Al azar'],
            ['b', 'Negras'],
          ] as [Color, string][]
        ).map(([c, nombre]) => (
          <button key={c} type="button" role="radio" aria-checked={color === c} className={color === c ? 'activo' : ''} onClick={() => setColor(c)} data-testid={`color-${c}`}>
            <span className={`ficha ficha-${c}`} aria-hidden="true" />
            {nombre}
          </button>
        ))}
      </div>
      <button type="button" className="boton primario grande" data-testid="jugar" onClick={() => (enCurso ? setConfirmar(true) : jugar())}>
        Jugar
      </button>
      {confirmar && (
        <Dialogo titulo="¿Empezar otra partida?" confirmar="Empezar otra" peligro onConfirmar={jugar} onCancelar={() => setConfirmar(false)}>
          Tienes una partida en curso. Si empiezas otra, esa se pierde.
        </Dialogo>
      )}
    </div>
  )
}
