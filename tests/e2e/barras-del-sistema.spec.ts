import { expect, test, type Page } from '@playwright/test'

/**
 * Las barras del sistema del iPhone (2026-10-30). En la app instalada, la barra de inicio de abajo y la hora de arriba
 * ocupan pantalla: `env(safe-area-inset-bottom)` y `env(safe-area-inset-top)`. Carlos vio "Palabras del curso" tapado
 * por la barra de abajo (Inicio, Jugar, Aprender, Más): la barra medía `--alto-nav` más la barra de inicio, y el espacio
 * de abajo del contenido, solo `--alto-nav` más 24. Y al deslizar, el texto pasaba detrás de la hora.
 *
 * Playwright no trae los env(): un estilo de prueba fija `--seguro-arriba` y `--seguro-abajo` (src/estilos.css) con lo
 * del iPhone 16 Pro (62 y 34). Con la página hasta abajo, el último elemento de cada pantalla con barra queda completo
 * arriba de ella; el menú "Más", también; y arriba va una franja del color del fondo, del alto de la hora.
 */
const ARRIBA = 62
const ABAJO = 34

/** Las pantallas con la barra de abajo (las que van dentro de `Marco`). */
const PANTALLAS = [
  { nombre: 'Inicio', ruta: '/' },
  { nombre: 'Jugar', ruta: '/bots' },
  { nombre: 'Aprender, con negras', ruta: '/cursos/negras' },
  { nombre: 'Aprender, con blancas', ruta: '/cursos/blancas' },
  { nombre: 'la página del curso (Palabras del curso)', ruta: '/curso/caro-kann%3Ab' },
  { nombre: 'La idea', ruta: '/curso/caro-kann%3Ab/leer/idea' },
  { nombre: 'La estructura', ruta: '/curso/caro-kann%3Ab/leer/estructura' },
  { nombre: 'El repaso del curso', ruta: '/curso/caro-kann%3Ab/leer/repaso' },
  { nombre: 'Errores y trampas', ruta: '/curso/caro-kann%3Ab/errores' },
  { nombre: 'Repaso de hoy', ruta: '/repaso' },
  { nombre: 'Refuerza', ruta: '/refuerza' },
  { nombre: 'Mis partidas', ruta: '/historial' },
  { nombre: 'Ajustes', ruta: '/ajustes' },
  { nombre: 'Instalar en el iPhone', ruta: '/instalar' },
  { nombre: 'Código fuente y licencias', ruta: '/licencias' },
]

async function conBarras(page: Page, ruta: string) {
  await page.goto('/#' + ruta)
  await page.addStyleTag({ content: `:root { --seguro-arriba: ${ARRIBA}px !important; --seguro-abajo: ${ABAJO}px !important; }` })
  await expect(page.locator('.navegacion')).toBeVisible()
  await expect(page.locator('main.contenido > *').first()).toBeVisible()
}

