import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || session?.user?.email

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const unreadOnly = searchParams.get("unreadOnly") === "true"
  const limit = parseInt(searchParams.get("limit") || "50")

  const where: Record<string, unknown> = { userId: user.clerkId }
  if (unreadOnly) where.isRead = false

  const [notifications, unreadCount] = await Promise.all([
    db.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    db.notification.count({
      where: { userId: user.clerkId, isRead: false },
    }),
  ])

  return NextResponse.json({
    notifications,
    unreadCount,
    total: notifications.length,
  })
}

export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || session?.user?.email

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { notificationIds, markAllRead } = await request.json()

  if (markAllRead) {
    await db.notification.updateMany({
      where: { userId: user.clerkId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    })
    return NextResponse.json({ success: true })
  }

  if (notificationIds && Array.isArray(notificationIds)) {
    await db.notification.updateMany({
      where: { id: { in: notificationIds }, userId: user.clerkId },
      data: { isRead: true, readAt: new Date() },
    })
    return NextResponse.json({ success: true })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || session?.user?.email

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { userId, title, message, type, data, link } = await request.json()

  if (!userId || !title || !message || !type) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const notification = await db.notification.create({
    data: { userId, title, message, type, data, link },
  })

  return NextResponse.json({ success: true, notification })
}
