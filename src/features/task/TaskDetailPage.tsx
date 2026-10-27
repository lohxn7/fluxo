import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { Check, Trash2 } from 'lucide-react'
import { db } from '../../db/schema'
import { Modal } from '../../components/Modal'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { ChecklistSection } from './ChecklistSection'
import { AttachmentsSection } from '../files/AttachmentsSection'
import { deleteTask, moveTask, restoreTask, setTaskCompletion, updateTask } from './taskApi'
import { LoadingState } from '../../components/LoadingState'
import { useToast } from '../../components/ToastProvider'
import { usePageTitle } from '../../hooks/usePageTitle'
import type { Priority } from '../../db/types'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const task = useLiveQuery(() => (id ? db.tasks.get(id) : undefined), [id])
  const columns = useLiveQuery(() => db.columns.orderBy('order').toArray(), [])
  const labels = useLiveQuery(() => db.labels.toArray(), [])

  usePageTitle(task ? task.title : 'Tarefa')

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const [labelId, setLabelId] = useState('')
  const [columnId, setColumnId] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [dueTime, setDueTime] = useState('')
  const [saved, setSaved] = useState(true)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [titleError, setTitleError] = useState('')

  const loadedId = useRef<string | null>(null)
  const saveTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!task || loadedId.current === task.id) return
    loadedId.current = task.id
    setTitle(task.title)
    setDescription(task.description)
    setPriority(task.priority)
    setLabelId(task.labelId ?? '')
    setColumnId(task.columnId)
    setDueDate(task.dueDate ?? '')
    setDueTime(task.dueTime ?? '')
  }, [task])

  function scheduleSave(patch: Record<string, unknown>) {
    if (!id) return
    setSaved(false)
    if (saveTimer.current) window.clearTimeout(saveTimer.current)
    saveTimer.current = window.setTimeout(async () => {
      await updateTask(id, patch)
      setSaved(true)
    }, 500)
  }

  function close() {
    navigate('/quadro')
  }

  async function handleDelete() {
    if (!task) return
    await deleteTask(task.id)
    setConfirmDelete(false)
    close()
    showToast('Tarefa excluída', {
      actionLabel: 'Desfazer',
      onAction: () => restoreTask(task),
    })
  }

  async function handleToggleComplete() {
    if (!task) return
    const willComplete = !task.completedAt
    await setTaskCompletion(task.id, willComplete)
    const latest = await db.tasks.get(task.id)
    if (latest) setColumnId(latest.columnId)
    showToast(willComplete ? 'Mandou bem! Tarefa concluída 🎉' : 'Tarefa reaberta')
  }

  if (!task) return <LoadingState />

  return (
    <Modal title="Detalhes da tarefa" onClose={close}>
      <div className="flex flex-col gap-5">
        <div className="flex items-center justify-between gap-3">
          <span
            className={`inline-flex items-center gap-1.5 text-sm font-semibold ${
              saved ? 'text-success' : 'text-text-muted'
            }`}
            role="status"
          >
            {saved ? (
              <>
                <Check size={16} aria-hidden="true" /> Salvo
              </>
            ) : (
              'Salvando…'
            )}
          </span>
          <Button
            variant={task.completedAt ? 'secondary' : 'primary'}
            onClick={handleToggleComplete}
            icon={<Check size={16} aria-hidden="true" />}
          >
            {task.completedAt ? 'Reabrir tarefa' : 'Concluir tarefa'}
          </Button>
        </div>

        <Input
          label="Título"
          value={title}
          error={titleError}
          onChange={(e) => {
            setTitle(e.target.value)
            // Prevenção de erros: título vazio nunca vai para o banco
            if (!e.target.value.trim()) {
              setTitleError('A tarefa precisa de um título. Se sair do campo, o anterior volta.')
              return
            }
            setTitleError('')
            scheduleSave({ title: e.target.value.trim() })
          }}
          onBlur={() => {
            if (!title.trim()) {
              setTitle(task.title)
              setTitleError('')
            }
          }}
        />

        <div className="flex flex-col gap-1.5">
          <label htmlFor="task-desc" className="text-sm font-semibold text-text">
            Descrição
          </label>
          <textarea
            id="task-desc"
            value={description}
            onChange={(e) => {
              setDescription(e.target.value)
              scheduleSave({ description: e.target.value })
            }}
            rows={3}
            className="w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 text-base text-text focus-visible:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label="Coluna atual"
            value={columnId}
            onChange={async (e) => {
              const target = e.target.value
              setColumnId(target)
              // Vai pelo mesmo caminho do quadro, para a marcação de concluída acompanhar a coluna
              const count = await db.tasks.where('columnId').equals(target).count()
              await moveTask(task.id, target, count)
            }}
          >
            {columns?.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <Select
            label="Prioridade"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value as Priority)
              scheduleSave({ priority: e.target.value })
            }}
          >
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </Select>

          <Select
            label="Etiqueta"
            value={labelId}
            onChange={(e) => {
              setLabelId(e.target.value)
              scheduleSave({ labelId: e.target.value || null })
            }}
          >
            <option value="">Sem etiqueta</option>
            {labels?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </Select>

          <Input
            label="Prazo"
            type="date"
            value={dueDate}
            onChange={(e) => {
              setDueDate(e.target.value)
              scheduleSave({ dueDate: e.target.value || null })
            }}
          />

          <Input
            label="Hora (opcional)"
            type="time"
            value={dueTime}
            onChange={(e) => {
              setDueTime(e.target.value)
              scheduleSave({ dueTime: e.target.value || null })
            }}
          />
        </div>

        <hr className="border-border" />
        <ChecklistSection taskId={task.id} />

        <hr className="border-border" />
        <AttachmentsSection taskId={task.id} />

        <hr className="border-border" />
        <Button variant="danger" icon={<Trash2 size={16} aria-hidden="true" />} onClick={() => setConfirmDelete(true)}>
          Excluir tarefa
        </Button>
      </div>

      {confirmDelete && (
        <ConfirmDialog
          title="Excluir tarefa"
          message={`Tem certeza que quer excluir "${task.title}"? Você pode desfazer logo em seguida.`}
          confirmLabel="Excluir"
          danger
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </Modal>
  )
}
