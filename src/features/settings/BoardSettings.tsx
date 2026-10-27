import { useState, type ChangeEvent } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
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
import type { Column, Label } from '../../db/types'

// Campo de nome controlado: se a pessoa apaga tudo, o nome salvo volta ao sair do campo
// (antes o campo ficava vazio na tela, mostrando um estado que não existia no banco).
// Visibilidade do status: toda alteração salva gera um aviso, como no detalhe da tarefa.
function useNameField(saved: string, onSave: (name: string) => Promise<unknown>, noun: 'Coluna' | 'Etiqueta') {
  const { showToast } = useToast()
  const [value, setValue] = useState(saved)
  const [lastSaved, setLastSaved] = useState(saved)
  if (lastSaved !== saved) {
    setLastSaved(saved)
    setValue(saved)
  }

  async function onBlur() {
    const next = value.trim()
    if (!next) {
      setValue(saved)
      showToast(`O nome não pode ficar vazio. Voltamos para "${saved}".`)
      return
    }
    if (next === saved) return
    await onSave(next)
    showToast(`${noun} renomeada para "${next}"`)
  }

  return { value, onChange: (e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value), onBlur }
}

interface ColumnRowProps {
  col: Column
  index: number
  total: number
  taskCount: number
  onMove: (index: number, direction: -1 | 1) => void
}

function ColumnRow({ col, index, total, taskCount, onMove }: ColumnRowProps) {
  const { showToast } = useToast()
  const name = useNameField(col.name, (n) => renameColumn(col.id, n), 'Coluna')
  const [limit, setLimit] = useState(col.wipLimit?.toString() ?? '')
  const [lastLimit, setLastLimit] = useState(col.wipLimit)
  if (lastLimit !== col.wipLimit) {
    setLastLimit(col.wipLimit)
    setLimit(col.wipLimit?.toString() ?? '')
  }
  const hintId = `col-hint-${col.id}`

  async function commitLimit() {
    const next = limit.trim() === '' ? null : Number(limit)
    // Prevenção de erros: limite 0 deixaria a coluna sempre "estourada"
    if (next !== null && (!Number.isInteger(next) || next < 1)) {
      setLimit(col.wipLimit?.toString() ?? '')
      showToast('O máximo precisa ser 1 ou mais. Deixe vazio para não ter limite.')
      return
    }
    if (next === col.wipLimit) return
    await setColumnWipLimit(col.id, next)
    showToast(next === null ? `${col.name}: sem máximo de tarefas` : `${col.name}: máximo de ${next} tarefas`)
  }

  async function handleDelete() {
    try {
      await deleteColumn(col.id)
      showToast(`Coluna "${col.name}" excluída`)
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Não foi possível excluir a coluna.')
    }
  }

  return (
    <div className="flex flex-col gap-1.5 rounded-btn border border-border p-2.5">
      <div className="flex flex-wrap items-center gap-2">
        {/* No quadro as colunas ficam lado a lado, então as setas são ← e → */}
        <div className="flex gap-1">
          <button
            aria-label={`Mover coluna ${col.name} para a esquerda`}
            title="Mover para a esquerda no quadro"
            disabled={index === 0}
            onClick={() => onMove(index, -1)}
            className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-text-muted hover:bg-column hover:text-primary disabled:opacity-30"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <button
            aria-label={`Mover coluna ${col.name} para a direita`}
            title="Mover para a direita no quadro"
            disabled={index === total - 1}
            onClick={() => onMove(index, 1)}
            className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-text-muted hover:bg-column hover:text-primary disabled:opacity-30"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>
        <input
          {...name}
          aria-label={`Nome da coluna ${col.name}`}
          className="min-w-0 flex-1 rounded-btn border border-transparent bg-transparent px-2 py-1.5 text-base font-medium text-text hover:border-border focus-visible:outline-none"
        />
        <label className="flex items-center gap-1.5 text-sm text-text-muted">
          Máx. de tarefas
          <input
            type="number"
            min={1}
            inputMode="numeric"
            aria-label={`Máximo de tarefas ao mesmo tempo em ${col.name}`}
            value={limit}
            onChange={(e) => setLimit(e.target.value)}
            onBlur={commitLimit}
            placeholder="Sem limite"
            className="w-24 rounded-btn border border-border bg-surface px-2 py-1.5 text-sm text-text focus-visible:outline-none"
          />
        </label>
        {/* Prevenção de erros: com tarefas dentro, o botão fica desativado e o motivo aparece antes */}
        <button
          aria-label={`Excluir coluna ${col.name}`}
          aria-describedby={taskCount > 0 ? hintId : undefined}
          title={taskCount > 0 ? 'Mova as tarefas antes de excluir' : 'Excluir coluna'}
          disabled={taskCount > 0}
          onClick={handleDelete}
          className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-danger hover:bg-danger-bg disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <Trash2 size={16} aria-hidden="true" />
        </button>
      </div>
      {taskCount > 0 && (
        <p id={hintId} className="px-1 text-xs text-text-muted">
          Tem {taskCount} tarefa{taskCount > 1 ? 's' : ''} aqui. Para excluir a coluna, mova ou exclua essas tarefas antes.
        </p>
      )}
    </div>
  )
}

function LabelRow({ label }: { label: Label }) {
  const name = useNameField(label.name, (n) => updateLabel(label.id, { name: n }), 'Etiqueta')
  return (
    <div className="flex items-center gap-2 rounded-btn border border-border p-2.5">
      <input
        {...name}
        aria-label={`Nome da etiqueta ${label.name}`}
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
  )
}

export function BoardSettings() {
  const columns = useLiveQuery(() => db.columns.orderBy('order').toArray(), [])
  const labels = useLiveQuery(() => db.labels.toArray(), [])
  const tasks = useLiveQuery(() => db.tasks.toArray(), [])
  const [newColumnName, setNewColumnName] = useState('')
  const [newLabelName, setNewLabelName] = useState('')

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
            <ColumnRow
              key={col.id}
              col={col}
              index={index}
              total={columns.length}
              taskCount={tasks?.filter((t) => t.columnId === col.id).length ?? 0}
              onMove={moveColumn}
            />
          ))}
          <p className="px-1 text-xs text-text-muted">
            A última coluna guarda as tarefas concluídas. "Máx. de tarefas" mostra um aviso no quadro quando a coluna passa desse número.
          </p>
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
            <LabelRow key={label.id} label={label} />
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
