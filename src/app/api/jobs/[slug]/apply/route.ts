import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendEmail, emailTemplates, shouldSendEmail } from "@/lib/email"

export const dynamic = "force-dynamic"

export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
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

  const rawId = params.slug
  const jobIdNum = parseInt(rawId)
  const isNumeric = !isNaN(jobIdNum)

  const job = await db.job.findFirst({
    where: isNumeric ? { id: jobIdNum } : { slug: rawId },
  })

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  const jobId = job.id

  // Check if already applied
  const existingApplication = await db.jobApplication.findFirst({
    where: {
      userId: user.clerkId,
      jobId,
    },
  })

  if (existingApplication) {
    return NextResponse.json(
      { error: "Already applied to this job" },
      { status: 400 }
    )
  }

  const body = await request.json()
  const { coverLetter, resumeUrl } = body

  const application = await db.jobApplication.create({
    data: {
      userId: user.clerkId,
      jobId,
      coverLetter,
      resumeUrl: resumeUrl || null,
      status: "PENDING",
    },
    include: {
      job: {
        include: {
          employer: { select: { companyName: true, companyLogo: true, contactEmail: true } },
        },
      },
      user: { select: { firstName: true, lastName: true, email: true } },
    },
  })

  // Update job application count
  await db.job.update({
    where: { id: jobId },
    data: { applicationsCount: { increment: 1 } },
  })

  // Create notification for employer
  await db.notification.create({
    data: {
      userId: job.employerId,
      title: "New Application",
      message: `New application for ${job.title}`,
      type: "APPLICATION_RECEIVED",
      data: { applicationId: application.id, jobId },
    },
  })

  // Send email notifications
  const applicantName = [application.user.firstName, application.user.lastName].filter(Boolean).join(" ") || "A candidate"
  const companyName = application.job.employer?.companyName || "the company"

  const emailPromises: Promise<any>[] = []

  const shouldNotify = await shouldSendEmail(user.clerkId, 'applicationUpdates')
  if (shouldNotify) {
    emailPromises.push(
      sendEmail(emailTemplates.applicationSubmitted(application.job.title, companyName, user.email))
    )
  }

  if (application.job.employer?.contactEmail) {
    emailPromises.push(
      sendEmail(emailTemplates.newApplicant(application.job.title, applicantName, application.job.employer.contactEmail))
    )
  }

  await Promise.allSettled(emailPromises)

  return NextResponse.json({
    success: true,
    application: {
      id: application.id,
      status: application.status,
      appliedAt: application.appliedAt,
      job: application.job,
    },
  })
}