import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { db } from '../../db/schema'
import {
  createColumn,
  renameColumn,
  setColumnWipLimit,
  deleteColumn,
  reorderColumns,
  createLabel,
  updateLabel,
  deleteLabel,
} from '../board/boardApi'
import { Button } from '../../components/Button'
import { LABEL_PALETTE } from '../../db/labelPalette'
import { useToast } from '../../components/ToastProvider'

export function BoardSettings() {
  const columns = useLiveQuery(() => db.columns.orderBy('order').toArray(), [])
  const labels = useLiveQuery(() => db.labels.toArray(), [])
  const { showToast } = useToast()
  const [newColumnName, setNewColumnName] = useState('')
  const [newLabelName, setNewLabelName] = useState('')

  async function handleDeleteColumn(id: string) {
    try {
      await deleteColumn(id)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível excluir a coluna.')
    }
  }

  async function moveColumn(index: number, direction: -1 | 1) {
    if (!columns) return
    const targetIndex = index + direction
    if (targetIndex < 0 || targetIndex >= columns.length) return
    const ids = columns.map((c) => c.id)
    ;[ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]]
    await reorderColumns(ids)
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h3 className="mb-3 text-base font-semibold text-text">Colunas</h3>
        <div className="flex flex-col gap-2">
          {columns?.map((col, index) => (
            <div key={col.id} className="flex flex-wrap items-center gap-2 rounded-btn border border-border p-2.5">
              <div className="flex gap-1">
                <button
                  aria-label={`Mover coluna ${col.name} para cima`}
                  title="Mover para cima"
                  disabled={index === 0}
                  onClick={() => moveColumn(index, -1)}
                  className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-text-muted hover:bg-column hover:text-primary disabled:opacity-30"
                >
                  <ChevronUp size={18} aria-hidden="true" />
                </button>
                <button
                  aria-label={`Mover coluna ${col.name} para baixo`}
                  title="Mover para baixo"
                  disabled={index === (columns?.length ?? 0) - 1}
                  onClick={() => moveColumn(index, 1)}
                  className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-text-muted hover:bg-column hover:text-primary disabled:opacity-30"
                >
                  <ChevronDown size={18} aria-hidden="true" />
                </button>
              </div>
              <input
                defaultValue={col.name}
                aria-label={`Nome da coluna ${col.name}`}
                onBlur={(e) => e.target.value.trim() && renameColumn(col.id, e.target.value)}
                className="min-w-0 flex-1 rounded-btn border border-transparent bg-transparent px-2 py-1.5 text-base font-medium text-text hover:border-border focus-visible:outline-none"
              />
              <label className="flex items-center gap-1.5 text-sm text-text-muted">
                Limite WIP
                <input
                  type="number"
                  min={0}
                  aria-label={`Limite de tarefas simultâneas para ${col.name}`}
                  defaultValue={col.wipLimit ?? ''}
                  placeholder="Sem limite"
                  onBlur={(e) => setColumnWipLimit(col.id, e.target.value ? Number(e.target.value) : null)}
                  className="w-24 rounded-btn border border-border bg-surface px-2 py-1.5 text-sm text-text focus-visible:outline-none"
                />
              </label>
              <button
                aria-label={`Excluir coluna ${col.name}`}
                title="Excluir coluna"
                onClick={() => handleDeleteColumn(col.id)}
                className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-danger hover:bg-danger-bg"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={newColumnName}
            onChange={(e) => setNewColumnName(e.target.value)}
            placeholder="Nome da nova coluna"
            aria-label="Nome da nova coluna"
            className="min-h-11 flex-1 rounded-btn border border-border bg-surface px-3.5 py-2 text-base text-text focus-visible:outline-none"
          />
          <Button
            variant="secondary"
            icon={<Plus size={16} aria-hidden="true" />}
            onClick={async () => {
              if (!newColumnName.trim()) return
              await createColumn(newColumnName)
              setNewColumnName('')
            }}
          >
            Adicionar
          </Button>
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-base font-semibold text-text">Etiquetas</h3>
        <div className="flex flex-col gap-2">
          {labels?.map((label) => (
            <div key={label.id} className="flex items-center gap-2 rounded-btn border border-border p-2.5">
              <input
                defaultValue={label.name}
                aria-label={`Nome da etiqueta ${label.name}`}
                onBlur={(e) => e.target.value.trim() && updateLabel(label.id, { name: e.target.value })}
                className="min-w-0 flex-1 rounded-btn border border-transparent bg-transparent px-2 py-1.5 text-base font-medium text-text hover:border-border focus-visible:outline-none"
              />
              <div className="flex gap-1.5">
                {LABEL_PALETTE.map((swatch) => (
                  <button
                    key={swatch.bg}
                    aria-label={`Cor ${swatch.name} para ${label.name}`}
                    aria-pressed={label.color === swatch.bg}
                    onClick={() => updateLabel(label.id, { color: swatch.bg })}
                    className={`tap-inline h-7 w-7 rounded-full border-2 ${
                      label.color === swatch.bg ? 'border-primary' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: swatch.bg }}
                  />
                ))}
              </div>
              <button
                aria-label={`Excluir etiqueta ${label.name}`}
                title="Excluir etiqueta"
                onClick={() => deleteLabel(label.id)}
                className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-danger hover:bg-danger-bg"
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            placeholder="Nome da nova etiqueta"
            aria-label="Nome da nova etiqueta"
            className="min-h-11 flex-1 rounded-btn border border-border bg-surface px-3.5 py-2 text-base text-text focus-visible:outline-none"
          />
          <Button
            variant="secondary"
            icon={<Plus size={16} aria-hidden="true" />}
            onClick={async () => {
              if (!newLabelName.trim()) return
              await createLabel(newLabelName, LABEL_PALETTE[0].bg)
              setNewLabelName('')
            }}
          >
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  )
}
