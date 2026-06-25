import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail, emailTemplates, shouldSendEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

// GET /api/messages - Get conversations
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")
  const jobId = searchParams.get("jobId")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const whereClause: any = {
    OR: [
      { senderId: user.clerkId },
      { receiverId: user.clerkId },
    ],
  }

  if (jobId) {
    whereClause.jobId = parseInt(jobId)
  }

  const messages = await db.message.findMany({
    where: whereClause,
    orderBy: { createdAt: "asc" },
    include: {
      sender: { select: { id: true, name: true, firstName: true, lastName: true, profileImage: true } },
      receiver: { select: { id: true, name: true, firstName: true, lastName: true, profileImage: true } },
    },
  })

  return NextResponse.json(messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    jobId: msg.jobId,
    readAt: msg.readAt,
    createdAt: msg.createdAt,
    isOwn: msg.senderId === user.clerkId,
    sender: msg.sender,
    receiver: msg.receiver,
  })))
}

// POST /api/messages - Send message
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { receiverId, content, jobId } = await request.json()

  if (!receiverId || !content) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  // Verify candidate is at INTERVIEW stage if jobId provided
  if (jobId) {
    const application = await db.jobApplication.findFirst({
      where: {
        jobId: parseInt(jobId),
        userId: receiverId,
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 })
    }

    if (application.status !== "INTERVIEW" && application.status !== "OFFERED") {
      return NextResponse.json(
        { error: "Messaging only available when candidate is at Interview stage" },
        { status: 403 }
      )
    }
  }

  const message = await db.message.create({
    data: {
      senderId: user.clerkId,
      receiverId,
      content,
      jobId: jobId ? parseInt(jobId) : null,
    },
  })

  const senderName = user.firstName || user.name || "Employer"

  // Create notification
  await db.notification.create({
    data: {
      userId: receiverId,
      title: "New Message",
      message: `You have a new message from ${senderName}`,
      type: "MESSAGE",
      link: `/dashboard/messages`,
    },
  })

  // Send email notification
  const receiver = await db.user.findUnique({ where: { clerkId: receiverId } })
  if (receiver?.email) {
    const shouldNotify = await shouldSendEmail(receiverId, 'newMessages')
    if (shouldNotify) {
      await sendEmail(emailTemplates.newMessage(senderName, receiver.email))
    }
  }

  return NextResponse.json({
    success: true,
    message: {
      id: message.id,
      content: message.content,
      createdAt: message.createdAt,
    },
  })
}