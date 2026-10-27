import { useEffect, useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Paperclip, ListChecks, Pencil, Trash2, ArrowRightLeft, Circle, CheckCircle2 } from 'lucide-react'
import { useLiveQuery } from 'dexie-react-hooks'
import { useNavigate } from 'react-router-dom'
import { db } from '../../db/schema'
import type { Task } from '../../db/types'
import { Tag } from '../../components/Tag'
import { PriorityBadge } from '../../components/PriorityBadge'
import { DueBadge } from '../../components/DueBadge'
import { DropdownMenu } from '../../components/DropdownMenu'
import { swatchForColor } from '../../db/labelPalette'

interface TaskCardProps {
  task: Task
  onEdit: () => void
  onDelete: () => void
  onMove: () => void
  onToggleComplete: () => void
}

// Gestalt — Proximidade: metadados agrupados, espaço maior entre cartões (gap na coluna)
// Ação situada: dois caminhos para mover — arrastar (alça) ou o menu "Mover para…"
export function TaskCard({ task, onEdit, onDelete, onMove, onToggleComplete }: TaskCardProps) {
  const navigate = useNavigate()
  const label = useLiveQuery(() => (task.labelId ? db.labels.get(task.labelId) : undefined), [task.labelId])
  const checklist = useLiveQuery(() => db.checklistItems.where('taskId').equals(task.id).toArray(), [task.id])
  const attachments = useLiveQuery(() => db.attachments.where('taskId').equals(task.id).toArray(), [task.id])

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const doneCount = checklist?.filter((c) => c.done).length ?? 0
  // Similaridade (Gestalt): faixa lateral na cor da etiqueta funciona como "lombada" do cartão,
  // reforçando de relance a categoria sem depender só da tag de texto.
  const stripeColor = label ? swatchForColor(label.color).text : 'var(--border)'
  const coverImage = attachments?.find((a) => a.mimeType.startsWith('image/'))
  const completed = !!task.completedAt

  return (
    <div
      ref={setNodeRef}
      style={{ ...style, borderLeftColor: stripeColor }}
      className={`group flex flex-col overflow-hidden rounded-card border border-l-4 border-border bg-surface shadow-soft ${completed ? 'opacity-75' : ''} transition-shadow duration-200 ease-out hover:shadow-[0_2px_4px_rgb(90_58_20_/_.08),_0_10px_24px_rgb(90_58_20_/_.14)]`}
    >
      {coverImage && <CardCover attachment={coverImage} />}

      <div className="flex gap-2 p-4">
        <button
          {...attributes}
          {...listeners}
          aria-label={`Arrastar tarefa: ${task.title}`}
          className="tap-inline flex w-6 shrink-0 cursor-grab items-center justify-center text-text-muted active:cursor-grabbing"
        >
          <GripVertical size={18} aria-hidden="true" />
        </button>

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-start justify-between gap-2">
            {/* Visibilidade do status + eficiência: concluir/reabrir direto do cartão */}
            <button
              onClick={onToggleComplete}
              aria-label={completed ? `Reabrir tarefa ${task.title}` : `Concluir tarefa ${task.title}`}
              title={completed ? 'Reabrir tarefa' : 'Concluir tarefa'}
              aria-pressed={completed}
              className={`tap-inline -ml-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                completed ? 'text-success' : 'text-text-muted hover:text-success'
              }`}
            >
              {completed ? <CheckCircle2 size={20} aria-hidden="true" /> : <Circle size={20} aria-hidden="true" />}
            </button>
            <button
              onClick={() => navigate(`/tarefa/${task.id}`)}
              className={`tap-inline line-clamp-2 flex-1 text-left text-[15px] font-bold leading-snug hover:underline ${
                completed ? 'text-text-muted line-through' : 'text-text'
              }`}
            >
              {task.title}
            </button>
            <DropdownMenu
              label={`Ações da tarefa ${task.title}`}
              actions={[
                { label: 'Mover para…', icon: <ArrowRightLeft size={16} />, onSelect: onMove },
                { label: 'Editar', icon: <Pencil size={16} />, onSelect: onEdit },
                { label: 'Excluir', icon: <Trash2 size={16} />, onSelect: onDelete, danger: true },
              ]}
            />
          </div>

          {/* Minimalismo: "Média" é o padrão e aparecia em quase todo cartão; só a alta merece destaque */}
          {(label || task.priority === 'alta') && (
            <div className="flex flex-wrap items-center gap-1.5">
              {label && <Tag name={label.name} color={label.color} />}
              {task.priority === 'alta' && <PriorityBadge priority={task.priority} />}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3 border-t border-border pt-3 text-xs font-medium text-text-muted">
            {completed ? <span className="font-semibold text-success">Concluída</span> : <DueBadge dueDate={task.dueDate} />}
            {!!checklist?.length && (
              <span className="inline-flex items-center gap-1.5">
                <ListChecks size={14} className={doneCount === checklist.length ? 'text-success' : 'text-text-muted'} aria-hidden="true" />
                {doneCount}/{checklist.length}
              </span>
            )}
            {!!attachments?.length && (
              <span className="inline-flex items-center gap-1.5">
                <Paperclip size={14} aria-hidden="true" /> {attachments.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CardCover({ attachment }: { attachment: { blob: Blob; name: string } }) {
  const [url, setUrl] = useState<string | null>(null)

  useEffect(() => {
    const objectUrl = URL.createObjectURL(attachment.blob)
    setUrl(objectUrl)
    return () => URL.revokeObjectURL(objectUrl)
  }, [attachment])

  if (!url) return null

  return (
    <div className="h-28 w-full overflow-hidden border-b border-border">
      <img
        src={url}
        alt=""
        aria-hidden="true"
        className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
      />
    </div>
  )
}
