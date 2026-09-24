import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/schema'
import { Modal } from '../../components/Modal'
import type { Task } from '../../db/types'

interface MoveTaskModalProps {
  task: Task
  onMove: (columnId: string) => void
  onClose: () => void
}

// Ação situada: caminho alternativo ao arrastar, útil com uma mão só no celular
export function MoveTaskModal({ task, onMove, onClose }: MoveTaskModalProps) {
  const columns = useLiveQuery(() => db.columns.orderBy('order').toArray(), [])

  return (
    <Modal title="Mover tarefa para…" onClose={onClose} fullScreenOnMobile={false}>
      <div className="flex flex-col gap-2">
        {columns?.map((col) => (
          <button
            key={col.id}
            disabled={col.id === task.columnId}
            onClick={() => {
              onMove(col.id)
              onClose()
            }}
            className="tap-inline flex items-center justify-between rounded-btn border border-border px-4 py-3 text-left text-base font-medium text-text hover:bg-column disabled:cursor-not-allowed disabled:opacity-50"
          >
            {col.name}
            {col.id === task.columnId && <span className="text-sm text-text-muted">(atual)</span>}
          </button>
        ))}
      </div>
    </Modal>
  )
}
