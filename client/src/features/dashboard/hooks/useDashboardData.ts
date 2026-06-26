import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuth } from '@/providers/AuthProvider'

export interface DashboardStats {
  profileViews: number
  applicationsCount: number
  savedJobsCount: number
  interviewRequests: number
}

export interface ApplicationSummary {
  id: number
  jobTitle: string
  company: string
  status: string
  appliedAt: string
}

export interface JobSummary {
  id: number
  title: string
  slug: string
  company: string | null
  companyLogo: string | null
  location: string
  workMode: string
  jobType: string
  salaryMin: number | null
  salaryMax: number | null
  skills: string[]
  publishedAt: string
}

export interface SavedJobItem {
  id: number
  jobId: number
  savedAt: string
  job: {
    id: number
    title: string
    slug: string
    location: string
    city: string
    remoteWork: boolean
    jobType: string
    company: { companyName: string; companyLogo: string | null } | null
  }
}

export interface DashboardData {
  stats: DashboardStats
  recentApplications: ApplicationSummary[]
  upcomingInterviews: ApplicationSummary[]
  currentJobs: JobSummary[]
  savedJobs: SavedJobItem[]
  profileCompletion: {
    basicInfo: boolean
    resume: boolean
    englishTest: boolean
    workExperience: boolean
  }
}

export function isProfileComplete(user: any, profile?: any): DashboardData['profileCompletion'] {
  const hasBasicInfo = !!(user?.firstName && user?.lastName)
  const hasResume = !!(profile?.resume?.fileUrl || profile?.resume?.isUploaded)
  const hasEnglishTest = !!(profile?.englishTestScore || profile?.englishTestLevel)
  const hasWorkExperience = !!(profile?.profile?.workExperience?.length > 0)
  return { basicInfo: hasBasicInfo, resume: hasResume, englishTest: hasEnglishTest, workExperience: hasWorkExperience }
}

export function calculateProfileProgress(completion: DashboardData['profileCompletion']): number {
  const fields = Object.values(completion)
  const completed = fields.filter(Boolean).length
  return Math.round((completed / fields.length) * 100)
}

const STALE_TIME = 30000

export function useDashboardData() {
  const { user, isAuthenticated } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetch = useRef(0)
  const [emailVerified, setEmailVerified] = useState(true)
  const [profileData, setProfileData] = useState<any>(null)
  const profileCompletion = useMemo(() => isProfileComplete(user, profileData), [user, profileData])
  const profileProgress = calculateProfileProgress(profileCompletion)

  const fetchDashboardData = useCallback(async () => {
    if (!isAuthenticated || !user) return
    setIsLoading(true)
    setError(null)
    lastFetch.current = Date.now()
    try {
      const email = user.email || ''
      const [applicationsRes, profileRes, jobsRes, savedJobsRes] = await Promise.all([
        fetch(`/api/applications?email=${encodeURIComponent(email)}`),
        fetch('/api/users/profile'),
        fetch('/api/jobs?limit=6'),
        fetch(`/api/users/saved-jobs?email=${encodeURIComponent(email)}`),
      ])
      const applications = applicationsRes.ok ? await applicationsRes.json() : []
      const profile = profileRes.ok ? await profileRes.json() : null
      if (profile) {
        if (typeof profile.emailVerified === 'boolean') setEmailVerified(profile.emailVerified)
        setProfileData(profile)
      }
      const jobsData = jobsRes.ok ? await jobsRes.json() : { jobs: [] }
      const savedJobsData: SavedJobItem[] = savedJobsRes.ok ? await savedJobsRes.json() : []
      const apps: ApplicationSummary[] = (Array.isArray(applications) ? applications : []).map((app: any) => ({
        id: app.id,
        jobTitle: app.job?.title || 'Unknown',
        company: app.job?.company?.companyName || 'Unknown',
        status: app.status?.toLowerCase() || 'pending',
        appliedAt: app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Unknown',
      }))
      const interviewApps = apps.filter(a => a.status === 'interview')
      const currentJobs: JobSummary[] = (jobsData.jobs || []).map((job: any) => ({
        id: job.id,
        title: job.title,
        slug: job.slug || job.id,
        company: job.company?.companyName || null,
        companyLogo: job.company?.companyLogo || null,
        location: job.location || job.city || '',
        workMode: job.workMode || '',
        jobType: job.jobType || '',
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        skills: job.skills || [],
        publishedAt: job.publishedAt || '',
      }))
      setData({
        stats: {
          profileViews: profile?.viewsCount ?? 0,
          applicationsCount: apps.length,
          savedJobsCount: savedJobsData.length,
          interviewRequests: interviewApps.length,
        },
        recentApplications: apps.slice(0, 5),
        upcomingInterviews: interviewApps.slice(0, 3),
        currentJobs,
        savedJobs: savedJobsData,
        profileCompletion: isProfileComplete(user, profile),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  useEffect(() => { fetchDashboardData() }, [fetchDashboardData])
  useEffect(() => {
    const handleFocus = () => { if (Date.now() - lastFetch.current > STALE_TIME) fetchDashboardData() }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [fetchDashboardData])

  const needsProfileCompletion = profileProgress < 100

  return { data, isLoading, error, isAuthenticated, user, emailVerified, profileCompletion, profileProgress, needsProfileCompletion, refetch: fetchDashboardData }
}

export default useDashboardData
