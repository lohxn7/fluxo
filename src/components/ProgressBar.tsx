interface ProgressBarProps {
  value: number
  max: number
  label: string
  colorClass?: string
}

// Teoria da Ação — Avaliação: progresso visível dá feedback imediato do estado do sistema
export function ProgressBar({ value, max, label, colorClass = 'bg-primary' }: ProgressBarProps) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm text-text-muted">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
        className="h-2.5 w-full overflow-hidden rounded-chip bg-column"
      >
        <div
          className={`h-full rounded-chip transition-[width] duration-200 ease-out ${colorClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
