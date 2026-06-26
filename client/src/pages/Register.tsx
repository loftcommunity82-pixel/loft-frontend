import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui/logo'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff, Loader2, Briefcase, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import PageShell from '@/components/layout/PageShell'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { useAuth } from '@/providers/AuthProvider'
import { toast } from 'sonner'

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['job_seeker', 'employer']),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type RegisterForm = z.infer<typeof registerSchema>

export default function Register() {
  const navigate = useNavigate()
  const reduced = useReducedMotion()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedRole, setSelectedRole] = useState<'job_seeker' | 'employer'>('job_seeker')
  const { register: registerUser } = useAuth()

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'job_seeker' },
  })

  async function onSubmit(data: RegisterForm) {
    setIsLoading(true)
    const result = await registerUser({
      email: data.email,
      password: data.password,
      confirmPassword: data.confirmPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
    })
    setIsLoading(false)
    if (result.success) {
      navigate('/onboarding')
    } else {
      toast.error(result.error || 'Registration failed')
    }
  }

  return (
    <PageShell showFooter={false}>
      <div className="min-h-screen flex items-center justify-center px-4 py-20">
        <motion.div
          initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass rounded-2xl p-6 sm:p-8">
            <div className="text-center mb-8">
              <Logo width={56} height={56} className="mx-auto mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Create Account</h1>
              <p className="text-sm text-neutral-400 mt-2">Join LoftCommunity today</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <Button variant="outline" className="flex-1 gap-2 h-12 border-white/10">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/><path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Google
              </Button>
              <Button variant="outline" className="flex-1 gap-2 h-12 border-white/10">
                <svg className="h-5 w-5" viewBox="0 0 24 24"><path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                LinkedIn
              </Button>
            </div>

            <div className="relative mb-6">
              <Separator />
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-neutral-950 px-3 text-xs text-neutral-500">
                or sign up with email
              </span>
            </div>

            <div className="mb-6">
              <Label className="text-sm text-neutral-300 mb-3 block">I want to</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => { setSelectedRole('job_seeker'); setValue('role', 'job_seeker') }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                    selectedRole === 'job_seeker'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20'
                  )}
                >
                  <User className="h-6 w-6" />
                  <span className="text-sm font-medium">Find a Job</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setSelectedRole('employer'); setValue('role', 'employer') }}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200',
                    selectedRole === 'employer'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                      : 'border-white/10 bg-white/5 text-neutral-400 hover:border-white/20'
                  )}
                >
                  <Briefcase className="h-6 w-6" />
                  <span className="text-sm font-medium">Hire Talent</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-sm text-neutral-300">First Name</Label>
                  <Input id="firstName" placeholder="John" {...register('firstName')} className={errors.firstName ? 'ring-2 ring-red-500' : ''} />
                  {errors.firstName && <p className="text-xs text-red-400">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-sm text-neutral-300">Last Name</Label>
                  <Input id="lastName" placeholder="Doe" {...register('lastName')} className={errors.lastName ? 'ring-2 ring-red-500' : ''} />
                  {errors.lastName && <p className="text-xs text-red-400">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-email" className="text-sm text-neutral-300">Email</Label>
                <Input id="reg-email" type="email" placeholder="name@example.com" {...register('email')} className={errors.email ? 'ring-2 ring-red-500' : ''} />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reg-password" className="text-sm text-neutral-300">Password</Label>
                <div className="relative">
                  <Input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    {...register('password')}
                    className={`pr-10 ${errors.password ? 'ring-2 ring-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm text-neutral-300">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repeat your password"
                  {...register('confirmPassword')}
                  className={errors.confirmPassword ? 'ring-2 ring-red-500' : ''}
                />
                {errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  required
                  className="mt-1 w-4 h-4 rounded border-white/10 bg-white/5 text-emerald-600 focus:ring-emerald-400"
                />
                <Label htmlFor="terms" className="text-xs sm:text-sm text-neutral-400 cursor-pointer">
                  I agree to the{' '}
                  <Link to="/terms" className="text-emerald-400 hover:text-emerald-300">Terms of Service</Link>
                  {' '}and{' '}
                  <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300">Privacy Policy</Link>
                </Label>
              </div>

              <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Creating account...
                  </>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>

            <p className="text-center text-sm text-neutral-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </motion.div>
      </div>
    </PageShell>
  )
}
