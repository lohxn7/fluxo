import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, AlertTriangle, SearchX } from 'lucide-react'
import type { Column, Task } from '../../db/types'
import { TaskCard } from './TaskCard'
import { EmptyState } from '../../components/EmptyState'
import { KanbanSquare } from 'lucide-react'

interface BoardColumnProps {
  column: Column
  tasks: Task[]
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (task: Task) => void
  onMoveTask: (task: Task) => void
  onToggleComplete: (task: Task) => void
  filtering: boolean
}

// Gestalt — Região comum: fundo próprio (--column) separa visualmente cada coluna
export function BoardColumn({ column, tasks, onAddTask, onEditTask, onDeleteTask, onMoveTask, onToggleComplete, filtering }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id })
  const overLimit = column.wipLimit != null && tasks.length > column.wipLimit

  return (
    <section
      aria-label={`Coluna ${column.name}`}
      className={`flex h-full w-[85vw] shrink-0 snap-start flex-col rounded-card bg-column p-3 lg:w-80 lg:shrink ${
        isOver ? 'ring-2 ring-primary' : ''
      }`}
    >
      <div className="mb-2 flex items-center justify-between px-1">
        <h2 className="text-base font-semibold text-text">{column.name}</h2>
        <span className="text-sm font-medium text-text-muted">
          {tasks.length}
          {column.wipLimit != null ? ` / ${column.wipLimit}` : ''}
        </span>
      </div>

      {overLimit && (
        <div className="mb-2 flex items-start gap-2 rounded-btn bg-warning-bg px-3 py-2 text-sm font-medium text-warning">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          <span>
            {column.name} passou do limite: {tasks.length} tarefas para um máximo de {column.wipLimit}. Que tal tirar alguma daqui antes de
            colocar outra?
          </span>
        </div>
      )}

      <div ref={setNodeRef} className="flex-1 overflow-y-auto scrollbar-thin">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          <div className="flex flex-col gap-3 pb-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEditTask(task)}
                onDelete={() => onDeleteTask(task)}
                onMove={() => onMoveTask(task)}
                onToggleComplete={() => onToggleComplete(task)}
              />
            ))}
            {tasks.length === 0 &&
              (filtering ? (
                <EmptyState
                  icon={<SearchX size={28} aria-hidden="true" />}
                  title="Nenhum resultado"
                  description="Nenhuma tarefa desta coluna combina com a busca ou o filtro."
                />
              ) : (
                <EmptyState
                  icon={<KanbanSquare size={28} aria-hidden="true" />}
                  title="Nada por aqui"
                  description="Arraste uma tarefa ou adicione uma nova."
                />
              ))}
          </div>
        </SortableContext>
      </div>

      <button
        onClick={onAddTask}
        className="tap-inline mt-2 flex items-center justify-center gap-2 rounded-btn border border-dashed border-border px-3 py-2.5 text-sm font-semibold text-text-muted hover:border-primary hover:text-primary"
      >
        <Plus size={16} aria-hidden="true" />
        Adicionar tarefa
      </button>
    </section>
  )
}
