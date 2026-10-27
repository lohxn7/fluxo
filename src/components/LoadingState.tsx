import { Loader2 } from 'lucide-react'

// Visibilidade do status: enquanto o banco local responde, a tela diz que está carregando
// em vez de ficar em branco.
export function LoadingState({ label = 'Carregando…' }: { label?: string }) {
  return (
    <div role="status" className="flex min-h-[50dvh] items-center justify-center gap-2 text-base text-text-muted">
      <Loader2 size={20} className="animate-spin" aria-hidden="true" />
      {label}
    </div>
  )
}
