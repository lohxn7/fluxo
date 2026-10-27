import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Input } from './Input'

type PasswordInputProps = Omit<Parameters<typeof Input>[0], 'type' | 'trailing'>

// Mesmo campo de senha (com mostrar/ocultar) no login e no cadastro — Consistência
export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false)
  return (
    <Input
      {...props}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          title={visible ? 'Ocultar senha' : 'Mostrar senha'}
          onClick={() => setVisible((v) => !v)}
          className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-text-muted hover:bg-column"
        >
          {visible ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
        </button>
      }
    />
  )
}
