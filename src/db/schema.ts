import Dexie, { type EntityTable } from 'dexie'
import type { User, Column, Label, Task, ChecklistItem, Attachment, Settings } from './types'

export class FluxoDB extends Dexie {
  users!: EntityTable<User, 'id'>
  columns!: EntityTable<Column, 'id'>
  labels!: EntityTable<Label, 'id'>
  tasks!: EntityTable<Task, 'id'>
  checklistItems!: EntityTable<ChecklistItem, 'id'>
  attachments!: EntityTable<Attachment, 'id'>
  settings!: EntityTable<Settings, 'id'>

  constructor() {
    super('fluxo-db')
    this.version(1).stores({
      users: 'id, email',
      columns: 'id, order',
      labels: 'id',
      tasks: 'id, columnId, order, dueDate, labelId',
      checklistItems: 'id, taskId, order',
      attachments: 'id, taskId',
      settings: 'id',
    })
  }
}

export const db = new FluxoDB()
