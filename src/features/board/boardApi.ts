import { db } from '../../db/schema'

const uid = () => crypto.randomUUID()

const DEFAULT_COLUMNS = ['A fazer', 'Fazendo', 'Concluído']

// Garante que o quadro tenha pelo menos as colunas padrão — isso é estrutura
// da interface, não dado de exemplo, então não depende de nenhum seed fixo.
export async function ensureDefaultColumns() {
  const existing = await db.columns.count()
  if (existing > 0) return
  await db.columns.bulkAdd(
    DEFAULT_COLUMNS.map((name, order) => ({
      id: uid(),
      name,
      order,
      wipLimit: name === 'Fazendo' ? 3 : null,
    }))
  )
}

export async function createColumn(name: string) {
  const count = await db.columns.count()
  await db.columns.add({ id: uid(), name: name.trim(), order: count, wipLimit: null })
}

export async function renameColumn(id: string, name: string) {
  await db.columns.update(id, { name: name.trim() })
}

export async function setColumnWipLimit(id: string, wipLimit: number | null) {
  await db.columns.update(id, { wipLimit })
}

export async function reorderColumns(orderedIds: string[]) {
  await Promise.all(orderedIds.map((id, i) => db.columns.update(id, { order: i })))
}

export async function deleteColumn(id: string) {
  const tasksInColumn = await db.tasks.where('columnId').equals(id).count()
  if (tasksInColumn > 0) {
    throw new Error('Mova ou exclua as tarefas dessa coluna antes de removê-la.')
  }
  await db.columns.delete(id)
}

export async function createLabel(name: string, color: string) {
  await db.labels.add({ id: uid(), name: name.trim(), color })
}

export async function updateLabel(id: string, patch: { name?: string; color?: string }) {
  await db.labels.update(id, patch)
}

export async function deleteLabel(id: string) {
  await db.transaction('rw', db.labels, db.tasks, async () => {
    const tasks = await db.tasks.where('labelId').equals(id).toArray()
    await Promise.all(tasks.map((t) => db.tasks.update(t.id, { labelId: null })))
    await db.labels.delete(id)
  })
}
