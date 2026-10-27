import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
import { useAuth } from './AuthContext'
import { LogoMark, Wordmark } from '../../components/Logo'
import { Input } from '../../components/Input'
import { PasswordInput } from '../../components/PasswordInput'
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
        {/* Consistência: mesmo topo (logo + marca) do login */}
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <LogoMark size={48} />
          <Wordmark className="text-3xl text-text" />
          <h1 className="text-xl font-semibold text-text">Criar conta</h1>
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
          <PasswordInput
            label="Senha"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            hint="Pelo menos 6 caracteres."
          />
          {/* Ajuda: avisar antes, e não só em Ajustes, que limpar o navegador apaga tudo */}
          <p className="flex items-start gap-2 rounded-btn bg-column px-3 py-2.5 text-sm text-text-muted">
            <ShieldCheck size={16} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
            <span>
              Seus dados ficam só neste dispositivo. Se você limpar os dados do navegador, eles somem. Dá para fazer uma cópia em
              Ajustes → Dados.
            </span>
          </p>
          {errors.general && (
            <p role="alert" className="text-sm font-medium text-danger">
              {errors.general}
            </p>
          )}
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
