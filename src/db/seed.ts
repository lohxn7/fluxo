import { db } from './schema'
import { generateSalt, hashPassword } from './auth'
import { buildSamplePdf } from './samplePdf'
import { addDays, toIsoDate } from '../lib/date'
import { LABEL_PALETTE } from './labelPalette'

const uid = () => crypto.randomUUID()

// Evita seed duplicado quando o efeito de inicialização roda mais de uma vez
// (ex.: React StrictMode em desenvolvimento invoca efeitos duas vezes).
let seedPromise: Promise<void> | null = null

export function seedIfNeeded(): Promise<void> {
  if (!seedPromise) seedPromise = runSeed()
  return seedPromise
}

async function runSeed() {
  const userCount = await db.users.count()
  if (userCount > 0) return

  const today = new Date()

  const demoSalt = generateSalt()
  const demoHash = await hashPassword('fluxo123', demoSalt)
  const userId = uid()
  await db.users.add({
    id: userId,
    email: 'larissa@fluxo.app',
    name: 'Larissa Menezes',
    passwordHash: demoHash,
    salt: demoSalt,
    createdAt: new Date().toISOString(),
  })

  const colTodo = uid()
  const colDoing = uid()
  const colDone = uid()
  await db.columns.bulkAdd([
    { id: colTodo, name: 'A fazer', order: 0, wipLimit: null },
    { id: colDoing, name: 'Fazendo', order: 1, wipLimit: 3 },
    { id: colDone, name: 'Concluído', order: 2, wipLimit: null },
  ])

  const labelIhm = uid()
  const labelBd = uid()
  const labelEstagio = uid()
  const labelPessoal = uid()
  await db.labels.bulkAdd([
    { id: labelIhm, name: 'IHM', color: LABEL_PALETTE[0].bg },
    { id: labelBd, name: 'Banco de Dados', color: LABEL_PALETTE[1].bg },
    { id: labelEstagio, name: 'Estágio', color: LABEL_PALETTE[2].bg },
    { id: labelPessoal, name: 'Pessoal', color: LABEL_PALETTE[3].bg },
  ])

  const now = new Date().toISOString()

  type SeedTask = {
    title: string
    description: string
    columnId: string
    labelId: string
    priority: 'alta' | 'media' | 'baixa'
    dueOffset: number | null
    completed?: boolean
    checklist?: string[]
    attachment?: boolean
  }

  const seedTasks: SeedTask[] = [
    {
      title: 'Relatório AV1 de IHM',
      description: 'Escrever o relatório final com as decisões de design justificadas pelos princípios de IHC.',
      columnId: colDoing,
      labelId: labelIhm,
      priority: 'alta',
      dueOffset: 0,
      checklist: ['Introdução', 'Persona', 'Telas', 'Revisão final'],
      attachment: true,
    },
    {
      title: 'Estudar normalização (BD)',
      description: 'Revisar 1FN, 2FN e 3FN para a prova de quinta-feira.',
      columnId: colTodo,
      labelId: labelBd,
      priority: 'media',
      dueOffset: 3,
      checklist: ['1FN', '2FN', '3FN'],
    },
    {
      title: 'Atualizar planilha de chamados do estágio',
      description: 'Lançar os chamados resolvidos na última semana.',
      columnId: colTodo,
      labelId: labelEstagio,
      priority: 'media',
      dueOffset: -2,
    },
    {
      title: 'Renovar carteira de estudante',
      description: 'Levar o comprovante de matrícula até a secretaria.',
      columnId: colTodo,
      labelId: labelPessoal,
      priority: 'baixa',
      dueOffset: 5,
    },
    {
      title: 'Montar apresentação do projeto',
      description: 'Slides com o protótipo do Fluxo para a banca.',
      columnId: colDoing,
      labelId: labelIhm,
      priority: 'alta',
      dueOffset: 1,
      checklist: ['Roteiro', 'Slides', 'Ensaiar'],
    },
    {
      title: 'Ler capítulo 4 do livro de BD',
      description: 'Transações e controle de concorrência.',
      columnId: colTodo,
      labelId: labelBd,
      priority: 'baixa',
      dueOffset: 6,
    },
    {
      title: 'Organizar arquivos do estágio',
      description: 'Separar os documentos por cliente na pasta compartilhada.',
      columnId: colDone,
      labelId: labelEstagio,
      priority: 'baixa',
      dueOffset: -4,
      completed: true,
    },
    {
      title: 'Entregar formulário de bolsa',
      description: 'Formulário preenchido e assinado na coordenação.',
      columnId: colDone,
      labelId: labelPessoal,
      priority: 'media',
      dueOffset: -1,
      completed: true,
    },
    {
      title: 'Corrigir exercícios de SQL',
      description: 'Lista 3 do professor, questões de junção.',
      columnId: colDoing,
      labelId: labelBd,
      priority: 'media',
      dueOffset: 2,
      checklist: ['Questão 1-5', 'Questão 6-10'],
    },
    {
      title: 'Revisar wireframes com o grupo',
      description: 'Chamada rápida com o grupo de IHM para alinhar o protótipo.',
      columnId: colTodo,
      labelId: labelIhm,
      priority: 'alta',
      dueOffset: 0,
    },
  ]

  let order = 0
  const orderByColumn: Record<string, number> = { [colTodo]: 0, [colDoing]: 0, [colDone]: 0 }

  for (const t of seedTasks) {
    const taskId = uid()
    const dueDate = t.dueOffset === null ? null : toIsoDate(addDays(today, t.dueOffset))
    await db.tasks.add({
      id: taskId,
      title: t.title,
      description: t.description,
      columnId: t.columnId,
      labelId: t.labelId,
      priority: t.priority,
      dueDate,
      dueTime: null,
      order: orderByColumn[t.columnId]++,
      createdAt: now,
      updatedAt: now,
      completedAt: t.completed ? now : null,
    })
    order++

    if (t.checklist) {
      let i = 0
      for (const text of t.checklist) {
        await db.checklistItems.add({
          id: uid(),
          taskId,
          text,
          done: t.completed ? true : i === 0,
          order: i++,
        })
      }
    }

    if (t.attachment) {
      const blob = buildSamplePdf('Relatorio AV1 - Fluxo')
      await db.attachments.add({
        id: uid(),
        taskId,
        name: 'relatorio-av1-ihm.pdf',
        mimeType: 'application/pdf',
        size: blob.size,
        blob,
        createdAt: now,
      })
    }
  }

  await db.settings.add({
    id: 'app-settings',
    displayName: 'Larissa Menezes',
    theme: 'claro',
    fontScale: 1,
    reduceMotion: false,
  })
}
