/**
 * Reset Password API Route
 * 
 * POST /api/auth/reset-password
 */

import { NextRequest, NextResponse } from 'next/server'
import * as authService from '@/features/auth/services/authService'
import type { ResetPasswordInput } from '@/features/auth/types'
import { rateLimit } from '@/lib/rate-limit'
import { createLogger } from '@/lib/logger'

export const dynamic = "force-dynamic"

const log = createLogger('auth:reset-password')

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { success } = await rateLimit(`reset:${ip}`, 3, 60000)
  if (!success) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json() as ResetPasswordInput
    
    // Validate required fields
    if (!body.email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const response = await authService.requestPasswordReset(body)
    
    // Always return success to prevent email enumeration
    return NextResponse.json(
      { 
        success: true, 
        message: response.success 
          ? 'If an account exists, you will receive a password reset link'
          : 'Failed to process request'
      },
      { status: 200 }
    )
  } catch (error) {
    log.error('Reset password error', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
