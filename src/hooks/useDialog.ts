import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), textarea, input, select, iframe, [tabindex]:not([tabindex="-1"])'

// Pilha de diálogos abertos: só o do topo reage a Esc/Tab. Sem isso, um diálogo aberto
// por cima de outro (confirmação dentro do detalhe, pré-visualização de anexo) fecharia
// os dois de uma vez com um único Esc.
const stack: symbol[] = []

// Acessibilidade: prende o foco, fecha com Esc e devolve o foco ao elemento de origem
export function useDialog(dialogRef: RefObject<HTMLElement | null>, onClose: () => void) {
  // Guarda a versão mais recente de onClose sem entrar nas dependências do efeito abaixo:
  // se o efeito reexecutasse a cada nova referência de onClose (comum, já que o chamador
  // costuma passar uma arrow function inline), o foco seria "roubado" de volta a cada
  // digitação que causasse um re-render do componente pai (ex.: campo de descrição).
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    const token = Symbol('dialog')
    stack.push(token)
    const trigger = document.activeElement as HTMLElement | null
    const dialog = dialogRef.current
    const autoFocusTarget = dialog?.querySelector<HTMLElement>('[data-autofocus]')
    const focusable = dialog?.querySelectorAll<HTMLElement>(FOCUSABLE)
    ;(autoFocusTarget ?? focusable?.[0])?.focus()

    function handleKeyDown(e: KeyboardEvent) {
      if (stack[stack.length - 1] !== token) return
      if (e.key === 'Escape') {
        e.preventDefault()
        onCloseRef.current()
        return
      }
      if (e.key === 'Tab' && dialog) {
        const items = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (items.length === 0) return
        const first = items[0]
        const last = items[items.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      stack.splice(stack.indexOf(token), 1)
      trigger?.focus()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- roda só na montagem/desmontagem; onClose é lido via ref
  }, [])
}

// Atalho de teclado global que não dispara enquanto a pessoa digita num campo
// nem enquanto há um diálogo aberto.
export function useShortcut(key: string, handler: () => void) {
  const handlerRef = useRef(handler)
  handlerRef.current = handler

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== key || e.ctrlKey || e.metaKey || e.altKey || stack.length > 0) return
      const target = e.target as HTMLElement
      if (target.closest('input, textarea, select, [contenteditable="true"]')) return
      e.preventDefault()
      handlerRef.current()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [key])
}
