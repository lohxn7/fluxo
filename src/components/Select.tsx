import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  children: ReactNode
}

export function Select({ label, id, children, className = '', ...rest }: SelectProps) {
  const autoId = useId()
  const selectId = id ?? autoId
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={selectId} className="text-sm font-semibold text-text">
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full rounded-btn border border-border bg-surface px-3.5 py-2.5 text-base text-text focus-visible:outline-none ${className}`}
        {...rest}
      >
        {children}
      </select>
    </div>
  )
}
