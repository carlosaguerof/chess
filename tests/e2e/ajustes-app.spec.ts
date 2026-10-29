import { expect, test, type Page } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { Chess } from 'chess.js'
import { captura } from './_util.ts'

/**
 * Ajustes de la app (2026-10-28), en los dos perfiles: Aprender por color y sin favoritas, Refuerza solo con lo
 * fallado, Respaldo en Ajustes (sin "Tus datos"), la guía para instalar y el "cómo funciona" (Nota 1).
 */

/** Una entrada del registro: la jugada `esperada` después de `camino`. */
function entrada(camino: string[], esperada: string, resultado: string, fecha = Date.now() - 86_400_000) {
  const c = new Chess()
  for (const s of camino) c.move(s)
  return { fen: c.fen().split(' ').slice(0, 4).join(' '), esperada, resultado, lugar: 'curso', fecha, linea: 'ejemplo', camino }
}

async function conRegistro(page: Page, registro: unknown[]) {
  await page.addInitScript((r) => localStorage.getItem('ajedrez.v1.registro') ?? localStorage.setItem('ajedrez.v1.registro', JSON.stringify(r)), registro)
}

/** La página como si estuviera abierta desde la pantalla de inicio (modo app). */
async function comoApp(page: Page) {
  await page.addInitScript(() => {
    const original = window.matchMedia.bind(window)
    window.matchMedia = (q: string) => (q.includes('display-mode: standalone') ? ({ matches: true, media: q, addEventListener() {}, removeEventListener() {} } as unknown as MediaQueryList) : original(q))
  })
}

