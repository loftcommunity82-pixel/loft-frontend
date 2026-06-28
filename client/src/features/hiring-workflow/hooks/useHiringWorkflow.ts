import { useState, useEffect, useCallback } from 'react'
import {
  Application,
  HiringStage,
  WorkflowMetrics,
  TimelineEntry,
  StageConfig,
} from '../types'
import {
  getApplications,
  getApplication,
  updateApplicationStatus,
  submitApplication,
  generateApplicationTimeline,
  STAGE_CONFIG,
} from '../services/hiringService'
import { USE_JSON_DATA } from '@/lib/config'
import {
  getApplicationsForJobFromJson,
  getApplicationFromJson,
  updateApplicationStatusInJson,
} from '@/lib/json-service'

interface UseHiringWorkflowProps {
  jobId?: number
  applicationId?: number
}

interface UseHiringWorkflowState {
  applications: Application[]
  currentApplication: Application | null
  timeline: TimelineEntry[]
  metrics: WorkflowMetrics | null
  loading: boolean
  error: string | null
}

export function useHiringWorkflow({ jobId, applicationId }: UseHiringWorkflowProps = {}) {
  const [state, setState] = useState<UseHiringWorkflowState>({
    applications: [],
    currentApplication: null,
    timeline: [],
    metrics: null,
    loading: true,
    error: null,
  })

  const fetchApplications = useCallback(async () => {
    if (!jobId) return
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const applications = USE_JSON_DATA
        ? await getApplicationsForJobFromJson(jobId)
        : await getApplications(jobId)
      setState(prev => ({
        ...prev,
        applications,
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch applications',
      }))
    }
  }, [jobId])

  const fetchApplication = useCallback(async () => {
    if (!applicationId) return
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const application: Application = USE_JSON_DATA
        ? (await getApplicationFromJson(applicationId)) as any
        : await getApplication(applicationId)
      if (!application) throw new Error('Application not found')
      const timeline = generateApplicationTimeline(application)
      setState(prev => ({
        ...prev,
        currentApplication: application,
        timeline,
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch application',
      }))
    }
  }, [applicationId])

  const transitionStage = useCallback(async (
    appId: number,
    newStatus: string,
    notes?: string
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const updated = USE_JSON_DATA
        ? await updateApplicationStatusInJson(appId, newStatus, notes)
        : await updateApplicationStatus(appId, newStatus, notes)
      const timeline = generateApplicationTimeline(updated)
      setState(prev => ({
        ...prev,
        currentApplication: updated,
        timeline,
        applications: prev.applications.map(app =>
          app.id === appId ? updated : app
        ),
        loading: false,
      }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update status',
      }))
    }
  }, [])

  const applyToJob = useCallback(async (data: {
    jobId: number
    coverLetter?: string
    resumeUrl?: string
  }) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const application = await submitApplication(data)
      setState(prev => ({
        ...prev,
        currentApplication: application,
        applications: [...prev.applications, application],
        loading: false,
      }))
      return application
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to submit application',
      }))
      throw error
    }
  }, [])

  useEffect(() => {
    if (jobId) {
      fetchApplications()
    } else if (applicationId) {
      fetchApplication()
    }
  }, [jobId, applicationId, fetchApplications, fetchApplication])

  const getStageConfig = useCallback((): StageConfig[] => {
    return Object.entries(STAGE_CONFIG).map(([key, value]) => ({
      id: key as HiringStage,
      name: value.name,
      description: value.description,
      status: 'pending' as const,
      order: value.order,
    }))
  }, [])

  const getCurrentStage = useCallback((): HiringStage | null => {
    if (!state.currentApplication) return null
    const statusMap: Record<string, HiringStage> = {
      PENDING: 'APPLICATIONS_RECEIVED',
      REVIEWING: 'RESUME_SCREENING',
      SHORTLISTED: 'HR_INTERVIEW',
      INTERVIEW: 'TECHNICAL_INTERVIEW',
      OFFERED: 'OFFER_LETTER',
      HIRED: 'HIRING',
    }
    return statusMap[state.currentApplication.status] || null
  }, [state.currentApplication])

  const getApplicationsByStatus = useCallback((status: string) => {
    return state.applications.filter(app => app.status === status)
  }, [state.applications])

  return {
    ...state,
    fetchApplications,
    fetchApplication,
    transitionStage,
    applyToJob,
    getStageConfig,
    getCurrentStage,
    getApplicationsByStatus,
  }
}

interface UseApplicationTimelineProps {
  application: Application
}

interface UseApplicationTimelineState {
  timeline: TimelineEntry[]
  currentStage: HiringStage
  progress: number
}

export function useApplicationTimeline({ application }: UseApplicationTimelineProps) {
  const [state, setState] = useState<UseApplicationTimelineState>({
    timeline: [],
    currentStage: 'JOB_APPLICATION',
    progress: 0,
  })

  useEffect(() => {
    const timeline = generateApplicationTimeline(application)
    const currentIndex = timeline.findIndex(t => t.status === 'current')
    const progress = currentIndex >= 0 ? Math.round(((currentIndex + 1) / timeline.length) * 100) : 0

    const statusMap: Record<string, HiringStage> = {
      PENDING: 'APPLICATIONS_RECEIVED',
      REVIEWING: 'RESUME_SCREENING',
      SHORTLISTED: 'HR_INTERVIEW',
      INTERVIEW: 'TECHNICAL_INTERVIEW',
      OFFERED: 'OFFER_LETTER',
      HIRED: 'HIRING',
    }

    setState({
      timeline,
      currentStage: statusMap[application.status] || 'JOB_APPLICATION',
      progress,
    })
  }, [application])

  return state
}
