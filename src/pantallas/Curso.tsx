import { useRepertorio, leerProgreso } from '../repertorio/estado.ts'
import { cursos } from '../cursos/datos.ts'
import { aperturaPorId } from '../base/base.ts'
import { siguienteLeccion } from '../cursos/modelo.ts'
import { Puntos } from '../componentes/Puntos.tsx'
import { IconoAtras } from '../componentes/Iconos.tsx'
import { navegar } from '../ruta.ts'

export function Curso({ id }: { id: string }) {
  const [rep] = useRepertorio()
  const curso = cursos(rep).find((c) => c.id === id)
  const hechas = leerProgreso()
  if (!curso) return <p>No encontré ese curso. <a href="#/cursos">Ver los cursos</a></p>
  const siguiente = siguienteLeccion(curso, hechas)
  const indice = (lid: string) => curso.lecciones.findIndex((l) => l.id === lid)
  return (
    <div className="curso">
      <a className="volver" href="#/cursos">
        <IconoAtras /> Aprender
      </a>
      <h1>{curso.nombre}</h1>
      <small className="ingles">
        {aperturaPorId(curso.apertura)?.nombreIngles} · {aperturaPorId(curso.apertura)?.eco}
      </small>
      {siguiente && (
        <button type="button" className="boton primario grande" onClick={() => navegar(`/leccion/${encodeURIComponent(curso.id)}/${indice(siguiente.id)}`)} data-testid="empezar-leccion">
          {Object.keys(hechas).some((k) => k.startsWith(curso.id + '/')) ? 'Continuar' : 'Empezar'}: {siguiente.nombre}
        </button>
      )}
      <ol className="lista-lecciones">
        {curso.lecciones.map((l, i) => (
          <li key={l.id}>
            <a href={`#/leccion/${encodeURIComponent(curso.id)}/${i}`} className={`fila-leccion ${hechas[l.id] ? 'hecha' : ''}`} data-testid="leccion">
              <span className="marca-leccion" aria-label={hechas[l.id] ? 'hecha' : 'pendiente'}>
                {hechas[l.id] ? '✓' : i + 1}
              </span>
              <span className="fila-leccion-texto">
                <span className="nombre">{l.nombre}</span>
                <span className="apagado">{l.familia}</span>
                {l.ingles && <small className="ingles">{l.ingles} · {l.eco}</small>}
              </span>
              <Puntos n={l.frecuencia} />
            </a>
          </li>
        ))}
      </ol>
    </div>
  )
}
