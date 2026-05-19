import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// GET /api/jobs - Search and list jobs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const search = searchParams.get("search") || ""
  const location = searchParams.get("location")
  const experience = searchParams.get("experience")
  const jobType = searchParams.get("jobType")
  const workMode = searchParams.get("workMode")
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "10")

  const where: any = {
    status: "PUBLISHED",
    isActive: true,
  }

  // Search by keyword
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ]
  }

  // Location filter
  if (location) {
    where.OR = [
      { city: { contains: location, mode: "insensitive" } },
      { location: { contains: location, mode: "insensitive" } },
      { remoteWork: true },
    ]
  }

  // Filters
  if (experience) {
    where.experienceLevel = experience
  }

  if (jobType) {
    where.jobType = jobType
  }

  if (workMode) {
    where.workMode = workMode
  }

  const [jobs, total] = await Promise.all([
    db.job.findMany({
      where,
      include: {
        employer: {
          select: { 
            companyName: true, 
            companyLogo: true,
            city: true,
          },
        },
        requiredSkills: {
          include: { skill: true },
        },
      },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    db.job.count({ where }),
  ])

  return NextResponse.json({
    jobs: jobs.map((job) => ({
      id: job.id,
      title: job.title,
      slug: job.slug,
      description: job.description,
      jobType: job.jobType,
      experienceLevel: job.experienceLevel,
      workMode: job.workMode,
      location: job.location,
      city: job.city,
      remoteWork: job.remoteWork,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      salaryCurrency: job.salaryCurrency,
      viewsCount: job.viewsCount,
      applicationsCount: job.applicationsCount,
      publishedAt: job.publishedAt,
      company: job.employer,
      skills: job.requiredSkills.map((rs) => rs.skill.name),
    })),
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}

// POST /api/jobs - Create job (employer only)
export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
    include: { employerProfile: true },
  })

  if (!user?.employerProfile) {
    return NextResponse.json({ error: "Company profile required" }, { status: 403 })
  }

  const body = await request.json()
  const { 
    title, 
    description, 
    requirements,
    jobType, 
    experienceLevel, 
    workMode, 
    location, 
    city, 
    salaryMin, 
    salaryMax,
    skills,
    deadline 
  } = body

  if (!title || !description || !jobType || !experienceLevel || !workMode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now()

  const job = await db.job.create({
    data: {
      title,
      slug,
      description,
      requirements,
      jobType,
      experienceLevel,
      workMode,
      location,
      city,
      salaryMin,
      salaryMax,
      status: "PUBLISHED",
      isActive: true,
      publishedAt: new Date(),
      deadline: deadline ? new Date(deadline) : null,
      employerId: user.clerkId,
      // Skills will be added via separate endpoint
    },
  })

  // Add required skills
  if (skills && skills.length > 0) {
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

  return NextResponse.json({
    success: true,
    job: {
      ...job,
      skills: skills || [],
    },
  })
}