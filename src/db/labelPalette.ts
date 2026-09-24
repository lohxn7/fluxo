// Paleta de etiquetas com contraste aprovado (texto sobre fundo >= 4.5:1)
export interface LabelSwatch {
  name: string
  bg: string
  text: string
}

export const LABEL_PALETTE: LabelSwatch[] = [
  { name: 'Azul', bg: '#DBEAFE', text: '#1D4ED8' },
  { name: 'Roxo', bg: '#EDE9FE', text: '#6D28D9' },
  { name: 'Verde', bg: '#DCFCE7', text: '#15803D' },
  { name: 'Âmbar', bg: '#FEF3C7', text: '#B45309' },
  { name: 'Rosa', bg: '#FCE7F3', text: '#BE185D' },
  { name: 'Ciano', bg: '#CFFAFE', text: '#0E7490' },
]

export function swatchForColor(color: string): LabelSwatch {
  return LABEL_PALETTE.find((s) => s.bg === color) ?? LABEL_PALETTE[0]
}
