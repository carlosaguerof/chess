import { useMemo, useState } from 'react'
import { useRepertorio, leerProgreso } from '../repertorio/estado.ts'
import { cursos } from '../cursos/datos.ts'
import { leerRegistro } from '../registro/almacen-registro.ts'
import { Practica } from './Leccion.tsx'
import { alRepasar, dia, ESCALONES, guardarRepaso, leerRepaso, paraHoy, sumarDias } from '../repaso/repaso.ts'

/** R7: el "Repaso de hoy": las líneas que tocan hoy, una tras otra, solo con preguntas. */
export function Repaso() {
  const [rep] = useRepertorio()
  const lista = useMemo(() => cursos(rep), [rep])
  const lecciones = useMemo(() => lista.flatMap((c) => c.lecciones), [lista])
  // la lista de hoy se fija al abrir: lo que repaso ya no se reordena mientras repaso
  const [hoy] = useState(() => paraHoy(leerRepaso(), leerProgreso(), lecciones, dia(), leerRegistro()))
  const [i, setI] = useState(0)
  if (i >= hoy.length) {
    const manana = paraHoy(leerRepaso(), leerProgreso(), lecciones, sumarDias(dia(), 1), leerRegistro()).length
    return (
      <div className="listo-por-hoy" data-testid="listo-por-hoy">
        <h1>Listo por hoy</h1>
        <p>{hoy.length > 0 ? `Repasaste ${hoy.length} ${hoy.length === 1 ? 'línea' : 'líneas'}.` : 'Hoy no te toca repasar ninguna línea.'}</p>
        <p className="apagado" data-testid="manana">
          Mañana {manana === 1 ? 'toca 1 línea' : `tocan ${manana} líneas`}.
        </p>
        <a className="boton primario" href="#/">
          Volver al inicio
        </a>
      </div>
    )
  }
  const l = hoy[i]!
  const curso = lista.find((c) => c.id === l.cursoId)!
  return (
    <Practica
      key={`${l.id}-${i}`}
      curso={curso}
      leccion={l}
      indice={curso.lecciones.indexOf(l)}
      repaso={{
        indice: i,
        total: hoy.length,
        onTerminar: (limpia) => {
          const e = alRepasar(leerRepaso(), l.id, dia(), limpia, leerProgreso())
          guardarRepaso(e)
          const dias = ESCALONES[e[l.id]!.escalon - 1]!
          return limpia ? `Sin ayuda y sin errores: vuelve en ${dias} ${dias === 1 ? 'día' : 'días'}.` : 'Con un error o con ayuda: vuelve mañana.'
        },
        onSiguiente: () => setI(i + 1),
      }}
    />
  )
}
