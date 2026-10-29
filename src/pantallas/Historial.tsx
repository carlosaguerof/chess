import { leerHistorial, dondeMeSalgo, totales } from '../historial/historial.ts'
import { mostrarTexto } from '../ajedrez/mostrar.ts'
import { personajePorId } from '../bots/personajes.ts'
import { Avatar } from '../componentes/Avatar.tsx'

const RESULTADO = { gane: 'Ganaste', perdi: 'Perdiste', tablas: 'Tablas' } as const

/** R2: mis partidas contra los bots, guardadas en este navegador, y en qué líneas me salgo más. */
export function Historial() {
  const h = leerHistorial()
  const t = totales(h)
  const salidas = dondeMeSalgo(h)
  if (h.length === 0) {
    return (
      <div className="historial vacio">
        <h1>Mis partidas</h1>
        <p className="apagado">Todavía no terminas ninguna partida.</p>
        <a className="boton primario" href="#/bots">
          Jugar contra un bot
        </a>
      </div>
    )
  }
  return (
    <div className="historial">
      <h1>Mis partidas</h1>
      <p className="apagado" data-testid="totales">
        {h.length} {h.length === 1 ? 'partida' : 'partidas'} · {t.gane} {t.gane === 1 ? 'ganada' : 'ganadas'} · {t.perdi} {t.perdi === 1 ? 'perdida' : 'perdidas'} · {t.tablas} tablas
      </p>
      {/* §3: la tarjeta solo aparece cuando hay algo que decir */}
      {salidas.length > 0 && (
        <section className="tarjeta">
          <h2>Dónde me salgo más de mi línea</h2>
          <ol className="lista-salidas" data-testid="donde-me-salgo">
            {salidas.map((s) => (
              <li key={s.linea}>
                <span>{mostrarTexto(s.linea)}</span>
                <span className="conteo-fallo">
                  {s.veces} {s.veces === 1 ? 'vez' : 'veces'}
                </span>
              </li>
            ))}
          </ol>
        </section>
      )}
      <ol className="lista-partidas" data-testid="lista-partidas">
        {h.map((p) => {
          const bot = personajePorId(p.botId)
          return (
            <li key={p.id} data-testid="partida-historial" data-resultado={p.resultado}>
              <Avatar personaje={bot} tam={36} />
              <span className="detalle">
                <strong>
                  {bot?.nombre ?? p.botId} <span className="apagado">({bot?.elo})</span>
                </strong>
                <small className="apagado">
                  {p.colorHumano === 'w' ? 'con blancas' : 'con negras'} · {p.fin} · {Math.ceil(p.jugadas / 2)} jugadas · {new Date(p.fecha).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                </small>
                {p.resumen?.caso === 'me-sali' && p.resumen.linea && <small className="conteo-fallo">Te saliste de: {mostrarTexto(p.resumen.linea)}</small>}
              </span>
              <span className={`resultado-chico ${p.resultado}`}>{RESULTADO[p.resultado]}</span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
