import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext'
import { Input } from '../../components/Input'
import { Button } from '../../components/Button'
import { usePageTitle } from '../../hooks/usePageTitle'

export function SignupPage() {
  usePageTitle('Criar conta')
  const navigate = useNavigate()
  const { signup } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; general?: string }>({})
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const nextErrors: typeof errors = {}
    if (!name.trim()) nextErrors.name = 'Conta pra gente saber como te chamar.'
    if (!/^\S+@\S+\.\S+$/.test(email)) nextErrors.email = 'Digite um e-mail válido.'
    if (password.length < 6) nextErrors.password = 'A senha precisa ter pelo menos 6 caracteres.'
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) return

    setLoading(true)
    const result = await signup(name, email, password)
    setLoading(false)
    if (!result.ok) {
      setErrors({ general: result.error })
      return
    }
    navigate('/')
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-bg px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <h1 className="text-2xl font-bold text-text">Criar conta no Fluxo</h1>
          <p className="text-base text-text-muted">Leva menos de um minuto.</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
          <Input label="Nome" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} />
          <Input
            label="E-mail"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
          />
          <Input
            label="Senha"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint="Pelo menos 6 caracteres."
          />
          {errors.general && <p className="text-sm font-medium text-danger">{errors.general}</p>}
          <Button type="submit" variant="primary" fullWidth disabled={loading}>
            {loading ? 'Criando conta…' : 'Criar conta'}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-text-muted">
          Já tem conta?{' '}
          <Link to="/entrar" className="font-semibold text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  )
}
