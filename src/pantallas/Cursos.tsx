import { useRepertorio, leerProgreso } from '../repertorio/estado.ts'
import { cursos } from '../cursos/datos.ts'
import { aperturaPorId } from '../base/base.ts'

/** Aprender: un curso por apertura; primero los de mi repertorio. */
export function Cursos() {
  const [rep] = useRepertorio()
  const lista = cursos(rep)
  const hechas = leerProgreso()
  const fila = (c: (typeof lista)[number]) => {
    const n = c.lecciones.filter((l) => hechas[l.id]).length
    return (
      <li key={c.id}>
        <a className="fila-curso" href={`#/curso/${encodeURIComponent(c.id)}`} data-testid={`curso-${c.id}`}>
          <span className={`ficha ficha-${c.color}`} aria-hidden="true" />
          <span className="fila-curso-texto">
            <span className="nombre">{c.nombre}</span>
            <small className="ingles">
              {aperturaPorId(c.apertura)?.nombreIngles} · {aperturaPorId(c.apertura)?.eco}
            </small>
            <span className="apagado">
              {c.lecciones.length} lecciones · {n} hechas
            </span>
            <span className="barra-avance" aria-hidden="true">
              <i style={{ width: `${(100 * n) / c.lecciones.length}%` }} />
            </span>
          </span>
        </a>
      </li>
    )
  }
  return (
    <div className="cursos">
      <h1>Aprender</h1>
      <a className="enlace-base" href="#/aperturas" data-testid="ver-aperturas">
        Ver todas las aperturas de la base ›
      </a>
      <section aria-label="Tu repertorio">
        <h2>Tu repertorio</h2>
        <ul className="lista-cursos">{lista.filter((c) => c.enRepertorio).map(fila)}</ul>
      </section>
      <section aria-label="Más aperturas de la base">
        <h2>Más aperturas de la base</h2>
        <ul className="lista-cursos">{lista.filter((c) => !c.enRepertorio).map(fila)}</ul>
      </section>
    </div>
  )
}
