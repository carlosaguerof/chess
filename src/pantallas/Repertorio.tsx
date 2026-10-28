import { useMemo, useRef, useState, type ReactNode } from 'react'
import { BASE, variantePorClave, aperturaDeClave } from '../base/base.ts'
import { arbolDe, GUIA, type NodoArbol, type LineaRepertorio } from '../repertorio/modelo.ts'
import { agregarDeBase, borrarRama, deshacerBorrado, editarLinea, exportar, importar, repertorioOriginal, ErrorImportar, type Borrado, agregarPropia, importarPgn } from '../repertorio/edicion.ts'
import { ErrorPgn } from '../repertorio/pgn.ts'
import { useRepertorio, leerProgreso, guardarProgreso } from '../repertorio/estado.ts'
import { leerRegistro, guardarRegistro } from '../registro/almacen-registro.ts'
import { jugadaNumerada, sanAEspanol } from '../ajedrez/notacion.ts'
import { Puntos } from '../componentes/Puntos.tsx'
import { Dialogo } from '../componentes/Dialogo.tsx'
import { IconoMas } from '../componentes/Iconos.tsx'
import { AgregarJugando } from './AgregarJugando.tsx'
import type { ColorCorto } from '../ajedrez/reglas.ts'
import type { EntradaRegistro } from '../registro/registro.ts'

const pastilla = (n: NodoArbol) => jugadaNumerada(sanAEspanol(n.san), n.ply)

