import { db } from '../../db/schema'
import type { Priority, Task } from '../../db/types'

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
    completedAt: null,
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

export async function moveTask(taskId: string, targetColumnId: string, targetOrder: number) {
  await db.transaction('rw', db.tasks, async () => {
    const task = await db.tasks.get(taskId)
    if (!task) return

    const sourceColumnId = task.columnId
    const siblingsTarget = await db.tasks.where('columnId').equals(targetColumnId).sortBy('order')
    const filteredTarget = siblingsTarget.filter((t) => t.id !== taskId)
    filteredTarget.splice(targetOrder, 0, task)

    await Promise.all(filteredTarget.map((t, i) => db.tasks.update(t.id, { order: i })))

    if (sourceColumnId !== targetColumnId) {
      await db.tasks.update(taskId, {
        columnId: targetColumnId,
        order: targetOrder,
        updatedAt: new Date().toISOString(),
      })
      const siblingsSource = await db.tasks.where('columnId').equals(sourceColumnId).sortBy('order')
      await Promise.all(siblingsSource.map((t, i) => db.tasks.update(t.id, { order: i })))
    }
  })
}

export async function setTaskCompletion(taskId: string, completed: boolean) {
  await db.tasks.update(taskId, { completedAt: completed ? new Date().toISOString() : null, updatedAt: new Date().toISOString() })
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

export async function updateChecklistItemText(id: string, text: string) {
  await db.checklistItems.update(id, { text: text.trim() })
}
