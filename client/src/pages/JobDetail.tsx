import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, MapPin, Briefcase, Clock, DollarSign, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import PageShell from '@/components/layout/PageShell'
import SaveJobButton from '@/components/sections/jobs/SaveJobButton'
import ApplyJobModal from '@/components/modals/ApplyJobModal'
import { useJob } from '@/lib/api-hooks'
import { useAuth } from '@/providers/AuthProvider'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { displayJobType, displayExperience, displayWorkMode, formatSalary, formatRelativeTime } from '@/lib/mappers'
import api from '@/lib/api'
import { toast } from 'sonner'

export default function JobDetail() {
  const { slug } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const reduced = useReducedMotion()
  const { job, loading, error } = useJob(slug)
  const [showApply, setShowApply] = useState(false)
  const [applying, setApplying] = useState(false)

  async function handleApply(data: { jobId?: number; coverLetter: string; resumeUrl?: string }) {
    if (!isAuthenticated) {
      navigate('/login')
      return
    }
    setApplying(true)
    try {
      await api.post(`/jobs/${slug}/apply`, { email: user?.email, coverLetter: data.coverLetter, resumeUrl: data.resumeUrl })
      toast.success('Application submitted!')
      setShowApply(false)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to apply')
    } finally {
      setApplying(false)
    }
  }

  if (loading) {
    return (
      <PageShell>
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-400" />
        </div>
      </PageShell>
    )
  }

  if (error || !job) {
    return (
      <PageShell>
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
          <p className="text-neutral-400 mb-4">{error || 'Job not found'}</p>
          <Link to="/jobs">
            <Button variant="outline"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Jobs</Button>
          </Link>
        </div>
      </PageShell>
    )
  }

  return (
    <PageShell>
      <div className="container px-4 md:px-6 py-16 sm:py-20 max-w-4xl mx-auto">
        <motion.div initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Link to="/jobs" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </Link>

          <Card className="mb-8">
            <CardContent className="p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-xl bg-neutral-800 flex items-center justify-center overflow-hidden shrink-0">
                    {job.company?.companyLogo ? (
                      <img src={job.company.companyLogo} alt={job.company.companyName} className="w-full h-full object-cover" />
                    ) : (
                      <img
                        src="/images/Company%20Avatar%20Placeholder.png"
                        alt=""
                        className="w-full h-full object-cover opacity-60"
                      />
                    )}
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">{job.title}</h1>
                    <p className="text-neutral-400">{job.company?.companyName}</p>
                    <div className="flex flex-wrap gap-3 mt-3">
                      <Badge variant="default">{displayJobType(job.jobType)}</Badge>
                      <Badge variant="outline">{displayExperience(job.experienceLevel)}</Badge>
                      <Badge variant="outline">{displayWorkMode(job.workMode)}</Badge>
                      {job.isFeatured && <Badge variant="featured">Featured</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <SaveJobButton jobId={job.id} />
                  <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" onClick={() => setShowApply(true)} disabled={!isAuthenticated}>
                    <Send className="h-4 w-4 mr-2" /> Apply Now
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] mb-6">
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <MapPin className="h-4 w-4 text-emerald-400" />
                  <span>{job.location || job.city || 'Remote'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-neutral-400">
                  <Briefcase className="h-4 w-4 text-emerald-400" />
                  <span>{displayJobType(job.jobType)}</span>
                </div>
                {job.publishedAt && (
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <Clock className="h-4 w-4 text-emerald-400" />
                    <span>{formatRelativeTime(job.publishedAt)}</span>
                  </div>
                )}
                {formatSalary(job.salaryMin, job.salaryMax) && (
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <DollarSign className="h-4 w-4 text-emerald-400" />
                    <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3">Description</h3>
                <p className="text-neutral-300 leading-relaxed whitespace-pre-line">{job.description}</p>
              </div>

              {job.requirements && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-3">Requirements</h3>
                  <p className="text-neutral-300 leading-relaxed whitespace-pre-line">{job.requirements}</p>
                </div>
              )}

              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-3">Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s, i) => (
                      <Badge key={i} variant="outline">{s}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <ApplyJobModal
        isOpen={showApply}
        onClose={() => setShowApply(false)}
        job={job}
        onSubmit={handleApply}
        isSubmitting={applying}
      />
    </PageShell>
  )
}
