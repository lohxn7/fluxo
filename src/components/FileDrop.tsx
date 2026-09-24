import { useRef, useState, type ChangeEvent, type DragEvent } from 'react'
import { UploadCloud } from 'lucide-react'

interface FileDropProps {
  onFiles: (files: FileList) => void
  accept: string
}

// Teoria da Ação — Execução: affordance clara (área de soltar + botão explícito) para o mesmo objetivo
export function FileDrop({ onFiles, accept }: FileDropProps) {
  const [dragOver, setDragOver] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

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
      aria-label="Arraste arquivos aqui ou toque para escolher"
      className={`flex flex-col items-center gap-2 rounded-card border-2 border-dashed px-4 py-8 text-center transition-colors duration-200 ease-out cursor-pointer ${
        dragOver ? 'border-primary bg-column' : 'border-border bg-column/60'
      }`}
    >
      <UploadCloud size={28} className="text-primary" aria-hidden="true" />
      <p className="text-sm font-medium text-text">Arraste arquivos aqui ou toque para escolher</p>
      <p className="text-xs text-text-muted">PDF, imagens, DOCX, XLSX, PPTX ou TXT — até 10 MB cada</p>
      <input ref={inputRef} type="file" multiple accept={accept} className="hidden" onChange={handleChange} />
    </div>
  )
}
