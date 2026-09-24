import { Modal } from './Modal'
import { Button } from './Button'

interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  danger?: boolean
  onConfirm: () => void
  onCancel: () => void
}

// Segurança no uso: nada irreversível acontece sem confirmação explícita
export function ConfirmDialog({ title, message, confirmLabel = 'Confirmar', danger, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      fullScreenOnMobile={false}
      footer={
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
          <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <p className="text-base text-text">{message}</p>
    </Modal>
  )
}
