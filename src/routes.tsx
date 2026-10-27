import type { ReactNode } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { LoadingState } from './components/LoadingState'
import { useAuth } from './features/auth/AuthContext'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { HomePage } from './features/home/HomePage'
import { BoardPage } from './features/board/BoardPage'
import { TaskDetailPage } from './features/task/TaskDetailPage'
import { FilesPage } from './features/files/FilesPage'
import { SettingsPage } from './features/settings/SettingsPage'

function ProtectedLayout({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState />
  if (!user) return <Navigate to="/entrar" replace />
  return <AppShell>{children}</AppShell>
}

function PublicOnly({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <LoadingState />
  if (user) return <Navigate to="/" replace />
  return children
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/entrar" element={<PublicOnly><LoginPage /></PublicOnly>} />
      <Route path="/criar-conta" element={<PublicOnly><SignupPage /></PublicOnly>} />
      <Route path="/" element={<ProtectedLayout><HomePage /></ProtectedLayout>} />
      <Route path="/quadro" element={<ProtectedLayout><BoardPage /></ProtectedLayout>} />
      <Route path="/tarefa/:id" element={<ProtectedLayout><TaskDetailPage /></ProtectedLayout>} />
      <Route path="/arquivos" element={<ProtectedLayout><FilesPage /></ProtectedLayout>} />
      <Route path="/ajustes" element={<ProtectedLayout><SettingsPage /></ProtectedLayout>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
