import { gruposDePersonajes } from '../bots/personajes.ts'
import { nombreApertura, inglesApertura } from '../bots/nombres-aperturas.ts'
import { Avatar } from '../componentes/Avatar.tsx'

export function ListaBots() {
  return (
    <div className="lista-bots">
      <h1>Jugar contra un bot</h1>
      {gruposDePersonajes().map((g) => (
        <section key={g.titulo} className="grupo-bots" aria-label={g.titulo}>
          <h2>
            {g.titulo} <small>{g.detalle}</small>
          </h2>
          <ul>
            {g.personajes.map((p) => (
              <li key={p.id}>
                <a href={`#/bot/${p.id}`} className="fila-bot" data-testid={`bot-${p.id}`}>
                  <Avatar personaje={p} tam={48} />
                  <div className="fila-bot-texto">
                    <span className="nombre">
                      {p.nombre} <span className="nivel">{p.elo}</span>
                    </span>
                    <span className="aperturas">{[nombreApertura(p.estilo.blancas[0]!, 'blancas'), nombreApertura(p.estilo.negras[0]!, 'negras')].join(' · ')}</span>
                    <small className="ingles aperturas">{[inglesApertura(p.estilo.blancas[0]!), inglesApertura(p.estilo.negras[0]!)].join(' / ')}</small>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