test.describe('ajustes de la app', () => {
  test('Aprender: "Con blancas" y "Con negras", sin ♡ ni "Mis favoritas", y solo mis aperturas', async ({ page }, info) => {
    await page.goto('/#/cursos')
    await expect(page.getByTestId('pestana-blancas')).toHaveText('Con blancas')
    await expect(page.getByTestId('pestana-blancas')).toHaveAttribute('aria-selected', 'true')
    await expect(page.getByTestId('pestana-negras')).toHaveText('Con negras')
    const ids = () => page.locator('.tarjeta-apertura').evaluateAll((ts) => ts.map((t) => t.getAttribute('data-testid')))
    expect(await ids()).toEqual(['tarjeta-italiana:w', 'tarjeta-siciliana:w', 'tarjeta-caro-kann:w', 'tarjeta-francesa:w', 'tarjeta-escandinava:w', 'tarjeta-otros-1e4:w'])
    const sinFavoritas = async () => {
      const texto = await page.locator('main').innerText()
      expect(texto).not.toMatch(/Mis favoritas|Todas|♡|Londres|Gambito/)
      await expect(page.locator('.corazon')).toHaveCount(0)
    }
    await sinFavoritas()
    await captura(page, info, 'ajustes-aprender-blancas')
    await page.getByTestId('pestana-negras').click()
    await expect(page.getByTestId('pestana-negras')).toHaveAttribute('aria-selected', 'true')
    expect(await ids()).toEqual(['tarjeta-caro-kann:b', 'tarjeta-eslava:b', 'tarjeta-otros-negras:b'])
    await sinFavoritas()
    // las populares apagadas no se abren ni por su dirección
    for (const id of ['londres:w', 'gambito-dama:w', 'siciliana:b', 'escandinava:b', 'gambito-dama-declinado:b']) {
      await page.goto('/#/curso/' + encodeURIComponent(id))
      await expect(page.getByText('No encontré esa apertura')).toBeVisible()
    }
  })

  test('Refuerza: solo las jugadas falladas, de la que más fallo a la que menos', async ({ page }, info) => {
    await conRegistro(page, [
      ...['fallo', 'acierto'].map((r) => entrada(['e4'], 'c6', r)),
      ...['fallo', 'pista', 'respuesta'].map((r) => entrada(['e4', 'c5'], 'c3', r)),
      ...['fallo', 'fallo'].map((r) => entrada(['e4', 'c6', 'd4', 'd5'], 'e5', r)),
      ...[1, 2, 3].map(() => entrada([], 'e4', 'acierto')),
    ])
    await page.goto('/')
    await expect(page.getByTestId('ir-refuerza')).toHaveAttribute('data-n', '3')
    await page.getByTestId('ir-refuerza').getByRole('link', { name: 'Reforzar' }).click()
    const filas = page.getByTestId('jugada-refuerza')
    await expect(filas).toHaveCount(3)
    expect(await filas.evaluateAll((f) => f.map((x) => Number(x.getAttribute('data-fallos'))))).toEqual([3, 2, 1])
    await expect(page.getByTestId('conteo-refuerza')).toHaveText('3 jugadas que has fallado')
    const texto = await page.locator('main').innerText()
    expect(texto).not.toMatch(/nunca practicada|sin practicar|bien \d/)
    await captura(page, info, 'ajustes-refuerza')
  })

  test('Refuerza sin jugadas falladas: lo dice en una línea y el inicio no lleva botón', async ({ page }, info) => {
    await conRegistro(page, [entrada([], 'e4', 'acierto')])
    await page.goto('/')
    const tarjeta = page.getByTestId('ir-refuerza')
    await expect(tarjeta).toHaveAttribute('data-n', '0')
    await expect(tarjeta).toContainText('Aún no hay jugadas falladas.')
    await expect(tarjeta.getByRole('link')).toHaveCount(0)
    await captura(page, info, 'ajustes-inicio-sin-falladas')
    await page.goto('/#/refuerza')
    await expect(page.getByTestId('refuerza-vacia')).toContainText('Aún no hay jugadas falladas.')
    await expect(page.getByTestId('empezar-refuerza')).toHaveCount(0)
  })

  test('"Tus datos" ya no existe; Respaldo en Ajustes exporta todo e importa con confirmación', async ({ page }, info) => {
    await page.addInitScript(() => {
      if (localStorage.getItem('ajedrez.v1.progreso')) return
      localStorage.setItem('ajedrez.v1.progreso', JSON.stringify({ 'caro-kann:b/b:caro-kann/avance-short': { fecha: 1 } }))
      localStorage.setItem('ajedrez.v1.historial', JSON.stringify([{ id: 'p1', botId: 'brisa', colorHumano: 'w', resultado: 'gane', fin: 'jaque mate', jugadas: 20, fecha: 3 }]))
      localStorage.setItem('ajedrez.v1.sonido', 'true')
    })
    await page.goto('/')
    await page.getByRole('button', { name: 'Más' }).click()
    await expect(page.getByRole('menuitem', { name: 'Tus datos' })).toHaveCount(0)
    await page.getByRole('menuitem', { name: 'Ajustes' }).click()
    const respaldo = page.getByTestId('respaldo')
    await expect(respaldo.getByRole('heading', { name: 'Respaldo' })).toBeVisible()
    await expect(respaldo).toContainText('no hay nube')
    await expect(respaldo).toContainText('iCloud Drive o a Archivos')
    await expect(respaldo).toContainText('de Safari a la app instalada')
    // exportar baja el archivo, con todo
    const descarga = page.waitForEvent('download')
    await page.getByTestId('exportar').click()
    const d = await descarga
    expect(d.suggestedFilename()).toMatch(/^mis-aperturas-\d{4}-\d{2}-\d{2}\.json$/)
    const ruta = await d.path()
    const r = JSON.parse(readFileSync(ruta, 'utf8'))
    expect(Object.keys(r.progreso)).toEqual(['caro-kann:b/b:caro-kann/avance-short'])
    expect(r.historial).toHaveLength(1)
    expect(r.ajustes.sonido).toBe(true)
    await expect(page.getByTestId('aviso-respaldo')).toContainText('se descargó')
    await captura(page, info, 'ajustes-respaldo')
    // importar: se borra lo de la app (como en la app instalada, vacía), se escoge el archivo y pregunta antes
    await page.evaluate(() => {
      localStorage.setItem('ajedrez.v1.progreso', '{}')
      localStorage.setItem('ajedrez.v1.historial', '[]')
    })
    await page.getByTestId('importar').setInputFiles(ruta)
    const dialogo = page.getByRole('dialog', { name: '¿Reemplazar lo que hay en esta app?' })
    await expect(dialogo).toContainText('1 lección aprendida y 1 partida')
    await captura(page, info, 'ajustes-importar-confirmar')
    // Cancelar no cambia nada
    await dialogo.getByRole('button', { name: 'Cancelar' }).click()
    expect(await page.evaluate(() => localStorage.getItem('ajedrez.v1.progreso'))).toBe('{}')
    // Reemplazar lo carga
    await page.getByTestId('importar').setInputFiles(ruta)
    await page.getByRole('dialog').getByRole('button', { name: 'Reemplazar' }).click()
    await expect(page.getByTestId('aviso-respaldo')).toContainText('se cargaron tus datos (1 lección aprendida y 1 partida)')
    expect(JSON.parse((await page.evaluate(() => localStorage.getItem('ajedrez.v1.historial')))!)).toHaveLength(1)
    // un archivo ajeno dice qué pasó, sin preguntar
    await page.getByTestId('importar').setInputFiles({ name: 'otro.json', mimeType: 'application/json', buffer: Buffer.from('{"hola":1}') })
    await expect(page.getByTestId('aviso-respaldo')).toContainText('no es un respaldo de esta app')
    await expect(page.getByRole('dialog')).toHaveCount(0)
    // y la ruta vieja de "Tus datos" ya no abre esa pantalla
    await page.goto('/#/datos')
    await expect(page.getByRole('heading', { name: 'Tus datos' })).toHaveCount(0)
    await expect(page.getByTestId('jugar-recomendado')).toBeVisible()
  })

  test('abierta como app y sin poder compartir: exportar baja el archivo', async ({ page }) => {
    await comoApp(page)
    // sin compartir (como en el navegador de las pruebas): se descarga
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'share', { value: undefined, configurable: true })
    })
    await page.goto('/#/ajustes')
    const descarga = page.waitForEvent('download')
    await page.getByTestId('exportar').click()
    expect((await descarga).suggestedFilename()).toMatch(/\.json$/)
    await expect(page.getByTestId('aviso-respaldo')).toContainText('se descargó')
  })

  test('abierta como app con compartir (como en el iPhone): exportar abre compartir con el archivo', async ({ page }) => {
    await comoApp(page)
    await page.addInitScript(() => {
      const w = window as unknown as { compartido: { nombre: string; tipo: string; tam: number }[] }
      w.compartido = []
      Object.defineProperty(navigator, 'canShare', { value: (d: { files?: File[] }) => !!d.files?.length, configurable: true })
      Object.defineProperty(navigator, 'share', {
        value: async (d: { files: File[] }) => {
          for (const f of d.files) w.compartido.push({ nombre: f.name, tipo: f.type, tam: f.size })
        },
        configurable: true,
      })
    })
    await page.goto('/#/ajustes')
    let descargas = 0
    page.on('download', () => descargas++)
    await page.getByTestId('exportar').click()
    await expect(page.getByTestId('aviso-respaldo')).toContainText('compartiste el archivo')
    const compartido = await page.evaluate(() => (window as unknown as { compartido: { nombre: string; tipo: string; tam: number }[] }).compartido)
    expect(compartido).toHaveLength(1)
    expect(compartido[0]!.nombre).toMatch(/^mis-aperturas-.*\.json$/)
    expect(compartido[0]!.tipo).toBe('application/json')
    expect(compartido[0]!.tam).toBeGreaterThan(50)
    expect(descargas).toBe(0)
  })

  test('la guía "Instalar en el iPhone": abre desde Más y muestra los pasos de Safari', async ({ page }, info) => {
    await page.goto('/')
    await page.getByRole('button', { name: 'Más' }).click()
    await page.getByRole('menuitem', { name: 'Instalar en el iPhone' }).click()
    await expect(page.getByRole('heading', { name: 'Instalar en el iPhone' })).toBeVisible()
    await expect(page.getByText('Con Safari. Para Android o computadora aún no hay guía.')).toBeVisible()
    const pasos = page.getByTestId('paso-instalar')
    await expect(pasos).toHaveCount(7)
    const textos = await pasos.allInnerTexts()
    for (const [i, boton] of ['⋯', 'Share', 'View More', 'Add to Home Screen', 'Open as Web App', 'Add', 'Aperturas'].entries()) expect(textos[i]).toContain(boton)
    // cada paso, con su dibujo propio (nunca una captura)
    await expect(page.locator('.pasos-instalar svg.dibujo-paso')).toHaveCount(7)
    await expect(page.locator('.instalar img')).toHaveCount(0)
    await expect(page.getByTestId('nota-instalar')).toContainText('Funciona sin internet después de abrirla una vez, y lo que guardas vive en esa app.')
    await expect(page.getByTestId('ya-instalada')).toHaveCount(0)
    await captura(page, info, 'ajustes-instalar')
  })

  test('la guía "Instalar en el iPhone", abierta ya como app: "Ya la tienes como app"', async ({ page }, info) => {
    await comoApp(page)
    await page.goto('/#/instalar')
    await expect(page.getByTestId('ya-instalada')).toHaveText('Ya la tienes como app.')
    await expect(page.getByTestId('paso-instalar')).toHaveCount(0)
    await expect(page.getByTestId('nota-instalar')).toBeVisible()
    await captura(page, info, 'ajustes-instalar-ya')
  })
})

