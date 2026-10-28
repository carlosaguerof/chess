import { expect, test } from '@playwright/test'
import { captura } from './_util.ts'

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
