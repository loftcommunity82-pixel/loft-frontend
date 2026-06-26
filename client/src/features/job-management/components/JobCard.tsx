import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { JobSummary, JOB_TYPE_LABELS, WORK_MODE_LABELS, JOB_STATUS_LABELS } from '../types'
import { formatSalaryRange } from '../services/jobService'
import { cn } from '@/lib/utils'
import {
  MapPin,
  Eye,
  Users,
  Clock,
  Edit,
  Trash2,
  Star,
  ExternalLink,
  Globe,
  Briefcase
} from 'lucide-react'

interface JobCardProps {
  job: JobSummary
  onClick?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggleFeatured?: (isFeatured: boolean) => void
  className?: string
}

const statusColors: Record<string, { bg: string; text: string; border: string }> = {
  DRAFT: { bg: 'bg-neutral-500/10', text: 'text-muted-foreground', border: 'border-neutral-500/30' },
  PUBLISHED: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  CLOSED: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30' },
  ARCHIVED: { bg: 'bg-yellow-500/10', text: 'text-yellow-400', border: 'border-yellow-500/30' },
}

export function JobCard({
  job,
  onClick,
  onEdit,
  onDelete,
  onToggleFeatured,
  className,
}: JobCardProps) {
  const status = statusColors[job.status] || statusColors.DRAFT
  const salary = formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          'bg-card/50 border-border hover:border-emerald-500/30 transition-all cursor-pointer',
          className
        )}
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {job.isFeatured && (
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                )}
                <CardTitle className="text-lg text-foreground">
                  {job.title}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Briefcase className="w-4 h-4" />
                {JOB_TYPE_LABELS[job.jobType] || job.jobType}
                {job.workMode && (
                  <>
                    <span>•</span>
                    <Globe className="w-4 h-4" />
                    {WORK_MODE_LABELS[job.workMode] || job.workMode}
                  </>
                )}
              </div>
            </div>
            <Badge className={cn('border', status.bg, status.text, status.border)}>
              {JOB_STATUS_LABELS[job.status] || job.status}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <MapPin className="w-4 h-4" />
            {job.remoteWork ? (
              <span className="text-emerald-400">Remote</span>
            ) : (
              job.location || 'Location not specified'
            )}
          </div>

          {salary !== 'Not specified' && (
            <div className="text-emerald-400 font-medium text-sm">
              {salary}
            </div>
          )}

          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1 text-muted-foreground">
              <Eye className="w-4 h-4" />
              <span>{job.viewsCount} views</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{job.applicationsCount} applications</span>
            </div>
            <div className="flex items-center gap-1 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{new Date(job.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border">
            {onEdit && (
              <Button
                size="sm"
                variant="outline"
                className="border-border"
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit()
                }}
              >
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onToggleFeatured && (
              <Button
                size="sm"
                variant="outline"
                className={cn(
                  'border-border',
                  job.isFeatured && 'text-yellow-400 border-yellow-400/30'
                )}
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleFeatured(!job.isFeatured)
                }}
              >
                <Star className={cn('w-4 h-4', job.isFeatured && 'fill-yellow-400')} />
              </Button>
            )}
            {onDelete && (
              <Button
                size="sm"
                variant="outline"
                className="border-border text-red-400 hover:text-red-300"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete()
                }}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
            {job.status === 'PUBLISHED' && (
              <Button
                size="sm"
                variant="outline"
                className="border-border ml-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="w-4 h-4 mr-1" />
                View
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default JobCard
