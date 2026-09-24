import { test, chromium } from '@playwright/test'
import path from 'node:path'

const SHOTS_DIR = path.join(process.cwd(), 'docs', 'screenshots')

async function login(page: import('@playwright/test').Page) {
  await page.goto('/entrar')
  await page.getByLabel('E-mail').fill('larissa@fluxo.app')
  await page.locator('input[type="password"]').fill('fluxo123')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await page.waitForURL('**/')
  await page.waitForTimeout(500)
}

test('captura telas mobile', async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()

  // Tela 1: Entrar (antes do login)
  await page.goto('/entrar')
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(SHOTS_DIR, '01-entrar.png') })

  await login(page)

  // Tela 2: Início
  await page.goto('/')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '02-inicio.png') })

  // Tela 3: Quadro (mobile)
  await page.goto('/quadro')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '03-quadro.png') })

  // Tela 4: Detalhes da tarefa (tela cheia no celular)
  const taskButton = page.locator('button').filter({ hasText: 'Estudar normalização' }).first()
  await taskButton.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '04-detalhes.png') })
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)

  // Tela 5: Arquivos
  await page.goto('/arquivos')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '05-arquivos.png') })

  // Tela 6: Ajustes
  await page.goto('/ajustes')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '06-ajustes.png') })

  await browser.close()
})

test('captura quadro desktop', async () => {
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await login(page)
  await page.goto('/quadro')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '03b-quadro-desktop.png') })

  await browser.close()
})
