import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const interviewId = parseInt(params.id)
  if (isNaN(interviewId)) {
    return NextResponse.json({ error: "Invalid interview ID" }, { status: 400 })
  }

  const interview = await db.interview.findUnique({
    where: { id: interviewId },
    include: {
      application: {
        include: { job: true },
      },
    },
  })

  if (!interview) {
    return NextResponse.json({ error: "Interview not found" }, { status: 404 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
    include: { companyMemberships: { take: 1 } },
  })

  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const isOwner = interview.application.job.employerId === user.clerkId
  const isCompanyMember = user.companyMemberships.length > 0
  if (!isOwner && !isCompanyMember) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const body = await request.json()
  const { status, notes, feedback, rating, completed, scheduledAt, duration, type, meetingLink, location } = body

  const data: Record<string, any> = {}
  if (status !== undefined) data.status = status
  if (notes !== undefined) data.notes = notes
  if (feedback !== undefined) data.feedback = feedback
  if (rating !== undefined) data.rating = rating
  if (completed !== undefined) data.completed = completed
  if (scheduledAt !== undefined) data.scheduledAt = new Date(scheduledAt)
  if (duration !== undefined) data.duration = duration
  if (type !== undefined) data.type = type
  if (meetingLink !== undefined) data.meetingLink = meetingLink
  if (location !== undefined) data.location = location

  const updated = await db.interview.update({
    where: { id: interviewId },
    data,
  })

  return NextResponse.json({
    success: true,
    interview: updated,
  })
}
