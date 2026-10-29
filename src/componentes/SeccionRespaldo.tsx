import { useRef, useState } from 'react'
import { importar, ErrorImportar, type Respaldo } from '../repertorio/edicion.ts'
import { cargarRespaldo, exportarMisDatos, resumenDelRespaldo } from '../estado/respaldo.ts'
import { Dialogo } from './Dialogo.tsx'

/**
 * "Respaldo" en Ajustes (ajustes de la app, opción A de Carlos): Exportar e Importar juntos, con lo que hacen en
 * palabras de usuario. Importar reemplaza lo que hay en la app: antes de hacerlo, pregunta (N5).
 */
export function SeccionRespaldo({ onCargado }: { onCargado?: () => void }) {
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const [porCargar, setPorCargar] = useState<Respaldo | null>(null)
  const archivo = useRef<HTMLInputElement>(null)
  const exportarAhora = async () => {
    const r = await exportarMisDatos()
    if (r === 'descargado') setAviso({ ok: true, texto: 'Listo: se descargó el archivo.' })
    else if (r === 'compartido') setAviso({ ok: true, texto: 'Listo: compartiste el archivo.' })
  }
  const leerArchivo = async (f: File) => {
    try {
      setPorCargar(importar(await f.text()))
      setAviso(null)
    } catch (e) {
      setAviso({ ok: false, texto: e instanceof ErrorImportar ? e.message : 'No se pudo leer el archivo.' })
    }
    if (archivo.current) archivo.current.value = ''
  }
  return (
    <section className="seccion-respaldo" aria-labelledby="titulo-respaldo" data-testid="respaldo">
      <h2 id="titulo-respaldo">Respaldo</h2>
      <p className="apagado">Tu avance vive solo en esta app, en este teléfono; no hay nube.</p>
      <div className="tarjeta opciones-respaldo">
        <div>
          <button type="button" className="boton secundario" onClick={exportarAhora} data-testid="exportar">
            Exportar mis datos
          </button>
          <p className="apagado">Guarda todo en un archivo: tu avance, tus partidas y tus ajustes. Puedes mandarlo a iCloud Drive o a Archivos.</p>
        </div>
        <div>
          <button type="button" className="boton secundario" onClick={() => archivo.current?.click()} data-testid="importar-boton">
            Importar
          </button>
          <p className="apagado">Lo carga de vuelta: si borraste la app, en un teléfono nuevo o para pasar tu avance de Safari a la app instalada (en el iPhone son copias separadas).</p>
        </div>
      </div>
      <input ref={archivo} type="file" accept="application/json,.json" hidden data-testid="importar" onChange={(e) => e.target.files?.[0] && leerArchivo(e.target.files[0])} />
      {aviso && (
        <p className={aviso.ok ? 'aviso-ok' : 'error-campo'} role="status" data-testid="aviso-respaldo">
          {aviso.texto}
        </p>
      )}
      {porCargar && (
        <Dialogo
          titulo="¿Reemplazar lo que hay en esta app?"
          confirmar="Reemplazar"
          peligro
          onConfirmar={() => {
            cargarRespaldo(porCargar)
            setAviso({ ok: true, texto: `Listo: se cargaron tus datos (${resumenDelRespaldo(porCargar)}).` })
            setPorCargar(null)
            onCargado?.()
          }}
          onCancelar={() => setPorCargar(null)}
        >
          El archivo trae {resumenDelRespaldo(porCargar)}. Lo que hay ahora en esta app se reemplaza con eso.
        </Dialogo>
      )}
    </section>
  )
}
