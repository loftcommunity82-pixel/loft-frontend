import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

import jobsData from '@/data/jobs.json'
import { getAllRemoteJobs } from '@/lib/remote-jobs'

export const dynamic = "force-dynamic"

function parseSalaryRange(range?: string): { min: number | null; max: number | null } {
  if (!range) return { min: null, max: null }
  const matches = range.replace(/,/g, '').match(/\$?(\d+(?:,\d{3})*(?:\.\d+)?)/g)
  if (!matches) return { min: null, max: null }
  const nums = matches.map(m => parseInt(m.replace(/[^0-9]/g, '')))
  return { min: nums[0] || null, max: nums[1] || null }
}

function parseJobType(jt: string): string {
  const map: Record<string, string> = {
    'full-time': 'FULL_TIME', 'part-time': 'PART_TIME',
    contract: 'CONTRACT', internship: 'INTERNSHIP',
    temporary: 'TEMPORARY', freelance: 'FREELANCE',
  }
  return map[jt.toLowerCase()] || 'FULL_TIME'
}

function parseWorkMode(location: string): string {
  const loc = location.toLowerCase()
  if (loc.startsWith('remote')) return 'REMOTE'
  if (loc.startsWith('hybrid')) return 'HYBRID'
  return 'ONSITE'
}

function parseCreatedAt(dateStr?: string): Date {
  return dateStr ? new Date(dateStr) : new Date()
}

function getExperienceLevel(title: string): string {
  if (/senior|lead|principal/i.test(title)) return 'SENIOR'
  if (/junior|graduate/i.test(title)) return 'JUNIOR'
  if (/director|head|vp|chief/i.test(title)) return 'EXECUTIVE'
  return 'MID'
}

interface JobsJSONEntry {
  id?: string
  title: string
  company: string
  jobType: string
  location: string
  salaryRange?: string
  description: string
  requiredSkills: string[]
  benefits?: string[]
  postedTime?: string
  employer_id?: string
  status?: string
  created_at?: string
}

interface JobResponse {
  id: number
  title: string
  slug: string
  description: string
  jobType: string
  experienceLevel: string
  workMode: string
  location: string
  city: string
  remoteWork: boolean
  salaryMin: number | null
  salaryMax: number | null
  salaryCurrency: string
  applicationsCount: number
  publishedAt: string
  company: { companyName: string; companyLogo: string | null; city: string | null } | null
  skills: string[]
  source?: string
}

let jsonFallbackCache: { jobs: JobResponse[] } | null = null

function getFallbackJobs(): JobResponse[] {
  if (jsonFallbackCache) return jsonFallbackCache.jobs
  const raw = (jobsData as JobsJSONEntry[]) || []
  const jobs: JobResponse[] = raw.map((j, i) => {
    const { min, max } = parseSalaryRange(j.salaryRange)
    const workMode = parseWorkMode(j.location)
    const createdAt = parseCreatedAt(j.created_at)
    return {
      id: parseInt(j.id || String(i + 1)),
      title: j.title,
      slug: j.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + (j.id || i),
      description: j.description,
      jobType: parseJobType(j.jobType),
      experienceLevel: getExperienceLevel(j.title),
      workMode,
      location: j.location,
      city: j.location,
      remoteWork: workMode === 'REMOTE',
      salaryMin: min,
      salaryMax: max,
      salaryCurrency: 'USD',
      applicationsCount: 0,
      publishedAt: createdAt.toISOString(),
      company: { companyName: j.company, companyLogo: null, city: j.location },
      skills: j.requiredSkills || [],
    }
  })
  jsonFallbackCache = { jobs }
  return jobs
}

function filterFallbackJobs(jobs: JobResponse[], search: string, location: string, experience: string, jobType: string, workMode: string, sort: string): JobResponse[] {
  const filtered = jobs.filter(j => {
    if (search) {
      const q = search.toLowerCase()
      if (!j.title.toLowerCase().includes(q) && !j.description.toLowerCase().includes(q)) return false
    }
    if (location) {
      const loc = location.toLowerCase()
      const matchesCity = j.city?.toLowerCase().includes(loc)
      const matchesLoc = j.location?.toLowerCase().includes(loc)
      const isRemote = loc === 'remote' && j.remoteWork
      if (!matchesCity && !matchesLoc && !isRemote) return false
    }
    if (experience && j.experienceLevel !== experience) return false
    if (jobType && j.jobType !== jobType) return false
    if (workMode && j.workMode !== workMode) return false
    return true
  })

  if (sort === 'salary_high') {
    filtered.sort((a, b) => (b.salaryMax ?? -Infinity) - (a.salaryMax ?? -Infinity))
  } else if (sort === 'salary_low') {
    filtered.sort((a, b) => (a.salaryMax ?? Infinity) - (b.salaryMax ?? Infinity))
  } else {
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
  }

  return filtered
}

