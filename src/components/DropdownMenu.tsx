import { useEffect, useRef, useState, type ReactNode } from 'react'
import { MoreVertical } from 'lucide-react'

export interface MenuAction {
  label: string
  icon: ReactNode
  onSelect: () => void
  danger?: boolean
}

interface DropdownMenuProps {
  actions: MenuAction[]
  label: string
}

export function DropdownMenu({ actions, label }: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div className="relative tap-inline" ref={ref}>
      <button
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        title={label}
        onClick={() => setOpen((v) => !v)}
        className="tap-inline flex h-8 w-8 items-center justify-center rounded-btn text-text-muted hover:bg-column"
      >
        <MoreVertical size={18} aria-hidden="true" />
      </button>
      {open && (
        <div
          role="menu"
          aria-label={label}
          className="absolute right-0 z-30 mt-1 w-48 overflow-hidden rounded-card border border-border bg-surface py-1 shadow-soft"
        >
          {actions.map((action) => (
            <button
              key={action.label}
              role="menuitem"
              onClick={() => {
                setOpen(false)
                action.onSelect()
              }}
              className={`tap-inline flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm font-medium hover:bg-column ${
                action.danger ? 'text-danger' : 'text-text'
              }`}
            >
              <span aria-hidden="true">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
