import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { CheckCircle2, X } from 'lucide-react'

interface ToastOptions {
  actionLabel?: string
  onAction?: () => void
  durationMs?: number
}

interface ToastItem {
  id: string
  message: string
  actionLabel?: string
  onAction?: () => void
}

interface ToastContextValue {
  showToast: (message: string, options?: ToastOptions) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast deve ser usado dentro de ToastProvider')
  return ctx
}

// Teoria da Ação — Avaliação + Segurança no uso: toda ação relevante gera feedback, com "Desfazer" por 6s
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const timers = useRef<Record<string, number>>({})

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    window.clearTimeout(timers.current[id])
    delete timers.current[id]
  }, [])

  const showToast = useCallback(
    (message: string, options?: ToastOptions) => {
      const id = crypto.randomUUID()
      const duration = options?.durationMs ?? 6000
      setToasts((prev) => [...prev, { id, message, actionLabel: options?.actionLabel, onAction: options?.onAction }])
      timers.current[id] = window.setTimeout(() => dismiss(id), duration)
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-50 flex flex-col items-center gap-2 px-4 lg:bottom-6"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-card bg-text px-4 py-3 text-surface shadow-soft"
          >
            <CheckCircle2 size={18} className="shrink-0 text-success" aria-hidden="true" />
            <span className="flex-1 text-sm">{t.message}</span>
            {t.actionLabel && (
              <button
                className="tap-inline shrink-0 text-sm font-semibold underline underline-offset-2"
                onClick={() => {
                  t.onAction?.()
                  dismiss(t.id)
                }}
              >
                {t.actionLabel}
              </button>
            )}
            <button
              aria-label="Fechar aviso"
              className="tap-inline shrink-0 opacity-70 hover:opacity-100"
              onClick={() => dismiss(t.id)}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
