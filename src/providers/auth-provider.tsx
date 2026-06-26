/**
 * Authentication Provider
 * 
 * Provides authentication context to the entire application.
 * Follows the docs/frontend-lifecycle.md pattern.
 */

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '../features/auth/hooks/useAuth'
import type { AuthUser } from '../features/auth/types'

// Context type
interface AuthContextType {
  user: AuthUser | null
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'
  error: string | null
  isAuthenticated: boolean
  login: (input: { email: string; password: string; rememberMe?: boolean }) => Promise<{ success: boolean; error?: string }>
  register: (input: {
    email: string
    password: string
    confirmPassword: string
    firstName: string
    lastName: string
    role: 'employer' | 'job_seeker'
    phone?: string
  }) => Promise<{ success: boolean; error?: string }>
  logout: () => Promise<{ success: boolean }>
  requestPasswordReset: (input: { email: string }) => Promise<{ success: boolean; message?: string; error?: string }>
  clearError: () => void
  hasRole: (role: 'employer' | 'job_seeker') => boolean
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuthContext() {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}
