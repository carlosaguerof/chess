import { expect, test, type Page } from '@playwright/test'
import { obligatorias } from '../../src/curso/datos.ts'
import { cambiarNotacion, mostrarTexto } from '../../src/ajedrez/mostrar.ts'
import { abrirInicioCon, cursosTerminados, ESTADOS, nombresPosibles, nuevoDe, ORDEN, otros } from './_seguir.ts'

/**
 * "Seguir" en Inicio (vuelta 5, escalón 1; `specs/aprender.md`, "Seguir"): un toque y caes en lo siguiente que toca,
 * sin pasar por Aprender. Con el avance vacío, con la Caro-Kann a medias, con un curso terminado, con Otras defensas
 * contra 1.e4 en turno y con todo terminado. Y su texto cabe, en tres renglones, a 360 de ancho.
 */

/** Los nombres como se ven con "Notación: Letras" en Ajustes (Nf3, O-O); de regreso a figuras al terminar. */
function conLetras(ns: string[]): string[] {
  cambiarNotacion('letras')
  const r = ns.map((n) => mostrarTexto(n))
  cambiarNotacion('figuras')
  return r
}

const boton = (page: Page) => page.getByTestId('seguir-inicio')
const enc = encodeURIComponent

test.describe('Seguir en Inicio', () => {
  test('es lo primero de Inicio, arriba de Jugar, y Repaso y Refuerza siguen debajo', async ({ page }) => {
    await abrirInicioCon(page, ESTADOS.vacio)
    const hijos = page.locator('.inicio > *')
    await expect(hijos.first()).toHaveAttribute('data-testid', 'seguir-inicio')
    const y = async (id: string) => (await page.getByTestId(id).boundingBox())!.y
    expect(await y('seguir-inicio')).toBeLessThan(await y('jugar-recomendado'))
    expect(await y('jugar-recomendado')).toBeLessThan(await y('repaso-hoy'))
    expect(await y('repaso-hoy')).toBeLessThan(await y('ir-refuerza'))
    // la acción principal es una sola ("Pantalla limpia", regla 1): Jugar queda gris, en su lugar y de su tamaño
    await expect(page.locator('.inicio .boton.primario.grande')).toHaveCount(1)
    await expect(page.getByTestId('jugar-recomendado')).toHaveClass(/secundario/)
    await expect(page.getByTestId('jugar-recomendado')).toHaveClass(/grande/)
  })

  test('con el avance vacío: Defensa Caro-Kann, La idea, y un toque la abre', async ({ page }) => {
    await abrirInicioCon(page, ESTADOS.vacio)
    await expect(boton(page)).toContainText('Seguir')
    await expect(page.getByTestId('seguir-curso')).toHaveText('Defensa Caro-Kann')
    await expect(page.getByTestId('seguir-paso')).toHaveText('La idea')
    await boton(page).click()
    await expect(page).toHaveURL(new RegExp(`#/curso/${enc('caro-kann-estructuras:b')}/leer/idea$`))
    await expect(page.getByTestId('pieza-idea')).toBeVisible()
  })

  test('con la Caro-Kann a medias: regresa a la lección que dejó, en la vuelta donde iba', async ({ page }) => {
    await abrirInicioCon(page, ESTADOS['a-medias'])
    const v2 = obligatorias(nuevoDe('caro-kann:b'))[1]!
    await expect(page.getByTestId('seguir-curso')).toHaveText('Defensa Caro-Kann')
    await expect(page.getByTestId('seguir-paso')).toHaveText(mostrarTexto(v2.nombre))
    await boton(page).click()
    await expect(page).toHaveURL(new RegExp(`/linea/${enc(`v:${v2.id}`)}$`))
    await expect(page.getByTestId('leccion-curso')).toHaveAttribute('data-vuelta', 'practicar')
  })

  test('con un curso terminado: Apertura Italiana, La idea', async ({ page }) => {
    await abrirInicioCon(page, ESTADOS['un-curso'])
    await expect(page.getByTestId('seguir-curso')).toHaveText('Apertura Italiana')
    await expect(page.getByTestId('seguir-paso')).toHaveText('La idea')
    await boton(page).click()
    await expect(page).toHaveURL(new RegExp(`#/curso/${enc('italiana:w')}/leer/idea$`))
    await expect(page.getByTestId('pieza-idea')).toBeVisible()
  })

  test('con los ocho nuevos terminados: Otras defensas contra 1.e4, solo con el nombre de la defensa', async ({ page }) => {
    const o = otros()
    await abrirInicioCon(page, { ...cursosTerminados(ORDEN.slice(0, 8)), progreso: { [o.lecciones[0]!.id]: { fecha: 1 } } })
    await expect(page.getByTestId('seguir-curso')).toHaveText('Otras defensas contra 1.e4')
    await expect(page.getByTestId('seguir-paso')).toHaveText(`Lección 2 de 8: ${o.lecciones[1]!.familia}`)
    await boton(page).click()
    await expect(page).toHaveURL(new RegExp(`#/leccion/${enc('otros-1e4:w')}/1$`))
    await expect(page.getByTestId('leccion-pantalla')).toBeVisible()
  })

  test('con todo terminado: Repasar, y lleva al Repaso de hoy', async ({ page }) => {
    await abrirInicioCon(page, ESTADOS.todo)
    await expect(boton(page)).toContainText('Repasar')
    await expect(page.getByTestId('seguir-curso')).toHaveText('Terminaste los nueve cursos')
    await expect(page.getByTestId('seguir-paso')).toHaveText('Repaso de hoy')
    await boton(page).click()
    await expect(page).toHaveURL(/#\/repaso$/)
  })

  test('cada renglón cabe en uno solo a 360 de ancho, con cada curso y cada paso posible', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 740 })
    await abrirInicioCon(page, ESTADOS.vacio)
    const nombres = [...new Set([...ORDEN.flatMap(nombresPosibles), 'Terminaste los nueve cursos', 'Repaso de hoy'])]
    expect(nombres.some((n) => /C[a-h]?[1-8]|A[a-h][1-8]/.test(n))).toBe(true) // hay jugadas que cambian entre figuras y letras
    const medidas = await page.evaluate((ns) => {
      const s = document.querySelector('[data-testid="seguir-paso"]') as HTMLElement
      const alto = (() => {
        s.textContent = 'La idea'
        return s.getBoundingClientRect().height
      })()
      return ns.map((n) => {
        s.textContent = n
        return { n, alto: s.getBoundingClientRect().height, cabe: s.scrollWidth <= s.clientWidth + 1, uno: s.getBoundingClientRect().height <= alto + 1 }
      })
    }, [...nombres.map((n) => mostrarTexto(n)), ...conLetras(nombres)])
    for (const m of medidas) expect(m.uno && m.cabe, `${m.n} (${m.alto})`).toBe(true)
  })
})
