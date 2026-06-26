import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import api from '@/lib/api'
import type { User, LoginInput, RegisterInput, AuthResponse } from '@/lib/types'

interface AuthContextType {
  user: User | null
  status: 'loading' | 'authenticated' | 'unauthenticated'
  isAuthenticated: boolean
  error: string | null
  login: (input: LoginInput) => Promise<{ success: boolean; error?: string }>
  register: (input: RegisterInput) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<{ success: boolean; error?: string; message?: string }>
  clearError: () => void
  hasRole: (role: 'employer' | 'job_seeker') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function toUser(raw: any): User | null {
  if (!raw) return null
  return {
    id: raw.id ?? raw.clerkId,
    clerkId: raw.clerkId ?? raw.id,
    email: raw.email || '',
    name: raw.name || null,
    firstName: raw.firstName || raw.name || null,
    lastName: raw.lastName || null,
    profileImage: raw.profileImage || raw.image || null,
    phone: raw.phone || null,
    isEmployer: raw.isEmployer != null ? raw.isEmployer : raw.employerProfile != null,
    isApplicant: raw.isApplicant ?? true,
    isVerified: raw.isVerified ?? false,
    needsOnboarding: raw.needsOnboarding ?? false,
  }
}

async function fetchProfile(email?: string): Promise<User | null> {
  if (!email) return null
  try {
    const res = await api.get(`/users/profile?email=${email}`)
    return toUser(res.data)
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    checkSession()
  }, [])

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [error])

  async function checkSession() {
    try {
      const res = await api.get('/auth/session')
      const sessionEmail = res.data?.user?.email
      if (sessionEmail) {
        const profile = await fetchProfile(sessionEmail)
        if (profile) {
          setUser(profile)
          setStatus('authenticated')
          return
        }
      }
      setStatus('unauthenticated')
    } catch {
      setStatus('unauthenticated')
    }
  }

  async function login(input: LoginInput) {
    try {
      const res = await api.post('/auth/login', input)
      const data = res.data as AuthResponse
      if (data.success && data.user?.email) {
        const profile = await fetchProfile(data.user.email)
        if (profile) {
          setUser(profile)
          setStatus('authenticated')
          return { success: true }
        }
      }
      if (data.success) {
        const session = await api.get('/auth/session')
        const sessionEmail = session.data?.user?.email
        if (sessionEmail) {
          const profile = await fetchProfile(sessionEmail)
          if (profile) {
            setUser(profile)
            setStatus('authenticated')
            return { success: true }
          }
        }
        return { success: false, error: 'Could not load profile' }
      }
      return { success: false, error: data.message || 'Login failed' }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.response?.data?.error || 'Login failed' }
    }
  }

  async function register(input: RegisterInput) {
    try {
      const res = await api.post('/auth/register', input)
      const data = res.data as AuthResponse
      if (data.success && data.user?.email) {
        const profile = await fetchProfile(data.user.email)
        if (profile) {
          setUser(profile)
          setStatus('authenticated')
          return { success: true }
        }
      }
      return { success: false, error: data.message || 'Registration failed' }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || err.response?.data?.error || 'Registration failed' }
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout')
    } catch { /* ignore */ }
    setUser(null)
    setStatus('unauthenticated')
  }

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      const res = await api.post('/auth/reset-password', { email })
      const data = res.data as { success: boolean; message?: string }
      if (data.success) {
        return { success: true, message: data.message }
      }
      return { success: false, error: data.message || 'Failed to send reset email' }
    } catch (err: any) {
      return { success: false, error: err.response?.data?.message || 'Failed to send reset email' }
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const hasRole = useCallback((role: 'employer' | 'job_seeker'): boolean => {
    if (!user) return false
    if (role === 'employer') return !!user.isEmployer
    return !!user.isApplicant
  }, [user])

  return (
    <AuthContext.Provider value={{
      user, status, isAuthenticated: !!user, error,
      login, register, logout,
      requestPasswordReset, clearError, hasRole,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
