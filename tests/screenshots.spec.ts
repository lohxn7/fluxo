import { test, chromium, type Page } from '@playwright/test'
import path from 'node:path'

const SHOTS_DIR = path.join(process.cwd(), 'docs', 'screenshots')

// Não há mais conta nem dados de exemplo fixos — o teste cria uma conta e
// preenche o quadro pela própria interface, pra gerar capturas realistas.
async function signup(page: Page) {
  await page.goto('/criar-conta')
  const unique = Date.now()
  await page.getByLabel('Nome').fill('Abraão Menezes')
  await page.getByLabel('E-mail').fill(`larissa-${unique}@fluxo.app`)
  await page.getByLabel('Senha', { exact: true }).fill('fluxo123')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await page.waitForURL('**/')
}

async function createTask(page: Page, title: string) {
  await page.goto('/quadro')
  await page.waitForTimeout(200)
  await page.getByRole('button', { name: 'Nova tarefa' }).click()
  await page.getByLabel('Título', { exact: true }).fill(title)
  await page.getByRole('button', { name: 'Criar tarefa' }).click()
  await page.waitForURL('**/tarefa/**')
  await page.getByRole('button', { name: 'Fechar', exact: true }).waitFor({ state: 'visible' })
}

// Fechar clicando no botão (ação direta e determinística) em vez de simular
// Esc: logo após a navegação, o listener de teclado do Modal pode ainda não
// ter sido registrado, então Esc às vezes chega cedo demais — comportamento
// coberto à parte em tests/functional.spec.ts, não precisa ser reexercitado aqui.
async function closeTaskModal(page: Page) {
  await page.getByRole('button', { name: 'Fechar', exact: true }).click()
  await page.waitForURL('**/quadro')
}

async function seedBoardForScreenshots(page: Page) {
  await createTask(page, 'Relatório AV1 de IHM')
  await page.getByLabel('Adicionar item ao checklist').fill('Escrever introdução')
  await page.getByLabel('Adicionar item', { exact: true }).click()
  const buffer = Buffer.from('%PDF-1.4\n%%EOF')
  await page.setInputFiles('input[type="file"]', {
    name: 'relatorio-rascunho.pdf',
    mimeType: 'application/pdf',
    buffer,
  })
  await page.waitForTimeout(300)
  await closeTaskModal(page)

  await createTask(page, 'Estudar normalização (BD)')
  await closeTaskModal(page)

  await createTask(page, 'Atualizar planilha de chamados do estágio')
  await closeTaskModal(page)
}

test('captura telas mobile', async ({}, testInfo) => {
  testInfo.setTimeout(90000) // signup + criar 3 tarefas + anexo real demora mais que o padrão de 30s
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const page = await context.newPage()

  // Tela 1: Entrar (antes do login)
  await page.goto('/entrar')
  await page.waitForTimeout(400)
  await page.screenshot({ path: path.join(SHOTS_DIR, '01-entrar.png') })

  await signup(page)
  await seedBoardForScreenshots(page)

  // Tela 2: Início
  await page.goto('/')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '02-inicio.png') })

  // Tela 3: Quadro (mobile)
  await page.goto('/quadro')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '03-quadro.png') })

  // Tela 4: Detalhes da tarefa (tela cheia no celular)
  const taskButton = page.locator('button').filter({ hasText: 'Relatório AV1 de IHM' }).first()
  await taskButton.click()
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '04-detalhes.png') })
  await closeTaskModal(page)

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

test('captura quadro desktop', async ({}, testInfo) => {
  testInfo.setTimeout(90000)
  const browser = await chromium.launch()
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } })
  const page = await context.newPage()

  await signup(page)
  await seedBoardForScreenshots(page)
  await page.goto('/quadro')
  await page.waitForTimeout(500)
  await page.screenshot({ path: path.join(SHOTS_DIR, '03b-quadro-desktop.png') })

  await browser.close()
})