test('los estilos nuevos no pisan los de antes: el globo con la frase del bot en Jugar sigue en su lugar', async ({ page }) => {
  // el globito del ⓘ se llamó primero "globo", como el del bot, y lo volvía flotante (encontrado en las capturas)
  await page.goto('/#/bots')
  const globo = page.locator('.globo').first()
  await expect(globo).toBeVisible()
  expect(await globo.evaluate((g) => getComputedStyle(g).position)).toBe('relative')
  expect(await globo.evaluate((g) => getComputedStyle(g).backgroundColor)).toBe('rgb(255, 255, 255)')
})

test.describe('Nota 1 · "cómo funciona" con ⓘ en Repaso de hoy y en Refuerza', () => {
  /** ⓘ → globito → ventana; Siguiente y Atrás; Salir en el último; tocar fuera cierra el globito y la ventana. */
  async function recorrer(page: Page, id: 'repaso' | 'refuerza', enlace: string, pasos: number) {
    const info = page.getByTestId(`info-${id}`).first()
    // el globito, y un toque fuera lo cierra
    await info.click()
    await expect(page.getByTestId('globo')).toContainText(enlace)
    await page.getByTestId('globo-fondo').click({ position: { x: 5, y: 5 } })
    await expect(page.getByTestId('globo')).toHaveCount(0)
    // el enlace abre la ventana en el paso 1, sin Atrás
    await info.click()
    await page.getByTestId(`ver-como-funciona-${id}`).click()
    const ventana = page.getByTestId('como-funciona')
    await expect(ventana).toHaveAttribute('data-paso', '1')
    await expect(page.getByTestId('globo')).toHaveCount(0)
    await expect(page.getByTestId('paso-atras')).toHaveCount(0)
    await expect(page.getByTestId('paso-siguiente')).toHaveText('Siguiente')
    const primero = await page.getByTestId('como-funciona-paso').innerText()
    // Siguiente y Atrás
    await page.getByTestId('paso-siguiente').click()
    await expect(ventana).toHaveAttribute('data-paso', '2')
    await expect(page.getByTestId('como-funciona-paso')).not.toHaveText(primero)
    await page.getByTestId('paso-atras').click()
    await expect(ventana).toHaveAttribute('data-paso', '1')
    await expect(page.getByTestId('como-funciona-paso')).toHaveText(primero)
    // hasta el último: Siguiente se vuelve Salir y Atrás se queda
    for (let i = 1; i < pasos; i++) await page.getByTestId('paso-siguiente').click()
    await expect(ventana).toHaveAttribute('data-paso', String(pasos))
    await expect(page.getByTestId('como-funciona-paso')).toContainText('opcional')
    await expect(page.getByTestId('paso-siguiente')).toHaveText('Salir')
    await expect(page.getByTestId('paso-atras')).toBeVisible()
    await page.getByTestId('paso-siguiente').click()
    await expect(ventana).toHaveCount(0)
    // un toque fuera de la ventana también la cierra
    await info.click()
    await page.getByTestId(`ver-como-funciona-${id}`).click()
    await expect(ventana).toBeVisible()
    await page.getByTestId('como-funciona-fondo').click({ position: { x: 5, y: 5 } })
    await expect(ventana).toHaveCount(0)
  }

  test('en el inicio: el ⓘ de Repaso de hoy y el de Refuerza (sin abrir sus pantallas)', async ({ page }, info) => {
    await conRegistro(page, [entrada(['e4'], 'c6', 'fallo')])
    await page.goto('/')
    await recorrer(page, 'repaso', 'Ver cómo funciona el Repaso de hoy', 7)
    await recorrer(page, 'refuerza', 'Ver cómo funciona Refuerza', 5)
    // el ⓘ no abre la tarjeta (que lleva a Refuerza)
    await expect(page).toHaveURL(/#\/$|\/$/)
    await page.getByTestId('info-refuerza').click()
    await captura(page, info, 'nota1-globito')
    await page.getByTestId('ver-como-funciona-refuerza').click()
    await captura(page, info, 'nota1-ventana')
  })

  test('en sus pantallas: Refuerza y el Repaso de hoy', async ({ page }) => {
    await page.goto('/#/refuerza')
    await recorrer(page, 'refuerza', 'Ver cómo funciona Refuerza', 5)
    await page.goto('/#/repaso')
    await expect(page.getByTestId('listo-por-hoy')).toBeVisible()
    await recorrer(page, 'repaso', 'Ver cómo funciona el Repaso de hoy', 7)
  })

  test('en el Repaso de hoy, con una línea que toca: el ⓘ va arriba de la lección', async ({ page }, info) => {
    await page.addInitScript((fecha) => {
      if (!localStorage.getItem('ajedrez.v1.progreso')) localStorage.setItem('ajedrez.v1.progreso', JSON.stringify({ 'caro-kann:b/b:caro-kann/avance-short': { fecha } }))
    }, Date.now() - 3 * 86_400_000)
    await page.goto('/#/repaso')
    await expect(page.getByTestId('leccion-pantalla')).toBeVisible()
    await recorrer(page, 'repaso', 'Ver cómo funciona el Repaso de hoy', 7)
    await captura(page, info, 'nota1-repaso-leccion')
  })
})