export function Repertorio({ colorInicial }: { colorInicial?: ColorCorto }) {
  const [rep, setRep] = useRepertorio()
  const [color, setColor] = useState<ColorCorto>(colorInicial ?? 'w')
  const [borrando, setBorrando] = useState<NodoArbol | null>(null)
  const [ultimoBorrado, setUltimoBorrado] = useState<Borrado | null>(null)
  const [editando, setEditando] = useState<LineaRepertorio | null>(null)
  const [agregandoDesde, setAgregandoDesde] = useState<{ jugadas: string[]; apertura: string } | null>(null)
  const [menu, setMenu] = useState(false)
  const [reiniciar, setReiniciar] = useState(false)
  // R3: importar un PGN (pegado o de un archivo .pgn) al repertorio del color que estoy viendo
  const [pgn, setPgn] = useState<string | null>(null)
  const [errorPgn, setErrorPgn] = useState<string | null>(null)
  const archivoPgn = useRef<HTMLInputElement>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [menuLinea, setMenuLinea] = useState<{ linea: LineaRepertorio; nodo: NodoArbol } | null>(null)
  const [abiertos, setAbiertos] = useState<Set<string>>(new Set())
  const alternar = (k: string, abierto: boolean) =>
    setAbiertos((a) => {
      if (a.has(k) === abierto) return a
      const n = new Set(a)
      if (abierto) n.add(k)
      else n.delete(k)
      return n
    })
  const archivo = useRef<HTMLInputElement>(null)
  const arbol = useMemo(() => arbolDe(rep, color, BASE), [rep, color])
  const lineaPorId = useMemo(() => new Map(rep.lineas.map((l) => [l.id, l])), [rep])

  const descargar = () => {
    const texto = exportar({ repertorio: rep, progreso: leerProgreso(), registro: leerRegistro() })
    const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `mi-repertorio-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setMenu(false)
  }
  const subir = async (f: File) => {
    try {
      const r = importar(await f.text())
      setRep(r.repertorio)
      guardarProgreso(r.progreso as ReturnType<typeof leerProgreso>)
      guardarRegistro(r.registro as EntradaRegistro[])
      setAviso(`Listo: se cargó tu repertorio (${r.repertorio.lineas.length} líneas).`)
    } catch (e) {
      setAviso(e instanceof ErrorImportar ? e.message : 'No se pudo leer el archivo.')
    }
    setMenu(false)
  }

  const Rama = ({ nodo, nivel, padreBase = false }: { nodo: NodoArbol; nivel: number; padreBase?: boolean }): ReactNode => {
    // una cadena de jugadas sin ramas se dibuja en una sola fila de píldoras
    const cadena: NodoArbol[] = [nodo]
    let fin = nodo
    while (fin.hijos.length === 1 && !fin.terminaLinea && !fin.hijos[0]!.familia && fin.hijos[0]!.enRepertorio === nodo.enRepertorio) {
      fin = fin.hijos[0]!
      cadena.push(fin)
    }
    const conFamilia = cadena.find((n) => n.familia)
    const soloBase = !nodo.enRepertorio
    const editable = fin.terminaLinea ? lineaPorId.get(fin.terminaLinea.id) : undefined
    const clavesBase = soloBase ? [...new Set(fin.soloBase)] : []
    // lo de la base que cuelga de aquí: su nombre, de la apertura de la base
    const raizDeBase = soloBase && !padreBase
    const nombreBase = raizDeBase ? aperturaDeClave(nodo.soloBase[0] ?? '')?.nombre : undefined
    // en las tarjetas de arriba, el nombre y el texto de mi guía (nota 11: donde coincide con la teoría)
    const lineaGuia = nivel === 0 && !conFamilia && nodo.lineas[0] ? lineaPorId.get(nodo.lineas[0]) : undefined
    const guia = lineaGuia ? GUIA.find((g) => g.color === color && g.apertura === lineaGuia.apertura && lineaGuia.claveBase?.split('/')[1]?.startsWith(g.prefijo)) : undefined
    const pildoras = (
      <span className="pildoras">
        {cadena.map((n) => (
          <span key={n.camino.join(' ')} className={`pildora ${n.mia ? 'mia' : 'rival'}`}>
            {pastilla(n)}
          </span>
        ))}
      </span>
    )
    const cabeza = (
      <span className="rama-fila">
        {pildoras}
        {conFamilia?.familia && (
          <span className="rama-nombre">
            → {conFamilia.familia.nombre} <Puntos n={conFamilia.familia.frecuencia} />
            {conFamilia.familia.ingles && (
              <small className="ingles">
                {conFamilia.familia.ingles} · {conFamilia.familia.eco}
              </small>
            )}
          </span>
        )}
        {soloBase && nombreBase && <span className="rama-nombre">→ {nombreBase}</span>}
        {guia && <span className="rama-nombre">→ {guia.nombreGuia}</span>}
        {raizDeBase ? <span className="chip chip-base">solo en la base</span> : !soloBase && nivel === 0 && <span className="chip chip-rep">en tu repertorio</span>}
      </span>
    )
    const cuerpo = (
      <>
        {guia && (
          <p className="plan">
            {guia.textoGuia} <span className="autor">de tu guía</span>
          </p>
        )}
        {conFamilia?.familia && conFamilia.familia.plan && (
          <p className="plan">
            {conFamilia.familia.plan} <span className="autor">{conFamilia.familia.autorPlan === 'ia' ? 'redactado por la IA' : conFamilia.familia.autorPlan === 'yo' ? 'escrito por ti' : 'de tu guía'}</span>
          </p>
        )}
        {editable && (
          <div className="rama-acciones">
            <span className="fin-linea">{editable.nombre}</span>
            <button type="button" className="boton-menu chico" aria-label={`Opciones de ${editable.nombre}`} onClick={() => setMenuLinea(menuLinea?.linea.id === editable.id ? null : { linea: editable, nodo })} data-testid="opciones-linea">
              <IconoMas />
            </button>
          </div>
        )}
        {soloBase && clavesBase.length > 0 && fin.hijos.length === 0 && (
          <div className="rama-acciones">
            {clavesBase.map((k) => (
              <button key={k} type="button" className="boton secundario chico" onClick={() => setRep(agregarDeBase(rep, BASE, k, color))} data-testid="agregar-de-base">
                + Agregar «{variantePorClave(k)?.nombre}»
              </button>
            ))}
          </div>
        )}
        {fin.hijos.length > 0 && (
          <ul className="ramas">
            {fin.hijos.map((h) => (
              <Rama key={h.camino.join(' ')} nodo={h} nivel={nivel + 1} padreBase={soloBase} />
            ))}
          </ul>
        )}
      </>
    )
    // las familias y lo de la base se abren al tocarlas (nota 5: pocas cosas a la vista)
    const plegable = !!conFamilia?.familia || raizDeBase
    return (
      <li className={`rama ${soloBase ? 'solo-base' : 'en-repertorio'}`} data-testid="rama" data-familia={conFamilia?.familia?.nombre}>
        {plegable ? (
          <details open={abiertos.has(nodo.camino.join(' '))} onToggle={(e) => alternar(nodo.camino.join(' '), (e.target as HTMLDetailsElement).open)}>
            <summary>{cabeza}</summary>
            {cuerpo}
          </details>
        ) : (
          <>
            {cabeza}
            {cuerpo}
          </>
        )}
      </li>
    )
  }

  // con blancas abro siempre con 1.e4: se dice arriba y las respuestas del rival van como tarjetas
  const unaSolaApertura = arbol.hijos.length === 1 && arbol.hijos[0]!.mia ? arbol.hijos[0]! : null
  const tarjetas = unaSolaApertura ? unaSolaApertura.hijos : arbol.hijos

  return (
    <div className="repertorio">
      <div className="titulo-con-menu">
        <h1>Mi repertorio</h1>
        <button type="button" className="boton-menu" aria-label="Más opciones del repertorio" onClick={() => setMenu(!menu)} data-testid="menu-repertorio">
          <IconoMas />
        </button>
        {menu && (
          <div className="menu-local" role="menu">
            <button type="button" role="menuitem" onClick={descargar}>
              Exportar a un archivo
            </button>
            <button type="button" role="menuitem" onClick={() => archivo.current?.click()}>
              Importar de un archivo
            </button>
            <button type="button" role="menuitem" onClick={() => (setPgn(''), setErrorPgn(null), setMenu(false))} data-testid="importar-pgn">
              Importar un PGN
            </button>
            <button type="button" role="menuitem" className="peligro" onClick={() => (setReiniciar(true), setMenu(false))}>
              Volver al repertorio original
            </button>
          </div>
        )}
        <input ref={archivo} type="file" accept="application/json,.json" hidden data-testid="importar" onChange={(e) => e.target.files?.[0] && subir(e.target.files[0])} />
      </div>
      <p className="apagado subtitulo">Tu guía dice qué aprendes; las líneas, los planes y las frecuencias salen de la base de aperturas.</p>
      <div className="pestanas" role="tablist">
        <button type="button" role="tab" aria-selected={color === 'w'} className={color === 'w' ? 'activo' : ''} onClick={() => setColor('w')} data-testid="tab-blancas">
          Con blancas
        </button>
        <button type="button" role="tab" aria-selected={color === 'b'} className={color === 'b' ? 'activo' : ''} onClick={() => setColor('b')} data-testid="tab-negras">
          Con negras
        </button>
      </div>
      <p className="encabezado-arbol">{unaSolaApertura ? `// Abres con ${pastilla(unaSolaApertura)}; el rival responde con…` : '// El rival abre con…; tú respondes con…'}</p>
      <ul className="arbol" data-testid={color === 'w' ? 'arbol-blancas' : 'arbol-negras'}>
        {tarjetas.map((h) => (
          <Rama key={h.camino.join(' ')} nodo={h} nivel={0} />
        ))}
      </ul>
      {menuLinea && (
        <div className="menu-mas-fondo" onClick={() => setMenuLinea(null)}>
          <div className="menu-mas menu-linea" role="menu" onClick={(e) => e.stopPropagation()}>
            <p className="apagado">{menuLinea.linea.nombre}</p>
            <button type="button" role="menuitem" onClick={() => (setEditando(menuLinea.linea), setMenuLinea(null))}>
              Editar nombre, plan y frecuencia
            </button>
            <button type="button" role="menuitem" onClick={() => (setAgregandoDesde({ jugadas: menuLinea.linea.jugadas, apertura: menuLinea.linea.apertura }), setMenuLinea(null))}>
              Agregar una línea jugando desde aquí
            </button>
            <button type="button" role="menuitem" className="peligro" onClick={() => (setBorrando(menuLinea.nodo), setMenuLinea(null))} data-testid="borrar-rama">
              Borrar esta rama
            </button>
          </div>
        </div>
      )}

      {aviso && (
        <div className="toast" role="status" onClick={() => setAviso(null)}>
          {aviso}
        </div>
      )}
      {ultimoBorrado && (
        <div className="toast" role="status" data-testid="aviso-borrado">
          Rama borrada.
          <button
            type="button"
            className="enlace-chico"
            onClick={() => {
              setRep(deshacerBorrado(rep, ultimoBorrado))
              setUltimoBorrado(null)
            }}
          >
            Deshacer
          </button>
        </div>
      )}
      {borrando && (
        <Dialogo
          titulo="¿Borrar esta rama?"
          confirmar="Borrar"
          peligro
          onConfirmar={() => {
            const b = borrarRama(rep, color, borrando.camino)
            setRep(b.repertorio)
            setUltimoBorrado(b)
            setBorrando(null)
          }}
          onCancelar={() => setBorrando(null)}
        >
          Se quitan de tu repertorio {borrando.lineas.length === 1 ? 'esta línea' : `estas ${borrando.lineas.length} líneas`}. Puedes deshacerlo después.
        </Dialogo>
      )}
      {pgn !== null && (
        <Dialogo
          titulo={`Importar un PGN ${color === 'w' ? 'con blancas' : 'con negras'}`}
          confirmar="Importar"
          onConfirmar={() => {
            try {
              const r = importarPgn(rep, color, pgn)
              setRep(r.repertorio)
              setPgn(null)
              setAviso(`Listo: ${r.nuevas} ${r.nuevas === 1 ? 'línea nueva' : 'líneas nuevas'} ${color === 'w' ? 'con blancas' : 'con negras'} ("${r.nombre}")${r.yaEstaban > 0 ? `; ${r.yaEstaban} ya ${r.yaEstaban === 1 ? 'estaba' : 'estaban'}` : ''}.`)
            } catch (e) {
              setErrorPgn(e instanceof ErrorPgn ? e.message : 'No pude leer ese PGN.')
            }
          }}
          onCancelar={() => setPgn(null)}
        >
          <p>Pega las jugadas (con variantes entre paréntesis), en inglés o con R D T A C. Entran como líneas tuyas, sin plan.</p>
          <textarea className="campo-pgn" rows={6} value={pgn} onChange={(e) => (setPgn(e.target.value), setErrorPgn(null))} placeholder="1. e4 c6 2. d4 d5 3. e5 Af5 (3... c5) 4. Cf3 e6" aria-label="PGN" data-testid="texto-pgn" />
          <button type="button" className="enlace-chico" onClick={() => archivoPgn.current?.click()}>
            O abre un archivo .pgn
          </button>
          <input ref={archivoPgn} type="file" accept=".pgn,text/plain" hidden onChange={async (e) => e.target.files?.[0] && (setPgn(await e.target.files[0].text()), setErrorPgn(null))} />
          {errorPgn && (
            <p className="error-campo" role="alert" data-testid="error-pgn">
              {errorPgn}
            </p>
          )}
        </Dialogo>
      )}
      {reiniciar && (
        <Dialogo
          titulo="¿Volver al repertorio original?"
          confirmar="Volver al original"
          peligro
          onConfirmar={() => {
            setRep(repertorioOriginal(BASE))
            setReiniciar(false)
          }}
          onCancelar={() => setReiniciar(false)}
        >
          Se pierden las líneas que agregaste y los cambios de nombre, plan y frecuencia. Tu avance en los cursos se queda.
        </Dialogo>
      )}
      {editando && <EditarLinea linea={editando} onGuardar={(c) => (setRep(editarLinea(rep, editando.id, c)), setEditando(null))} onCancelar={() => setEditando(null)} />}
      {agregandoDesde && (
        <AgregarJugando
          color={color}
          desde={agregandoDesde.jugadas}
          onGuardar={(jugadas, nombre) => {
            setRep(agregarPropia(rep, color, jugadas, nombre, agregandoDesde.apertura))
            setAgregandoDesde(null)
          }}
          onCancelar={() => setAgregandoDesde(null)}
        />
      )}
    </div>
  )
}

