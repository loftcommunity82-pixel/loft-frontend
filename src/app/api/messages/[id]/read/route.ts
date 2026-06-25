import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const messageId = parseInt(params.id)
  if (isNaN(messageId)) {
    return NextResponse.json({ error: "Invalid message ID" }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const message = await db.message.findUnique({ where: { id: messageId } })
  if (!message) {
    return NextResponse.json({ error: "Message not found" }, { status: 404 })
  }

  if (message.receiverId !== user.clerkId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  await db.message.update({
    where: { id: messageId },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ success: true })
}
