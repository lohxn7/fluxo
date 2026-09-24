import { useEffect } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/schema'
import { resolveEffectiveTheme } from './settingsApi'

// Aplica tema, escala de fonte e redução de animação no documento inteiro
export function SettingsEffects() {
  const settings = useLiveQuery(() => db.settings.get('app-settings'))

  useEffect(() => {
    if (!settings) return
    const effective = resolveEffectiveTheme(settings.theme)
    document.documentElement.setAttribute('data-theme', effective)
    document.documentElement.style.setProperty('--font-scale', String(settings.fontScale))
    document.body.classList.toggle('reduce-motion', settings.reduceMotion)
  }, [settings])

  useEffect(() => {
    if (settings?.theme !== 'automatico') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const handler = () => {
      document.documentElement.setAttribute('data-theme', resolveEffectiveTheme('automatico'))
    }
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [settings?.theme])

  return null
}
