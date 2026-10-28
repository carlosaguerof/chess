import { expect, test } from '@playwright/test'
import { captura, jugar, tocar } from './_util.ts'

test.describe('T14 · reloj', () => {
  test('"Elegir tiempo": tres grupos, "Sin tiempo" la primera vez, y se recuerda', async ({ page }, info) => {
    await page.goto('/#/bot/brisa')
    await expect(page.getByTestId('elegir-tiempo')).toContainText('Sin tiempo')
    await page.getByTestId('elegir-tiempo').click()
    const v = page.getByRole('dialog', { name: 'Elegir tiempo' })
    for (const g of ['Bullet', 'Blitz', 'Rapid']) await expect(v.getByRole('region', { name: g }).getByRole('button')).toHaveCount(3)
    await expect(v.getByTestId('tiempo-sin')).toHaveAttribute('aria-pressed', 'true')
    await captura(page, info, 't14-elegir-tiempo')
    await v.getByTestId('tiempo-3+2').click()
    await expect(page.getByTestId('elegir-tiempo')).toContainText('3 | 2')
    await page.getByTestId('jugar').click()
    await expect(page.getByTestId('reloj-yo')).toContainText('3:00')
    await page.goto('/#/bot/hugo')
    await expect(page.getByTestId('elegir-tiempo')).toContainText('3 | 2')
  })

  test('una partida de 1 minuto termina por tiempo con su aviso; recargar conserva el tiempo (tolerancia: 1.5 s)', async ({ page }, info) => {
    await page.clock.install()
    await page.addInitScript(() => {
      localStorage.setItem('ajedrez.v1.tiempo', JSON.stringify('1+0'))
      localStorage.setItem('ajedrez.v1.opciones-partida', JSON.stringify({ guia: false, misLineas: false }))
    })
    await page.goto('/')
    await page.getByTestId('jugar-recomendado').click()
    await expect(page.getByTestId('reloj-yo')).toContainText('1:00')
    const segundos = async () => {
      const [m, s] = (await page.getByTestId('reloj-yo').textContent())!.split(':').map(Number) as [number, number]
      return m * 60 + s
    }
    // pasan 20 s sin que juegue (el reloj de prueba también corre en tiempo real: tolerancia de 2 s)
    await page.clock.runFor(20_000)
    const antes = await segundos()
    expect(Math.abs(antes - 40)).toBeLessThanOrEqual(2)
    await page.reload()
    // recargar: sigue donde iba (tolerancia anotada: 1.5 s)
    await expect(page.getByTestId('reloj-yo')).toBeVisible()
    expect(Math.abs((await segundos()) - antes)).toBeLessThanOrEqual(1.5)
    await captura(page, info, 't14-reloj')
    // se me acaba el tiempo
    await page.clock.runFor(45_000)
    const aviso = page.getByTestId('aviso-final')
    await expect(aviso).toBeVisible()
    await expect(aviso).toContainText('Perdiste')
    await expect(aviso).toContainText('Se te acabó el tiempo')
    await captura(page, info, 't14-sin-tiempo')
  })
})

test('el reloj no corre con la app oculta aunque el bot juegue mientras tanto, ni mientras decido tras un desvío', async ({ page }, info) => {
  // la app "oculta" a voluntad (como al bloquear el iPhone)
  await page.addInitScript(() => {
    const w = window as unknown as { __vis?: string }
    Object.defineProperty(document, 'visibilityState', { get: () => w.__vis ?? 'visible', configurable: true })
    Object.defineProperty(document, 'hidden', { get: () => (w.__vis ?? 'visible') === 'hidden', configurable: true })
  })
  const ocultar = (v: 'hidden' | 'visible') =>
    page.evaluate((x) => {
      ;(window as unknown as { __vis?: string }).__vis = x
      document.dispatchEvent(new Event('visibilitychange'))
    }, v)
  const tiempos = async () => ({ yo: await page.getByTestId('reloj-yo').textContent(), bot: await page.getByTestId('reloj-rival').textContent() })
  // 3 minutos, sin guía: juego y oculto la app antes de que conteste el bot
  await page.goto('/#/prueba-partida?bot=brisa&color=w&guia=0&tiempo=3%2B0&jugadas=')
  await jugar(page, info, 'e2e4')
  await ocultar('hidden')
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(2, { timeout: 15_000 })
  const antes = await tiempos()
  await page.waitForTimeout(3000)
  expect(await tiempos()).toEqual(antes) // ni el mío ni el del bot corren con la app oculta
  await ocultar('visible')
  await expect.poll(async () => (await tiempos()).yo, { timeout: 5000 }).not.toBe(antes.yo) // al volver, corre el mío
  // con la guía: me desvío y, mientras decido, no corre ningún reloj
  await page.goto('/#/prueba-partida?bot=brisa&color=b&guia=1&mislineas=0&tiempo=1%2B0&jugadas=e2e4,c7c6,d2d4,d7d5,e4e5')
  await tocar(page, info, 'e7')
  await tocar(page, info, 'e6')
  await expect(page.getByTestId('mensaje-guia')).toHaveAttribute('data-tipo', 'desvio')
  const enPausa = await tiempos()
  await page.waitForTimeout(2500)
  expect(await tiempos()).toEqual(enPausa)
  // al seguir, el bot juega y vuelve a correr mi reloj
  await page.getByTestId('seguir-desvio').click()
  await expect(page.getByTestId('lista-jugadas').getByTestId('jugada')).toHaveCount(7, { timeout: 15_000 })
  await expect.poll(async () => (await tiempos()).yo, { timeout: 5000 }).not.toBe(enPausa.yo)
})
