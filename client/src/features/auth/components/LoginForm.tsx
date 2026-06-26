import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'

interface LoginFormProps {
  onSwitchToRegister?: () => void
  onSwitchToResetPassword?: () => void
}

export function LoginForm({ onSwitchToRegister, onSwitchToResetPassword }: LoginFormProps) {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email || !password) {
      setError('Please fill in all fields')
      return
    }
    setLoading(true)
    const result = await login({ email, password, rememberMe })
    setLoading(false)
    if (result.success) {
      navigate('/dashboard')
    } else {
      setError(result.error || 'Login failed')
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Welcome Back</h2>
        <p className="text-muted-foreground text-sm mt-1">Sign in to your account</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3">{error}</div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} disabled={loading} autoComplete="email" required />
        </div>
        <div className="space-y-2">
          <label htmlFor="password" className="text-sm font-medium text-foreground">Password</label>
          <Input id="password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} disabled={loading} autoComplete="current-password" required />
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-border bg-transparent accent-emerald-400" />
            Remember me for 30 days
          </label>
          <button type="button" onClick={onSwitchToResetPassword} className="text-sm text-primary hover:underline">Forgot password?</button>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          {loading ? 'Signing in...' : 'Sign In'}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Do not have an account?{' '}
          <button type="button" onClick={onSwitchToRegister} className="text-emerald-500 hover:underline font-medium">Create Account</button>
        </p>
      </div>
    </motion.div>
  )
}
