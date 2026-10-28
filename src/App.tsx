import { useRuta } from './ruta.ts'
import { TableroLibre } from './pantallas/TableroLibre.tsx'
import { MedirMotor } from './pantallas/MedirMotor.tsx'

export function App() {
  const ruta = useRuta()
  if (import.meta.env.DEV && ruta.partes[0] === 'libre') {
    return (
      <main className="app">
        <TableroLibre fenInicial={ruta.consulta.get('fen') ?? undefined} />
      </main>
    )
  }
  if (import.meta.env.DEV && ruta.partes[0] === 'medir-motor') return <MedirMotor />
  return (
    <main className="app">
      <h1 data-testid="titulo">Ajedrez · mis aperturas</h1>
      <p className="apagado">Base del proyecto lista. Las pantallas llegan en las siguientes tareas.</p>
    </main>
  )
}
