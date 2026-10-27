import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlertCircle } from 'lucide-react'
import { useAuth } from './AuthContext'
import { LogoMark, Wordmark } from '../../components/Logo'
import { Input } from '../../components/Input'
import { PasswordInput } from '../../components/PasswordInput'
import { Button } from '../../components/Button'
import { usePageTitle } from '../../hooks/usePageTitle'

export function LoginPage() {
  usePageTitle('Entrar')
  const navigate = useNavigate()
  const { login } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [errors, setErrors] = useState<{ email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    // Diagnóstico certo: campo vazio diz "preencha", e não "e-mail ou senha não conferem"
    const nextErrors: typeof errors = {}
    if (!email.trim()) nextErrors.email = 'Digite seu e-mail.'
    if (!password) nextErrors.password = 'Digite sua senha.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    const result = await login(email, password, remember)
    setLoading(false)
    if (!result.ok) {
      setErrors({ general: result.error ?? 'Não foi possível entrar.' })
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
            error={errors.email}
            required
          />
          <PasswordInput
            label="Senha"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            required
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

          {/* Erro de credencial vale para o formulário todo, não só para a senha */}
          {errors.general && (
            <p role="alert" className="flex items-start gap-1.5 rounded-btn bg-danger-bg px-3 py-2.5 text-sm font-medium text-danger">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              {errors.general}
            </p>
          )}

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
      </div>
    </div>
  )
}
