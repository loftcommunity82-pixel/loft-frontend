import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const session = await getServerSession(authOptions)
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || session?.user?.email

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const jobId = parseInt(params.slug)

  const job = await db.job.findUnique({
    where: { id: jobId },
    include: {
      requiredSkillsRelation: { include: { skill: true } },
    },
  })

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  const user = await db.user.findUnique({ where: { email: userEmail as string } })

  if (job.employerId !== user?.clerkId) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const applications = await db.jobApplication.findMany({
    where: { jobId },
    include: {
      user: {
        include: {
          profile: {
            include: {
              skillsRelation: { include: { skill: true } },
            },
          },
        },
      },
    },
  })

  const totalApplications = applications.length
  const pendingApplications = applications.filter(a => a.status === "PENDING").length
  const reviewingApplications = applications.filter(a => a.status === "REVIEWING").length
  const shortlistedApplications = applications.filter(a => a.status === "SHORTLISTED").length
  const interviewingApplications = applications.filter(a => a.status === "INTERVIEW").length
  const offeredApplications = applications.filter(a => a.status === "OFFERED").length
  const hiredApplications = applications.filter(a => a.status === "HIRED").length
  const rejectedApplications = applications.filter(a => a.status === "REJECTED").length

  const jobSkillIds = (job.requiredSkillsRelation || []).map(rs => rs.skillId)
  const candidatesWithScores = applications.map((app) => {
    const userSkillIds = (app.user.profile?.skillsRelation || []).map(s => s.skillId)
    const matchedSkills = userSkillIds.filter(id => jobSkillIds.includes(id)).length
    const matchScore = jobSkillIds.length > 0 ? Math.round((matchedSkills / jobSkillIds.length) * 100) : 0
    return { ...app, matchScore }
  })

  const avgMatchScore = candidatesWithScores.length > 0
    ? Math.round(candidatesWithScores.reduce((sum, c) => sum + c.matchScore, 0) / candidatesWithScores.length)
    : 0

  return NextResponse.json({
    jobId,
    totalApplications,
    pendingApplications,
    reviewingApplications,
    shortlistedApplications,
    interviewingApplications,
    offeredApplications,
    hiredApplications,
    rejectedApplications,
    conversionRate: totalApplications > 0 ? Math.round((hiredApplications / totalApplications) * 100) : 0,
    avgMatchScore,
    totalCandidates: totalApplications,
  })
}
