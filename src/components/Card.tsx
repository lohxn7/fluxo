import type { HTMLAttributes } from 'react'

// Gestalt — Região comum: superfície própria separa o cartão do fundo
export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-card border border-border bg-surface shadow-soft ${className}`}
      {...rest}
    />
  )
}
