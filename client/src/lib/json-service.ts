import rawData from '@/data/jobs.json'
import type { Job, Application, SavedJob, Candidate, JobMetrics } from './types'
import { normalizeJob } from './mappers'

const BASE_DELAY = 400
const JITTER = 300
const CACHE_TTL = 60000

let cache: Record<string, { data: any; ts: number }> = {}

function randomDelay(): Promise<void> {
  const ms = BASE_DELAY + Math.random() * JITTER
  return new Promise(r => setTimeout(r, ms))
}

function fromCache<T>(key: string): T | null {
  const entry = cache[key]
  if (entry && Date.now() - entry.ts < CACHE_TTL) return entry.data as T
  return null
}

function toCache(key: string, data: any): void {
  cache[key] = { data, ts: Date.now() }
}

export function clearCache(): void {
  cache = {}
}

function matchJob(job: any, params: Record<string, string>): boolean {
  for (const [key, val] of Object.entries(params)) {
    if (!val) continue
    const lower = val.toLowerCase()
    if (key === 'search') {
      const match = job.title?.toLowerCase().includes(lower)
        || (job.company?.companyName || '').toLowerCase().includes(lower)
        || (job.skills || []).some((s: string) => s.toLowerCase().includes(lower))
      if (!match) return false
    } else if (key === 'jobType') {
      if ((job.jobType || '').toLowerCase() !== lower) return false
    } else if (key === 'experienceLevel') {
      if ((job.experienceLevel || '').toLowerCase() !== lower) return false
    } else if (key === 'workMode') {
      if ((job.workMode || '').toLowerCase() !== lower) return false
    } else if (key === 'featured') {
      if (val === 'true' && !job.isFeatured) return false
    } else if (key === 'status') {
      if ((job.status || '').toLowerCase() !== lower) return false
    } else if (key === 'location') {
      if (!(job.location || '').toLowerCase().includes(lower)) return false
    }
  }
  return true
}

export async function getJobsFromJson(params?: Record<string, string>): Promise<{
  jobs: Job[]
  total: number
  page: number
  totalPages: number
}> {
  const cacheKey = 'jobs:' + JSON.stringify(params)
  const cached = fromCache<{ jobs: Job[]; total: number; page: number; totalPages: number }>(cacheKey)
  if (cached) return cached

  await randomDelay()

  let results = (rawData.jobs || []).map(normalizeJob)

  if (params) {
    results = results.filter(j => matchJob(j, params))
  }

  // Pagination
  const limit = params?.limit ? parseInt(params.limit, 10) : results.length
  const page = params?.page ? parseInt(params.page, 10) : 1
  const total = results.length
  const totalPages = Math.ceil(total / limit)
  const start = (page - 1) * limit
  const paged = results.slice(start, start + limit)

  const out = { jobs: paged, total, page, totalPages }
  toCache(cacheKey, out)
  return out
}

export async function getJobFromJson(slug: string): Promise<Job | null> {
  const cacheKey = 'job:' + slug
  const cached = fromCache<Job | null>(cacheKey)
  if (cached !== null) return cached

  await randomDelay()
  const job = (rawData.jobs || []).find(j => j.slug === slug) || null
  const result = job ? normalizeJob(job) : null
  toCache(cacheKey, result)
  return result
}

export async function getApplicationsFromJson(email?: string): Promise<Application[]> {
  await randomDelay()
  const apps = (rawData.applications || []) as any[]
  return apps.map(a => {
    const job = (rawData.jobs || []).find(j => j.id === a.jobId)
    const emp = job ? (rawData.employers || []).find(e => e.userId === job.employerId) : null
    return {
      ...a,
      job: job ? {
        id: job.id,
        title: job.title,
        slug: job.slug,
        location: job.location,
        city: job.city,
        jobType: job.jobType,
        company: emp ? {
          companyName: emp.companyName,
          companyLogo: emp.companyLogo,
        } : null,
      } : null,
      candidate: {
        id: 0,
        clerkId: a.userId,
        firstName: 'John',
        lastName: 'Doe',
        email: email || 'applicant@example.com',
        profileImage: null,
      },
    }
  }) as Application[]
}

export async function getApplicationFromJson(id: number | string): Promise<Application | null> {
  await randomDelay()
  const apps = await getApplicationsFromJson()
  return apps.find(a => a.id === Number(id)) || null
}

