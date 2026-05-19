import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

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

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const jobId = parseInt(params.id)

  // Check if job exists
  const job = await db.job.findUnique({
    where: { id: jobId },
  })

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

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
  const { coverLetter } = body

  const application = await db.jobApplication.create({
    data: {
      userId: user.clerkId,
      jobId,
      coverLetter,
      status: "PENDING",
    },
    include: {
      job: {
        include: {
          employer: { select: { companyName: true, companyLogo: true } },
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