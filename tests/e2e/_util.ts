import type { Page, TestInfo } from '@playwright/test'

/** Guarda una captura en iterations/v1/capturas/<perfil>/<nombre>.png */
export async function captura(page: Page, info: TestInfo, nombre: string) {
  await page.screenshot({ path: `iterations/v1/capturas/${info.project.name}/${nombre}.png`, fullPage: false })
}
