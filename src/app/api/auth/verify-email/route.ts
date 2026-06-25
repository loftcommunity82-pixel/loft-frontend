import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import crypto from "crypto"
import { sendEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ success: false, message: "Token is required" }, { status: 400 })
  }

  const vt = await db.verificationToken.findUnique({ where: { token } })
  if (!vt) {
    return NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 400 })
  }

  if (vt.expires < new Date()) {
    await db.verificationToken.delete({ where: { token } })
    return NextResponse.json({ success: false, message: "Token has expired" }, { status: 400 })
  }

  await db.user.update({
    where: { email: vt.identifier },
    data: { emailVerified: true },
  })

  await db.verificationToken.delete({ where: { token } })

  return NextResponse.json({ success: true, message: "Email verified successfully" })
}

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) {
    return NextResponse.json({ success: false, message: "Email is required" }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
  }

  if (user.emailVerified) {
    return NextResponse.json({ success: false, message: "Email already verified" }, { status: 400 })
  }

  // Delete old tokens
  await db.verificationToken.deleteMany({ where: { identifier: email } })

  const token = crypto.randomBytes(32).toString("hex")
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000)

  await db.verificationToken.create({
    data: { identifier: email, token, expires },
  })

  const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/auth/verify-email?token=${token}`

  try {
    await sendEmail({
      to: email,
      subject: "Verify your LoftCommunity email",
      html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email address.</p><p>This link expires in 24 hours.</p>`,
    })
  } catch {
    // Email sending failed, but token is still created
  }

  return NextResponse.json({ success: true, message: "Verification email sent" })
}
