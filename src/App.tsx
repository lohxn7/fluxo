import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './features/auth/AuthContext'
import { ToastProvider } from './components/ToastProvider'
import { SettingsEffects } from './features/settings/SettingsEffects'
import { AppRoutes } from './routes'

export function App() {
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
