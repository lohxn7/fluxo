import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variant = 'primary' | 'cta' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  icon?: ReactNode
  fullWidth?: boolean
}

const variantClasses: Record<Variant, string> = {
  // Primary: confiança, ações principais
  primary: 'bg-primary text-primary-contrast hover:opacity-90',
  // CTA: laranja exclusivo do botão "Nova tarefa" — Sinal estático diferenciado (Semiótica)
  cta: 'bg-cta text-cta-contrast hover:opacity-90 shadow-soft',
  secondary: 'bg-surface text-text border border-border hover:bg-column',
  ghost: 'bg-transparent text-text hover:bg-column',
  danger: 'bg-danger-bg text-danger hover:opacity-90 border border-danger',
}

export function Button({
  variant = 'secondary',
  icon,
  fullWidth,
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-btn px-4 py-2.5 text-base font-semibold transition-[opacity,transform] duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed ${
        fullWidth ? 'w-full' : ''
      } ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  )
}
