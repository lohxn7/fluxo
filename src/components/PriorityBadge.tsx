import { SignalHigh, SignalMedium, SignalLow } from 'lucide-react'
import type { Priority } from '../db/types'

const CONFIG: Record<Priority, { label: string; icon: typeof SignalHigh; className: string }> = {
  alta: { label: 'Alta', icon: SignalHigh, className: 'text-danger bg-danger-bg' },
  // Média fica neutra: o amarelo é reservado para "vence em breve" (Consistência)
  media: { label: 'Média', icon: SignalMedium, className: 'text-text bg-column' },
  baixa: { label: 'Baixa', icon: SignalLow, className: 'text-text-muted bg-column' },
}

// Nunca só cor: ícone + texto sempre juntos (Semiótica / nenhuma informação só por cor).
// Pílula colorida (em vez de texto solto) pra ficar no mesmo nível visual da etiqueta ao lado.
export function PriorityBadge({ priority }: { priority: Priority }) {
  const { label, icon: Icon, className } = CONFIG[priority]
  return (
    <span className={`inline-flex items-center gap-1 rounded-chip px-2 py-1 text-[11px] font-bold uppercase tracking-wide ${className}`}>
      <Icon size={13} aria-hidden="true" />
      {label}
    </span>
  )
}
