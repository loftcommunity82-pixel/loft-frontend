import { useState, useEffect, useCallback, useRef } from 'react'
import api, {
  resetPassword,
  fetchSavedJobs,
  saveJob,
  unsaveJob,
  getCompanyJobs,
  getCompanyProfile,
  updateCompanyProfile,
  getJobCandidates,
  getJobMetrics,
  getNotifications,
  markNotificationsRead,
  markAllNotificationsRead,
  getNotificationPrefs,
  updateNotificationPrefs,
  submitContactForm,
  searchSkills,
} from './api'
import type { Job, Application, Message, Conversation, SavedJob, CompanyProfile, Notification, NotificationPrefs, JobMetrics, Candidate, Skill } from './types'
import { normalizeJob } from './mappers'

export function useJobs(params?: Record<string, string>) {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setLoading(true)
    api.get('/jobs', { params })
      .then((res) => {
        const data = res.data
        const rawJobs = data.jobs || data || []
        setJobs(rawJobs.map(normalizeJob))
        setTotal(data.total ?? rawJobs.length)
        setPage(data.page ?? 1)
        setTotalPages(data.totalPages ?? 1)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [JSON.stringify(params)])

  return { jobs, loading, error, total, page, totalPages }
}

export function useFeaturedJobs() {
  return useJobs({ featured: 'true', limit: '3' })
}

export function useJob(slug: string | undefined) {
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) return
    setLoading(true)
    api.get(`/jobs/${slug}`)
      .then((res) => setJob(normalizeJob(res.data)))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  return { job, loading, error }
}

function getEmail(): string | null {
  try {
    const stored = sessionStorage.getItem('auth-email') || localStorage.getItem('auth-email')
    return stored
  } catch { return null }
}

