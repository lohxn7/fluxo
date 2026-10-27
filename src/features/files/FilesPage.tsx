import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Search, Paperclip, Download, SearchX } from 'lucide-react'
import { db } from '../../db/schema'
import { AttachmentIcon } from './AttachmentIcon'
import { EmptyState } from '../../components/EmptyState'
import { Select } from '../../components/Select'
import { formatFileSize } from './attachmentApi'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useEffect } from 'react'
import { LoadingState } from '../../components/LoadingState'
import type { Attachment } from '../../db/types'

const TYPE_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'pdf', label: 'PDF' },
  { value: 'image', label: 'Imagens' },
  { value: 'doc', label: 'Documentos' },
  { value: 'sheet', label: 'Planilhas' },
  { value: 'slide', label: 'Apresentações' },
]

function typeGroup(mime: string) {
  if (mime === 'application/pdf') return 'pdf'
  if (mime.startsWith('image/')) return 'image'
  if (mime.includes('spreadsheet')) return 'sheet'
  if (mime.includes('presentation')) return 'slide'
  return 'doc'
}

export function FilesPage() {
  usePageTitle('Arquivos')
  const navigate = useNavigate()
  const attachments = useLiveQuery(() => db.attachments.toArray(), [])
  const tasks = useLiveQuery(() => db.tasks.toArray(), [])

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date')

  const taskById = useMemo(() => {
    const map = new Map<string, string>()
    tasks?.forEach((t) => map.set(t.id, t.title))
    return map
  }, [tasks])

  const filtered = useMemo(() => {
    if (!attachments) return []
    let list = attachments.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()))
    if (typeFilter) list = list.filter((a) => typeGroup(a.mimeType) === typeFilter)
    list = [...list].sort((a, b) =>
      sortBy === 'name' ? a.name.localeCompare(b.name) : b.createdAt.localeCompare(a.createdAt)
    )
    return list
  }, [attachments, search, typeFilter, sortBy])

  if (!attachments || !tasks) return <LoadingState />

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 lg:px-8">
      <header>
        <h1 className="font-display text-2xl font-semibold text-text">Arquivos</h1>
        <p className="text-base text-text-muted">Todos os anexos das suas tarefas, num lugar só.</p>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar arquivo por nome"
            aria-label="Buscar arquivo por nome"
            className="w-full rounded-btn border border-border bg-surface py-2.5 pl-10 pr-3.5 text-base text-text focus-visible:outline-none"
          />
        </div>
        <div className="flex gap-2">
          <Select label="" aria-label="Filtrar por tipo" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="!min-w-32">
            {TYPE_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </Select>
          <Select label="" aria-label="Ordenar por" value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}>
            <option value="date">Mais recentes</option>
            <option value="name">Nome (A-Z)</option>
          </Select>
        </div>
      </div>

      {filtered.length === 0 && attachments.length > 0 ? (
        <EmptyState
          icon={<SearchX size={28} />}
          title="Nenhum resultado para o filtro"
          description="Nenhum arquivo combina com a busca ou o tipo escolhido."
          action={
            <button
              onClick={() => {
                setSearch('')
                setTypeFilter('')
              }}
              className="tap-inline rounded-btn px-3 py-2 text-sm font-semibold text-primary hover:bg-column"
            >
              Limpar filtros
            </button>
          }
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<Paperclip size={28} />}
          title="Nenhum arquivo ainda"
          description="Quando você anexar algo a uma tarefa, ele aparece aqui."
        />
      ) : (
        <ul className="flex flex-col gap-2">
          {filtered.map((att) => (
            <li key={att.id} className="flex items-center gap-3 rounded-card border border-border bg-surface p-3.5 shadow-soft">
              <span className="text-primary">
                <AttachmentIcon mimeType={att.mimeType} size={22} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-base font-medium text-text">{att.name}</p>
                <p className="text-xs text-text-muted">
                  {formatFileSize(att.size)} ·{' '}
                  {taskById.has(att.taskId) ? (
                    <button
                      onClick={() => navigate(`/tarefa/${att.taskId}`)}
                      className="tap-inline underline underline-offset-2 hover:text-primary"
                    >
                      em: {taskById.get(att.taskId)}
                    </button>
                  ) : (
                    'tarefa removida'
                  )}
                </p>
              </div>
              <FileDownload attachment={att} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function FileDownload({ attachment }: { attachment: Attachment }) {
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
      className="tap-inline flex h-9 w-9 shrink-0 items-center justify-center rounded-btn text-text-muted hover:bg-column"
    >
      <Download size={18} aria-hidden="true" />
    </a>
  )
}
