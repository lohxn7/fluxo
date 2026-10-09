import { test, expect } from '@playwright/test'

// Não há mais conta demo fixa — cada execução de teste cria a sua própria conta local.
async function login(page: import('@playwright/test').Page) {
  await page.goto('/criar-conta')
  const unique = Date.now()
  await page.getByLabel('Nome').fill('Usuária de Teste')
  await page.getByLabel('E-mail').fill(`teste-${unique}@fluxo.app`)
  await page.getByLabel('Senha', { exact: true }).fill('senha123')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await page.waitForURL('**/')
}

test.use({ viewport: { width: 390, height: 844 } })

test('criar tarefa, checklist, anexo, excluir com desfazer', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('pageerror', (e) => consoleErrors.push(e.message))

  await login(page)
  await page.goto('/quadro')
  await page.waitForTimeout(300)

  // Criar tarefa
  await page.getByRole('button', { name: 'Nova tarefa' }).click()
  await page.getByLabel('Título', { exact: true }).fill('Tarefa de teste automatizado')
  await page.getByRole('button', { name: 'Criar tarefa' }).click()
  await page.waitForURL('**/tarefa/**')
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Tarefa de teste automatizado')

  // Checklist
  await page.getByLabel('Adicionar item ao checklist').fill('Primeiro passo')
  await page.getByLabel('Adicionar item', { exact: true }).click()
  await expect(page.getByText('Primeiro passo')).toBeVisible()

  // Anexo: arquivo de texto simples
  const buffer = Buffer.from('conteudo de teste')
  await page.setInputFiles('input[type="file"]', {
    name: 'teste.txt',
    mimeType: 'text/plain',
    buffer,
  })
  await expect(page.getByText('teste.txt')).toBeVisible({ timeout: 5000 })

  // Anexo inválido (extensão não aceita)
  await page.setInputFiles('input[type="file"]', {
    name: 'malicioso.exe',
    mimeType: 'application/octet-stream',
    buffer: Buffer.from('x'),
  })
  await expect(page.getByText(/não é aceito/)).toBeVisible()

  // Fechar modal (Esc) e voltar pro quadro
  await page.keyboard.press('Escape')
  await page.waitForURL('**/quadro')

  // Excluir com desfazer
  await page.getByRole('tab', { name: 'A fazer' }).click().catch(() => {})
  await page.getByLabel(/Ações da tarefa Tarefa de teste automatizado/).click()
  await page.getByRole('menuitem', { name: 'Excluir' }).click()
  await page.getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(page.getByText('Tarefa excluída')).toBeVisible()
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await page.waitForTimeout(300)
  await expect(page.getByText('Tarefa de teste automatizado')).toBeVisible()

  expect(consoleErrors).toEqual([])
})

test('foco preso no modal e Esc devolve foco', async ({ page }) => {
  await login(page)
  await page.goto('/quadro')
  const fab = page.getByRole('button', { name: 'Nova tarefa' })
  await fab.focus()
  await fab.press('Enter')
  await page.waitForTimeout(300)
  const titleInput = page.getByLabel('Título', { exact: true })
  await expect(titleInput).toBeFocused()
  await page.keyboard.press('Escape')
  await page.waitForTimeout(300)
  await expect(fab).toBeFocused()
})

test('temas escuro e alto contraste aplicam atributo', async ({ page }) => {
  await login(page)
  await page.goto('/ajustes')
  // Cartões de tema usam um radio visualmente oculto dentro do <label> (padrão
  // acessível comum, ex.: Tailwind UI "radio cards"); clicar no <label> é como
  // um usuário real interage — o navegador ativa o radio associado.
  await page.locator('label').filter({ hasText: 'Escuro' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'escuro', { timeout: 3000 })
  await page.locator('label').filter({ hasText: 'Alto contraste' }).click()
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'alto-contraste', { timeout: 3000 })
})