export async function submitApplicationToJson(slug: string, body: { coverLetter?: string; resumeUrl?: string; email?: string }): Promise<{ success: boolean; application: any }> {
  await randomDelay()
  const job = (rawData.jobs || []).find(j => j.slug === slug)
  if (!job) throw new Error('Job not found')

  const newApp = {
    id: Date.now(),
    userId: body.email || 'local-user',
    jobId: job.id,
    coverLetter: body.coverLetter || null,
    resumeUrl: body.resumeUrl || null,
    status: 'PENDING',
    englishTestRequired: false,
    englishTestScore: null,
    passedScreening: null,
    appliedAt: new Date().toISOString(),
    reviewedAt: null,
    interviewAt: null,
    rejectedAt: null,
    acceptedAt: null,
    employerNotes: null,
    isShortlisted: false,
  }

  // Mutate in-memory (won't persist to file — that's fine for demo)
  ;(rawData as any).applications = [...(rawData.applications || []), newApp]
  clearCache()

  return { success: true, application: newApp }
}

const savedJobsStore: Record<string, number[]> = {}

export async function saveJobInJson(email: string, jobId: number): Promise<void> {
  await randomDelay()
  if (!savedJobsStore[email]) savedJobsStore[email] = []
  if (!savedJobsStore[email].includes(jobId)) {
    savedJobsStore[email].push(jobId)
  }
  clearCache()
}

export async function unsaveJobInJson(email: string, jobId: number): Promise<void> {
  await randomDelay()
  if (savedJobsStore[email]) {
    savedJobsStore[email] = savedJobsStore[email].filter(id => id !== jobId)
  }
  clearCache()
}

export async function getSavedJobsFromJson(email?: string): Promise<SavedJob[]> {
  await randomDelay()
  if (!email || !savedJobsStore[email]) return []

  const jobIds = savedJobsStore[email]
  const jobs = (rawData.jobs || []).filter(j => jobIds.includes(j.id))

  return jobs.map(j => {
    const emp = (rawData.employers || []).find(e => e.userId === j.employerId)
    return {
      id: String(j.id),
      jobId: j.id,
      userId: email,
      savedAt: new Date().toISOString(),
      job: {
        id: j.id,
        title: j.title,
        slug: j.slug,
        location: j.location ?? null,
        city: j.city ?? null,
        remoteWork: j.remoteWork ?? null,
        jobType: j.jobType,
        company: emp ? { companyName: emp.companyName, companyLogo: emp.companyLogo } : null,
      },
    }
  })
}

export async function getCompanyJobsFromJson(email?: string): Promise<any[]> {
  await randomDelay()
  const emp = (rawData.employers || []).find(e => e.contactEmail === email)
  if (!emp) return []
  const apps = rawData.applications || []
  return (rawData.jobs || [])
    .filter(j => j.employerId === emp.userId)
    .map(j => {
      const count = apps.filter(a => a.jobId === j.id).length
      return { ...normalizeJob(j), applicationsCount: count }
    })
}

export async function getCompanyProfileFromJson(email?: string): Promise<any> {
  await randomDelay()
  const emp = (rawData.employers || []).find(e => e.contactEmail === email)
  if (!emp) return null
  return {
    id: emp.id,
    companyName: emp.companyName,
    companyWebsite: emp.companyWebsite,
    companySize: emp.companySize,
    industry: emp.industry,
    description: emp.description,
    contactEmail: emp.contactEmail,
    contactPhone: emp.contactPhone,
    city: emp.city,
    country: emp.country,
    logo: emp.companyLogo,
    linkedIn: emp.linkedIn,
    twitter: emp.twitter,
    hiringMode: emp.hiringMode,
    userId: emp.userId,
  }
}

export async function searchSkillsFromJson(query: string): Promise<{ id: number; name: string }[]> {
  await randomDelay()
  const allSkills = new Set<string>()
  for (const job of rawData.jobs || []) {
    for (const skill of job.requiredSkills || []) {
      if (skill.toLowerCase().includes(query.toLowerCase())) {
        allSkills.add(skill)
      }
    }
  }
  return Array.from(allSkills).map((name, i) => ({ id: i + 1, name }))
}

export async function getDashboardDataFromJson(email?: string): Promise<any> {
  await randomDelay()
  const apps = await getApplicationsFromJson(email)
  const jobs = (rawData.jobs || []).map(normalizeJob)

  const interviewApps = apps.filter(a => a.status === 'INTERVIEW' || a.status === 'interview')

  return {
    user: { email },
    stats: {
      totalApplications: apps.length,
      savedJobsCount: 0,
      profileViews: 0,
      interviewRequests: interviewApps.length,
    },
    recentApplications: apps.slice(0, 5),
    currentJobs: jobs.slice(0, 6),
    savedJobs: [],
    profileCompletion: {
      basicInfo: true,
      resume: false,
      englishTest: false,
      workExperience: false,
    },
    profileProgress: 25,
  }
}

export function getRawJsonData() {
  return rawData
}

