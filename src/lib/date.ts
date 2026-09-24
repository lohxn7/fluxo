const WEEKDAYS = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
]

const MONTHS = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro',
]

export function toIsoDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function addDays(date: Date, days: number): Date {
  const copy = new Date(date)
  copy.setDate(copy.getDate() + days)
  return copy
}

export function formatFullDate(date: Date): string {
  const text = `${WEEKDAYS[date.getDay()]}, ${date.getDate()} de ${MONTHS[date.getMonth()]}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export function greetingForHour(hour: number): { text: string; emoji: string } {
  if (hour < 12) return { text: 'Bom dia', emoji: '☀️' }
  if (hour < 18) return { text: 'Boa tarde', emoji: '' }
  return { text: 'Boa noite', emoji: '🌙' }
}

export type DueStatus = 'sem-prazo' | 'atrasada' | 'hoje' | 'em-breve' | 'futura'

export function dueStatus(isoDate: string | null, referenceDate = new Date()): DueStatus {
  if (!isoDate) return 'sem-prazo'
  const today = toIsoDate(referenceDate)
  const diffDays = daysBetween(today, isoDate)
  if (diffDays < 0) return 'atrasada'
  if (diffDays === 0) return 'hoje'
  if (diffDays <= 2) return 'em-breve'
  return 'futura'
}

export function daysBetween(isoA: string, isoB: string): number {
  const a = new Date(isoA + 'T00:00:00')
  const b = new Date(isoB + 'T00:00:00')
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

export function dueLabel(isoDate: string | null, referenceDate = new Date()): string {
  if (!isoDate) return 'Sem prazo'
  const status = dueStatus(isoDate, referenceDate)
  const diff = daysBetween(toIsoDate(referenceDate), isoDate)
  if (status === 'atrasada') {
    const days = Math.abs(diff)
    return `Atrasada há ${days} dia${days > 1 ? 's' : ''}`
  }
  if (status === 'hoje') return 'Vence hoje'
  if (diff === 1) return 'Vence amanhã'
  return `Vence em ${diff} dias`
}

export function formatShortDate(isoDate: string): string {
  const d = new Date(isoDate + 'T00:00:00')
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`
}
