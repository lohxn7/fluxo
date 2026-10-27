import { test, expect, type Page } from '@playwright/test'

// Cobre as correções da avaliação heurística (H1–H10). Cada teste cria a sua própria conta local.
async function signup(page: Page) {
  await page.goto('/criar-conta')
  await page.getByLabel('Nome').fill('Pessoa de Teste')
  await page.getByLabel('E-mail').fill(`heur-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@fluxo.app`)
  await page.getByLabel('Senha', { exact: true }).fill('senha123')
  await page.getByRole('button', { name: 'Criar conta' }).click()
  await page.waitForURL('**/')
}

async function createTask(page: Page, title: string) {
  await page.goto('/quadro')
  await page.getByRole('button', { name: 'Nova tarefa' }).first().click()
  await page.getByLabel('Título', { exact: true }).fill(title)
  // H7: Enter envia o formulário
  await page.getByLabel('Título', { exact: true }).press('Enter')
  await page.waitForURL('**/tarefa/**')
  await expect(page.getByRole('dialog').getByLabel('Título', { exact: true })).toHaveValue(title)
  await page.keyboard.press('Escape')
  await page.waitForURL('**/quadro')
}

test.use({ viewport: { width: 1280, height: 900 } })

test('H1/H7: concluir pelo cartão leva para a coluna Concluído, e Desfazer volta', async ({ page }) => {
  await signup(page)
  await createTask(page, 'Ler capítulo 3')

  const aFazer = page.getByRole('region', { name: 'Coluna A fazer' })
  const concluido = page.getByRole('region', { name: 'Coluna Concluído' })
  await expect(aFazer.getByText('Ler capítulo 3')).toBeVisible()

  await page.getByRole('button', { name: 'Concluir tarefa Ler capítulo 3' }).click()
  await expect(concluido.getByText('Ler capítulo 3')).toBeVisible()
  await expect(concluido.getByText('Concluída', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(aFazer.getByText('Ler capítulo 3')).toBeVisible()
})

test('H4/H8: toast sem "Desfazer" duplicado e prioridade média escondida', async ({ page }) => {
  await signup(page)
  await createTask(page, 'Tarefa comum')
  await expect(page.getByText('MÉDIA', { exact: true })).toHaveCount(0)
  await expect(page.getByText(/^Média$/)).toHaveCount(0)

  await page.getByLabel('Ações da tarefa Tarefa comum').click()
  await page.getByRole('menuitem', { name: 'Excluir' }).click()
  await page.getByRole('button', { name: 'Excluir', exact: true }).click()
  await expect(page.getByText('Tarefa excluída', { exact: true })).toBeVisible()
  await expect(page.getByText(/Desfazer/)).toHaveCount(1)
})

test('H6: busca sem resultado diz que é o filtro', async ({ page }) => {
  await signup(page)
  await createTask(page, 'Estudar')
  await page.getByLabel('Buscar tarefa por título ou descrição').fill('zzz')
  await expect(page.getByText('Nenhum resultado').first()).toBeVisible()
  await expect(page.getByText('Nada por aqui')).toHaveCount(0)
  await page.getByRole('button', { name: 'Limpar filtros' }).click()
  await expect(page.getByText('Estudar')).toBeVisible()
})

test('H3: cancelar nova tarefa preenchida pede confirmação', async ({ page }) => {
  await signup(page)
  await page.goto('/quadro')
  await page.getByRole('button', { name: 'Nova tarefa' }).first().click()
  await page.getByLabel('Título', { exact: true }).fill('Rascunho')
  await page.getByRole('button', { name: 'Cancelar' }).click()
  await expect(page.getByText('Descartar tarefa?')).toBeVisible()
  // Esc fecha só a confirmação, não o formulário de baixo
  await page.keyboard.press('Escape')
  await expect(page.getByText('Descartar tarefa?')).toHaveCount(0)
  await expect(page.getByLabel('Título', { exact: true })).toHaveValue('Rascunho')
})

test('H3: remover item do checklist tem Desfazer', async ({ page }) => {
  await signup(page)
  await createTask(page, 'Com checklist')
  await page.getByRole('button', { name: 'Com checklist', exact: true }).click()
  await page.getByLabel('Adicionar item ao checklist').fill('Passo 1')
  await page.getByLabel('Adicionar item ao checklist').press('Enter')
  await page.getByLabel('Remover item: Passo 1').click()
  await expect(page.getByText('Passo 1', { exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Desfazer' }).click()
  await expect(page.getByText('Passo 1', { exact: true })).toBeVisible()
})

test('H5: título vazio não é salvo', async ({ page }) => {
  await signup(page)
  await createTask(page, 'Título original')
  await page.getByRole('button', { name: 'Título original', exact: true }).click()
  const title = page.getByLabel('Título', { exact: true })
  await title.fill('')
  await expect(page.getByText(/precisa de um título/)).toBeVisible()
  await page.getByLabel('Descrição').click()
  await expect(title).toHaveValue('Título original')
})

test('H5/H2/H1: Ajustes não deixa excluir coluna com tarefa, não aceita nome vazio e avisa ao salvar', async ({ page }) => {
  await signup(page)
  await createTask(page, 'Ocupa a coluna')
  await page.goto('/ajustes')
  await expect(page.getByRole('button', { name: 'Excluir coluna A fazer' })).toBeDisabled()
  await expect(page.getByText(/Tem 1 tarefa aqui/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mover coluna Fazendo para a esquerda' })).toBeVisible()

  const nome = page.getByLabel('Nome da coluna Fazendo')
  await nome.fill('')
  await nome.blur()
  await expect(nome).toHaveValue('Fazendo')

  await nome.fill('Em andamento')
  await nome.blur()
  await expect(page.getByText('Coluna renomeada para "Em andamento"')).toBeVisible()

  const limite = page.getByLabel('Máximo de tarefas ao mesmo tempo em Em andamento')
  await limite.fill('0')
  await limite.blur()
  await expect(page.getByText(/precisa ser 1 ou mais/)).toBeVisible()
  await expect(limite).toHaveValue('3')
})

test('H4: nome exibido muda a Início e o topo de Ajustes juntos', async ({ page }) => {
  await signup(page)
  await page.goto('/ajustes')
  const campo = page.getByLabel('Nome exibido')
  await campo.fill('Rejane Souza')
  await campo.blur()
  await expect(page.getByText('Nome exibido atualizado')).toBeVisible()
  await expect(page.locator('header').getByText('Rejane Souza')).toBeVisible()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Rejane')
})

test('H9: login vazio pede para preencher', async ({ page }) => {
  await page.goto('/entrar')
  await page.getByRole('button', { name: 'Entrar' }).click()
  await expect(page.getByText('Digite seu e-mail.')).toBeVisible()
  await expect(page.getByText('Digite sua senha.')).toBeVisible()
  await expect(page.getByText(/não conferem/)).toHaveCount(0)
})

test('H10/H4: cadastro mostra aviso de dados locais e botão de mostrar senha', async ({ page }) => {
  await page.goto('/criar-conta')
  await expect(page.getByText(/ficam só neste dispositivo/)).toBeVisible()
  await expect(page.getByRole('button', { name: 'Mostrar senha' })).toBeVisible()
})
