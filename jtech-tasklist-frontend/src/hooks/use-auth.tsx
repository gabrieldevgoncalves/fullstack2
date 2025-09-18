"use client"

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react"
import { useRouter } from "next/navigation"

// --------- Tipos ---------
export type SessionUser = {
  id: number
  username: string
  name: string
  loggedAt: string
}

type Credentials = {
  username: string
  password: string
}

type AuthContextType = {
  user: SessionUser | null
  // estados básicos
  loading: boolean
  error: string | null
  hydrated: boolean
  // aliases esperados pelo seu código
  isAuthenticated: boolean
  isLoading: boolean
  // ações
  login: (c: Credentials) => Promise<void>
  logout: () => void
}

// --------- Contexto ---------
const AuthContext = createContext<AuthContextType | null>(null)

// --------- Provider com mock livre ---------
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<SessionUser | null>(null)
  const [hydrated, setHydrated] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // hidrata a sessão do localStorage
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("auth:user") : null
      if (raw) {
        const parsed: SessionUser = JSON.parse(raw)
        setUser(parsed)
      }
    } catch {
      // ignore
    } finally {
      setHydrated(true)
    }
  }, [])

  const login = useCallback(async ({ username, password }: Credentials) => {
    setError(null)

    const u = username?.trim() ?? ""
    const p = password?.trim() ?? ""
    if (!u || !p) {
      setError("Preencha usuário e senha.")
      return
    }

    setLoading(true)
    await new Promise((r) => setTimeout(r, 350)) // simula atraso/UX

    // MOCK LIVRE: qualquer combinação não-vazia
    const session: SessionUser = {
      id: 1,
      username: u,
      name: u,
      loggedAt: new Date().toISOString(),
    }

    setUser(session)

    if (typeof window !== "undefined") {
      localStorage.setItem("auth:user", JSON.stringify(session))
      document.cookie = `auth=1; path=/; max-age=${60 * 60 * 24 * 7}` // 7 dias
    }

    setLoading(false)
    router.push("/dashboard")
  }, [router])

  const logout = useCallback(() => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth:user")
      document.cookie = "auth=; path=/; max-age=0"
      window.location.href = "/login"
    }
  }, [])

  // aliases compatíveis com seu código
  const isAuthenticated = !!user
  const isLoading = !hydrated || loading

  const value: AuthContextType = useMemo(
    () => ({
      user,
      loading,
      error,
      hydrated,
      isAuthenticated,
      isLoading,
      login,
      logout,
    }),
    [user, loading, error, hydrated, isAuthenticated, isLoading, login, logout]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// --------- Hook de consumo ---------
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>")
  return ctx
}

// --------- Guard pronto para uso (opcional) ---------
export function AuthGuard({
  children,
  redirectTo = "/login",
  fallback = null,
}: {
  children: React.ReactNode
  redirectTo?: string
  fallback?: React.ReactNode
}) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [isLoading, isAuthenticated, router, redirectTo])

  if (isLoading) return fallback
  if (!isAuthenticated) return null
  return <>{children}</>
}
