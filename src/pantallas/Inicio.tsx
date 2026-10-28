import { useState } from 'react'
import { recomendado, personajePorId } from '../bots/personajes.ts'
import { Avatar } from '../componentes/Avatar.tsx'
import { Dialogo } from '../componentes/Dialogo.tsx'
import { empezarPartida, partidaEnCurso } from '../partida/usePartidaBot.ts'
import { navegar } from '../ruta.ts'

export function Inicio() {
  const bot = recomendado()
  const enCurso = partidaEnCurso()
  const rival = personajePorId(enCurso?.botId)
  const [confirmar, setConfirmar] = useState(false)
  const jugar = () => {
    empezarPartida(bot.id, 'w')
    navegar('/partida')
  }
  return (
    <div className="inicio">
      {enCurso && rival && (
        <a className="tarjeta en-curso" href="#/partida" data-testid="partida-en-curso">
          <Avatar personaje={rival} tam={40} />
          <div>
            <strong>Partida en curso contra {rival.nombre}</strong>
            <span className="apagado">{Math.ceil(enCurso.jugadas.length / 2)} jugadas</span>
          </div>
          <span className="boton primario chico">Continuar</span>
        </a>
      )}
      <section className="tarjeta recomendado" aria-labelledby="titulo-recomendado">
        <p className="etiqueta" id="titulo-recomendado">
          Juega contra un bot de tu nivel
        </p>
        <div className="recomendado-bot">
          <Avatar personaje={bot} tam={96} />
          <div>
            <h1>
              {bot.nombre} <span className="nivel">{bot.elo}</span>
            </h1>
            <p className="frase">“{bot.frase}”</p>
          </div>
        </div>
        <button type="button" className="boton primario grande" data-testid="jugar-recomendado" onClick={() => (enCurso ? setConfirmar(true) : jugar())}>
          Jugar
        </button>
        <a className="enlace" href="#/bots">
          Escoger otro bot o color
        </a>
      </section>
      {confirmar && (
        <Dialogo
          titulo="¿Empezar otra partida?"
          confirmar="Empezar otra"
          peligro
          onConfirmar={() => {
            setConfirmar(false)
            jugar()
          }}
          onCancelar={() => setConfirmar(false)}
        >
          Tienes una partida en curso contra {rival?.nombre}. Si empiezas otra, esa se pierde.
        </Dialogo>
      )}
    </div>
  )
}