export function useApplications(email?: string) {
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const e = email || getEmail()

  useEffect(() => {
    if (!e) { setLoading(false); return }
    setLoading(true)
    api.get('/applications', { params: { email: e } })
      .then((res) => {
        const data = res.data
        setApplications(Array.isArray(data) ? data : data.applications || [])
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [e])

  return { applications, loading, error }
}

export function useApplication(id: string | undefined) {
  const [application, setApplication] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const email = getEmail()

  useEffect(() => {
    if (!id) { setLoading(false); return }
    setLoading(true)
    api.get(`/applications/${id}`, { params: { email } })
      .then((res) => setApplication(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id, email])

  return { application, loading, error }
}

function isProfileComplete(user: any, profile?: any) {
  return {
    basicInfo: !!(user?.firstName && user?.lastName),
    resume: !!(profile?.resume?.fileUrl || profile?.resume?.isUploaded),
    englishTest: !!(profile?.englishTestScore || profile?.englishTestLevel),
    workExperience: !!(profile?.profile?.workExperience?.length > 0),
  }
}

function calcProfileProgress(completion: ReturnType<typeof isProfileComplete>): number {
  const fields = Object.values(completion)
  const completed = fields.filter(Boolean).length
  return Math.round((completed / fields.length) * 100)
}

const STALE_TIME = 30000

export function useDashboardData(email?: string) {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const lastFetch = useRef(0)
  const [profileData, setProfileData] = useState<any>(null)

  const e = email || getEmail()

  async function fetchDashboard() {
    if (!e) { setLoading(false); return }
    setLoading(true)
    lastFetch.current = Date.now()
    try {
      const [appsRes, profileRes, jobsRes, savedJobsRes] = await Promise.all([
        api.get('/applications', { params: { email: e } }).catch(() => ({ data: [] })),
        api.get('/users/profile', { params: { email: e } }).catch(() => ({ data: null })),
        api.get('/jobs', { params: { limit: '6' } }).catch(() => ({ data: { jobs: [] } })),
        fetchSavedJobs(e).catch(() => []),
      ])

      const apps = Array.isArray(appsRes.data) ? appsRes.data : appsRes.data?.applications || []
      const profile = profileRes.data
      const jobsData = jobsRes.data?.jobs || []
      const savedJobsData = Array.isArray(savedJobsRes) ? savedJobsRes : []

      if (profile) setProfileData(profile)

      const profileCompletion = isProfileComplete(profile, profile)
      const profileProgress = calcProfileProgress(profileCompletion)

      const interviewApps = apps.filter((a: any) => a.status === 'INTERVIEW' || a.status === 'interview')

      setData({
        user: profile,
        stats: {
          totalApplications: apps.length,
          savedJobsCount: savedJobsData.length,
          profileViews: profile?.viewsCount ?? 0,
          interviewRequests: interviewApps.length,
        },
        recentApplications: apps.slice(0, 5),
        currentJobs: jobsData,
        savedJobs: savedJobsData,
        profileCompletion,
        profileProgress,
      })
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDashboard() }, [e])

  useEffect(() => {
    const handleFocus = () => {
      if (Date.now() - lastFetch.current > STALE_TIME) {
        fetchDashboard()
      }
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [e])

  const needsProfileCompletion = data?.profileProgress != null && data.profileProgress < 100

  return { data, loading, error, refresh: fetchDashboard, profileData, needsProfileCompletion }
}

export function useConversations(email?: string) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const e = email || getEmail()

  async function fetchConversations() {
    if (!e) { setLoading(false); return }
    try {
      const res = await api.get('/messages', { params: { email: e } })
      const msgs: Message[] = Array.isArray(res.data) ? res.data : res.data.messages || []
      const grouped: Record<string, Conversation> = {}

      for (const msg of msgs) {
        const isOther = !msg.isOwn
        const other = isOther ? msg.sender : msg.receiver
        const key = String(other.id)
        if (!grouped[key]) {
          grouped[key] = {
            id: key,
            participantId: key,
            participantName: [other.firstName, other.lastName].filter(Boolean).join(' ') || 'Unknown',
            participantEmail: '',
            participantImage: other.profileImage,
            lastMessage: msg.content,
            lastMessageAt: msg.createdAt,
            unread: !msg.isOwn && !msg.readAt,
            messages: [],
          }
        }
        grouped[key].messages.push(msg)
        const msgTime = new Date(msg.createdAt).getTime()
        const currentLast = new Date(grouped[key].lastMessageAt).getTime()
        if (msgTime > currentLast) {
          grouped[key].lastMessage = msg.content
          grouped[key].lastMessageAt = msg.createdAt
        }
      }

      setConversations(
        Object.values(grouped).sort(
          (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
        )
      )
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchConversations() }, [e])

  return { conversations, loading, error, refresh: fetchConversations }
}

export function useSavedJobs(email?: string) {
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const e = email || getEmail()

  useEffect(() => {
    if (!e) { setLoading(false); return }
    setLoading(true)
    fetchSavedJobs(e)
      .then(setSavedJobs)
      .catch((err) => setError(err?.response?.data?.error || 'Failed to load saved jobs'))
      .finally(() => setLoading(false))
  }, [e])

  const toggleSave = async (jobId: number) => {
    const existing = savedJobs.find(sj => sj.jobId === jobId)
    try {
      if (existing) {
        await unsaveJob(jobId, e ?? undefined)
        setSavedJobs(prev => prev.filter(sj => sj.jobId !== jobId))
      } else {
        await saveJob(jobId, e ?? undefined)
        const newSaved = await fetchSavedJobs(e ?? undefined)
        setSavedJobs(newSaved)
      }
    } catch { /* silent */ }
  }

  const isSaved = (jobId: number) => savedJobs.some(sj => sj.jobId === jobId)

  return { savedJobs, loading, error, toggleSave, isSaved }
}

export function useRequestPasswordReset() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (email: string) => {
    setLoading(true)
    setError(null)
    setSent(false)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, sent, error }
}

export function useProfile(email?: string) {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const e = email || getEmail()

  useEffect(() => {
    if (!e) { setLoading(false); return }
    setLoading(true)
    api.get('/users/profile', { params: { email: e } })
      .then((res) => setProfile(res.data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [e])

  return { profile, setProfile, loading, error }
}

// ─── Company ──────────────────────────────────────────────────────────────

export function useCompanyProfile(email?: string) {
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const e = email || getEmail()

  const fetch = useCallback(async () => {
    if (!e) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await getCompanyProfile(e)
      setProfile(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [e])

  useEffect(() => { fetch() }, [fetch])

  const save = async (body: Partial<CompanyProfile>) => {
    setSaving(true)
    try {
      const res = await updateCompanyProfile(body)
      setProfile(res.profile)
      return res
    } finally {
      setSaving(false)
    }
  }

  return { profile, loading, error, saving, save, refresh: fetch }
}

export function useCompanyJobs(email?: string) {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const e = email || getEmail()

  const fetch = useCallback(async () => {
    if (!e) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await getCompanyJobs(e)
      setJobs(Array.isArray(data) ? data : [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [e])

  useEffect(() => { fetch() }, [fetch])

  return { jobs, loading, error, refresh: fetch }
}

// ─── Candidates ───────────────────────────────────────────────────────────

export function useCandidates(slug: string | undefined) {
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [jobTitle, setJobTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    if (!slug) { setLoading(false); return }
    setLoading(true)
    try {
      const data = await getJobCandidates(slug)
      setCandidates(data.candidates || [])
      setJobTitle(data.job?.title || '')
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [slug])

  useEffect(() => { fetch() }, [fetch])

  return { candidates, jobTitle, loading, error, refresh: fetch }
}

// ─── Job Metrics ──────────────────────────────────────────────────────────

export function useJobMetrics(slug: string | undefined) {
  const [metrics, setMetrics] = useState<JobMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!slug) { setLoading(false); return }
    setLoading(true)
    getJobMetrics(slug)
      .then(setMetrics)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [slug])

  return { metrics, loading, error }
}

// ─── Notifications ────────────────────────────────────────────────────────

export function useNotifications(_email?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getNotifications()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
      setTotal(data.total || 0)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch() }, [fetch])

  const markRead = async (ids: number[]) => {
    await markNotificationsRead(ids)
    setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
    setUnreadCount(prev => Math.max(0, prev - ids.length))
  }

  const markAllRead = async () => {
    await markAllNotificationsRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, total, loading, error, refresh: fetch, markRead, markAllRead }
}

// ─── Notification Preferences ─────────────────────────────────────────────

export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState<NotificationPrefs>({
    applicationUpdates: true,
    newMessages: true,
    jobAlerts: true,
    marketing: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    getNotificationPrefs()
      .then(setPrefs)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggle = async (key: keyof NotificationPrefs) => {
    const updated = { ...prefs, [key]: !prefs[key] }
    setPrefs(updated)
    setSaving(key)
    try {
      await updateNotificationPrefs(updated)
    } catch {
      setPrefs(prefs)
    } finally {
      setSaving(null)
    }
  }

  return { prefs, loading, saving, toggle }
}

// ─── Contact Form ─────────────────────────────────────────────────────────

export function useContactForm() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (input: { name: string; email: string; subject: string; message: string }) => {
    setLoading(true)
    setError(null)
    setSent(false)
    try {
      await submitContactForm(input)
      setSent(true)
    } catch (err: any) {
      setError(err?.response?.data?.error || err?.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return { submit, loading, sent, error }
}

// ─── Skills Search ────────────────────────────────────────────────────────

export function useSkillsSearch() {
  const [results, setResults] = useState<Skill[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')

  useEffect(() => {
    if (!query || query.length < 1) { setResults([]); return }
    const timer = setTimeout(() => {
      setLoading(true)
      searchSkills(query)
        .then(setResults)
        .catch(() => setResults([]))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  return { results, loading, query, setQuery }
}

// ─── Remote Jobs ──────────────────────────────────────────────────────────

export function useRemoteJobs(params?: { count?: number; geo?: string; industry?: string; tag?: string }) {
  const [jobs, setJobs] = useState<any[]>([])
  const [source, setSource] = useState<string>('none')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api.get('/jobs/remote', { params })
      .then((res) => {
        setJobs(res.data.jobs || [])
        setSource(res.data.source || 'none')
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [JSON.stringify(params)])

  return { jobs, source, loading, error }
}
