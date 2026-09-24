import type { ButtonHTMLAttributes, ReactNode } from 'react'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode
  label: string
  showLabel?: boolean
  variant?: 'ghost' | 'danger'
}

// Todo ícone precisa de rótulo (Semiótica): visível por padrão, ou aria-label + title quando só ícone.
export function IconButton({ icon, label, showLabel = false, variant = 'ghost', className = '', ...rest }: IconButtonProps) {
  const variantClasses =
    variant === 'danger' ? 'text-danger hover:bg-danger-bg' : 'text-text hover:bg-column'
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center gap-2 rounded-btn px-2.5 py-2.5 transition-colors duration-200 ease-out ${variantClasses} ${className}`}
      {...rest}
    >
      <span aria-hidden="true">{icon}</span>
      {showLabel && <span className="text-sm font-medium">{label}</span>}
      {!showLabel && <span className="sr-only">{label}</span>}
    </button>
  )
}
