import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")
  const jobIdParam = searchParams.get("jobId")
  const statusParam = searchParams.get("status")

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

  const where: Record<string, unknown> = {}

  if (statusParam) {
    where.status = statusParam
  }

  if (jobIdParam) {
    where.jobId = parseInt(jobIdParam)
    const job = await db.job.findUnique({ where: { id: parseInt(jobIdParam) } })
    if (job) {
      where.jobId = job.id
    }
  } else if (user.isEmployer) {
    where.job = { employerId: user.clerkId }
  } else {
    where.userId = user.clerkId
  }

  const applications = await db.jobApplication.findMany({
    where,
    include: {
      job: {
        include: {
          employer: { select: { companyName: true, companyLogo: true, city: true } },
        },
      },
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, profileImage: true },
      },
    },
    orderBy: { appliedAt: "desc" },
  })

  return NextResponse.json(applications.map(app => ({
    id: app.id,
    jobId: app.jobId,
    userId: app.userId,
    status: app.status,
    coverLetter: app.coverLetter,
    appliedAt: app.appliedAt,
    reviewedAt: app.reviewedAt,
    interviewAt: app.interviewAt,
    englishTestScore: app.englishTestScore,
    englishTestRequired: app.englishTestRequired,
    employerNotes: app.employerNotes,
    isShortlisted: app.isShortlisted,
    job: {
      id: app.job.id,
      title: app.job.title,
      slug: app.job.slug,
      location: app.job.location,
      city: app.job.city,
      jobType: app.job.jobType,
      company: app.job.employer,
    },
    candidate: {
      id: app.user.id,
      firstName: app.user.firstName,
      lastName: app.user.lastName,
      email: app.user.email,
      profileImage: app.user.profileImage,
    },
  })))
}