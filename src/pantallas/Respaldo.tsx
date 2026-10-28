import { useRef, useState } from 'react'
import { exportar, importar, ErrorImportar } from '../repertorio/edicion.ts'
import { leerProgreso, guardarProgreso } from '../repertorio/estado.ts'
import { leerRegistro, guardarRegistro } from '../registro/almacen-registro.ts'
import { leerRepaso, guardarRepaso } from '../repaso/repaso.ts'
import { leerFavoritas, guardarFavoritas } from '../aprender/favoritas.ts'
import type { EntradaRegistro } from '../registro/registro.ts'

/** "Tus datos" (menú Más, Nota 1): exportar e importar las favoritas, el avance, el registro y el repaso. */
export function Respaldo() {
  const [aviso, setAviso] = useState<{ ok: boolean; texto: string } | null>(null)
  const archivo = useRef<HTMLInputElement>(null)
  const descargar = () => {
    const texto = exportar({ favoritas: leerFavoritas(), progreso: leerProgreso(), registro: leerRegistro(), repaso: leerRepaso() })
    const url = URL.createObjectURL(new Blob([texto], { type: 'application/json' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `mis-aperturas-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    setAviso({ ok: true, texto: 'Listo: se descargó el archivo.' })
  }
  const subir = async (f: File) => {
    try {
      const r = importar(await f.text())
      guardarFavoritas(r.favoritas)
      guardarProgreso(r.progreso)
      guardarRegistro(r.registro as EntradaRegistro[])
      guardarRepaso(r.repaso ?? {})
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
