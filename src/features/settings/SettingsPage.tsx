import type { ReactNode } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { LogOut, ShieldCheck, Sun, Moon, Contrast, MonitorSmartphone, Check, ListTodo, Paperclip, HardDrive, Sparkles } from 'lucide-react'
import { db } from '../../db/schema'
import { updateSettings } from './settingsApi'
import { Card } from '../../components/Card'
import { Switch } from '../../components/Switch'
import { Button } from '../../components/Button'
import { Input } from '../../components/Input'
import { BoardSettings } from './BoardSettings'
import { DataManagement } from './DataManagement'
import { useAuth } from '../auth/AuthContext'
import { usePageTitle } from '../../hooks/usePageTitle'
import { formatFileSize } from '../files/attachmentApi'
import type { ThemeMode } from '../../db/types'
import { useState } from 'react'
import { useToast } from '../../components/ToastProvider'
import { LoadingState } from '../../components/LoadingState'

const THEME_OPTIONS: { value: ThemeMode; label: string; icon: typeof Sun; swatch: string }[] = [
  { value: 'claro', label: 'Claro', icon: Sun, swatch: 'linear-gradient(135deg, #F8FAFC, #1D4ED8)' },
  { value: 'escuro', label: 'Escuro', icon: Moon, swatch: 'linear-gradient(135deg, #0F172A, #93C5FD)' },
  { value: 'alto-contraste', label: 'Alto contraste', icon: Contrast, swatch: 'linear-gradient(135deg, #000000, #FFD600)' },
  { value: 'automatico', label: 'Automático', icon: MonitorSmartphone, swatch: 'linear-gradient(135deg, #F8FAFC 50%, #0F172A 50%)' },
]

export function SettingsPage() {
  usePageTitle('Ajustes')
  const { user, logout } = useAuth()
  const settings = useLiveQuery(() => db.settings.get('app-settings'), [])
  const { showToast } = useToast()
  // null = sem edição em andamento (mostra o valor salvo); string = o que está sendo digitado
  const [displayName, setDisplayName] = useState<string | null>(null)

  const taskCount = useLiveQuery(() => db.tasks.count(), [])
  const attachments = useLiveQuery(() => db.attachments.toArray(), [])
  const attachmentBytes = attachments?.reduce((sum, a) => sum + a.size, 0) ?? 0

  if (!settings) return <LoadingState />

  // Mesma fonte da saudação da Início: o "Nome exibido" que a pessoa edita aqui embaixo
  const name = settings.displayName || user?.name || ''
  const initials = name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-6 lg:px-8">
      <header className="flex items-center gap-4">
        <span
          aria-hidden="true"
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary text-lg font-bold text-primary-contrast"
        >
          {initials || 'FL'}
        </span>
        <div>
          <h1 className="font-display text-2xl font-semibold text-text">Ajustes</h1>
          <p className="text-sm text-text-muted">{name}</p>
        </div>
      </header>

      <Section title="Aparência">
        <fieldset className="grid grid-cols-2 gap-3">
          <legend className="sr-only">Escolha o tema</legend>
          {THEME_OPTIONS.map((opt) => {
            const Icon = opt.icon
            const active = settings.theme === opt.value
            return (
              <label
                key={opt.value}
                className={`relative flex cursor-pointer flex-col gap-2 rounded-card border-2 p-3 transition-colors duration-200 ease-out ${
                  active ? 'border-primary bg-column' : 'border-border hover:bg-column'
                }`}
              >
                <input
                  type="radio"
                  name="theme"
                  value={opt.value}
                  checked={active}
                  onChange={() => updateSettings({ theme: opt.value })}
                  className="sr-only"
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none h-9 w-full rounded-btn border border-border"
                  style={{ backgroundImage: opt.swatch }}
                />
                <span className="pointer-events-none flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-text">
                    <Icon size={15} aria-hidden="true" />
                    {opt.label}
                  </span>
                  {active && <Check size={16} className="text-primary" aria-hidden="true" />}
                </span>
              </label>
            )
          })}
        </fieldset>
      </Section>

      <Section title="Leitura">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="font-scale" className="text-sm font-semibold text-text">
            Tamanho da fonte: {Math.round(settings.fontScale * 100)}%
          </label>
          <input
            id="font-scale"
            type="range"
            min={1}
            max={1.5}
            step={0.1}
            value={settings.fontScale}
            onChange={(e) => updateSettings({ fontScale: Number(e.target.value) })}
            className="w-full accent-[var(--primary)]"
          />
          <p className="text-sm text-text-muted" style={{ fontSize: `${settings.fontScale}rem` }}>
            Assim fica o tamanho do texto.
          </p>
        </div>
        <Switch
          checked={settings.reduceMotion}
          onChange={(v) => updateSettings({ reduceMotion: v })}
          label="Reduzir animações"
          description="Diminui movimento e transições na interface"
        />
      </Section>

      <Section title="Quadro">
        <BoardSettings />
      </Section>

      <Section title="Dados">
        <p className="flex items-center gap-2 text-sm text-text-muted">
          <ShieldCheck size={16} className="shrink-0 text-success" aria-hidden="true" />
          Seus dados ficam só neste dispositivo.
        </p>

        <div className="grid grid-cols-3 gap-2">
          <StatChip icon={<ListTodo size={16} aria-hidden="true" />} value={String(taskCount ?? 0)} label="Tarefas" />
          <StatChip icon={<Paperclip size={16} aria-hidden="true" />} value={String(attachments?.length ?? 0)} label="Anexos" />
          <StatChip icon={<HardDrive size={16} aria-hidden="true" />} value={formatFileSize(attachmentBytes)} label="Ocupado" />
        </div>

        <DataManagement />
      </Section>

      <Section title="Conta">
        <div className="flex flex-col gap-3">
          <Input
            label="Nome exibido"
            hint="Aparece na saudação da Início e aqui no topo."
            value={displayName ?? settings.displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            onBlur={async () => {
              const next = displayName?.trim()
              setDisplayName(null)
              if (!next || next === settings.displayName) return
              await updateSettings({ displayName: next })
              showToast('Nome exibido atualizado')
            }}
          />
          <p className="text-sm text-text-muted">{user?.email}</p>
          <Button variant="secondary" icon={<LogOut size={16} aria-hidden="true" />} onClick={logout}>
            Sair
          </Button>
        </div>
      </Section>

      <footer className="flex flex-col items-center gap-1 py-4 text-center text-xs text-text-muted">
        <span className="flex items-center gap-1.5 font-medium text-text">
          <Sparkles size={14} aria-hidden="true" /> Fluxo
        </span>
        <span>Protótipo acadêmico de IHC · v1.0.0</span>
      </footer>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="rule-accent mb-3 font-display text-lg font-semibold text-text">{title}</h2>
      <Card className="flex flex-col gap-4 p-4">{children}</Card>
    </section>
  )
}

function StatChip({ icon, value, label }: { icon: ReactNode; value: string; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-btn bg-column px-2 py-3 text-center">
      <span className="text-primary">{icon}</span>
      <span className="text-base font-bold text-text">{value}</span>
      <span className="text-xs text-text-muted">{label}</span>
    </div>
  )
}
