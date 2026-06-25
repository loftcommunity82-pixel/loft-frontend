import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
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

  const application = await db.jobApplication.findUnique({
    where: { id: applicationId },
    include: {
      job: {
        include: {
          employer: { select: { companyName: true, companyLogo: true, city: true, industry: true } },
          requiredSkillsRelation: { include: { skill: true } },
        },
      },
      user: {
        select: { id: true, clerkId: true, firstName: true, lastName: true, email: true, profileImage: true, name: true },
      },
      interview: true,
    },
  })

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  return NextResponse.json({
    id: application.id,
    jobId: application.jobId,
    userId: application.userId,
    status: application.status,
    coverLetter: application.coverLetter,
    resumeUrl: application.resumeUrl,
    appliedAt: application.appliedAt,
    reviewedAt: application.reviewedAt,
    interviewAt: application.interviewAt,
    rejectedAt: application.rejectedAt,
    acceptedAt: application.acceptedAt,
    employerNotes: application.employerNotes,
    englishTestRequired: application.englishTestRequired,
    englishTestScore: application.englishTestScore,
    passedScreening: application.passedScreening,
    job: {
      id: application.job.id,
      title: application.job.title,
      slug: application.job.slug,
      location: application.job.location,
      city: application.job.city,
      jobType: application.job.jobType,
      experienceLevel: application.job.experienceLevel,
      workMode: application.job.workMode,
      salaryMin: application.job.salaryMin,
      salaryMax: application.job.salaryMax,
      salaryCurrency: application.job.salaryCurrency,
      skills: application.job.requiredSkillsRelation.map(rs => rs.skill.name),
      company: application.job.employer,
    },
    candidate: application.user,
    interview: application.interview,
  })
}