export async function getCandidatesFromJson(slug: string): Promise<{ job: any; candidates: Candidate[]; total: number }> {
  await randomDelay()
  const job = (rawData.jobs || []).find(j => j.slug === slug)
  if (!job) return { job: null, candidates: [], total: 0 }

  const apps = (rawData.applications || []).filter(a => a.jobId === job.id)
  const emp = (rawData.employers || []).find(e => e.userId === job.employerId)

  const jobSkills: string[] = job.requiredSkills || job.skills || []

  const candidates: Candidate[] = apps.map(a => {
    const matchedSkills = jobSkills.length > 0
      ? Math.floor(Math.random() * jobSkills.length) + 1
      : 0
    const totalRequired = Math.max(jobSkills.length, 1)
    const matchScore = Math.min(Math.round((matchedSkills / totalRequired) * 100), 100)

    return {
      id: a.id,
      status: a.status || 'PENDING',
      appliedAt: a.appliedAt,
      matchScore,
      matchedSkills,
      totalRequired,
      candidate: {
        id: a.id,
        name: 'John Doe',
        firstName: 'John',
        lastName: 'Doe',
        email: a.userId || 'applicant@example.com',
        profileImage: '',
        profile: {
          jobTitle: job.title || '',
          summary: a.coverLetter?.slice(0, 200) || '',
          skills: jobSkills,
          experienceYears: 2,
          skillsRelation: jobSkills.slice(0, 5).map(s => ({ skill: { name: s }, level: 'intermediate' })),
        },
      },
    }
  })

  return {
    job: { ...job, company: emp || null },
    candidates,
    total: candidates.length,
  }
}

export async function getJobMetricsFromJson(slug: string): Promise<JobMetrics> {
  await randomDelay()
  const job = (rawData.jobs || []).find(j => j.slug === slug)
  const jobId = job?.id || 0

  const apps = (rawData.applications || []).filter(a => a.jobId === jobId)
  const total = apps.length
  const pending = apps.filter(a => a.status === 'PENDING').length
  const reviewing = apps.filter(a => a.status === 'REVIEWING').length
  const shortlisted = apps.filter(a => a.status === 'SHORTLISTED').length
  const interviewing = apps.filter(a => a.status === 'INTERVIEW').length
  const offered = apps.filter(a => a.status === 'OFFERED').length
  const hired = apps.filter(a => a.status === 'HIRED').length
  const rejected = apps.filter(a => a.status === 'REJECTED').length

  return {
    jobId,
    totalApplications: total,
    pendingApplications: pending,
    reviewingApplications: reviewing + shortlisted,
    shortlistedApplications: shortlisted,
    interviewingApplications: interviewing,
    offeredApplications: offered,
    hiredApplications: hired,
    rejectedApplications: rejected,
    conversionRate: total > 0 ? Math.round((hired / total) * 100) : 0,
    avgMatchScore: total > 0 ? 75 : 0,
    totalCandidates: total,
  }
}

export async function getApplicationsForJobFromJson(jobId: number): Promise<any[]> {
  await randomDelay()
  const apps = (rawData.applications || []).filter(a => a.jobId === jobId)
  const job = (rawData.jobs || []).find(j => j.id === jobId)
  const emp = job ? (rawData.employers || []).find(e => e.userId === job.employerId) : null

  return apps.map(a => ({
    ...a,
    job: job ? { ...job, company: emp ? { companyName: emp.companyName, companyLogo: emp.companyLogo } : null } : null,
    candidate: {
      id: a.userId || '0',
      firstName: 'John',
      lastName: 'Doe',
      email: a.userId || 'applicant@example.com',
      profileImage: '',
    },
  }))
}

export async function updateApplicationStatusInJson(appId: number, status: string, notes?: string): Promise<any> {
  await randomDelay()
  const app = (rawData.applications || []).find(a => a.id === appId)
  if (!app) throw new Error(`Application ${appId} not found`)

  const a = app as any
  a.status = status
  if (notes) a.employerNotes = notes
  if (status === 'REVIEWING' && !a.reviewedAt) a.reviewedAt = new Date().toISOString()
  if (status === 'INTERVIEW' && !a.interviewAt) a.interviewAt = new Date().toISOString()
  if (status === 'REJECTED' && !a.rejectedAt) a.rejectedAt = new Date().toISOString()
  if (status === 'HIRED' && !a.acceptedAt) a.acceptedAt = new Date().toISOString()
  if (status === 'OFFERED' && !a.acceptedAt) a.acceptedAt = new Date().toISOString()

  clearCache()
  return { ...app }
}

export async function toggleShortlistInJson(appId: number, shortlisted: boolean): Promise<{ success: boolean; isShortlisted: boolean }> {
  await randomDelay()
  const app = (rawData.applications || []).find(a => a.id === appId)
  if (app) {
    app.isShortlisted = shortlisted
    clearCache()
  }
  return { success: true, isShortlisted: shortlisted }
}
