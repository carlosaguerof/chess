import type { CambioDeTexto, CapaCurso, DatosCurso, LeccionCapa, PaginaCapa, PaginaLeer, ParrafoCapa, PasoAPaso, PiezaLeer, PlanVariante, VarianteCurso } from './tipos.ts'

/**
 * Un curso que sale de otro (`specs/cursos.md` §6): la capa trae solo lo que cambia y aquí se compone con el curso de
 * origen. Las explicaciones de cada jugada (`mias`, `rival`), los planes, las fuentes y el glosario son los mismos
 * objetos del curso de origen: una corrección futura llega a los dos. Si un texto que la capa cambia ya no existe, el
 * curso no carga: así no se pierde un cambio sin que nadie se entere.
 */
function cambiar(texto: string, cambios: CambioDeTexto[] = [], donde: string): string {
  return cambios.reduce((t, [de, a]) => {
    if (!t.includes(de)) throw new Error(`${donde}: no encontré "${de}"`)
    return t.replace(de, a)
  }, texto)
}

/**
 * Cambia la frase que trae el texto, en el paso que sea (el paso, sus jugadas y sus marcas se quedan), o pone un paso
 * nuevo antes de esa frase.
 */
function cambiarPasos(pa: PasoAPaso | undefined, cambios: NonNullable<LeccionCapa['pasosDelPlan']>, donde: string): PasoAPaso | undefined {
  if (!pa) throw new Error(`${donde}: el plan no trae paso a paso`)
  return cambios.reduce((p, cambio) => {
    const texto = Array.isArray(cambio) ? cambio[0] : cambio.antesDe
    const i = p.pasos.findIndex((x) => x.frase.includes(texto))
    if (i < 0) throw new Error(`${donde}: no encontré "${texto}"`)
    if (!Array.isArray(cambio)) return { ...p, pasos: [...p.pasos.slice(0, i), cambio.paso, ...p.pasos.slice(i)] }
    return { ...p, pasos: p.pasos.map((x, k) => (k === i ? { ...x, frase: cambiar(x.frase, [cambio], donde) } : x)) }
  }, pa)
}

/** Sin cambios, el plan es el mismo objeto del curso de origen; con ellos, cambia solo lo que la capa dice. */
function planDe(v: VarianteCurso, l: LeccionCapa, donde: string): PlanVariante {
  if (!l.planTuyo && !l.pasosDelPlan) return v.plan
  return { ...v.plan, tuyo: cambiar(v.plan.tuyo, l.planTuyo, donde), pasoAPaso: l.pasosDelPlan ? cambiarPasos(v.plan.pasoAPaso, l.pasosDelPlan, donde) : v.plan.pasoAPaso }
}

function parrafo(p: ParrafoCapa, origen: PaginaLeer | undefined, donde: string): string {
  if (typeof p === 'string') return p
  const t = origen?.texto[p.de]
  if (t === undefined) throw new Error(`${donde}: no existe el párrafo ${p.de}`)
  return cambiar(t, p.cambia, donde)
}

function pieza(origen: PiezaLeer, paginas: PaginaCapa[], donde: string): PiezaLeer {
  return {
    titulo: origen.titulo,
    paginas: paginas.map((g, i) => {
      const { de, texto, ...lo } = g
      const base = de === undefined ? undefined : origen.paginas[de]
      if (de !== undefined && !base) throw new Error(`${donde}: no existe la página ${de}`)
      const nuevo = { ...base, ...lo } as PaginaLeer
      return { ...nuevo, texto: texto ? texto.map((p) => parrafo(p, base, `${donde}, página ${i + 1}`)) : (base?.texto ?? []) }
    }),
  }
}

export function componerCurso(origen: DatosCurso, capa: CapaCurso): DatosCurso {
  if (capa.de !== origen.id) throw new Error(`${capa.id}: sale de ${capa.de}, no de ${origen.id}`)
  const variantes = capa.secciones.flatMap((s) =>
    s.lecciones.map((l) => {
      const v = origen.variantes.find((x) => x.id === l.id)
      if (!v) throw new Error(`${capa.id}: no existe la variante ${l.id}`)
      const donde = `${capa.id}, ${l.id}`
      const intro = `${l.frase} ${cambiar(v.intro, l.cambia, donde)}`
      const nueva = { ...v, intro, idea: cambiar(v.idea, l.idea, donde), plan: planDe(v, l, donde) }
      return l.estructura ? { ...nueva, estructura: l.estructura } : nueva
    }),
  )
  const lista = capa.piezas.errores.lista.map((id) => {
    const e = origen.piezas.errores.lista.find((x) => x.id === id)
    if (!e) throw new Error(`${capa.id}: no existe el error ${id}`)
    return e
  })
  return {
    ...origen,
    id: capa.id,
    nombre: capa.nombre,
    version: capa.version,
    fichasDe: origen.fichasDe ?? origen.id,
    secciones: capa.secciones.map(({ lecciones, ...s }) => ({ ...s, variantes: lecciones.map((l) => l.id) })),
    fuentes: { ...origen.fuentes, ...capa.fuentes },
    glosario: [...origen.glosario, ...(capa.glosario ?? [])].sort((a, b) => a.termino.localeCompare(b.termino, 'es')),
    piezas: {
      idea: pieza(origen.piezas.idea, capa.piezas.idea.paginas, `${capa.id}, La idea`),
      estructura: pieza(origen.piezas.estructura, capa.piezas.estructura.paginas, `${capa.id}, La estructura`),
      errores: { ...origen.piezas.errores, intro: capa.piezas.errores.intro, lista },
      repaso: pieza(origen.piezas.repaso, capa.piezas.repaso.paginas, `${capa.id}, Repaso`),
    },
    variantes,
  }
}
