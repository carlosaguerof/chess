import { useState } from 'react'
import { botParaJugar, personajePorId } from '../bots/personajes.ts'
import { Avatar } from '../componentes/Avatar.tsx'
import { Dialogo } from '../componentes/Dialogo.tsx'
import { empezarPartida, partidaEnCurso } from '../partida/usePartidaBot.ts'
import { navegar } from '../ruta.ts'
import { leerProgreso } from '../repertorio/estado.ts'
import { cursos } from '../cursos/datos.ts'
import { leerRegistro } from '../registro/almacen-registro.ts'
import { dia, leerRepaso, minutos, paraHoy, repasoActivo, sumarDias } from '../repaso/repaso.ts'

export function Inicio() {
  // L4: el último bot con el que jugué (Brisa, 700, la primera vez), igual que en Jugar
  const bot = botParaJugar()
  const enCurso = partidaEnCurso()
  const rival = personajePorId(enCurso?.botId)
  const [confirmar, setConfirmar] = useState(false)
  // R7: el repaso de hoy (si el interruptor está prendido)
  const repaso = (() => {
    if (!repasoActivo()) return null
    const lecciones = cursos().flatMap((c) => c.lecciones)
    const hechas = leerProgreso()
    const registro = leerRegistro()
    const hoy = paraHoy(leerRepaso(), hechas, lecciones, dia(), registro)
    const manana = paraHoy(leerRepaso(), hechas, lecciones, sumarDias(dia(), 1), registro).length
    return { n: hoy.length, min: minutos(hoy), manana, aprendidas: lecciones.some((l) => hechas[l.id]) }
  })()
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
      <section className="tarjeta recomendado" aria-label="Jugar">
        <div className="recomendado-bot">
          <Avatar personaje={bot} tam={88} />
          <div>
            <h1>
              {bot.nombre} <span className="nivel">{bot.elo}</span>
            </h1>
            <p className="frase">{bot.frase}</p>
          </div>
        </div>
        <button type="button" className="boton primario grande" data-testid="jugar-recomendado" onClick={() => (enCurso ? setConfirmar(true) : jugar())}>
          Jugar
        </button>
        <a className="enlace" href="#/bots">
          Escoger otro bot o color
        </a>
      </section>
      {repaso &&
        (repaso.n > 0 ? (
          <a className="tarjeta tarjeta-enlace repaso-hoy" href="#/repaso" data-testid="repaso-hoy" data-n={repaso.n}>
            <strong>
              Repaso de hoy: {repaso.n} {repaso.n === 1 ? 'línea' : 'líneas'}, unos {repaso.min} {repaso.min === 1 ? 'minuto' : 'minutos'}
            </strong>
            <span className="boton primario chico">Repasar</span>
          </a>
        ) : (
          <div className="tarjeta repaso-hoy" data-testid="repaso-hoy" data-n={0}>
            <strong>{repaso.aprendidas ? 'Repaso de hoy: listo' : 'Repaso de hoy'}</strong>
            <span className="apagado">{repaso.aprendidas ? `Mañana ${repaso.manana === 1 ? 'toca 1 línea' : `tocan ${repaso.manana} líneas`}.` : 'Aquí vuelven las lecciones que termines.'}</span>
          </div>
        ))}
      <a className="tarjeta tarjeta-enlace" href="#/refuerza" data-testid="ir-refuerza">
        <div>
          <strong>Refuerza lo que fallas</strong>
          <span className="apagado">Las jugadas que más fallas</span>
        </div>
      </a>
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
