import type { ApplicationStatus } from '@/lib/types'

export type JobStatus = 'DRAFT' | 'PUBLISHED' | 'CLOSED' | 'ARCHIVED'
export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP' | 'TEMPORARY'
export type ExperienceLevel = 'ENTRY' | 'JUNIOR' | 'MID' | 'SENIOR' | 'LEAD' | 'EXECUTIVE'
export type WorkMode = 'ONSITE' | 'REMOTE' | 'HYBRID'
export type SalaryPeriod = 'HOURLY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface CreateJobPayload {
  title: string
  description: string
  requirements?: string
  benefits?: string
  jobType: JobType
  experienceLevel: ExperienceLevel
  workMode: WorkMode
  location?: string
  city?: string
  country?: string
  remoteWork?: boolean
  salaryMin?: number
  salaryMax?: number
  salaryCurrency?: string
  salaryPeriod?: SalaryPeriod
  isSalaryVisible?: boolean
  requiredSkills?: string[]
  preferredSkills?: string[]
  applicationUrl?: string
  applicationEmail?: string
  deadline?: Date
  categoryId?: number
}

export interface UpdateJobPayload extends Partial<CreateJobPayload> {
  status?: JobStatus
  isFeatured?: boolean
  isActive?: boolean
}

export interface JobWithRelations {
  id: number
  title: string
  slug: string
  description: string
  requirements?: string
  benefits?: string
  jobType: JobType
  experienceLevel: ExperienceLevel
  workMode: WorkMode
  location?: string
  city?: string
  country?: string
  remoteWork: boolean
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  salaryPeriod: SalaryPeriod
  isSalaryVisible: boolean
  requiredSkills: string[]
  preferredSkills: string[]
  status: JobStatus
  isFeatured: boolean
  isActive: boolean
  applicationUrl?: string
  applicationEmail?: string
  deadline?: Date
  viewsCount: number
  applicationsCount: number
  employerId: string
  categoryId?: number
  createdAt: Date
  updatedAt: Date
  publishedAt?: Date
  closedAt?: Date
  applications?: JobApplicationSummary[]
  category?: JobCategory
}

export interface JobSummary {
  id: number
  title: string
  slug: string
  jobType: JobType
  experienceLevel: ExperienceLevel
  workMode: WorkMode
  location?: string
  remoteWork: boolean
  salaryMin?: number
  salaryMax?: number
  salaryCurrency: string
  status: JobStatus
  isFeatured: boolean
  isActive: boolean
  viewsCount: number
  applicationsCount: number
  createdAt: Date
  publishedAt?: Date
}

export interface JobCategory {
  id: number
  name: string
  slug: string
  description?: string
  icon?: string
}

export interface JobApplicationSummary {
  id: number
  userId: string
  status: ApplicationStatus
  appliedAt: Date
  englishTestScore?: number
  passedScreening?: boolean
}

export interface JobMetrics {
  jobId: number
  totalViews: number
  totalApplications: number
  pendingApplications: number
  interviewingApplications: number
  offeredApplications: number
  hiredApplications: number
  rejectedApplications: number
  averageTimeToReview: number
  conversionRate: number
}

export interface JobFormValues extends CreateJobPayload {
  isSalaryVisible: boolean
  remoteWork: boolean
  isFeatured: boolean
}

export interface JobFilters {
  status?: JobStatus
  jobType?: JobType
  experienceLevel?: ExperienceLevel
  workMode?: WorkMode
  search?: string
}

export const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: 'Full Time',
  PART_TIME: 'Part Time',
  CONTRACT: 'Contract',
  INTERNSHIP: 'Internship',
  TEMPORARY: 'Temporary',
}

export const EXPERIENCE_LEVEL_LABELS: Record<string, string> = {
  ENTRY: 'Entry Level',
  JUNIOR: 'Junior',
  MID: 'Mid-Level',
  SENIOR: 'Senior',
  LEAD: 'Lead',
  EXECUTIVE: 'Executive',
}

export const WORK_MODE_LABELS: Record<string, string> = {
  ONSITE: 'On-site',
  REMOTE: 'Remote',
  HYBRID: 'Hybrid',
}

export const JOB_STATUS_LABELS: Record<string, string> = {
  DRAFT: 'Draft',
  PUBLISHED: 'Published',
  CLOSED: 'Closed',
  ARCHIVED: 'Archived',
}
