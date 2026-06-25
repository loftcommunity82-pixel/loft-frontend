import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  let prefs = await db.notificationPreference.findUnique({ where: { userId: user.clerkId } })
  if (!prefs) {
    prefs = await db.notificationPreference.create({
      data: { userId: user.clerkId },
    })
  }

  return NextResponse.json(prefs)
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const body = await request.json()
  const prefs = await db.notificationPreference.upsert({
    where: { userId: user.clerkId },
    update: {
      applicationUpdates: body.applicationUpdates !== undefined ? body.applicationUpdates : undefined,
      newMessages: body.newMessages !== undefined ? body.newMessages : undefined,
      jobAlerts: body.jobAlerts !== undefined ? body.jobAlerts : undefined,
      marketing: body.marketing !== undefined ? body.marketing : undefined,
    },
    create: {
      userId: user.clerkId,
      applicationUpdates: body.applicationUpdates ?? true,
      newMessages: body.newMessages ?? true,
      jobAlerts: body.jobAlerts ?? true,
      marketing: body.marketing ?? false,
    },
  })

  return NextResponse.json(prefs)
}
