import { useRuta } from './ruta.ts'
import { TableroLibre } from './pantallas/TableroLibre.tsx'
import { MedirMotor } from './pantallas/MedirMotor.tsx'
import { Marco, SECCIONES, type EntradaMas } from './componentes/Marco.tsx'
import { Inicio } from './pantallas/Inicio.tsx'
import { ListaBots } from './pantallas/ListaBots.tsx'
import { DetalleBot } from './pantallas/DetalleBot.tsx'
import { Partida } from './pantallas/Partida.tsx'

const MAS: EntradaMas[] = [{ nombre: 'Código fuente y licencias', href: 'https://github.com/carlosaguerof/chess#readme', externo: true }]

export function App() {
  const ruta = useRuta()
  const [primera, segunda] = ruta.partes
  if (import.meta.env.DEV && primera === 'libre') {
    return (
      <main className="app">
        <TableroLibre fenInicial={ruta.consulta.get('fen') ?? undefined} />
      </main>
    )
  }
  if (import.meta.env.DEV && primera === 'medir-motor') return <MedirMotor />
  // la partida ocupa toda la pantalla (N8: solo lo que importa)
  if (primera === 'partida') return <Partida />
  let pantalla
  if (primera === 'bots') pantalla = <ListaBots />
  else if (primera === 'bot' && segunda) pantalla = <DetalleBot id={segunda} />
  else pantalla = <Inicio />
  return (
    <Marco actual={ruta.camino} secciones={SECCIONES} mas={MAS}>
      {pantalla}
    </Marco>
  )
}
