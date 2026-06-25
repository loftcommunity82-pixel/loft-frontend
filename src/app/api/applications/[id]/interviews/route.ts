import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const applicationId = parseInt(params.id)
  if (isNaN(applicationId)) {
    return NextResponse.json({ error: "Invalid application ID" }, { status: 400 })
  }

  const application = await db.jobApplication.findUnique({
    where: { id: applicationId },
    include: { job: true },
  })

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
    include: { companyMemberships: { take: 1 } },
  })

  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const isOwner = application.job.employerId === user.clerkId
  const isCompanyMember = user.companyMemberships.length > 0
  if (!isOwner && !isCompanyMember) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const existingInterview = await db.interview.findUnique({
    where: { applicationId },
  })

  if (existingInterview) {
    return NextResponse.json({ error: "Interview already scheduled for this application" }, { status: 409 })
  }

  const body = await request.json()
  const { scheduledAt, duration, type, meetingLink, location } = body

  if (!scheduledAt || !type) {
    return NextResponse.json({ error: "scheduledAt and type are required" }, { status: 400 })
  }

  const interview = await db.interview.create({
    data: {
      applicationId,
      scheduledAt: new Date(scheduledAt),
      duration: duration || 60,
      type,
      meetingLink: meetingLink || null,
      location: location || null,
    },
  })

  await db.jobApplication.update({
    where: { id: applicationId },
    data: {
      status: 'INTERVIEW',
      interviewAt: new Date(scheduledAt),
    },
  })

  await db.notification.create({
    data: {
      userId: application.userId,
      title: 'Interview Scheduled',
      message: `Your interview has been scheduled for ${new Date(scheduledAt).toLocaleString()}`,
      type: 'INTERVIEW_SCHEDULED',
      link: `/applications/${applicationId}`,
    },
  })

  return NextResponse.json({
    success: true,
    interview,
    applicationStatus: 'INTERVIEW',
  })
}
