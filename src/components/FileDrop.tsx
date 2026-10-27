import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { UploadCloud } from 'lucide-react'
import { useMediaQuery } from '../hooks/useMediaQuery'

interface FileDropProps {
  onFiles: (files: FileList) => void
  accept: string
  invalid?: boolean
}

// Teoria da Ação — Execução: affordance clara (área de soltar + botão explícito) para o mesmo objetivo
export function FileDrop({ onFiles, accept, invalid }: FileDropProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  // "Toque" só faz sentido em tela de toque; com mouse o verbo é "clique"
  const isTouch = useMediaQuery('(pointer: coarse)')
  const text = `Arraste arquivos aqui ou ${isTouch ? 'toque' : 'clique'} para escolher`

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files)
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files?.length) onFiles(e.target.files)
    e.target.value = ''
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragOver(true)
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={text}
      className={`flex flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-8 text-center transition-colors duration-200 ease-out cursor-pointer ${
        dragOver ? 'border-primary bg-column' : invalid ? 'border-danger bg-column/60' : 'border-border bg-column/60'
      }`}
    >
      <UploadCloud size={28} className="text-primary" aria-hidden="true" />
      <p className="text-sm font-medium text-text">{text}</p>
      <p className="text-xs text-text-muted">PDF, imagens, DOCX, XLSX, PPTX ou TXT — até 10 MB cada</p>
      <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={handleChange} />
    </div>
  )
}
