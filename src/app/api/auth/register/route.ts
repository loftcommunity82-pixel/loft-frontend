import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"
import { db } from "@/lib/db"
import { rateLimit } from "@/lib/rate-limit"
import { registerUser, validatePassword, isPasswordStrongEnough } from "@/features/auth/services/authService"
import type { RegisterInput } from "@/features/auth/types"
import { createLogger } from '@/lib/logger'

export const dynamic = "force-dynamic"

const log = createLogger('auth:register')

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
  const { success } = await rateLimit(`register:${ip}`, 5, 60000)
  if (!success) {
    return NextResponse.json(
      { success: false, message: 'Too many requests. Try again later.' },
      { status: 429 }
    )
  }

  try {
    const body = await request.json()
    const { email, password, firstName, lastName, role: rawRole } = body
    const role = (rawRole || "JOB_SEEKER").toLowerCase()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      )
    }

    const passwordReq = validatePassword(password)
    if (!isPasswordStrongEnough(passwordReq)) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters with uppercase and number" },
        { status: 400 }
      )
    }

    const input: RegisterInput = {
      email,
      password,
      confirmPassword: password,
      firstName,
      lastName,
      role: role === "employer" ? "employer" : "job_seeker",
    }

    const result = await registerUser(input)
    if (!result.success) {
      return NextResponse.json(
        { success: false, message: result.message },
        { status: 400 }
      )
    }

    const verificationToken = crypto.randomBytes(32).toString("hex")
    await db.verificationToken.create({
      data: {
        identifier: email.toLowerCase(),
        token: verificationToken,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })

    if (result.user?.clerkId) {
      await db.notification.create({
        data: {
          userId: result.user.clerkId,
          title: "Welcome to Loft Community!",
          message: `Hi ${firstName}! Your account has been created successfully. Start exploring job opportunities and build your career with us.`,
          type: "MESSAGE",
          link: "/dashboard",
        },
      })
    }

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully. Please check your email to verify your account.",
        user: { id: result.user?.id, email: result.user?.email },
        verificationToken,
      },
      { status: 201 }
    )
  } catch (error) {
    log.error("Register error", error)
    const message = error instanceof Error ? error.message : "Internal server error"
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    )
  }
}
