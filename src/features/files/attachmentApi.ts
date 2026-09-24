import { db } from '../../db/schema'

const uid = () => crypto.randomUUID()

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10 MB

export const ACCEPTED_TYPES: Record<string, string[]> = {
  'application/pdf': ['.pdf'],
  'image/png': ['.png'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/webp': ['.webp'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  'text/plain': ['.txt'],
}

export const ACCEPT_ATTRIBUTE = Object.values(ACCEPTED_TYPES).flat().join(',')

export function sanitizeFileName(name: string): string {
  const trimmed = name.trim().replace(/[/\\?%*:|"<>]/g, '-')
  return trimmed.slice(0, 150) || 'arquivo'
}

export interface FileValidationResult {
  ok: boolean
  error?: string
}

export function validateFile(file: File): FileValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    return { ok: false, error: 'Esse arquivo passou de 10 MB. Tente compactar ou enviar uma versão menor.' }
  }
  const ext = '.' + file.name.split('.').pop()?.toLowerCase()
  const allowedExts = Object.values(ACCEPTED_TYPES).flat()
  const mimeOk = Object.keys(ACCEPTED_TYPES).includes(file.type)
  const extOk = allowedExts.includes(ext)
  if (!mimeOk || !extOk) {
    return { ok: false, error: 'Esse tipo de arquivo não é aceito. Envie PDF, imagem, DOCX, XLSX, PPTX ou TXT.' }
  }
  return { ok: true }
}

export async function addAttachment(taskId: string, file: File) {
  const safeName = sanitizeFileName(file.name)
  await db.attachments.add({
    id: uid(),
    taskId,
    name: safeName,
    mimeType: file.type,
    size: file.size,
    blob: file,
    createdAt: new Date().toISOString(),
  })
}

export async function deleteAttachment(id: string) {
  await db.attachments.delete(id)
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
