import { FileText, Image, FileSpreadsheet, Presentation, File } from 'lucide-react'

export function attachmentIconFor(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image
  if (mimeType === 'application/pdf') return FileText
  if (mimeType.includes('spreadsheet')) return FileSpreadsheet
  if (mimeType.includes('presentation')) return Presentation
  if (mimeType.includes('wordprocessing') || mimeType === 'text/plain') return FileText
  return File
}

export function AttachmentIcon({ mimeType, size = 20 }: { mimeType: string; size?: number }) {
  const Icon = attachmentIconFor(mimeType)
  return <Icon size={size} aria-hidden="true" />
}
