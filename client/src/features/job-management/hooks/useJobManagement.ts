import { useState, useEffect, useCallback } from 'react'
import { createLogger } from '@/lib/logger'
import type {
  JobSummary,
  JobWithRelations,
  JobMetrics,
  JobCategory,
  CreateJobPayload,
  UpdateJobPayload,
  JobFilters,
} from '../types'
import {
  getEmployerJobs,
  getJob,
  createJob,
  updateJob,
  publishJob,
  closeJob,
  deleteJob,
  toggleFeatured,
  getJobMetrics,
  getJobCategories,
} from '../services/jobService'

const log = createLogger('useJobManagement')

interface UseJobManagementState {
  jobs: JobSummary[]
  currentJob: JobWithRelations | null
  metrics: JobMetrics | null
  categories: JobCategory[]
  loading: boolean
  error: string | null
}

export function useJobManagement(filters?: JobFilters) {
  const [state, setState] = useState<UseJobManagementState>({
    jobs: [],
    currentJob: null,
    metrics: null,
    categories: [],
    loading: true,
    error: null,
  })

  const fetchJobs = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const jobs = await getEmployerJobs(filters)
      setState(prev => ({ ...prev, jobs, loading: false }))
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch jobs',
      }))
    }
  }, [filters])

  const fetchCategories = useCallback(async () => {
    try {
      const categories = await getJobCategories()
      setState(prev => ({ ...prev, categories }))
    } catch (error) {
      log.error('Failed to fetch categories', error)
    }
  }, [])

  const fetchJob = useCallback(async (jobId: number) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const job = await getJob(jobId)
      setState(prev => ({ ...prev, currentJob: job, loading: false }))
      return job
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch job',
      }))
      throw error
    }
  }, [])

  const addJob = useCallback(async (data: CreateJobPayload) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const job = await createJob(data)
      setState(prev => ({
        ...prev,
        jobs: [...prev.jobs, job as unknown as JobSummary],
        currentJob: job as unknown as JobWithRelations,
        loading: false,
      }))
      return job
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to create job',
      }))
      throw error
    }
  }, [])

  const editJob = useCallback(async (jobId: number, data: UpdateJobPayload) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    try {
      const job = await updateJob(jobId, data)
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === jobId ? job as unknown as JobSummary : j),
        currentJob: job as unknown as JobWithRelations,
        loading: false,
      }))
      return job
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Failed to update job',
      }))
      throw error
    }
  }, [])

  const publish = useCallback(async (jobId: number) => {
    try {
      const job = await publishJob(jobId)
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === jobId ? job as unknown as JobSummary : j),
      }))
      return job
    } catch (error) {
      throw error
    }
  }, [])

  const close = useCallback(async (jobId: number) => {
    try {
      const job = await closeJob(jobId)
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === jobId ? job as unknown as JobSummary : j),
      }))
      return job
    } catch (error) {
      throw error
    }
  }, [])

  const removeJob = useCallback(async (jobId: number) => {
    try {
      await deleteJob(jobId)
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.filter(j => j.id !== jobId),
      }))
    } catch (error) {
      throw error
    }
  }, [])

  const setFeatured = useCallback(async (jobId: number, isFeatured: boolean) => {
    try {
      const job = await toggleFeatured(jobId, isFeatured)
      setState(prev => ({
        ...prev,
        jobs: prev.jobs.map(j => j.id === jobId ? job as unknown as JobSummary : j),
      }))
      return job
    } catch (error) {
      throw error
    }
  }, [])

  useEffect(() => {
    fetchJobs()
    fetchCategories()
  }, [fetchJobs, fetchCategories])

  return {
    ...state,
    fetchJobs,
    fetchJob,
    addJob,
    editJob,
    publish,
    close,
    deleteJob: removeJob,
    setFeatured,
  }
}

export function useJobMetrics(jobId: number) {
  const [metrics, setMetrics] = useState<JobMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getJobMetrics(jobId)
      setMetrics(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics')
    } finally {
      setLoading(false)
    }
  }, [jobId])

  useEffect(() => {
    if (jobId) {
      fetchMetrics()
    }
  }, [jobId, fetchMetrics])

  return { metrics, loading, error, refetch: fetchMetrics }
}
