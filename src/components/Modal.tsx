import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { IconButton } from './IconButton'

interface ModalProps {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  fullScreenOnMobile?: boolean
}

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

// Acessibilidade: prende o foco, fecha com Esc e devolve o foco ao elemento de origem
export function Modal({ title, onClose, children, footer, fullScreenOnMobile = true }: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLElement | null>(null)
  // Guarda a versão mais recente de onClose sem entrar nas dependências do efeito abaixo:
  // se o efeito reexecutasse a cada nova referência de onClose (comum, já que o chamador
  // costuma passar uma arrow function inline), o foco seria "roubado" de volta a cada
  // digitação que causasse um re-render do componente pai (ex.: campo de descrição).
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    triggerRef.current = document.activeElement as HTMLElement
    const dialog = dialogRef.current
    const autoFocusTarget = dialog?.querySelector<HTMLElement>('[data-autofocus]')
    const focusable = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE)
    ;(autoFocusTarget ?? focusable?.[0])?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onCloseRef.current()
        return
      }
      if (e.key === 'Tab' && dialog) {
        const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      triggerRef.current?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda só na montagem/desmontagem; onClose é lido via ref
  }, [])

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 lg:items-center" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`flex max-h-[100dvh] w-full flex-col bg-surface shadow-soft lg:max-w-lg lg:rounded-card ${
          fullScreenOnMobile ? 'h-[100dvh] lg:h-auto' : 'max-h-[90vh] rounded-t-card lg:rounded-card'
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 id="modal-title" className="font-display text-xl font-semibold text-text">
            {title}
          </h2>
          <IconButton icon={<X size={20} />} label="Fechar" onClick={onClose} />
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
