import { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { Search, Plus } from 'lucide-react'
import { db } from '../../db/schema'
import type { Task } from '../../db/types'
import { BoardColumn } from './BoardColumn'
import { NewTaskModal } from '../task/NewTaskModal'
import { MoveTaskModal } from './MoveTaskModal'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { moveTask, deleteTask, restoreTask } from '../task/taskApi'
import { useToast } from '../../components/ToastProvider'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useMediaQuery } from '../../hooks/useMediaQuery'
import { useNavigate } from 'react-router-dom'

export function BoardPage() {
  usePageTitle('Quadro')
  const navigate = useNavigate()
  const { showToast } = useToast()

  const columns = useLiveQuery(() => db.columns.orderBy('order').toArray(), [])
  const tasks = useLiveQuery(() => db.tasks.orderBy('order').toArray(), [])
  const labels = useLiveQuery(() => db.labels.toArray(), [])

  const [search, setSearch] = useState('')
  const [labelFilter, setLabelFilter] = useState('')
  const [activeTab, setActiveTab] = useState(0)
  const isDesktop = useMediaQuery('(min-width: 1024px)')
  const [newTaskColumn, setNewTaskColumn] = useState<string | null>(null)
  const [taskToMove, setTaskToMove] = useState<Task | null>(null)
  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null)
  const [announcement, setAnnouncement] = useState('')

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const filteredTasks = useMemo(() => {
    if (!tasks) return []
    return tasks.filter((t) => {
      const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase())
      const matchesLabel = !labelFilter || t.labelId === labelFilter
      return matchesSearch && matchesLabel
    })
  }, [tasks, search, labelFilter])

  function tasksForColumn(columnId: string) {
    return filteredTasks.filter((t) => t.columnId === columnId).sort((a, b) => a.order - b.order)
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || !tasks || !columns) return

    const activeTask = tasks.find((t) => t.id === active.id)
    if (!activeTask) return

    const overIsColumn = columns.some((c) => c.id === over.id)
    const overTask = tasks.find((t) => t.id === over.id)
    const targetColumnId = overIsColumn ? (over.id as string) : overTask?.columnId

    if (!targetColumnId) return

    const targetTasks = tasksForColumn(targetColumnId).filter((t) => t.id !== activeTask.id)
    let targetOrder = targetTasks.length
    if (overTask && overTask.id !== activeTask.id) {
      targetOrder = targetTasks.findIndex((t) => t.id === overTask.id)
      if (targetOrder === -1) targetOrder = targetTasks.length
    }

    if (targetColumnId === activeTask.columnId && targetOrder === activeTask.order) return

    await moveTask(activeTask.id, targetColumnId, targetOrder)
    const targetColumn = columns.find((c) => c.id === targetColumnId)
    setAnnouncement(`Tarefa ${activeTask.title} movida para ${targetColumn?.name}`)
  }

  async function handleMove(task: Task, columnId: string) {
    const targetTasks = tasksForColumn(columnId)
    await moveTask(task.id, columnId, targetTasks.length)
    const targetColumn = columns?.find((c) => c.id === columnId)
    showToast(`Tarefa movida para ${targetColumn?.name} · Desfazer`, {
      actionLabel: 'Desfazer',
      onAction: () => moveTask(task.id, task.columnId, task.order),
    })
  }

  async function handleDelete() {
    if (!taskToDelete) return
    const snapshot = taskToDelete
    await deleteTask(snapshot.id)
    setTaskToDelete(null)
    showToast('Tarefa excluída · Desfazer', {
      actionLabel: 'Desfazer',
      onAction: () => restoreTask(snapshot),
    })
  }

  if (!columns || !tasks) return null

  return (
    <div className="flex h-dvh flex-col lg:h-dvh">
      <header className="flex flex-col gap-3 border-b border-border bg-surface px-4 py-4 lg:px-8">
        <h1 className="font-display text-2xl font-semibold text-text">Quadro</h1>
        <div className="flex flex-col gap-2 sm:flex-row">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar tarefa por título"
              aria-label="Buscar tarefa por título"
              className="w-full rounded-btn border border-border bg-surface py-2.5 pl-10 pr-3.5 text-base text-text focus-visible:outline-none"
            />
          </div>
          <select
            value={labelFilter}
            onChange={(e) => setLabelFilter(e.target.value)}
            aria-label="Filtrar por etiqueta"
            className="rounded-btn border border-border bg-surface px-3.5 py-2.5 text-base text-text focus-visible:outline-none"
          >
            <option value="">Todas as etiquetas</option>
            {labels?.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-1 overflow-x-auto lg:hidden" role="tablist" aria-label="Colunas do quadro">
          {columns.map((c, i) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={activeTab === i}
              onClick={() => setActiveTab(i)}
              className={`tap-inline shrink-0 rounded-chip px-4 py-2 text-sm font-semibold ${
                activeTab === i ? 'bg-primary text-primary-contrast' : 'bg-column text-text-muted'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </header>

      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-hidden px-4 py-4 lg:px-8">
          {isDesktop ? (
            // Desktop: todas as colunas lado a lado
            <div className="flex h-full gap-4">
              {columns.map((col) => (
                <BoardColumn
                  key={col.id}
                  column={col}
                  tasks={tasksForColumn(col.id)}
                  onAddTask={() => setNewTaskColumn(col.id)}
                  onEditTask={(task) => navigate(`/tarefa/${task.id}`)}
                  onDeleteTask={setTaskToDelete}
                  onMoveTask={setTaskToMove}
                />
              ))}
            </div>
          ) : (
            // Mobile: uma coluna por vez, com abas (destino comum reforçado pela navegação)
            <div className="flex h-full gap-4 overflow-x-auto snap-x-mandatory">
              {columns[activeTab] && (
                <BoardColumn
                  column={columns[activeTab]}
                  tasks={tasksForColumn(columns[activeTab].id)}
                  onAddTask={() => setNewTaskColumn(columns[activeTab].id)}
                  onEditTask={(task) => navigate(`/tarefa/${task.id}`)}
                  onDeleteTask={setTaskToDelete}
                  onMoveTask={setTaskToMove}
                />
              )}
            </div>
          )}
        </div>
      </DndContext>

      <button
        onClick={() => setNewTaskColumn(columns[0]?.id ?? '')}
        aria-label="Nova tarefa"
        className="fixed bottom-24 right-5 z-30 flex h-14 items-center gap-2 rounded-full bg-cta px-4 text-cta-contrast shadow-soft transition-transform duration-200 ease-out hover:scale-105 lg:bottom-8 lg:right-8"
      >
        <Plus size={24} aria-hidden="true" />
        <span className="hidden pr-1 text-base font-semibold lg:inline">Nova tarefa</span>
      </button>

      {newTaskColumn && (
        <NewTaskModal
          defaultColumnId={newTaskColumn}
          onClose={() => setNewTaskColumn(null)}
          onCreated={(id) => {
            setNewTaskColumn(null)
            showToast('Tarefa criada')
            navigate(`/tarefa/${id}`)
          }}
        />
      )}

      {taskToMove && (
        <MoveTaskModal
          task={taskToMove}
          onClose={() => setTaskToMove(null)}
          onMove={(columnId) => handleMove(taskToMove, columnId)}
        />
      )}

      {taskToDelete && (
        <ConfirmDialog
          title="Excluir tarefa"
          message={`Tem certeza que quer excluir "${taskToDelete.title}"? Você pode desfazer logo em seguida.`}
          confirmLabel="Excluir"
          danger
          onConfirm={handleDelete}
          onCancel={() => setTaskToDelete(null)}
        />
      )}
    </div>
  )
}
