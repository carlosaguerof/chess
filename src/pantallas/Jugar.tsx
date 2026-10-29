import { useState } from 'react'
import { botParaJugar, gruposDePersonajes, personajePorId } from '../bots/personajes.ts'
import { Avatar } from '../componentes/Avatar.tsx'
import { Estrellas } from '../componentes/Estrellas.tsx'
import { Dialogo } from '../componentes/Dialogo.tsx'
import { Interruptor } from '../componentes/Interruptor.tsx'
import { ElegirTiempo } from '../componentes/ElegirTiempo.tsx'
import { leerAyudas, guardarAyudas, type AjustesAyudas } from '../componentes/Ayudas.tsx'
import { IconoAbajo, IconoAzar, IconoOpciones, IconoRey } from '../componentes/Iconos.tsx'
import { leerEstrellas } from '../estrellas/almacen.ts'
import { controlPorId } from '../reloj/reloj.ts'
import { colorRecordado, empezarPartida, guardarColor, guardarOpciones, guardarTiempo, opcionesRecordadas, partidaEnCurso, tiempoRecordado } from '../partida/usePartidaBot.ts'
import type { OpcionesPartida } from '../partida/modelo.ts'
import { navegar } from '../ruta.ts'

type Color = 'w' | 'azar' | 'b'

/**
 * L2: Jugar, como "Play Bots". Arriba, el escogido en grande con su frase; en medio, la cuadrícula de retratos por
 * nivel con mis estrellas; abajo y fijos, Opciones, el color y Jugar. Sin aperturas, códigos ni inglés a la vista.
 */
