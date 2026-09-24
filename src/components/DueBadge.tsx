import { AlarmClock, CalendarClock, Clock3 } from 'lucide-react'
import { dueLabel, dueStatus } from '../lib/date'

export function DueBadge({ dueDate }: { dueDate: string | null }) {
  if (!dueDate) return null
  const status = dueStatus(dueDate)
  const label = dueLabel(dueDate)

  const config = {
    atrasada: { icon: AlarmClock, className: 'text-danger bg-danger-bg' },
    hoje: { icon: Clock3, className: 'text-warning bg-warning-bg' },
    'em-breve': { icon: CalendarClock, className: 'text-warning bg-warning-bg' },
    futura: { icon: CalendarClock, className: 'text-text-muted bg-column' },
    'sem-prazo': { icon: CalendarClock, className: 'text-text-muted bg-column' },
  }[status]

  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 rounded-chip px-2 py-0.5 text-sm font-medium ${config.className}`}>
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  )
}
