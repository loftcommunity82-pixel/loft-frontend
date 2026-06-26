export type UserRole = 'employer' | 'job_seeker'
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

export interface LoginInput {
  email: string
  password: string
  rememberMe?: boolean
}

export interface RegisterInput {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
}

export interface ResetPasswordInput {
  email: string
}

export interface AuthUser {
  id: string
  clerkId?: string
  email: string
  firstName?: string
  lastName?: string
  name?: string
  profileImage?: string
  role: UserRole
  isVerified: boolean
  tier: string
  credits: string
  createdAt: Date
}

export interface AuthResponse {
  success: boolean
  message: string
  user?: AuthUser
  token?: string
}

export interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
}

export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

export interface ValidationErrors {
  email?: string
  password?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  role?: string
  general?: string
}
