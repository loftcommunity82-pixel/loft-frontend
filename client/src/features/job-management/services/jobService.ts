import api from '@/lib/api'
import { formatSalary } from '@/lib/mappers'
import type {
  JobWithRelations,
  JobSummary,
  JobMetrics,
  JobCategory,
  CreateJobPayload,
  UpdateJobPayload,
  JobFilters,
} from '../types'

export async function getEmployerJobs(filters?: JobFilters): Promise<JobSummary[]> {
  const params: Record<string, string> = {}
  if (filters?.status) params.status = filters.status
  if (filters?.jobType) params.jobType = filters.jobType
  if (filters?.experienceLevel) params.experienceLevel = filters.experienceLevel
  if (filters?.workMode) params.workMode = filters.workMode
  if (filters?.search) params.search = filters.search

  const { data } = await api.get('/jobs/employer', { params })
  return data
}

export async function getJob(jobId: number): Promise<JobWithRelations> {
  const { data } = await api.get(`/jobs/${jobId}`)
  return data
}

export async function createJob(payload: CreateJobPayload): Promise<JobWithRelations> {
  const { data } = await api.post('/jobs', payload)
  return data
}

export async function updateJob(jobId: number, payload: UpdateJobPayload): Promise<JobWithRelations> {
  const { data } = await api.patch(`/jobs/${jobId}`, payload)
  return data
}

export async function publishJob(jobId: number): Promise<JobWithRelations> {
  return updateJob(jobId, { status: 'PUBLISHED' })
}

export async function closeJob(jobId: number): Promise<JobWithRelations> {
  return updateJob(jobId, { status: 'CLOSED' })
}

export async function deleteJob(jobId: number): Promise<void> {
  await api.delete(`/jobs/${jobId}`)
}

export async function toggleFeatured(jobId: number, isFeatured: boolean): Promise<JobWithRelations> {
  return updateJob(jobId, { isFeatured })
}

export async function getJobMetrics(jobId: number): Promise<JobMetrics> {
  const { data } = await api.get(`/jobs/${jobId}/metrics`)
  return data
}

export async function getJobCategories(): Promise<JobCategory[]> {
  const { data } = await api.get('/job-categories')
  return data
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function formatSalaryRange(
  min?: number,
  max?: number,
  currency: string = 'USD',
  period: string = 'YEARLY'
): string {
  if (!min && !max) return 'Not specified'

  const formatted = formatSalary(min ?? null, max ?? null, currency)
  if (!formatted) return 'Not specified'

  const periodLabel: Record<string, string> = {
    HOURLY: '/hr',
    WEEKLY: '/wk',
    MONTHLY: '/mo',
    YEARLY: '/yr',
  }

  return `${formatted}${periodLabel[period] ?? ''}`
}
