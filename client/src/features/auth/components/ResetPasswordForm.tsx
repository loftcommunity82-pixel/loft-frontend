import { useState } from 'react'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { motion } from 'framer-motion'

interface ResetPasswordFormProps {
  onBackToLogin?: () => void
}

export function ResetPasswordForm({ onBackToLogin }: ResetPasswordFormProps) {
  const { requestPasswordReset, status, error, clearError } = useAuth()
  const [email, setEmail] = useState('')
  const [localError, setLocalError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLocalError('')
    setSuccessMessage('')
    clearError()
    if (!email) {
      setLocalError('Please enter your email address')
      return
    }
    const result = await requestPasswordReset(email)
    if (result.success) {
      setSuccessMessage('If an account exists, you will receive a password reset link')
      setEmail('')
    } else {
      setLocalError(result.error || 'Failed to send reset link')
    }
  }

  const displayError = localError || error || ''
  const isLoading = status === 'loading'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-md mx-auto"
    >
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-foreground">Reset Password</h2>
        <p className="text-muted-foreground text-sm mt-1">Enter your email to receive a reset link</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        {displayError && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md p-3">{displayError}</div>
        )}
        {successMessage && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm rounded-md p-3">{successMessage}</div>
        )}
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium text-foreground">Email Address</label>
          <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setLocalError(''); setSuccessMessage('') }} disabled={isLoading} autoComplete="email" required />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
        <div className="text-center pt-2">
          <p className="text-sm text-muted-foreground">
            Remember your password?{' '}
            <button type="button" onClick={onBackToLogin} className="text-emerald-500 hover:underline font-medium">Sign In</button>
          </p>
        </div>
      </form>
    </motion.div>
  )
}
