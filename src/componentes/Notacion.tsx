import { mostrarTexto } from '../ajedrez/mostrar.ts'

const FIGURA = /([♔♕♖♗♘])/

/**
 * C6: un texto con jugadas, como se ve en pantalla (`mostrarTexto`), con las figuras un poco más grandes: con la letra de
 * la app, las figuras salen chicas junto a las letras y cuesta leerlas en el iPhone.
 */
export function Texto({ t }: { t: string }) {
  return (
    <>
      {mostrarTexto(t)
        .split(FIGURA)
        .map((p, i) =>
          FIGURA.test(p) ? (
            <span key={i} className="figura">
              {p}
            </span>
          ) : (
            p
          ),
        )}
    </>
  )
}