function EditarLinea(props: { linea: LineaRepertorio; onGuardar: (c: { nombre: string; plan: string; frecuencia: number }) => void; onCancelar: () => void }) {
  const [nombre, setNombre] = useState(props.linea.nombre)
  const [plan, setPlan] = useState(props.linea.plan)
  const [frecuencia, setFrecuencia] = useState(props.linea.frecuencia)
  return (
    <div className="dialogo-fondo" onClick={props.onCancelar}>
      <form
        className="dialogo formulario"
        role="dialog"
        aria-label="Editar línea"
        onClick={(e) => e.stopPropagation()}
        onSubmit={(e) => {
          e.preventDefault()
          props.onGuardar({ nombre: nombre.trim() || props.linea.nombre, plan, frecuencia })
        }}
      >
        <h2>Editar línea</h2>
        <label>
          Nombre
          <input value={nombre} onChange={(e) => setNombre(e.target.value)} data-testid="editar-nombre" />
        </label>
        <label>
          Plan
          <textarea value={plan} rows={4} onChange={(e) => setPlan(e.target.value)} data-testid="editar-plan" />
        </label>
        <label>
          Frecuencia
          <span className="selector-frecuencia">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" className={n <= frecuencia ? 'lleno' : ''} aria-label={`${n} de 5`} onClick={() => setFrecuencia(n)} />
            ))}
          </span>
        </label>
        <div className="dialogo-botones">
          <button type="button" className="boton secundario" onClick={props.onCancelar}>
            Cancelar
          </button>
          <button type="submit" className="boton primario">
            Guardar
          </button>
        </div>
      </form>
    </div>
  )
}
