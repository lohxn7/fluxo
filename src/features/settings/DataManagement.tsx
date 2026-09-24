import { useRef, useState } from 'react'
import { Download, Upload, Trash2 } from 'lucide-react'
import { db } from '../../db/schema'
import { Button } from '../../components/Button'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { useToast } from '../../components/ToastProvider'

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve((reader.result as string).split(',')[1] ?? '')
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

function base64ToBlob(base64: string, mimeType: string): Blob {
  const bytes = atob(base64)
  const array = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) array[i] = bytes.charCodeAt(i)
  return new Blob([array], { type: mimeType })
}

export function DataManagement() {
  const { showToast } = useToast()
  const [confirmWipeStep, setConfirmWipeStep] = useState(0)
  const importRef = useRef<HTMLInputElement>(null)

  async function handleExport() {
    const [users, columns, labels, tasks, checklistItems, attachments, settings] = await Promise.all([
      db.users.toArray(),
      db.columns.toArray(),
      db.labels.toArray(),
      db.tasks.toArray(),
      db.checklistItems.toArray(),
      db.attachments.toArray(),
      db.settings.toArray(),
    ])

    const attachmentsExport = await Promise.all(
      attachments.map(async (a) => ({ ...a, blob: undefined, dataBase64: await blobToBase64(a.blob) }))
    )

    const payload = {
      exportedAt: new Date().toISOString(),
      users: users.map((u) => ({ ...u })),
      columns,
      labels,
      tasks,
      checklistItems,
      attachments: attachmentsExport,
      settings,
    }

    const json = JSON.stringify(payload, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `fluxo-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
    showToast('Seus dados foram exportados')
  }

  async function handleImportFile(file: File) {
    try {
      const text = await file.text()
      const data = JSON.parse(text)
      await db.transaction('rw', db.tables, async () => {
          await Promise.all([
            db.users.clear(),
            db.columns.clear(),
            db.labels.clear(),
            db.tasks.clear(),
            db.checklistItems.clear(),
            db.attachments.clear(),
            db.settings.clear(),
          ])
          await db.users.bulkAdd(data.users ?? [])
          await db.columns.bulkAdd(data.columns ?? [])
          await db.labels.bulkAdd(data.labels ?? [])
          await db.tasks.bulkAdd(data.tasks ?? [])
          await db.checklistItems.bulkAdd(data.checklistItems ?? [])
          await db.settings.bulkAdd(data.settings ?? [])
          const restoredAttachments = (data.attachments ?? []).map((a: Record<string, unknown>) => ({
            id: a.id,
            taskId: a.taskId,
            name: a.name,
            mimeType: a.mimeType,
            size: a.size,
            createdAt: a.createdAt,
            blob: base64ToBlob(a.dataBase64 as string, a.mimeType as string),
          }))
          await db.attachments.bulkAdd(restoredAttachments)
        }
      )
      showToast('Dados importados com sucesso')
    } catch {
      showToast('Não foi possível importar esse arquivo. Confira se é um backup válido do Fluxo.')
    }
  }

  async function handleWipe() {
    await db.delete()
    window.location.href = '/entrar'
  }

  return (
    <div className="flex flex-col gap-3">
      <Button variant="secondary" icon={<Download size={16} aria-hidden="true" />} onClick={handleExport}>
        Exportar meus dados
      </Button>
      <Button variant="secondary" icon={<Upload size={16} aria-hidden="true" />} onClick={() => importRef.current?.click()}>
        Importar backup
      </Button>
      <input
        ref={importRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleImportFile(file)
          e.target.value = ''
        }}
      />
      <Button variant="danger" icon={<Trash2 size={16} aria-hidden="true" />} onClick={() => setConfirmWipeStep(1)}>
        Apagar tudo
      </Button>

      {confirmWipeStep === 1 && (
        <ConfirmDialog
          title="Apagar todos os dados?"
          message="Isso vai remover todas as tarefas, arquivos e configurações deste dispositivo. Essa ação não pode ser desfeita."
          confirmLabel="Continuar"
          danger
          onConfirm={() => setConfirmWipeStep(2)}
          onCancel={() => setConfirmWipeStep(0)}
        />
      )}
      {confirmWipeStep === 2 && (
        <ConfirmDialog
          title="Tem mesmo certeza?"
          message="Última confirmação: todos os seus dados serão apagados permanentemente deste dispositivo."
          confirmLabel="Sim, apagar tudo"
          danger
          onConfirm={handleWipe}
          onCancel={() => setConfirmWipeStep(0)}
        />
      )}
    </div>
  )
}
