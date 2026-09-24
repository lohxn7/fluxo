import { db } from '../../db/schema'
import type { Settings } from '../../db/types'

const SETTINGS_ID = 'app-settings'

export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>) {
  await db.settings.update(SETTINGS_ID, patch)
}

export function resolveEffectiveTheme(theme: Settings['theme']): 'claro' | 'escuro' | 'alto-contraste' {
  if (theme !== 'automatico') return theme
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'escuro' : 'claro'
}
