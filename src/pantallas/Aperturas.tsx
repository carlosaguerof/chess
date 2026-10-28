import { useState } from 'react'
import { BASE, aperturaPorId } from '../base/base.ts'
import type { Variante } from '../base/tipos.ts'
import { useRepertorio } from '../repertorio/estado.ts'
import { agregarDeBase } from '../repertorio/edicion.ts'
import { jugadaNumerada, sanAEspanol } from '../ajedrez/notacion.ts'
import { Puntos } from '../componentes/Puntos.tsx'
import { IconoAtras } from '../componentes/Iconos.tsx'
import type { ColorCorto } from '../ajedrez/reglas.ts'

const LADO = { blancas: 'con blancas', negras: 'con negras', ambos: 'con los dos colores' } as const

/** "Aperturas" (T19): recorrer la base por apertura. */
export function Aperturas() {
  return (
    <div className="aperturas">
      <h1>Aperturas</h1>
      <p className="apagado">La base de teoría: de aquí salen tu repertorio, los cursos y los libros de los bots.</p>
      <ul className="lista-cursos">
        {BASE.aperturas.map((a) => (
          <li key={a.id}>
            <a className="fila-curso" href={`#/apertura/${a.id}`} data-testid={`apertura-${a.id}`}>
              <span className="fila-curso-texto">
                <span className="nombre">{a.nombre}</span>
                <small className="ingles">
                  {a.nombreIngles} · {a.eco}
                </small>
                <span className="apagado">
                  {a.variantes.length} variantes · {LADO[a.lado]}
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

function pildoras(v: Variante, desde: number) {
  return v.jugadas.slice(desde).map((s, i) => {
    const ply = desde + i
    return (
      <span key={ply} className="pildora">
        {jugadaNumerada(sanAEspanol(s), ply)}
      </span>
    )
  })
}

export function Apertura({ id }: { id: string }) {
  const a = aperturaPorId(id)
  const [rep, setRep] = useRepertorio()
  const [abiertas, setAbiertas] = useState<Set<string>>(new Set())
  if (!a) return <p>No encontré esa apertura. <a href="#/aperturas">Ver todas</a></p>
  const familias = [...new Set(a.variantes.map((v) => v.familia))]
  const colores = (v: Variante): ColorCorto[] => (v.lado === 'ambos' ? ['w', 'b'] : [v.lado === 'blancas' ? 'w' : 'b'])
  const enRep = (v: Variante, c: ColorCorto) => rep.lineas.some((l) => l.claveBase === v.clave && l.color === c)
  return (
    <div className="aperturas">
      <a className="volver" href="#/aperturas">
        <IconoAtras /> Aperturas
      </a>
      <h1>{a.nombre}</h1>
      <small className="ingles">
        {a.nombreIngles} · {a.eco} · se juega {LADO[a.lado]}
      </small>
      <p className="plan">
        {a.idea} <span className="autor">redactado por la IA</span>
      </p>
      <ul className="arbol">
        {familias.map((f) => {
          const vs = a.variantes.filter((v) => v.familia === f)
          const comun = vs.reduce((n, v) => {
            let k = 0
            while (k < n && k < v.jugadas.length && v.jugadas[k] === vs[0]!.jugadas[k]) k++
            return k
          }, vs[0]!.jugadas.length)
          const abierta = abiertas.has(f)
          return (
            <li key={f} className="rama en-repertorio" data-testid="familia-base" data-familia={f}>
              <details open={abierta} onToggle={(e) => setAbiertas((s) => { const n = new Set(s); if ((e.target as HTMLDetailsElement).open) n.add(f); else n.delete(f); return n })}>
                <summary>
                  <span className="rama-fila">
                    <span className="pildoras">{pildoras(vs[0]!, 0).slice(0, comun)}</span>
                    <span className="rama-nombre">
                      → {f} <Puntos n={Math.max(...vs.map((v) => v.frecuencia))} />
                    </span>
                  </span>
                </summary>
                <ul className="ramas">
                  {vs.map((v) => (
                    <li key={v.clave} className="rama" data-testid="variante-base" data-clave={v.clave}>
                      <span className="rama-fila">
                        <span className="pildoras">{pildoras(v, comun)}</span>
                      </span>
                      <p className="fin-linea">
                        {v.nombre} <small className="ingles">{v.nombreIngles} · {v.eco}</small>
                      </p>
                      <p className="plan">
                        {v.plan} <span className="autor">redactado por la IA</span>
                      </p>
                      <div className="rama-acciones">
                        {colores(v).map((c) =>
                          enRep(v, c) ? (
                            <span key={c} className="chip chip-rep">
                              en tu repertorio{v.lado === 'ambos' ? (c === 'w' ? ' (blancas)' : ' (negras)') : ''}
                            </span>
                          ) : (
                            <button key={c} type="button" className="boton secundario chico" onClick={() => setRep(agregarDeBase(rep, BASE, v.clave, c))} data-testid="agregar-a-repertorio">
                              + Agregar a mi repertorio{v.lado === 'ambos' ? (c === 'w' ? ' (con blancas)' : ' (con negras)') : ''}
                            </button>
                          ),
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </details>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
