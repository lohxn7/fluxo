import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { useAuth } from './AuthContext'
import { LogoMark, Wordmark } from '../../components/Logo'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { usePageTitle } from '../../hooks/usePageTitle'

export function LoginPage() {
  usePageTitle('Entrar')
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('larissa@fluxo.app')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(email, password, remember)
    setLoading(false)
    if (!result.ok) {
      setError(result.error ?? 'Não foi possível entrar.')
      return
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoMark size={48} />
          <Wordmark className="text-3xl text-text" />
          <p className="text-base text-text-muted">Suas tarefas e arquivos, num lugar só.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Senha"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={error}
            required
            trailing={
              <button
                type="button"
                aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                onClick={() => setShowPassword((v) => !v)}
                className="tap-inline flex h-9 w-9 items-center justify-center rounded-btn text-text-muted hover:bg-column"
              >
                {showPassword ? <EyeOff size={18} aria-hidden="true" /> : <Eye size={18} aria-hidden="true" />}
              </button>
            }
          />

          <label className="flex min-h-11 items-center gap-2 text-sm text-text">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-5 w-5 accent-[var(--primary)]"
            />
            Lembrar de mim
          </label>

          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Entrando…' : 'Entrar'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Ainda não tem conta?{' '}
          <Link to="/criar-conta" className="font-semibold text-primary hover:underline">
            Criar conta
          </Link>
        </p>

        <p className="mt-4 rounded-btn bg-column px-3.5 py-2.5 text-center text-sm text-text-muted">
          Conta demo: <strong className="text-text">larissa@fluxo.app</strong> · senha <strong className="text-text">fluxo123</strong>
        </p>
      </div>
    </div>
  )
}