export function Jugar({ inicial }: { inicial?: string }) {
  const [bot, setBot] = useState(() => personajePorId(inicial) ?? botParaJugar())
  const [color, setColor] = useState<Color>(colorRecordado)
  const [opcionesAbiertas, setOpcionesAbiertas] = useState(false)
  const [confirmar, setConfirmar] = useState(false)
  const ganadas = leerEstrellas()
  const jugar = () => {
    empezarPartida(bot.id, color)
    navegar('/partida')
  }
  const escoger = (c: Color) => {
    setColor(c)
    guardarColor(c)
  }
  return (
    <div className="jugar">
      <header className="jugar-escogido" data-testid="bot-escogido" data-bot={bot.id}>
        <div className="jugar-globo-fila">
          <Avatar personaje={bot} tam={88} />
          <p className="globo" data-testid="frase-bot">
            {bot.frase}
          </p>
        </div>
        <h1>
          {bot.nombre} <span className="nivel">{bot.elo}</span>
          {ganadas[bot.id] !== undefined && <Estrellas n={ganadas[bot.id]!} tam={16} />}
        </h1>
      </header>

      <div className="jugar-grupos">
        {gruposDePersonajes().map((g) => (
          <section key={g.titulo} className="grupo-bots" aria-label={g.titulo}>
            <h2>
              {g.titulo} <small>{g.detalle}</small>
            </h2>
            <ul className="cuadricula-bots">
              {g.personajes.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    className={`casilla-bot ${p.id === bot.id ? 'escogido' : ''}`}
                    aria-pressed={p.id === bot.id}
                    aria-label={`${p.nombre}, ${p.elo}`}
                    onClick={() => setBot(p)}
                    data-testid={`bot-${p.id}`}
                  >
                    <Avatar personaje={p} tam={72} />
                    {ganadas[p.id] !== undefined && <Estrellas n={ganadas[p.id]!} tam={13} testid={`estrellas-${p.id}`} />}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className="jugar-acciones">
        <div className="jugar-acciones-dentro">
          <div className="jugar-fila">
            <button type="button" className="boton-opciones" onClick={() => setOpcionesAbiertas(true)} data-testid="opciones" aria-haspopup="dialog">
              <IconoOpciones />
              <span className="boton-opciones-texto">
                Opciones <small>{controlPorId(tiempoRecordado()).nombre}</small>
              </span>
              <IconoAbajo />
            </button>
            <div className="colores" role="radiogroup" aria-label="Tu color">
              {(
                [
                  ['w', 'Blancas'],
                  ['azar', 'Al azar'],
                  ['b', 'Negras'],
                ] as [Color, string][]
              ).map(([c, nombre]) => (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={color === c}
                  aria-label={nombre}
                  title={nombre}
                  className={color === c ? 'activo' : ''}
                  onClick={() => escoger(c)}
                  data-testid={`color-${c}`}
                >
                  {c === 'azar' ? <IconoAzar /> : <IconoRey color={c} />}
                </button>
              ))}
            </div>
          </div>
          <button type="button" className="boton primario grande" data-testid="jugar" onClick={() => (partidaEnCurso() ? setConfirmar(true) : jugar())}>
            Jugar
          </button>
        </div>
      </div>

      {opcionesAbiertas && <HojaOpciones onCerrar={() => setOpcionesAbiertas(false)} />}
      {confirmar && (
        <Dialogo titulo="¿Empezar otra partida?" confirmar="Empezar otra" peligro onConfirmar={jugar} onCancelar={() => setConfirmar(false)}>
          Tienes una partida en curso. Si empiezas otra, esa se pierde.
        </Dialogo>
      )}
    </div>
  )
}

/** Opciones de la partida: el tiempo, la guía, "Que juegue mis líneas" y las ayudas. Cada cambio se guarda al momento. */
function HojaOpciones({ onCerrar }: { onCerrar: () => void }) {
  const [opciones, setOpciones] = useState(opcionesRecordadas)
  const [tiempo, setTiempo] = useState(tiempoRecordado)
  const [ayudas, setAyudas] = useState(leerAyudas)
  const [eligiendoTiempo, setEligiendoTiempo] = useState(false)
  const cambiarOpciones = (o: OpcionesPartida) => {
    setOpciones(o)
    guardarOpciones(o)
  }
  const cambiarAyudas = (a: AjustesAyudas) => {
    setAyudas(a)
    guardarAyudas(a)
  }
  return (
    <>
      <div className="dialogo-fondo hoja-fondo" onClick={onCerrar}>
        <div className="dialogo hoja" role="dialog" aria-modal="true" aria-label="Opciones" onClick={(e) => e.stopPropagation()}>
          <h2>Opciones</h2>
          <button type="button" className="fila-opcion" onClick={() => setEligiendoTiempo(true)} data-testid="elegir-tiempo">
            <strong>Tiempo</strong>
            <span>{controlPorId(tiempo).nombre}</span>
          </button>
          <div className="interruptores">
            <Interruptor
              etiqueta="Guía de aperturas"
              detalle="Te dice qué apertura juegas"
              activo={opciones.guia}
              onCambiar={(v) => cambiarOpciones({ ...opciones, guia: v })}
              testid="interruptor-guia"
            />
            <Interruptor
              etiqueta="Que juegue mis líneas"
              detalle="El bot entra a tus aperturas"
              activo={opciones.misLineas}
              onCambiar={(v) => cambiarOpciones({ ...opciones, misLineas: v })}
              testid="interruptor-mis-lineas"
            />
            <Interruptor etiqueta="Barra de ventaja" detalle="Quién va ganando" activo={ayudas.barra} onCambiar={(v) => cambiarAyudas({ ...ayudas, barra: v })} testid="ayuda-barra" />
            <Interruptor etiqueta="Flechas de amenaza" detalle="Tus piezas en peligro" activo={ayudas.amenazas} onCambiar={(v) => cambiarAyudas({ ...ayudas, amenazas: v })} testid="ayuda-amenazas" />
            <Interruptor etiqueta="Sugerencia" detalle="La mejor jugada para ti" activo={ayudas.sugerencia} onCambiar={(v) => cambiarAyudas({ ...ayudas, sugerencia: v })} testid="ayuda-sugerencia" />
          </div>
          <p className="nota-estrellas">Con la guía o las ayudas, ganar da menos estrellas.</p>
        <button type="button" className="boton primario" onClick={onCerrar} data-testid="opciones-listo">
            Listo
          </button>
        </div>
      </div>
      {eligiendoTiempo && (
        <ElegirTiempo
          actual={tiempo}
          onEscoger={(c) => {
            setTiempo(c.id)
            guardarTiempo(c.id)
            setEligiendoTiempo(false)
          }}
          onCerrar={() => setEligiendoTiempo(false)}
        />
      )}
    </>
  )
}
