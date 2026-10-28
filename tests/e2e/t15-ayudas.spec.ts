import { expect, test } from '@playwright/test'
import { captura, jugar } from './_util.ts'

test('las tres ayudas se prenden y apagan, se recuerdan al recargar, y el bot sigue a tiempo', async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem('ajedrez.v1.opciones-partida', JSON.stringify({ guia: false, misLineas: false })))
  // 1.e4 e6 2.Ac4 d5: mi alfil de c4 lo ataca un peón (vale menos): amenaza
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=e2e4,e7e6,f1c4,d7d5')
  await expect(page.getByTestId('barra-eval')).toHaveCount(0)
  await page.getByTestId('ayudas').click()
  const menu = page.getByRole('dialog', { name: 'Ayudas' })
  for (const a of ['barra', 'amenazas', 'sugerencia']) await expect(menu.getByTestId(`ayuda-${a}`)).not.toBeChecked()
  for (const a of ['barra', 'amenazas', 'sugerencia']) await menu.getByTestId(`ayuda-${a}`).check({ force: true })
  await captura(page, info, 't15-menu-ayudas')
  await menu.getByRole('button', { name: 'Listo' }).click()
  // barra, amenaza y sugerencia
  await expect(page.getByTestId('barra-eval').first()).toBeAttached()
  await expect(page.getByTestId('flechas')).toHaveAttribute('data-flechas', /red:d5c4/)
  await expect(page.getByTestId('flechas')).toHaveAttribute('data-flechas', /green:/, { timeout: 15_000 })
  await captura(page, info, 't15-ayudas-prendidas')
  // se recuerdan al recargar
  await page.reload()
  await page.getByTestId('ayudas').click()
  for (const a of ['barra', 'amenazas', 'sugerencia']) await expect(page.getByRole('dialog', { name: 'Ayudas' }).getByTestId(`ayuda-${a}`)).toBeChecked()
  await page.getByRole('dialog', { name: 'Ayudas' }).getByRole('button', { name: 'Listo' }).click()
  // el bot contesta dentro de su rango (0.4 a 1.2 s) con las tres prendidas: se mide en la página, desde que mi
  // jugada está en la lista hasta que aparece la suya (margen anotado: 0.5 s por el sondeo y la carga de la máquina)
  await jugar(page, info, 'c4b3')
  const ms = await page.evaluate(
    () =>
      new Promise<number>((listo) => {
        const lista = () => document.querySelectorAll('[data-testid="lista-jugadas"] [data-testid="jugada"]').length
        const t0 = performance.now()
        const ver = () => (lista() >= 6 ? listo(performance.now() - t0) : requestAnimationFrame(ver))
        ver()
      }),
  )
  expect(ms).toBeLessThanOrEqual(1200 + 500)
  // y se apagan
  await page.getByTestId('ayudas').click()
  for (const a of ['barra', 'amenazas', 'sugerencia']) await page.getByRole('dialog', { name: 'Ayudas' }).getByTestId(`ayuda-${a}`).uncheck({ force: true })
  await page.getByRole('dialog', { name: 'Ayudas' }).getByRole('button', { name: 'Listo' }).click()
  await expect(page.getByTestId('barra-eval')).toHaveCount(0)
  await expect(page.getByTestId('flechas')).toHaveAttribute('data-flechas', '')
})

test('al terminar por mate, la barra se llena del lado del ganador', async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem('ajedrez.v1.ayudas', JSON.stringify({ barra: true, amenazas: false, sugerencia: false })))
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&jugadas=e2e4,e7e5,d1h5,b8c6,f1c4,g8f6')
  await jugar(page, info, 'h5f7')
  await expect(page.getByTestId('aviso-final')).toContainText('¡Ganaste!')
  await expect(page.getByTestId('barra-eval').first()).toHaveAttribute('data-blancas', '100')
})

test('con negras, la barra marca la ventaja del lado correcto (y en el iPhone, Pista y Respuesta se ven con guía, reloj y barra)', async ({ page }, info) => {
  await page.addInitScript(() => localStorage.setItem('ajedrez.v1.ayudas', JSON.stringify({ barra: true, amenazas: false, sugerencia: false })))
  // 1.e4 e5 2.Cf3 Dh4?? 3.Cxh4: blancas con una dama de más; juego con negras, con guía y 10 minutos
  await page.goto('/#/prueba-partida?bot=brisa&color=b&guia=1&tiempo=10%2B0&jugadas=e2e4,e7e5,g1f3,d8h4,f3h4')
  const barra = page.locator('[data-testid="barra-eval"]:visible')
  await expect(barra).toHaveAttribute('data-blancas', /^(9\d|100)$/, { timeout: 15_000 })
  // lo mío (negras) es la parte rellena: casi nada
  const relleno = await barra.evaluate((b) => (b.querySelector('i') as HTMLElement).getBoundingClientRect())
  const total = await barra.evaluate((b) => b.getBoundingClientRect())
  const mio = info.project.name === 'iphone' ? relleno.width / total.width : relleno.height / total.height
  expect(mio).toBeLessThan(0.15)
  await captura(page, info, 't15-barra-negras')
  // Pista y Respuesta se pueden tocar sin desplazarse (nada las tapa)
  for (const b of ['pista', 'respuesta']) {
    const tapada = await page.getByTestId(b).evaluate((el) => {
      const r = el.getBoundingClientRect()
      const arriba = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)
      return !(arriba && el.contains(arriba))
    })
    expect(tapada, b).toBe(false)
  }
})

