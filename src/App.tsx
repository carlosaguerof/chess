import { useEffect } from 'react'
import { useRuta, navegar } from './ruta.ts'
import { empezarPartida } from './partida/usePartidaBot.ts'
import { CLAVES, guardar } from './estado/almacen.ts'
import { TableroLibre } from './pantallas/TableroLibre.tsx'
import { MedirMotor } from './pantallas/MedirMotor.tsx'
import { Marco, SECCIONES, type EntradaMas } from './componentes/Marco.tsx'
import { Inicio } from './pantallas/Inicio.tsx'
import { ListaBots } from './pantallas/ListaBots.tsx'
import { DetalleBot } from './pantallas/DetalleBot.tsx'
import { Partida } from './pantallas/Partida.tsx'
import { Licencias } from './pantallas/Licencias.tsx'
import { Repertorio } from './pantallas/Repertorio.tsx'
import { Cursos } from './pantallas/Cursos.tsx'
import { Curso } from './pantallas/Curso.tsx'
import { Leccion } from './pantallas/Leccion.tsx'
import { Refuerza } from './pantallas/Refuerza.tsx'
import { Aperturas, Apertura } from './pantallas/Aperturas.tsx'
import { Historial } from './pantallas/Historial.tsx'

const MAS: EntradaMas[] = [
  { nombre: 'Mis partidas', ruta: '/historial' },
  { nombre: 'Aperturas (la base)', ruta: '/aperturas' },
  { nombre: 'Código fuente y licencias', ruta: '/licencias' },
]

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
  if (import.meta.env.DEV && primera === 'prueba-partida') return <PruebaPartida consulta={ruta.consulta} />
  // la partida ocupa toda la pantalla (N8: solo lo que importa)
  if (primera === 'partida') return <Partida />
  if (primera === 'leccion' && segunda) return <Leccion key={ruta.consulta.get('otra') ?? ''} cursoId={decodeURIComponent(segunda)} indice={Number(ruta.partes[2] ?? 0)} />
  let pantalla
  if (primera === 'bots') pantalla = <ListaBots />
  else if (primera === 'bot' && segunda) pantalla = <DetalleBot id={segunda} />
  else if (primera === 'licencias') pantalla = <Licencias />
  else if (primera === 'cursos') pantalla = <Cursos />
  else if (primera === 'refuerza') pantalla = <Refuerza />
  else if (primera === 'aperturas') pantalla = <Aperturas />
  else if (primera === 'historial') pantalla = <Historial />
  else if (primera === 'apertura' && segunda) pantalla = <Apertura id={segunda} />
  else if (primera === 'curso' && segunda) pantalla = <Curso id={decodeURIComponent(segunda)} />
  else if (primera === 'repertorio') pantalla = <Repertorio colorInicial={segunda === 'negras' ? 'b' : 'w'} />
  else pantalla = <Inicio />
  return (
    <Marco actual={ruta.camino} secciones={SECCIONES} mas={MAS}>
      {pantalla}
    </Marco>
  )
}

/** Solo en desarrollo: arma una partida con jugadas fijas para las pruebas y abre la partida. */
function PruebaPartida({ consulta }: { consulta: URLSearchParams }) {
  useEffect(() => {
    const p = empezarPartida(consulta.get('bot') ?? 'brisa', (consulta.get('color') as 'w' | 'b') ?? 'w', undefined, { guia: consulta.get('guia') !== '0', misLineas: consulta.get('mislineas') === '1' })
    const jugadas = (consulta.get('jugadas') ?? '').split(',').filter(Boolean)
    guardar(CLAVES.partida, { ...p, jugadas })
    navegar('/partida', true)
  }, [consulta])
  return null
}
