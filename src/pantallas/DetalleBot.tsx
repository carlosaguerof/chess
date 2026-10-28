import { useState } from 'react'
import { personajePorId, NOMBRE_TEMPERAMENTO } from '../bots/personajes.ts'
import { nombreApertura, inglesApertura } from '../bots/nombres-aperturas.ts'
import { Avatar } from '../componentes/Avatar.tsx'
import { Dialogo } from '../componentes/Dialogo.tsx'
import { empezarPartida, partidaEnCurso, opcionesRecordadas, tiempoRecordado } from '../partida/usePartidaBot.ts'
import { ElegirTiempo } from '../componentes/ElegirTiempo.tsx'
import { Estrellas } from '../componentes/Estrellas.tsx'
import { leerEstrellas } from '../estrellas/almacen.ts'
import { controlPorId } from '../reloj/reloj.ts'
import { navegar } from '../ruta.ts'
import { IconoAtras } from '../componentes/Iconos.tsx'

type Color = 'w' | 'azar' | 'b'

export function DetalleBot({ id }: { id: string }) {
  const bot = personajePorId(id)
  const [color, setColor] = useState<Color>('w')
  const [confirmar, setConfirmar] = useState(false)
  const [opciones, setOpciones] = useState(opcionesRecordadas)
  const [tiempo, setTiempo] = useState(tiempoRecordado)
  const [eligiendoTiempo, setEligiendoTiempo] = useState(false)
  if (!bot) return <p>No encontré a ese bot. <a href="#/bots">Ver todos</a></p>
  const enCurso = partidaEnCurso()
  const jugar = () => {
    empezarPartida(bot.id, color, undefined, opciones, tiempo)
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
        {leerEstrellas()[bot.id] !== undefined && <Estrellas n={leerEstrellas()[bot.id]!} tam={22} />}
        <p className="estilo">
          <span className="chip">{NOMBRE_TEMPERAMENTO[bot.temperamento]}</span>
          Con blancas: {bot.estilo.blancas.map((k) => nombreApertura(k, 'blancas')).join(', ')} · Con negras: {bot.estilo.negras.map((k) => nombreApertura(k, 'negras')).join(', ')}
        </p>
        <small className="ingles">{[...bot.estilo.blancas, ...bot.estilo.negras].map(inglesApertura).join(' / ')}</small>
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
      <button type="button" className="boton-tiempo" onClick={() => setEligiendoTiempo(true)} data-testid="elegir-tiempo">
        ⏱ Tiempo <span>{controlPorId(tiempo).nombre}</span>
      </button>
      {eligiendoTiempo && (
        <ElegirTiempo
          actual={tiempo}
          onEscoger={(c) => {
            setTiempo(c.id)
            setEligiendoTiempo(false)
          }}
          onCerrar={() => setEligiendoTiempo(false)}
        />
      )}
      <div className="interruptores">
        <Interruptor
          etiqueta="Guía de aperturas"
          detalle="Te dice qué jugaste y si te saliste de tu línea"
          activo={opciones.guia}
          onCambiar={(v) => setOpciones({ ...opciones, guia: v })}
          testid="interruptor-guia"
        />
        <Interruptor
          etiqueta="Que juegue mis líneas"
          detalle="El bot entra a las líneas de tu repertorio"
          activo={opciones.misLineas}
          onCambiar={(v) => setOpciones({ ...opciones, misLineas: v })}
          testid="interruptor-mis-lineas"
        />
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

function Interruptor(props: { etiqueta: string; detalle: string; activo: boolean; onCambiar: (v: boolean) => void; testid: string }) {
  return (
    <label className="interruptor">
      <span>
        <strong>{props.etiqueta}</strong>
        <small className="apagado">{props.detalle}</small>
      </span>
      <input type="checkbox" role="switch" checked={props.activo} onChange={(e) => props.onCambiar(e.target.checked)} data-testid={props.testid} />
      <i aria-hidden="true" />
    </label>
  )
}