/** Lo más bajo que se ve dentro del contenido (sin lo fijo en la pantalla), contra lo más alto de lo que va fijo abajo. */
function medir() {
  const visible = (el: Element) => {
    const r = el.getBoundingClientRect()
    // lo de adentro de un <details> cerrado no se ve (checkVisibility lo sabe; en un navegador sin ella, se busca el details)
    const seVe = el.checkVisibility ? el.checkVisibility({ visibilityProperty: true, opacityProperty: true }) : !el.closest('details:not([open]) > :not(summary)')
    return seVe && r.width > 0 && r.height > 0
  }
  let ultimo = { abajo: 0, que: '' }
  // lo que se ve: un elemento sin hijos, uno con texto propio, un botón o un enlace, o una caja con fondo o borde (la
  // tarjeta de "Palabras del curso" se cortaba aunque su texto quedara arriba); no el relleno de una caja sin fondo
  const esHoja = (el: Element) => {
    const s = getComputedStyle(el)
    const caja = s.backgroundColor !== 'rgba(0, 0, 0, 0)' || parseFloat(s.borderBottomWidth) > 0
    return caja || !el.children.length || Array.from(el.childNodes).some((n) => n.nodeType === 3 && n.textContent!.trim()) || el.matches('button, a, summary, svg, img')
  }
  const recorrer = (el: Element) => {
    if (getComputedStyle(el).position === 'fixed') return
    if (visible(el) && esHoja(el)) {
      const r = el.getBoundingClientRect()
      if (r.bottom > ultimo.abajo) ultimo = { abajo: r.bottom, que: `${el.tagName.toLowerCase()} «${(el.textContent ?? '').trim().slice(0, 30)}»` }
    }
    for (const h of Array.from(el.children)) recorrer(h)
  }
  // lo de adentro del contenido, sin el contenido mismo (su relleno de abajo es justo el espacio que se mide)
  for (const h of Array.from(document.querySelector('main.contenido')!.children)) recorrer(h)
  const nav = document.querySelector('.navegacion')!.getBoundingClientRect()
  // lo que va fijo arriba de la barra (los botones de Jugar) también tapa
  const fijos = Array.from(document.querySelectorAll('main.contenido *')).filter((el) => getComputedStyle(el).position === 'fixed' && visible(el))
  const techo = Math.min(nav.top, ...fijos.map((el) => el.getBoundingClientRect().top))
  return { ultimo, techo, nav: { arriba: nav.top, alto: nav.height }, ventana: innerHeight }
}

test.describe('Las barras del sistema del iPhone: nada queda debajo de la barra de abajo ni detrás de la hora', () => {
  test.skip(({ isMobile }) => !isMobile, 'la barra de abajo es del celular (en la computadora va a la izquierda)')

  for (const p of PANTALLAS)
    test(`${p.nombre}: con la página hasta abajo, lo último queda completo arriba de la barra`, async ({ page }) => {
      await conBarras(page, p.ruta)
      await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight))
      await page.waitForTimeout(100)
      const m = await page.evaluate(medir)
      // la barra mide lo suyo más la barra de inicio
      expect(Math.round(m.nav.alto)).toBe(64 + ABAJO)
      expect(m.ultimo.abajo, `${p.nombre}: ${m.ultimo.que} termina en ${Math.round(m.ultimo.abajo)}; lo fijo de abajo empieza en ${Math.round(m.techo)}`).toBeLessThanOrEqual(m.techo + 0.5)
    })

  test('el menú "Más" queda completo arriba de la barra', async ({ page }) => {
    await conBarras(page, '/')
    await page.locator('.navegacion button.nav-item').click()
    const menu = await page.locator('.menu-mas').boundingBox()
    const nav = await page.locator('.navegacion').boundingBox()
    expect(menu!.y + menu!.height).toBeLessThanOrEqual(nav!.y + 0.5)
  })

  test('arriba, una franja del color del fondo, del alto de la hora: lo que se desliza no se ve detrás; al cargar, nada empieza debajo de ella', async ({ page }) => {
    await conBarras(page, '/curso/caro-kann%3Ab')
    const franja = page.getByTestId('franja-arriba')
    await expect(franja).toBeAttached()
    const caja = await franja.boundingBox()
    expect(caja).toEqual({ x: 0, y: 0, width: page.viewportSize()!.width, height: ARRIBA })
    const fondo = await page.evaluate(() => [getComputedStyle(document.querySelector('[data-testid="franja-arriba"]')!).backgroundColor, getComputedStyle(document.body).backgroundColor])
    expect(fondo[0]).toBe(fondo[1])
    // al cargar, lo primero de la página empieza abajo de la hora
    const primero = await page.locator('main.contenido > *').first().boundingBox()
    expect(primero!.y).toBeGreaterThanOrEqual(ARRIBA)
    // deslizada a la mitad, a la altura de la hora se ve la franja, no el texto
    await page.evaluate(() => window.scrollTo(0, 400))
    const encima = await page.evaluate((y) => [16, innerWidth / 2, innerWidth - 16].map((x) => document.elementFromPoint(x, y)?.getAttribute('data-testid') ?? document.elementFromPoint(x, y)?.tagName), ARRIBA / 2)
    expect(encima).toEqual(['franja-arriba', 'franja-arriba', 'franja-arriba'])
  })
})
