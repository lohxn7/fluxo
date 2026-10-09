import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { db } from '../../db/schema'
import { generateSalt, hashPassword, verifyPassword, setSession, getSession, clearSession } from '../../db/auth'
import { ensureDefaultColumns } from '../board/boardApi'
import type { User } from '../../db/types'

interface AuthContextValue {
  user: User | null
  loading: boolean
  login: (email: string, password: string, remember: boolean) => Promise<{ ok: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function restore() {
      const id = getSession()
      if (id) {
        const found = await db.users.get(id)
        if (found) setUser(found)
      }
      setLoading(false)
    }
    restore()
  }, [])

  async function login(email: string, password: string, remember: boolean) {
    const found = await db.users.where('email').equalsIgnoreCase(email.trim()).first()
    if (!found) return { ok: false, error: 'E-mail ou senha não conferem. Confira e tente de novo.' }
    const valid = await verifyPassword(password, found.salt, found.passwordHash)
    if (!valid) return { ok: false, error: 'E-mail ou senha não conferem. Confira e tente de novo.' }
    setUser(found)
    setSession(found.id, remember)
    return { ok: true }
  }

  async function signup(name: string, email: string, password: string) {
    const existing = await db.users.where('email').equalsIgnoreCase(email.trim()).first()
    if (existing) return { ok: false, error: 'Já existe uma conta com esse e-mail.' }
    const salt = generateSalt()
    const passwordHash = await hashPassword(password, salt)
    const id = crypto.randomUUID()
    const newUser: User = {
      id,
      email: email.trim(),
      name: name.trim(),
      passwordHash,
      salt,
      createdAt: new Date().toISOString(),
    }
    await db.users.add(newUser)
    await db.settings.put({ id: 'app-settings', displayName: newUser.name, theme: 'claro', fontScale: 1, reduceMotion: false })
    await ensureDefaultColumns()
    setUser(newUser)
    setSession(id, true)
    return { ok: true }
  }

  function logout() {
    clearSession()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout }}>{children}</AuthContext.Provider>
  )
}
