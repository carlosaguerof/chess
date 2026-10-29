import { useEffect } from 'react'
import { useRuta, navegar } from './ruta.ts'
import { empezarPartida } from './partida/usePartidaBot.ts'
import { CLAVES, guardar } from './estado/almacen.ts'
import { TableroLibre } from './pantallas/TableroLibre.tsx'
import { MedirMotor } from './pantallas/MedirMotor.tsx'
import { Marco, SECCIONES, type EntradaMas } from './componentes/Marco.tsx'
import { Inicio } from './pantallas/Inicio.tsx'
import { Jugar } from './pantallas/Jugar.tsx'
import { Partida } from './pantallas/Partida.tsx'
import { Licencias } from './pantallas/Licencias.tsx'
import { Leccion } from './pantallas/Leccion.tsx'
import { LeccionCurso } from './pantallas/LeccionCurso.tsx'
import { CursoPagina, ErroresDelCurso, PiezaDeLeer } from './pantallas/CursoPagina.tsx'
import { cursoNuevo } from './curso/datos.ts'
import { Refuerza } from './pantallas/Refuerza.tsx'
import { AperturasYDefensas, PaginaApertura, PaginaVariante, pestanaDe } from './pantallas/AperturasYDefensas.tsx'
import { Respaldo } from './pantallas/Respaldo.tsx'
import { Historial } from './pantallas/Historial.tsx'
import { Ajustes } from './pantallas/Ajustes.tsx'
import { Repaso } from './pantallas/Repaso.tsx'
import { GaleriaRetratos } from './pantallas/GaleriaRetratos.tsx'
import { Instalar } from './pantallas/Instalar.tsx'
import { TUS_DATOS_PRENDIDA } from './aprender/interruptores.ts'
import type { EstiloRetrato } from './bots/retratos.ts'

const MAS: EntradaMas[] = [
  { nombre: 'Mis partidas', ruta: '/historial' },
  { nombre: 'Ajustes', ruta: '/ajustes' },
  // "Tus datos" (importar) está apagada: exportar vive en Ajustes (aprender/interruptores.ts)
  ...(TUS_DATOS_PRENDIDA ? [{ nombre: 'Tus datos', ruta: '/datos' }] : []),
  { nombre: 'Instalar en el iPhone', ruta: '/instalar' },
  { nombre: 'Código fuente y licencias', ruta: '/licencias' },
]

export function App() {
  const ruta = useRuta()
  // cada pantalla nueva empieza arriba (antes se quedaba en la altura de la anterior)
  // (con llaves: en Chromium, scrollTo devuelve una promesa y React no debe tomarla como limpieza)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [ruta.camino])
  const [primera, segunda] = ruta.partes
  if (import.meta.env.DEV && primera === 'libre') {
    return (
      <main className="app">
        <TableroLibre fenInicial={ruta.consulta.get('fen') ?? undefined} />
      </main>
    )
  }
  if (import.meta.env.DEV && primera === 'medir-motor') return <MedirMotor />
  if (import.meta.env.DEV && primera === 'retratos') return <GaleriaRetratos estilo={(segunda ?? 'toon') as EstiloRetrato} />
  if (import.meta.env.DEV && primera === 'prueba-partida') return <PruebaPartida consulta={ruta.consulta} />
  // la partida ocupa toda la pantalla (N8: solo lo que importa)
  if (primera === 'partida') return <Partida />
  // C3: el curso piloto (la Caro-Kann) usa la lección nueva; los demás, la de antes
  const nuevo = segunda ? cursoNuevo(decodeURIComponent(segunda)) : undefined
  if (primera === 'curso' && nuevo && ruta.partes[2] === 'linea' && ruta.partes[3]) return <LeccionCurso key={ruta.camino} cursoId={nuevo.id} lineaId={decodeURIComponent(ruta.partes[3])} />
  if (primera === 'leccion' && nuevo) return <LeccionCurso key={ruta.camino} cursoId={nuevo.id} lineaId={`v:${nuevo.variantes[Number(ruta.partes[2] ?? 0)]?.id ?? ''}`} />
  if (primera === 'leccion' && segunda) return <Leccion key={ruta.consulta.get('otra') ?? ''} cursoId={decodeURIComponent(segunda)} indice={Number(ruta.partes[2] ?? 0)} />
  let pantalla
  if (primera === 'bots') pantalla = <Jugar />
  else if (primera === 'bot' && segunda) pantalla = <Jugar key={segunda} inicial={segunda} />
  else if (primera === 'licencias') pantalla = <Licencias />
  // Nota 1: Aprender es "Aperturas y defensas" (Con blancas / Con negras); Repertorio y Aperturas ya no son pantallas aparte
  else if (primera === 'cursos') pantalla = <AperturasYDefensas key={segunda ?? ''} pestana={pestanaDe(segunda)} />
  else if (primera === 'curso' && nuevo && ruta.partes[2] === 'leer' && ['idea', 'estructura', 'repaso'].includes(ruta.partes[3] ?? '')) pantalla = <PiezaDeLeer key={ruta.camino} id={nuevo.id} pieza={(ruta.partes[3] ?? 'idea') as 'idea' | 'estructura' | 'repaso'} />
  else if (primera === 'curso' && nuevo && ruta.partes[2] === 'errores') pantalla = <ErroresDelCurso id={nuevo.id} />
  else if (primera === 'curso' && nuevo && ruta.partes[2] === undefined) pantalla = <CursoPagina id={nuevo.id} />
  else if (primera === 'curso' && segunda && ruta.partes[2] !== undefined) pantalla = <PaginaVariante key={ruta.camino} id={decodeURIComponent(segunda)} indice={Number(ruta.partes[2])} />
  else if (primera === 'curso' && segunda) pantalla = <PaginaApertura id={decodeURIComponent(segunda)} />
  else if (primera === 'repertorio') pantalla = <AperturasYDefensas pestana={pestanaDe(undefined)} />
  else if (primera === 'aperturas' || primera === 'apertura') pantalla = <AperturasYDefensas pestana={pestanaDe('todas')} />
  else if (primera === 'refuerza') pantalla = <Refuerza />
  else if (primera === 'historial') pantalla = <Historial />
  else if (primera === 'ajustes') pantalla = <Ajustes />
  else if (primera === 'datos' && TUS_DATOS_PRENDIDA) pantalla = <Respaldo />
  else if (primera === 'instalar') pantalla = <Instalar />
  else if (primera === 'repaso') pantalla = <Repaso />
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
    const p = empezarPartida(consulta.get('bot') ?? 'brisa', (consulta.get('color') as 'w' | 'b') ?? 'w', undefined, { guia: consulta.get('guia') !== '0', misLineas: consulta.get('mislineas') === '1' }, consulta.get('tiempo') ?? undefined)
    const jugadas = (consulta.get('jugadas') ?? '').split(',').filter(Boolean)
    guardar(CLAVES.partida, { ...p, jugadas })
    navegar('/partida', true)
  }, [consulta])
  return null
}
