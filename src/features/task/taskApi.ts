import { db } from '../../db/schema'
import type { ChecklistItem, Priority, Task } from '../../db/types'

const uid = () => crypto.randomUUID()

export interface NewTaskInput {
  title: string
  description?: string
  columnId: string
  labelId?: string | null
  priority?: Priority
  dueDate?: string | null
  dueTime?: string | null
}

export async function createTask(input: NewTaskInput): Promise<string> {
  const id = uid()
  const count = await db.tasks.where('columnId').equals(input.columnId).count()
  const { doneId } = await columnOrder()
  const now = new Date().toISOString()
  await db.tasks.add({
    id,
    title: input.title.trim(),
    description: input.description?.trim() ?? '',
    columnId: input.columnId,
    labelId: input.labelId ?? null,
    priority: input.priority ?? 'media',
    dueDate: input.dueDate ?? null,
    dueTime: input.dueTime ?? null,
    order: count,
    createdAt: now,
    updatedAt: now,
    completedAt: input.columnId === doneId ? now : null,
  })
  return id
}

export async function updateTask(id: string, patch: Partial<Task>) {
  await db.tasks.update(id, { ...patch, updatedAt: new Date().toISOString() })
}

export async function deleteTask(id: string) {
  await db.transaction('rw', db.tasks, db.checklistItems, db.attachments, async () => {
    await db.checklistItems.where('taskId').equals(id).delete()
    await db.attachments.where('taskId').equals(id).delete()
    await db.tasks.delete(id)
  })
}

export async function restoreTask(task: Task) {
  await db.tasks.put(task)
}

// A última coluna do quadro é a de "Concluído": estar nela e estar concluída são a mesma
// coisa. Antes eram dois conceitos separados (botão "Concluir" × coluna), que se contradiziam.
async function columnOrder() {
  const columns = await db.columns.orderBy('order').toArray()
  return { firstId: columns[0]?.id, doneId: columns[columns.length - 1]?.id }
}

export async function moveTask(taskId: string, targetColumnId: string, targetOrder: number) {
  await db.transaction('rw', db.tasks, db.columns, async () => {
    const task = await db.tasks.get(taskId)
    if (!task) return
    const { doneId } = await columnOrder()

    const sourceColumnId = task.columnId
    const siblingsTarget = await db.tasks.where('columnId').equals(targetColumnId).sortBy('order')
    const filteredTarget = siblingsTarget.filter((t) => t.id !== taskId)
    filteredTarget.splice(targetOrder, 0, task)

    await Promise.all(filteredTarget.map((t, i) => db.tasks.update(t.id, { order: i })))

    if (sourceColumnId !== targetColumnId) {
      const now = new Date().toISOString()
      await db.tasks.update(taskId, {
        columnId: targetColumnId,
        order: targetOrder,
        updatedAt: now,
        completedAt: targetColumnId === doneId ? (task.completedAt ?? now) : null,
      })
      const siblingsSource = await db.tasks.where('columnId').equals(sourceColumnId).sortBy('order')
      await Promise.all(siblingsSource.map((t, i) => db.tasks.update(t.id, { order: i })))
    }
  })
}

// Concluir leva a tarefa para o fim da coluna de concluídas; reabrir devolve para a primeira.
export async function setTaskCompletion(taskId: string, completed: boolean) {
  const { firstId, doneId } = await columnOrder()
  const targetId = completed ? doneId : firstId
  const task = await db.tasks.get(taskId)
  if (!task || !targetId) return
  if (task.columnId === targetId) {
    // Já está na coluna certa (ex.: dado antigo): só acerta a marcação.
    await updateTask(taskId, { completedAt: completed ? new Date().toISOString() : null })
    return
  }
  const count = await db.tasks.where('columnId').equals(targetId).count()
  await moveTask(taskId, targetId, count)
}

// Checklist
export async function addChecklistItem(taskId: string, text: string) {
  const count = await db.checklistItems.where('taskId').equals(taskId).count()
  await db.checklistItems.add({ id: uid(), taskId, text: text.trim(), done: false, order: count })
}

export async function toggleChecklistItem(id: string, done: boolean) {
  await db.checklistItems.update(id, { done })
}

export async function deleteChecklistItem(id: string) {
  await db.checklistItems.delete(id)
}

export async function restoreChecklistItem(item: ChecklistItem) {
  await db.checklistItems.put(item)
}

export async function updateChecklistItemText(id: string, text: string) {
  await db.checklistItems.update(id, { text: text.trim() })
}
