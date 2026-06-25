import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail, emailTemplates, shouldSendEmail } from "@/lib/email"

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

  const applicationId = parseInt(params.id)
  const { status, notes } = await request.json()

  const validStatuses = ["PENDING", "REVIEWING", "SHORTLISTED", "INTERVIEW", "OFFERED", "HIRED", "REJECTED"]
  
  if (!validStatuses.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  // Get application with job info
  const application = await db.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      user: true,
      job: {
        include: {
          employer: { select: { companyName: true, contactEmail: true } },
        },
      },
    },
  })

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  // Verify employer owns the job
  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (application.job.employerId !== user?.clerkId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const updatedApplication = await db.jobApplication.update({
    where: { id: applicationId },
    data: { 
      status,
      ...(notes ? { employerNotes: notes } : {}),
      reviewedAt: status === "REVIEWING" || status === "SHORTLISTED" ? new Date() : application.reviewedAt,
      interviewAt: status === "INTERVIEW" ? new Date() : application.interviewAt,
      acceptedAt: status === "HIRED" ? new Date() : application.acceptedAt,
      rejectedAt: status === "REJECTED" ? new Date() : application.rejectedAt,
    },
  })

  // Create notification for job seeker
  const notificationType = status === "REJECTED" ? "APPLICATION_REJECTED" : "APPLICATION_SHORTLISTED"
  
  await db.notification.create({
    data: {
      userId: application.userId,
      title: "Application Status Update",
      message: `Your application for ${application.job.title} is now ${status.toLowerCase()}`,
      type: notificationType,
      link: `/dashboard/applications/${application.id}`,
    },
  })

  // Send email notification
  const companyName = application.job.employer?.companyName || "the company"
  const shouldNotify = await shouldSendEmail(application.userId, 'applicationUpdates')
  if (shouldNotify) {
    await sendEmail(emailTemplates.statusUpdate(application.job.title, companyName, status.toLowerCase(), application.user.email))
  }

  return NextResponse.json({
    success: true,
    application: {
      id: updatedApplication.id,
      status: updatedApplication.status,
      reviewedAt: updatedApplication.reviewedAt,
      interviewAt: updatedApplication.interviewAt,
    },
  })
}