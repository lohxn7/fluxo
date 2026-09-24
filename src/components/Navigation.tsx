import { NavLink } from 'react-router-dom'
import { Home, KanbanSquare, Paperclip, Settings } from 'lucide-react'
import { LogoMark, Wordmark } from './Logo'

const ITEMS = [
  { to: '/', label: 'Início', icon: Home, end: true },
  { to: '/quadro', label: 'Quadro', icon: KanbanSquare, end: false },
  { to: '/arquivos', label: 'Arquivos', icon: Paperclip, end: false },
  { to: '/ajustes', label: 'Ajustes', icon: Settings, end: false },
]

// Lei de Hick-Hyman: só 4 destinos, decisão rápida
// Lei de Fitts: no celular a navegação fica embaixo, ao alcance do polegar
export function Navigation() {
  return (
    <>
      <nav
        aria-label="Navegação principal"
        className="fixed inset-x-0 bottom-0 z-40 flex border-t border-border bg-surface lg:hidden"
      >
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium ${
                isActive ? 'text-primary' : 'text-text-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                {isActive && <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" aria-hidden="true" />}
                <Icon size={22} aria-hidden="true" />
                {label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <nav
        aria-label="Navegação principal"
        className="fixed inset-y-0 left-0 z-40 hidden w-56 flex-col gap-1 border-r border-border bg-surface p-4 lg:flex"
      >
        <div className="mb-4 flex items-center gap-2 px-2">
          <LogoMark size={28} />
          <Wordmark className="text-xl text-text" />
        </div>
        {ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-btn px-3 py-2.5 text-base font-medium transition-colors duration-200 ease-out ${
                isActive ? 'bg-column text-primary' : 'text-text hover:bg-column'
              }`
            }
          >
            <Icon size={20} aria-hidden="true" />
            {label}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
