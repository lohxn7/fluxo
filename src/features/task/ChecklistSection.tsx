import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2 } from 'lucide-react'
import { db } from '../../db/schema'
import { addChecklistItem, toggleChecklistItem, deleteChecklistItem } from './taskApi'
import { ProgressBar } from '../../components/ProgressBar'

export function ChecklistSection({ taskId }: { taskId: string }) {
  const items = useLiveQuery(() => db.checklistItems.where('taskId').equals(taskId).sortBy('order'), [taskId])
  const [newText, setNewText] = useState('')

  async function handleAdd() {
    if (!newText.trim()) return
    await addChecklistItem(taskId, newText)
    setNewText('')
  }

  const done = items?.filter((i) => i.done).length ?? 0

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-base font-semibold text-text">Checklist</h3>
      {!!items?.length && <ProgressBar value={done} max={items.length} label={`${done} de ${items.length} concluídos`} colorClass="bg-success" />}

      <ul className="flex flex-col gap-1">
        {items?.map((item) => (
          <li key={item.id} className="flex items-center gap-2 rounded-btn px-1 py-1.5 hover:bg-column">
            <input
              type="checkbox"
              id={`check-${item.id}`}
              checked={item.done}
              onChange={(e) => toggleChecklistItem(item.id, e.target.checked)}
              className="h-5 w-5 shrink-0 accent-[var(--primary)]"
            />
            <label
              htmlFor={`check-${item.id}`}
              className={`flex-1 text-base ${item.done ? 'text-text-muted line-through' : 'text-text'}`}
            >
              {item.text}
            </label>
            <button
              aria-label={`Remover item: ${item.text}`}
              title="Remover item"
              onClick={() => deleteChecklistItem(item.id)}
              className="tap-inline flex h-8 w-8 shrink-0 items-center justify-center rounded-btn text-text-muted hover:bg-danger-bg hover:text-danger"
            >
              <Trash2 size={16} aria-hidden="true" />
            </button>
          </li>
        ))}
      </ul>

      <div className="flex items-center gap-2">
        <input
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="Adicionar item ao checklist"
          aria-label="Adicionar item ao checklist"
          className="min-h-11 flex-1 rounded-btn border border-border bg-surface px-3.5 py-2 text-base text-text focus-visible:outline-none"
        />
        <button
          onClick={handleAdd}
          aria-label="Adicionar item"
          className="tap-inline flex h-11 w-11 shrink-0 items-center justify-center rounded-btn bg-primary text-primary-contrast"
        >
          <Plus size={18} aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
