import { useEffect, useState } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { seedIfNeeded } from './db/seed'
import { AuthProvider } from './features/auth/AuthContext'
import { ToastProvider } from './components/ToastProvider'
import { SettingsEffects } from './features/settings/SettingsEffects'
import { AppRoutes } from './routes'

export function App() {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    seedIfNeeded().then(() => setReady(true))
  }, [])

  if (!ready) return null

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <SettingsEffects />
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
