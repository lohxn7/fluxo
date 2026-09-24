import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { AlarmClock, CalendarClock, CheckCircle2, Plus } from 'lucide-react'
import { db } from '../../db/schema'
import { Card } from '../../components/Card'
import { ProgressBar } from '../../components/ProgressBar'
import { EmptyState } from '../../components/EmptyState'
import { DueBadge } from '../../components/DueBadge'
import { Tag } from '../../components/Tag'
import { greetingForHour, formatFullDate, toIsoDate, daysBetween } from '../../lib/date'
import { usePageTitle } from '../../hooks/usePageTitle'
import { useAuth } from '../auth/AuthContext'
import { useState } from 'react'
import { NewTaskModal } from '../task/NewTaskModal'

export function HomePage() {
  usePageTitle('Início')
  const navigate = useNavigate()
  const { user } = useAuth()
  const [showNewTask, setShowNewTask] = useState(false)

  const tasks = useLiveQuery(() => db.tasks.toArray(), [])
  const columns = useLiveQuery(() => db.columns.orderBy('order').toArray(), [])

  const now = new Date()
  const today = toIsoDate(now)
  const greeting = greetingForHour(now.getHours())
  const firstName = (user?.name ?? 'Larissa').split(' ')[0]

  const stats = useMemo(() => {
    if (!tasks) return { dueToday: 0, overdue: 0, completedWeek: 0 }
    let dueToday = 0
    let overdue = 0
    let completedWeek = 0
    for (const t of tasks) {
      if (t.dueDate && !t.completedAt) {
        const diff = daysBetween(today, t.dueDate)
        if (diff === 0) dueToday++
        if (diff < 0) overdue++
      }
      if (t.completedAt) {
        const diff = Math.abs(daysBetween(toIsoDate(new Date(t.completedAt)), today))
        if (diff <= 7) completedWeek++
      }
    }
    return { dueToday, overdue, completedWeek }
  }, [tasks, today])

  const weekTotal = useMemo(() => {
    if (!tasks) return { done: 0, total: 0 }
    const done = tasks.filter((t) => t.completedAt).length
    return { done, total: tasks.length }
  }, [tasks])

  const upcoming = useMemo(() => {
    if (!tasks) return []
    return tasks
      .filter((t) => t.dueDate && !t.completedAt)
      .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
      .slice(0, 5)
  }, [tasks])

  if (!tasks || !columns) return null

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 py-6 lg:px-8">
      <header>
        <h1 className="font-display text-3xl font-semibold text-text">
          {greeting.text}, {firstName} {greeting.emoji}
        </h1>
        <p className="text-base text-text-muted">{formatFullDate(now)}</p>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-warning-bg text-warning">
            <CalendarClock size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-text">{stats.dueToday}</p>
            <p className="text-sm text-text-muted">Vencem hoje</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-danger-bg text-danger">
            <AlarmClock size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-text">{stats.overdue}</p>
            <p className="text-sm text-text-muted">Atrasadas</p>
          </div>
        </Card>
        <Card className="flex items-center gap-3 p-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-success-bg text-success">
            <CheckCircle2 size={22} aria-hidden="true" />
          </span>
          <div>
            <p className="text-2xl font-bold text-text">{stats.completedWeek}</p>
            <p className="text-sm text-text-muted">Concluídas na semana</p>
          </div>
        </Card>
      </div>

      <Card className="p-4">
        <ProgressBar
          value={weekTotal.done}
          max={weekTotal.total}
          label={`${weekTotal.done} de ${weekTotal.total} tarefas concluídas`}
          colorClass="bg-success"
        />
      </Card>

      <section>
        <h2 className="rule-accent mb-3 font-display text-xl font-semibold text-text">Próximos prazos</h2>
        {upcoming.length === 0 ? (
          <EmptyState
            icon={<CheckCircle2 size={28} />}
            title="Tudo em dia por aqui!"
            description="Aproveita pra descansar um pouco."
          />
        ) : (
          <ul className="flex flex-col gap-2">
            {upcoming.map((t) => (
              <li key={t.id}>
                <button
                  onClick={() => navigate(`/tarefa/${t.id}`)}
                  className="tap-inline flex w-full items-center justify-between gap-3 rounded-card border border-border bg-surface p-3.5 text-left shadow-soft hover:bg-column"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-base font-semibold text-text">{t.title}</p>
                    <TaskLabel labelId={t.labelId} />
                  </div>
                  <DueBadge dueDate={t.dueDate} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {tasks.length === 0 && (
        <EmptyState
          icon={<Plus size={28} />}
          title="Seu quadro está livre por enquanto"
          description="Que tal criar a primeira tarefa?"
        />
      )}

      <button
        onClick={() => setShowNewTask(true)}
        aria-label="Nova tarefa"
        className="fixed bottom-24 right-5 z-30 flex h-14 items-center gap-2 rounded-full bg-cta px-4 text-cta-contrast shadow-soft transition-transform duration-200 ease-out hover:scale-105 lg:bottom-8 lg:right-8"
      >
        <Plus size={24} aria-hidden="true" />
        <span className="hidden pr-1 text-base font-semibold lg:inline">Nova tarefa</span>
      </button>

      {showNewTask && columns[0] && (
        <NewTaskModal
          defaultColumnId={columns[0].id}
          onClose={() => setShowNewTask(false)}
          onCreated={(id) => {
            setShowNewTask(false)
            navigate(`/tarefa/${id}`)
          }}
        />
      )}
    </div>
  )
}

function TaskLabel({ labelId }: { labelId: string | null }) {
  const label = useLiveQuery(() => (labelId ? db.labels.get(labelId) : undefined), [labelId])
  if (!label) return null
  return (
    <div className="mt-1">
      <Tag name={label.name} color={label.color} />
    </div>
  )
}
