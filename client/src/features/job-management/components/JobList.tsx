import { useState } from 'react'
import { motion } from 'framer-motion'
import { JobSummary, JobStatus, JobType, WorkMode, ExperienceLevel, JOB_TYPE_LABELS, WORK_MODE_LABELS, EXPERIENCE_LEVEL_LABELS } from '../types'
import { JobCard } from './JobCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  Search,
  SlidersHorizontal,
  Plus,
  LayoutGrid,
  List,
  ChevronDown,
  Briefcase
} from 'lucide-react'

interface JobListProps {
  jobs: JobSummary[]
  onJobClick?: (job: JobSummary) => void
  onEditJob?: (job: JobSummary) => void
  onDeleteJob?: (job: JobSummary) => void
  onToggleFeatured?: (jobId: number, isFeatured: boolean) => void
  onCreateJob?: () => void
  loading?: boolean
  className?: string
}

const statusFilters: { value: JobStatus | 'ALL'; label: string }[] = [
  { value: 'ALL', label: 'All Jobs' },
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'CLOSED', label: 'Closed' },
]

const jobTypeFilters = ['', ...Object.keys(JOB_TYPE_LABELS)]
const workModeFilters = ['', ...Object.keys(WORK_MODE_LABELS)]
const experienceFilters = ['', ...Object.keys(EXPERIENCE_LEVEL_LABELS)]

export function JobList({
  jobs,
  onJobClick,
  onEditJob,
  onDeleteJob,
  onToggleFeatured,
  onCreateJob,
  loading = false,
  className,
}: JobListProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobStatus | 'ALL'>('ALL')
  const [typeFilter, setTypeFilter] = useState<JobType | ''>('')
  const [workModeFilter, setWorkModeFilter] = useState<WorkMode | ''>('')
  const [experienceFilter, setExperienceFilter] = useState<ExperienceLevel | ''>('')
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = !searchQuery ||
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'ALL' || job.status === statusFilter
    const matchesType = !typeFilter || job.jobType === typeFilter
    const matchesWorkMode = !workModeFilter || job.workMode === workModeFilter
    const matchesExperience = !experienceFilter || job.experienceLevel === experienceFilter

    return matchesSearch && matchesStatus && matchesType && matchesWorkMode && matchesExperience
  })

  const statusCounts = jobs.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const clearFilters = () => {
    setSearchQuery('')
    setStatusFilter('ALL')
    setTypeFilter('')
    setWorkModeFilter('')
    setExperienceFilter('')
  }

  const hasActiveFilters = searchQuery || statusFilter !== 'ALL' || typeFilter || workModeFilter || experienceFilter

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-muted border-border text-foreground"
          />
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-border text-muted-foreground"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 bg-emerald-500/20 text-emerald-400">
                Active
              </Badge>
            )}
            <ChevronDown className={cn('w-4 h-4 ml-2 transition-transform', showFilters && 'rotate-180')} />
          </Button>

          {onCreateJob && (
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Post Job
            </Button>
          )}

          <div className="flex border border-border rounded-lg overflow-hidden">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-none',
                viewMode === 'grid' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              )}
              onClick={() => setViewMode('grid')}
            >
              <LayoutGrid className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                'rounded-none',
                viewMode === 'list' ? 'bg-muted text-foreground' : 'text-muted-foreground'
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {showFilters && (
        <div className="flex flex-col gap-4 p-4 bg-muted/50 rounded-lg">
          <div>
            <label className="text-sm text-muted-foreground mb-2 block">Status</label>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map(filter => (
                <Button
                  key={filter.value}
                  variant={statusFilter === filter.value ? 'default' : 'outline'}
                  size="sm"
                  className={statusFilter === filter.value
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'border-border text-muted-foreground'
                  }
                  onClick={() => setStatusFilter(filter.value)}
                >
                  {filter.label}
                  {filter.value !== 'ALL' && statusCounts[filter.value] !== undefined && (
                    <Badge variant="secondary" className="ml-1 bg-muted">
                      {statusCounts[filter.value]}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Job Type</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value as JobType | '')}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground"
              >
                <option value="">All Types</option>
                {jobTypeFilters.filter(Boolean).map(type => (
                  <option key={type} value={type}>
                    {JOB_TYPE_LABELS[type] || type}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Work Mode</label>
              <select
                value={workModeFilter}
                onChange={(e) => setWorkModeFilter(e.target.value as WorkMode | '')}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground"
              >
                <option value="">All Modes</option>
                {workModeFilters.filter(Boolean).map(mode => (
                  <option key={mode} value={mode}>
                    {WORK_MODE_LABELS[mode] || mode}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Experience</label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value as ExperienceLevel | '')}
                className="w-full bg-muted border border-border rounded-md px-3 py-2 text-foreground"
              >
                <option value="">All Levels</option>
                {experienceFilters.filter(Boolean).map(level => (
                  <option key={level} value={level}>
                    {EXPERIENCE_LEVEL_LABELS[level] || level}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center">
        <p className="text-muted-foreground text-sm">
          {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
          {hasActiveFilters && ' found'}
        </p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12">
          <Briefcase className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <p className="text-muted-foreground">No jobs found</p>
          {hasActiveFilters && (
            <Button
              variant="link"
              className="text-emerald-400 mt-2"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <JobCard
                job={job}
                onClick={() => onJobClick?.(job)}
                onEdit={() => onEditJob?.(job)}
                onDelete={() => onDeleteJob?.(job)}
                onToggleFeatured={(isFeatured) => onToggleFeatured?.(job.id, isFeatured)}
              />
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredJobs.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <JobCard
                job={job}
                onClick={() => onJobClick?.(job)}
                onEdit={() => onEditJob?.(job)}
                onDelete={() => onDeleteJob?.(job)}
                onToggleFeatured={(isFeatured) => onToggleFeatured?.(job.id, isFeatured)}
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

export default JobList
