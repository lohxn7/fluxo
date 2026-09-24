// Marca: três barras em gradiente azul → terracota, lembrando o fluxo de uma
// tarefa percorrendo as colunas do quadro até a conclusão.
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="fluxo-mark" x1="4" y1="26" x2="28" y2="6" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1D4ED8" />
          <stop offset="1" stopColor="#C2410C" />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx="9" fill="url(#fluxo-mark)" />
      <rect x="7" y="16" width="4" height="9" rx="2" fill="white" fillOpacity="0.95" />
      <rect x="14" y="11" width="4" height="14" rx="2" fill="white" fillOpacity="0.95" />
      <rect x="21" y="6" width="4" height="19" rx="2" fill="white" />
    </svg>
  )
}

export function Wordmark({ className = '' }: { className?: string }) {
  return <span className={`font-display font-semibold tracking-tight ${className}`}>Fluxo</span>
}
