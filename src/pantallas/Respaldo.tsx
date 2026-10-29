import { useRef, useState } from 'react'
import { importar, ErrorImportar } from '../repertorio/edicion.ts'
import { cargarRespaldo, exportarMisDatos } from '../estado/respaldo.ts'

/**
 * "Tus datos" (menú Más, Nota 1): exportar e importar las favoritas, el avance, el registro y el repaso.
 * Apagada desde los ajustes de la app (`TUS_DATOS_PRENDIDA` en aprender/interruptores.ts): exportar e importar viven
 * en Ajustes → Respaldo.
 */
export function Respaldo() {
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const archivo = useRef<HTMLInputElement>(null)
  const descargar = async () => {
    if ((await exportarMisDatos()) !== 'cancelado') setAviso({ ok: true, texto: 'Listo: se descargó el archivo.' })
  }
  const subir = async (f: File) => {
    try {
      const r = importar(await f.text())
      cargarRespaldo(r)
      setAviso({ ok: true, texto: `Listo: se cargaron tus datos (${r.favoritas.length} ${r.favoritas.length === 1 ? 'favorita' : 'favoritas'}, ${Object.keys(r.progreso).length} lecciones aprendidas).` })
    } catch (e) {
      setAviso({ ok: false, texto: e instanceof ErrorImportar ? e.message : 'No se pudo leer el archivo.' })
    }
    if (archivo.current) archivo.current.value = ''
  }
  return (
    <div className="respaldo">
      <h1>Tus datos</h1>
      <p className="apagado">Guarda tus favoritas y tu avance en un archivo.</p>
      <div className="tarjeta botones-respaldo">
        <button type="button" className="boton secundario" onClick={descargar} data-testid="exportar">
          Exportar a un archivo
        </button>
        <button type="button" className="boton secundario" onClick={() => archivo.current?.click()} data-testid="importar-boton">
          Importar de un archivo
        </button>
      </div>
      <input ref={archivo} type="file" accept="application/json,.json" hidden data-testid="importar" onChange={(e) => e.target.files?.[0] && subir(e.target.files[0])} />
      {aviso && (
        <p className={aviso.ok ? 'aviso-ok' : 'error-campo'} role="status" data-testid="aviso-respaldo">
          {aviso.texto}
        </p>
      )}
    </div>
  )
}
