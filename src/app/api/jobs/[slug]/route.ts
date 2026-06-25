import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { findRemoteJobBySlug } from "@/lib/remote-jobs"

export const dynamic = "force-dynamic"

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const rawSlug = params.slug
  const jobId = parseInt(rawSlug)
  const isNumeric = !isNaN(jobId)

  const job = await db.job.findFirst({
    where: isNumeric
      ? { id: jobId }
      : { slug: rawSlug },
    include: {
      employer: {
        select: { companyName: true, companyLogo: true, companySize: true, industry: true, description: true, contactEmail: true, city: true, country: true, linkedIn: true, twitter: true, hiringMode: true },
      },
      requiredSkillsRelation: {
        include: { skill: true },
      },
      category: true,
    },
  })

  if (!job) {
    const remoteJob = await findRemoteJobBySlug(rawSlug)
    if (remoteJob) {
      return NextResponse.json({ ...remoteJob, requiredSkills: remoteJob.skills, source: "jobicy" })
    }
    const numericId = parseInt(rawSlug)
    if (!isNaN(numericId)) {
      const { findRemoteJobById } = await import('@/lib/remote-jobs')
      const remoteById = await findRemoteJobById(numericId)
      if (remoteById) {
        return NextResponse.json({ ...remoteById, requiredSkills: remoteById.skills, source: "jobicy" })
      }
    }
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  return NextResponse.json({
    id: job.id,
    title: job.title,
    slug: job.slug,
    description: job.description,
    requirements: job.requirements,
    benefits: job.benefits,
    jobType: job.jobType,
    experienceLevel: job.experienceLevel,
    workMode: job.workMode,
    location: job.location,
    city: job.city,
    country: job.country,
    remoteWork: job.remoteWork,
    salaryMin: job.salaryMin,
    salaryMax: job.salaryMax,
    salaryCurrency: job.salaryCurrency,
    salaryPeriod: job.salaryPeriod,
    isSalaryVisible: job.isSalaryVisible,
    requiredSkills: job.requiredSkillsRelation.map((rs) => rs.skill.name),
    preferredSkills: job.preferredSkills,
    status: job.status,
    isFeatured: job.isFeatured,
    isActive: job.isActive,
    viewsCount: job.viewsCount,
    applicationsCount: job.applicationsCount,
    employerId: job.employerId,
    category: job.category,
    deadline: job.deadline,
    publishedAt: job.publishedAt,
    createdAt: job.createdAt,
    company: job.employer,
    source: "local",
  })
}

async function getUserWithCompany(email: string) {
  return db.user.findUnique({
    where: { email },
    include: {
      employerProfile: true,
      companyMemberships: { take: 1 },
    },
  })
}

async function findJobByIdOrSlug(rawSlug: string) {
  const jobId = parseInt(rawSlug)
  const isNumeric = !isNaN(jobId)
  return db.job.findFirst({
    where: isNumeric ? { id: jobId } : { slug: rawSlug },
  })
}

async function authorizeJobAction(user: any, job: any) {
  const isOwner = job.employerId === user.clerkId
  const isCompanyMember = user.companyMemberships?.length > 0
  return isOwner || isCompanyMember
}

export async function PATCH(
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

  const user = await getUserWithCompany(userEmail as string)

  if (!user?.employerProfile) {
    return NextResponse.json({ error: "Company profile required" }, { status: 403 })
  }

  const job = await findJobByIdOrSlug(params.slug)

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  if (!(await authorizeJobAction(user, job))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const body = await request.json()
  const { title, description, requirements, benefits, jobType, experienceLevel, workMode, location, city, salaryMin, salaryMax, status, isFeatured, isActive, deadline, skills, preferredSkills } = body

  const updateData: Record<string, unknown> = {}
  if (title !== undefined) updateData.title = title
  if (description !== undefined) updateData.description = description
  if (requirements !== undefined) updateData.requirements = requirements
  if (benefits !== undefined) updateData.benefits = benefits
  if (jobType !== undefined) updateData.jobType = jobType
  if (experienceLevel !== undefined) updateData.experienceLevel = experienceLevel
  if (workMode !== undefined) updateData.workMode = workMode
  if (location !== undefined) updateData.location = location
  if (city !== undefined) updateData.city = city
  if (salaryMin !== undefined) updateData.salaryMin = salaryMin
  if (salaryMax !== undefined) updateData.salaryMax = salaryMax
  if (isFeatured !== undefined) updateData.isFeatured = isFeatured
  if (isActive !== undefined) updateData.isActive = isActive
  if (preferredSkills !== undefined) updateData.preferredSkills = preferredSkills

  if (status !== undefined) {
    updateData.status = status
    if (status === "PUBLISHED") { updateData.publishedAt = new Date(); updateData.isActive = true }
    if (status === "CLOSED") { updateData.closedAt = new Date(); updateData.isActive = false }
    if (status === "DRAFT") { updateData.isActive = false }
  }

  if (deadline !== undefined) {
    updateData.deadline = deadline ? new Date(deadline) : null
  }

  const updated = await db.job.update({
    where: { id: job.id },
    data: updateData,
  })

  if (skills && Array.isArray(skills)) {
    await db.jobRequiredSkill.deleteMany({ where: { jobId: job.id } })
    for (const skillName of skills) {
      let skill = await db.skill.findUnique({ where: { name: skillName } })
      if (!skill) {
        skill = await db.skill.create({ data: { name: skillName, isCustom: true } })
      }
      await db.jobRequiredSkill.create({
        data: { jobId: job.id, skillId: skill.id, isRequired: true },
      })
    }
  }

  return NextResponse.json({ success: true, job: updated })
}

export async function DELETE(
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

  const user = await getUserWithCompany(userEmail as string)

  if (!user?.employerProfile) {
    return NextResponse.json({ error: "Company profile required" }, { status: 403 })
  }

  const job = await findJobByIdOrSlug(params.slug)

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  if (!(await authorizeJobAction(user, job))) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  await db.job.delete({ where: { id: job.id } })

  return NextResponse.json({ success: true })
}
