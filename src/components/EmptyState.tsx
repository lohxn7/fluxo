import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: ReactNode
}

// Engenharia Semiótica — signo metalinguístico: explica o estado vazio em vez de deixar a tela muda
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-card border border-dashed border-border bg-surface px-6 py-12 text-center">
      <div className="text-text-muted" aria-hidden="true">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-text">{title}</h3>
      <p className="max-w-sm text-sm text-text-muted">{description}</p>
      {action}
    </div>
  )
}
