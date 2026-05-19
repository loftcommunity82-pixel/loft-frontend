import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
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

  const applications = await db.jobApplication.findMany({
    where: { userId: user.clerkId },
    include: {
      job: {
        include: {
          employer: { select: { companyName: true, companyLogo: true, city: true } },
        },
      },
    },
    orderBy: { appliedAt: "desc" },
  })

  return NextResponse.json(applications.map(app => ({
    id: app.id,
    jobId: app.jobId,
    status: app.status,
    coverLetter: app.coverLetter,
    appliedAt: app.appliedAt,
    reviewedAt: app.reviewedAt,
    interviewAt: app.interviewAt,
    job: {
      id: app.job.id,
      title: app.job.title,
      slug: app.job.slug,
      location: app.job.location,
      city: app.job.city,
      jobType: app.job.jobType,
      company: app.job.employer,
    },
  })))
}