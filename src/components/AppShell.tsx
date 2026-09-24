import type { ReactNode } from 'react'
import { Navigation } from './Navigation'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-bg">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-btn focus:bg-primary focus:px-4 focus:py-2.5 focus:text-primary-contrast"
      >
        Pular para o conteúdo
      </a>
      <Navigation />
      <main id="conteudo" className="min-h-dvh pb-20 lg:ml-56 lg:pb-0">
        {children}
      </main>
    </div>
  )
}
