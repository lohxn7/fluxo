import { swatchForColor } from '../db/labelPalette'

interface TagProps {
  name: string
  color: string
}

// Gestalt — Similaridade: mesma disciplina sempre usa a mesma cor de etiqueta.
// Ponto + rótulo em versalete reforça a categoria com dois canais, não só a cor de fundo.
export function Tag({ name, color }: TagProps) {
  const swatch = swatchForColor(color)
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-chip px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide"
      style={{ backgroundColor: swatch.bg, color: swatch.text }}
    >
      <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: swatch.text }} />
      {name}
    </span>
  )
}
