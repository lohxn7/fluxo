export type Priority = 'alta' | 'media' | 'baixa'

export interface User {
  id: string
  email: string
  name: string
  passwordHash: string
  salt: string
  createdAt: string
}

export interface Column {
  id: string
  name: string
  order: number
  wipLimit: number | null
}

export interface Label {
  id: string
  name: string
  color: string
}

export interface ChecklistItem {
  id: string
  taskId: string
  text: string
  done: boolean
  order: number
}

export interface Attachment {
  id: string
  taskId: string
  name: string
  mimeType: string
  size: number
  blob: Blob
  createdAt: string
}

export interface Task {
  id: string
  title: string
  description: string
  columnId: string
  labelId: string | null
  priority: Priority
  dueDate: string | null // ISO date yyyy-mm-dd
  dueTime: string | null // HH:mm
  order: number
  createdAt: string
  updatedAt: string
  completedAt: string | null
}

export type ThemeMode = 'claro' | 'escuro' | 'alto-contraste' | 'automatico'

export interface Settings {
  id: string
  displayName: string
  theme: ThemeMode
  fontScale: number
  reduceMotion: boolean
}
