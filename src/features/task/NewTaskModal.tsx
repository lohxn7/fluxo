import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/schema'
import { Modal } from '../../components/Modal'
import { Input } from '../../components/Input'
import { Select } from '../../components/Select'
import { Button } from '../../components/Button'
import { createTask } from './taskApi'
import type { Priority } from '../../db/types'

interface NewTaskModalProps {
  defaultColumnId: string
  onClose: () => void
  onCreated: (taskId: string) => void
}

export function NewTaskModal({ defaultColumnId, onClose, onCreated }: NewTaskModalProps) {
  const columns = useLiveQuery(() => db.columns.orderBy('order').toArray(), [])
  const labels = useLiveQuery(() => db.labels.toArray(), [])

  const [title, setTitle] = useState('')
  const [columnId, setColumnId] = useState(defaultColumnId)
  const [labelId, setLabelId] = useState('')
  const [priority, setPriority] = useState<Priority>('media')
  const [dueDate, setDueDate] = useState('')
  const [error, setError] = useState('')

  async function handleSubmit() {
    if (!title.trim()) {
      setError('Dá um nome pra essa tarefa antes de continuar.')
      return
    }
    const id = await createTask({
      title,
      columnId,
      labelId: labelId || null,
      priority,
      dueDate: dueDate || null,
    })
    onCreated(id)
  }

  return (
    <Modal
      title="Nova tarefa"
      onClose={onClose}
      fullScreenOnMobile={false}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="cta" onClick={handleSubmit}>
            Criar tarefa
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          error={error}
          placeholder="Ex.: Relatório AV1 de IHM"
          data-autofocus
        />
        <Select label="Coluna" value={columnId} onChange={(e) => setColumnId(e.target.value)}>
          {columns?.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select label="Etiqueta" value={labelId} onChange={(e) => setLabelId(e.target.value)}>
          <option value="">Sem etiqueta</option>
          {labels?.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>
        <Select label="Prioridade" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
          <option value="alta">Alta</option>
          <option value="media">Média</option>
          <option value="baixa">Baixa</option>
        </Select>
        <Input
          label="Prazo (opcional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>
    </Modal>
  )
}
