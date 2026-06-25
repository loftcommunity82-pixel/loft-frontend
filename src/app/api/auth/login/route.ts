import { NextRequest, NextResponse } from 'next/server'
import * as authService from '@/features/auth/services/authService'
import type { LoginInput } from '@/features/auth/types'
import { rateLimit } from '@/lib/rate-limit'
import { createLogger } from '@/lib/logger'

export const dynamic = "force-dynamic"

const log = createLogger('auth:login')

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { success } = await rateLimit(`login:${ip}`, 5, 60000)
  if (!success) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Try again later.' },
      { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
    )
  }

  try {
    const body = await request.json() as LoginInput

    if (!body.email || !body.password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    const response = await authService.loginUser(body)
    if (response.success) {
      return NextResponse.json(response, { status: 200 })
    }
    return NextResponse.json(response, { status: 401 })
  } catch (error) {
    log.error('Login error', error)
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
