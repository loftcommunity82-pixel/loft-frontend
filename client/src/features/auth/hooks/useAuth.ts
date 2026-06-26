import { useAuth } from '@/providers/AuthProvider'
import { useNavigate } from 'react-router-dom'

export function useAuthActions() {
  const auth = useAuth()
  const navigate = useNavigate()

  const loginWithRedirect = async (input: import('@/lib/types').LoginInput) => {
    const result = await auth.login(input)
    if (result.success) {
      navigate('/dashboard')
    }
    return result
  }

  const registerWithRedirect = async (input: import('@/lib/types').RegisterInput) => {
    const result = await auth.register(input)
    if (result.success) {
      localStorage.setItem('pendingOnboarding', 'true')
      navigate('/onboarding')
    }
    return result
  }

  const logoutWithRedirect = async () => {
    await auth.logout()
    navigate('/')
  }

  return {
    ...auth,
    loginWithRedirect,
    registerWithRedirect,
    logoutWithRedirect,
  }
}
