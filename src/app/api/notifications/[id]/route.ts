import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const notificationId = parseInt(params.id)

  const notification = await db.notification.findUnique({
    where: { id: notificationId },
  })

  if (!notification) {
    return NextResponse.json({ error: "Notification not found" }, { status: 404 })
  }

  if (notification.userId !== user.clerkId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const { isRead } = await request.json()

  const updated = await db.notification.update({
    where: { id: notificationId },
    data: { isRead: isRead ?? true, readAt: isRead ? new Date() : null },
  })

  return NextResponse.json({ success: true, notification: updated })
}
