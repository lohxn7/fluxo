import { useEffect, useRef, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Eye, Download, Trash2, Paperclip, AlertCircle, Loader2, X } from 'lucide-react'
import { db } from '../../db/schema'
import { addAttachment, deleteAttachment, formatFileSize, validateFile } from './attachmentApi'
import { FileDrop } from '../../components/FileDrop'
import { AttachmentIcon } from './AttachmentIcon'
import { useToast } from '../../components/ToastProvider'
import type { Attachment } from '../../db/types'
import { useDialog } from '../../hooks/useDialog'

const ACCEPT = '.pdf,.png,.jpg,.jpeg,.webp,.docx,.xlsx,.pptx,.txt'

interface UploadingFile {
  id: string
  name: string
}

interface FileError {
  id: string
  name: string
  message: string
}

export function AttachmentsSection({ taskId }: { taskId: string }) {
  const attachments = useLiveQuery(() => db.attachments.where('taskId').equals(taskId).toArray(), [taskId])
  const { showToast } = useToast()
  const [uploading, setUploading] = useState<UploadingFile[]>([])
  const [preview, setPreview] = useState<Attachment | null>(null)
  const [errors, setErrors] = useState<FileError[]>([])

  // Os arquivos são gravados no próprio aparelho, sem envio pela rede, então não existe um
  // progresso real para medir: mostramos só "Salvando…" enquanto a gravação acontece.
  async function handleFiles(fileList: FileList) {
    setErrors([])
    for (const file of Array.from(fileList)) {
      const validation = validateFile(file)
      if (!validation.ok) {
        // Erro ao lado da área de soltar, e fica até a próxima tentativa (não some em 6 s)
        setErrors((prev) => [...prev, { id: crypto.randomUUID(), name: file.name, message: validation.error! }])
        continue
      }
      const uploadId = crypto.randomUUID()
      setUploading((prev) => [...prev, { id: uploadId, name: file.name }])
      try {
        await addAttachment(taskId, file)
        showToast(`${file.name} anexado`)
      } catch {
        setErrors((prev) => [
          ...prev,
          { id: uploadId, name: file.name, message: 'Não deu para salvar. O espaço do navegador pode estar cheio.' },
        ])
      } finally {
        setUploading((prev) => prev.filter((u) => u.id !== uploadId))
      }
    }
  }

  async function handleDelete(attachment: Attachment) {
    await deleteAttachment(attachment.id)
    showToast('Anexo removido')
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-text">Anexos</h3>
      <FileDrop onFiles={handleFiles} accept={ACCEPT} invalid={errors.length > 0} />

      {errors.length > 0 && (
        <div role="alert" className="flex flex-col gap-1.5 rounded-btn border border-danger bg-danger-bg p-3">
          {errors.map((err) => (
            <p key={err.id} className="flex items-start gap-2 text-sm text-danger">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span className="flex-1">
                <strong className="font-semibold">{err.name}:</strong> {err.message}
              </span>
            </p>
          ))}
          <button
            onClick={() => setErrors([])}
            className="tap-inline flex items-center gap-1 self-end text-sm font-semibold text-danger underline underline-offset-2"
          >
            <X size={14} aria-hidden="true" /> Entendi
          </button>
        </div>
      )}

      {uploading.map((u) => (
        <div key={u.id} role="status" className="flex items-center gap-2 rounded-btn border border-border p-3 text-sm text-text">
          <Loader2 size={16} className="shrink-0 animate-spin text-primary" aria-hidden="true" />
          <span className="truncate">Salvando {u.name}…</span>
        </div>
      ))}

      {!attachments?.length && !uploading.length && (
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <Paperclip size={16} aria-hidden="true" /> Nenhum arquivo anexado ainda.
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {attachments?.map((att) => (
          <li key={att.id} className="flex items-center gap-3 rounded-btn border border-border p-3">
            <span className="text-primary"><AttachmentIcon mimeType={att.mimeType} /></span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-text">{att.name}</p>
              <p className="text-xs text-text-muted">
                {formatFileSize(att.size)} · {new Date(att.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1">
              <button
                aria-label={`Visualizar ${att.name}`}
                title="Visualizar"
                onClick={() => setPreview(att)}
                className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-text-muted hover:bg-column"
              >
                <Eye size={18} aria-hidden="true" />
              </button>
              <DownloadLink attachment={att} />
              <button
                aria-label={`Remover ${att.name}`}
                title="Remover"
                onClick={() => handleDelete(att)}
                className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-danger hover:bg-danger-bg"
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {preview && <AttachmentPreview attachment={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}

function DownloadLink({ attachment }: { attachment: Attachment }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(attachment.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [attachment])

  return (
    <a
      aria-label={`Baixar ${attachment.name}`}
      title="Baixar"
      href={url ?? undefined}
      download={attachment.name}
      className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-text-muted hover:bg-column"
    >
      <Download size={18} aria-hidden="true" />
    </a>
  )
}

function AttachmentPreview({ attachment, onClose }: { attachment: Attachment; onClose: () => void }) {
  const [url, setUrl] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  // Mesmo comportamento dos outros modais: Esc fecha, foco preso e devolvido ao sair
  useDialog(dialogRef, onClose)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(attachment.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [attachment])

  const isImage = attachment.mimeType.startsWith('image/')
  const isPdf = attachment.mimeType === 'application/pdf'

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={`Pré-visualização de ${attachment.name}`}
      className="fixed inset-0 z-50 flex flex-col bg-black/70 p-4"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        data-autofocus
        className="tap-inline mb-2 self-end rounded-btn bg-surface px-4 py-2 text-sm font-semibold text-text"
      >
        Fechar
      </button>
      <div className="flex flex-1 items-center justify-center overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {url && isImage && <img src={url} alt={attachment.name} className="max-h-full max-w-full rounded-card object-contain" />}
        {url && isPdf && <iframe title={attachment.name} src={url} className="h-full w-full rounded-card bg-white" />}
        {url && !isImage && !isPdf && (
          <p className="rounded-card bg-surface px-6 py-4 text-text">Pré-visualização não disponível para este tipo de arquivo. Use "Baixar" para abrir.</p>
        )}
      </div>
    </div>
  )
}
