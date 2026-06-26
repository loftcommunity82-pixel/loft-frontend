'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type {
  AuthUser,
  AuthState,
  LoginInput,
  RegisterInput,
  ResetPasswordInput,
  AuthStatus,
} from '../types'

const AUTH_STORAGE_KEY = 'Loft Community_auth'
const AUTH_TOKEN_KEY = 'Loft Community_token'

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
}

export function useAuth() {
  const [state, setState] = useState<AuthState>(initialState)
  const router = useRouter()

  useEffect(() => {
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY)
    if (storedAuth) {
      try {
        const user = JSON.parse(storedAuth) as AuthUser
        setState({ user, status: 'unauthenticated', error: null })
      } catch {
        setState({ user: null, status: 'unauthenticated', error: null })
      }
    }

    fetch('/api/auth/me', { method: 'GET' })
      .then(res => {
        if (res.ok) return res.json()
        throw new Error('Not authenticated')
      })
      .then(data => {
        const user = data.user || data
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user))
        localStorage.setItem(AUTH_TOKEN_KEY, `session_${user.id}`)
        setState({ user, status: 'authenticated', error: null })
      })
      .catch(() => {
        if (!storedAuth) {
          setState({ user: null, status: 'unauthenticated', error: null })
        }
      })
  }, [])

  useEffect(() => {
    if (state.error) {
      const timer = setTimeout(() => {
        setState(prev => ({ ...prev, error: null }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [state.error])

  const login = useCallback(async (input: LoginInput) => {
    setState(prev => ({ ...prev, status: 'loading', error: null }))

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user))
        localStorage.setItem(AUTH_TOKEN_KEY, `session_${data.user.id}`)
        setState({
          user: data.user,
          status: 'authenticated',
          error: null,
        })
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          status: 'unauthenticated',
          error: data.message || 'Login failed',
        }))
        return { success: false, error: data.message || 'Login failed' }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during login'
      setState(prev => ({
        ...prev,
        status: 'unauthenticated',
        error: message,
      }))
      return { success: false, error: message }
    }
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    setState(prev => ({ ...prev, status: 'loading', error: null }))

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const data = await response.json()

      if (response.ok && data.user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user))
        localStorage.setItem(AUTH_TOKEN_KEY, `session_${data.user.id}`)
        setState({
          user: data.user,
          status: 'authenticated',
          error: null,
        })
        return { success: true }
      } else {
        setState(prev => ({
          ...prev,
          status: 'unauthenticated',
          error: data.message || 'Registration failed',
        }))
        return { success: false, error: data.message || 'Registration failed' }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred during registration'
      setState(prev => ({
        ...prev,
        status: 'unauthenticated',
        error: message,
      }))
      return { success: false, error: message }
    }
  }, [])

  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, status: 'loading', error: null }))

    localStorage.removeItem(AUTH_STORAGE_KEY)
    localStorage.removeItem(AUTH_TOKEN_KEY)

    setState({ user: null, status: 'unauthenticated', error: null })

    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {}

    router.push('/')
    return { success: true }
  }, [router])

  const requestPasswordReset = useCallback(async (input: ResetPasswordInput) => {
    setState(prev => ({ ...prev, status: 'loading', error: null }))

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      })

      const data = await res.json()

      if (data.success) {
        setState(prev => ({ ...prev, status: 'unauthenticated', error: null }))
        return { success: true, message: data.message }
      } else {
        setState(prev => ({ ...prev, error: data.message }))
        return { success: false, error: data.message }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred'
      setState(prev => ({ ...prev, error: message }))
      return { success: false, error: message }
    }
  }, [])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const hasRole = useCallback((role: 'employer' | 'job_seeker'): boolean => {
    return state.user?.role === role
  }, [state.user])

  const isAuthenticated = state.status === 'authenticated' && state.user !== null

  return {
    user: state.user,
    status: state.status,
    error: state.error,
    isAuthenticated,
    login,
    register,
    logout,
    requestPasswordReset,
    clearError,
    hasRole,
  }
}
