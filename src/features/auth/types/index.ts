/**
 * Authentication Types
 * 
 * Defines all type definitions for the authentication feature.
 * Follows the docs/frontend-lifecycle.md pattern for type definitions.
 */

// User roles in the employment platform
export type UserRole = 'employer' | 'job_seeker'

// Authentication status
export type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error'

// Login input
export interface LoginInput {
  email: string
  password: string
  rememberMe?: boolean
}

// Register input with role selection
export interface RegisterInput {
  email: string
  password: string
  confirmPassword: string
  firstName: string
  lastName: string
  role: UserRole
  phone?: string
}

// Reset password input
export interface ResetPasswordInput {
  email: string
}

// Update password input (after reset)
export interface UpdatePasswordInput {
  token: string
  newPassword: string
  confirmPassword: string
}

// Authenticated user representation
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

// API response types
export interface AuthResponse {
  success: boolean
  message: string
  user?: AuthUser
  token?: string
}

export interface LogoutResponse {
  success: boolean
  message: string
}

// Session state
export interface AuthState {
  user: AuthUser | null
  status: AuthStatus
  error: string | null
}

// Password validation rules
export interface PasswordRequirements {
  minLength: boolean
  hasUppercase: boolean
  hasLowercase: boolean
  hasNumber: boolean
  hasSpecialChar: boolean
}

// Form validation errors
export interface ValidationErrors {
  email?: string
  password?: string
  confirmPassword?: string
  firstName?: string
  lastName?: string
  role?: string
  general?: string
}
