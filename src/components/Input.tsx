import { useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  hint?: string
  trailing?: ReactNode
}

// Formulários: rótulo fixo acima do campo (nunca só placeholder) — Segurança no uso / clareza
export function Input({ label, error, hint, id, trailing, className = '', ...rest }: InputProps) {
  const autoId = useId()
  const inputId = id ?? autoId
  const errorId = `${inputId}-error`
  const hintId = `${inputId}-hint`

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={inputId} className="text-sm font-semibold text-text">
        {label}
      </label>
      <div className="relative flex items-center">
        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : hint ? hintId : undefined}
          className={`w-full rounded-btn border bg-surface px-3.5 py-2.5 text-base text-text placeholder:text-text-muted focus-visible:outline-none ${
            error ? 'border-danger' : 'border-border'
          } ${className}`}
          {...rest}
        />
        {trailing && <div className="absolute right-2">{trailing}</div>}
      </div>
      {hint && !error && (
        <p id={hintId} className="text-sm text-text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-sm font-medium text-danger">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}