// GET /api/jobs - Search and list jobs
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  
  const search = searchParams.get("search") || ""
  const location = searchParams.get("location") || ""
  const experience = searchParams.get("experience") || ""
  const jobType = searchParams.get("jobType") || ""
  const workMode = searchParams.get("workMode") || ""
  const sort = searchParams.get("sort") || "recent"
  const page = parseInt(searchParams.get("page") || "1")
  const limit = parseInt(searchParams.get("limit") || "12")

  function getOrderBy(): any {
    switch (sort) {
      case 'salary_high': return { salaryMax: { sort: 'desc', nulls: 'last' } }
      case 'salary_low': return { salaryMax: { sort: 'asc', nulls: 'last' } }
      default: return { publishedAt: 'desc' }
    }
  }

  try {
    // Auto-close jobs older than 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    await db.job.updateMany({
      where: {
        isActive: true,
        publishedAt: { lte: thirtyDaysAgo },
        status: 'PUBLISHED',
      },
      data: {
        isActive: false,
        status: 'CLOSED',
        closedAt: new Date(),
      },
    })

    const where: any = { status: "PUBLISHED", isActive: true }
    const filters: any[] = []

    if (search) {
      filters.push({
        OR: [
          { title: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
        ],
      })
    }

    if (location) {
      filters.push({
        OR: [
          { city: { contains: location, mode: "insensitive" } },
          { location: { contains: location, mode: "insensitive" } },
          { remoteWork: location.toLowerCase() === "remote" ? true : undefined },
        ].filter(Boolean),
      })
    }

    filters.push({
      OR: [
        { deadline: null },
        { deadline: { gte: new Date() } },
      ],
    })
    if (experience) filters.push({ experienceLevel: experience })
    if (jobType) filters.push({ jobType })
    if (workMode) filters.push({ workMode })
    if (filters.length > 0) where.AND = filters

    const [jobs, total] = await Promise.all([
      db.job.findMany({
        where,
        include: {
          employer: {
            select: { companyName: true, companyLogo: true, city: true },
          },
          requiredSkillsRelation: { include: { skill: true } },
        },
        orderBy: getOrderBy(),
        skip: (page - 1) * limit,
        take: limit,
      }),
      db.job.count({ where }),
    ])

    const remoteJobs = (await getAllRemoteJobs()).filter((j) => {
      if (search) {
        const q = search.toLowerCase()
        if (!j.title.toLowerCase().includes(q) && !j.description.toLowerCase().includes(q)) return false
      }
      if (location && !j.location?.toLowerCase().includes(location.toLowerCase())) return false
      return true
    })

    if (total === 0) {
      const fallback = filterFallbackJobs(getFallbackJobs(), search, location, experience, jobType, workMode, sort)
      const allJobs = [...fallback, ...remoteJobs]
      const totalAll = allJobs.length
      const paged = allJobs.slice((page - 1) * limit, page * limit)
      return NextResponse.json({
        jobs: paged,
        total: totalAll,
        page,
        totalPages: Math.ceil(totalAll / limit),
      })
    }

    return NextResponse.json({
      jobs: [
        ...jobs.map((job) => ({
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
          skills: job.requiredSkillsRelation.map((rs) => rs.skill.name),
          source: "local",
        })),
        ...remoteJobs,
      ],
      total: total + remoteJobs.length,
      page,
      totalPages: Math.ceil((total + remoteJobs.length) / limit),
    })
  } catch {
    const fallback = filterFallbackJobs(getFallbackJobs(), search, location, experience, jobType, workMode, sort)
    const remoteJobs = (await getAllRemoteJobs()).filter((j) => {
      if (search) {
        const q = search.toLowerCase()
        if (!j.title.toLowerCase().includes(q) && !j.description.toLowerCase().includes(q)) return false
      }
      if (location && !j.location?.toLowerCase().includes(location.toLowerCase())) return false
      return true
    })
    const allJobs = [...fallback, ...remoteJobs]
    const totalAll = allJobs.length
    const paged = allJobs.slice((page - 1) * limit, page * limit)
    return NextResponse.json({
      jobs: paged,
      total: totalAll,
      page,
      totalPages: Math.ceil(totalAll / limit),
    })
  }
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
    include: {
      employerProfile: true,
      companyMemberships: { take: 1 },
    },
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
    deadline,
    status: requestedStatus,
  } = body

  if (!title || !description || !jobType || !experienceLevel || !workMode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now()

  const companyId = user.companyMemberships[0]?.companyId || 1
  const isPublished = requestedStatus === "PUBLISHED"

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
      companyId,
      status: isPublished ? "PUBLISHED" : "DRAFT",
      isActive: isPublished,
      publishedAt: isPublished ? new Date() : null,
      deadline: deadline ? new Date(deadline) : null,
      employerId: user.clerkId,
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