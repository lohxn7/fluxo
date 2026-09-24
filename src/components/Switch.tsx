interface SwitchProps {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
  description?: string
}

export function Switch({ checked, onChange, label, description }: SwitchProps) {
  return (
    <label className="flex min-h-11 cursor-pointer items-center justify-between gap-4 py-1">
      <span className="flex flex-col">
        <span className="text-base font-medium text-text">{label}</span>
        {description && <span className="text-sm text-text-muted">{description}</span>}
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="peer sr-only"
        />
        <span className="h-7 w-12 rounded-chip bg-border transition-colors duration-200 ease-out peer-checked:bg-primary peer-focus-visible:outline peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--focus-ring)]" />
        <span className="absolute left-1 h-5 w-5 rounded-full bg-white transition-transform duration-200 ease-out peer-checked:translate-x-5" />
      </span>
    </label>
  )
}
