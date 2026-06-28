import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import {
  useHiringWorkflow,
  ApplicationCard,
  ApplicationList,
  StageCard,
} from '@/features/hiring-workflow'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { Application, ApplicationStatus, HiringStage } from '@/features/hiring-workflow/types'
import { cn } from '@/lib/utils'
import { createLogger } from '@/lib/logger'
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Code,
  Mail,
  Loader2
} from 'lucide-react'
import { useCompanyJobs, useJobMetrics } from '@/lib/api-hooks'
import { toggleShortlist } from '@/lib/api'
import { USE_JSON_DATA } from '@/lib/config'
import { toggleShortlistInJson } from '@/lib/json-service'

const log = createLogger('hiring-workflow')

interface JobOption {
  id: number
  title: string
}

export default function HiringWorkflowPage() {
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null)
  const [activeTab, setActiveTab] = useState<'pipeline' | 'applications' | 'stages'>('pipeline')
  const [selectedJobId, setSelectedJobId] = useState<number | null>(null)

  const { jobs: rawJobs } = useCompanyJobs()
  const jobs: JobOption[] = Array.isArray(rawJobs) ? rawJobs.map((j: any) => ({ id: j.id, title: j.title })) : []
  const { metrics } = useJobMetrics(selectedJobId?.toString())

  const {
    applications,
    loading,
    error,
    transitionStage,
  } = useHiringWorkflow({ jobId: selectedJobId || undefined })

  const initialJobSet = useRef(false)

  if (jobs.length > 0 && !initialJobSet.current && !selectedJobId) {
    initialJobSet.current = true
    setSelectedJobId(jobs[0].id)
  }

  const getCountByStatus = (status: ApplicationStatus) =>
    applications.filter(app => app.status === status).length

  const workflowStages: HiringStage[] = [
    'JOB_APPLICATION',
    'APPLICATIONS_RECEIVED',
    'RESUME_SCREENING',
    'HR_INTERVIEW',
    'SKILLS_TEST',
    'TECHNICAL_INTERVIEW',
    'BEHAVIORAL_INTERVIEW',
    'FINAL_HIRING_MANAGER',
    'BACKGROUND_CHECKS',
    'OFFER_LETTER',
    'HIRING',
    'ONBOARDING',
  ]

  const metricsCards = metrics ? [
    { title: 'Total Applications', value: metrics.totalApplications.toString(), change: '+0%', icon: <Users className="w-5 h-5" />, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { title: 'In Review', value: metrics.reviewingApplications.toString(), change: '+0%', icon: <Clock className="w-5 h-5" />, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    { title: 'Interviewing', value: metrics.interviewingApplications.toString(), change: '+0%', icon: <User className="w-5 h-5" />, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { title: 'Hired', value: metrics.hiredApplications.toString(), change: '+0%', icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  ] : [
    { title: 'Total Applications', value: '0', change: '-', icon: <Users className="w-5 h-5" />, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
    { title: 'In Review', value: '0', change: '-', icon: <Clock className="w-5 h-5" />, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
    { title: 'Interviewing', value: '0', change: '-', icon: <User className="w-5 h-5" />, color: 'text-purple-400', bgColor: 'bg-purple-500/10' },
    { title: 'Hired', value: '0', change: '-', icon: <CheckCircle className="w-5 h-5" />, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  ]

  const [shortlisted, setShortlisted] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (applications.length > 0) {
      setShortlisted(
        Object.fromEntries(applications.map(app => [app.id, app.isShortlisted ?? false]))
      )
    }
  }, [applications])

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await transitionStage(id, status)
    } catch (err) {
      log.error('Failed to update status', err)
    }
  }

  const toggleShortlistHandler = async (appId: number) => {
    const newValue = !shortlisted[appId]
    setShortlisted(prev => ({ ...prev, [appId]: newValue }))
    try {
      if (USE_JSON_DATA) {
        await toggleShortlistInJson(appId, newValue)
      } else {
        await toggleShortlist(appId, newValue)
      }
    } catch (err) {
      setShortlisted(prev => ({ ...prev, [appId]: !newValue }))
      log.error('Failed to toggle shortlist', err)
    }
  }

  return (
    <>
      <div className="bg-card border-b border">
        <div className="container px-4 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Hiring Workflow</h1>
              <p className="text-muted-foreground">Manage your hiring pipeline from application to onboarding</p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <select
                value={selectedJobId?.toString() || ''}
                onChange={(e) => setSelectedJobId(parseInt(e.target.value))}
                className="w-full max-w-[280px] bg-muted border border text-foreground rounded-md px-3 py-2 text-sm"
              >
                <option value="" disabled>Select a job...</option>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id.toString()}>{job.title}</option>
                ))}
              </select>
              <Link to="/jobs/create">
                <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Post New Job
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container px-4 py-8">
        {!selectedJobId ? (
          <Card className="bg-card border">
            <CardContent className="p-12 text-center">
              <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl text-foreground font-semibold mb-2">Select a Job</h3>
              <p className="text-muted-foreground">Choose a job posting above to view its hiring pipeline</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {metricsCards.map((metric, index) => (
                <motion.div
                  key={metric.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="bg-card/50 border">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className={cn('p-3 rounded-lg', metric.bgColor)}>
                          <span className={metric.color}>{metric.icon}</span>
                        </div>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">
                          {metric.change}
                        </Badge>
                      </div>
                      <div className="mt-4">
                        <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                        <p className="text-sm text-muted-foreground">{metric.title}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            <div className="flex gap-2 mb-6 border-b border overflow-x-auto">
              {[
                { id: 'pipeline', label: 'Pipeline' },
                { id: 'applications', label: 'Applications' },
                { id: 'stages', label: 'Stages' },
              ].map((tab) => (
                <Button
                  key={tab.id}
                  variant="ghost"
                  className={cn(
                    'rounded-none border-b-2 -mb-px',
                    activeTab === tab.id
                      ? 'border-emerald-500 text-foreground'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                >
                  {tab.label}
                </Button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
              </div>
            ) : error ? (
              <div className="text-center py-10">
                <p className="text-red-400">{error}</p>
              </div>
            ) : (
              <>
                {activeTab === 'pipeline' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                      {[
                        { status: 'PENDING' as ApplicationStatus, stage: 'APPLICATIONS_RECEIVED' as HiringStage, label: 'Applications', icon: <FileText className="w-4 h-4" /> },
                        { status: 'REVIEWING' as ApplicationStatus, stage: 'RESUME_SCREENING' as HiringStage, label: 'Screening', icon: <Clock className="w-4 h-4" /> },
                        { status: 'SHORTLISTED' as ApplicationStatus, stage: 'HR_INTERVIEW' as HiringStage, label: 'HR Interview', icon: <User className="w-4 h-4" /> },
                        { status: 'INTERVIEW' as ApplicationStatus, stage: 'TECHNICAL_INTERVIEW' as HiringStage, label: 'Technical', icon: <Code className="w-4 h-4" /> },
                        { status: 'OFFERED' as ApplicationStatus, stage: 'OFFER_LETTER' as HiringStage, label: 'Offer', icon: <Mail className="w-4 h-4" /> },
                        { status: 'HIRED' as ApplicationStatus, stage: 'HIRING' as HiringStage, label: 'Hired', icon: <CheckCircle className="w-4 h-4" /> },
                      ].map((column, index) => {
                        const count = getCountByStatus(column.status)
                        const columnApps = applications.filter(app => app.status === column.status)

                        return (
                          <motion.div
                            key={column.status}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <Card className="bg-card/30 border">
                              <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-muted-foreground">{column.icon}</span>
                                    <CardTitle className="text-sm text-foreground/80">{column.label}</CardTitle>
                                  </div>
                                  <Badge variant="secondary" className="bg-muted">{count}</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="space-y-2">
                                {columnApps.map((app) => (
                                  <div
                                    key={app.id}
                                    className="p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors group"
                                    onClick={() => setSelectedApplication(app)}
                                  >
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm text-foreground truncate">{app.job?.title || 'Candidate'}</p>
                                      <button
                                        onClick={(e) => { e.stopPropagation(); toggleShortlistHandler(app.id) }}
                                        className={cn(
                                          "opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded",
                                          shortlisted[app.id] ? "text-yellow-400" : "text-muted-foreground hover:text-yellow-400"
                                        )}
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={shortlisted[app.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                        </svg>
                                      </button>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Score: {app.englishTestScore || 'N/A'}
                                    </p>
                                  </div>
                                ))}
                                {count === 0 && (
                                  <p className="text-sm text-muted-foreground text-center py-4">No applications</p>
                                )}
                              </CardContent>
                            </Card>
                          </motion.div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'applications' && (
                  <ApplicationList
                    applications={applications}
                    onApplicationClick={(app) => setSelectedApplication(app)}
                    onStatusChange={(id, status) => handleStatusChange(id, status)}
                  />
                )}

                {activeTab === 'stages' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workflowStages.map((stage, index) => {
                      const count =
                        index < 2 ? applications.length :
                        index < 3 ? getCountByStatus('SHORTLISTED') + getCountByStatus('REVIEWING') :
                        index < 5 ? getCountByStatus('INTERVIEW') :
                        index < 10 ? getCountByStatus('OFFERED') :
                        getCountByStatus('HIRED')

                      return (
                        <StageCard
                          key={stage}
                          stage={stage}
                          status={index < 3 ? 'completed' : index === 3 ? 'current' : 'pending'}
                          applicationCount={count}
                          date={new Date()}
                        />
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setSelectedApplication(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative bg-card border border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {selectedApplication.job?.title || 'Application'}
                  </h2>
                  <p className="text-muted-foreground">Application ID: #{selectedApplication.id}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedApplication(null)}>
                  <XCircle className="w-5 h-5 text-muted-foreground" />
                </Button>
              </div>

              <ApplicationCard application={selectedApplication} showActions={false} className="border-0 bg-transparent" />

              <div className="flex gap-2 mt-6 pt-4 border-t border">
                {selectedApplication.status !== 'HIRED' && selectedApplication.status !== 'REJECTED' && (
                  <Button
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => {
                      const nextStatus: Record<string, string> = {
                        PENDING: 'REVIEWING',
                        REVIEWING: 'SHORTLISTED',
                        SHORTLISTED: 'INTERVIEW',
                        INTERVIEW: 'OFFERED',
                        OFFERED: 'HIRED',
                      }
                      const next = nextStatus[selectedApplication.status]
                      if (next) handleStatusChange(selectedApplication.id, next)
                    }}
                  >
                    Advance Stage
                  </Button>
                )}
                <Button
                  variant="outline"
                  className={shortlisted[selectedApplication.id] ? "border-yellow-600 text-yellow-400" : "border"}
                  onClick={() => toggleShortlistHandler(selectedApplication.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill={shortlisted[selectedApplication.id] ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  {shortlisted[selectedApplication.id] ? 'Shortlisted' : 'Shortlist'}
                </Button>
                {selectedApplication.status !== 'REJECTED' && selectedApplication.status !== 'HIRED' && (
                  <Button
                    variant="outline"
                    className="border-red-700 text-red-400 hover:bg-red-950"
                    onClick={() => handleStatusChange(selectedApplication.id, 'REJECTED')}
                  >
                    Reject
                  </Button>
                )}
                <Button variant="outline" className="border" onClick={() => {
                  const note = prompt('Add a note for this application:')
                  if (note?.trim()) {
                    log.info('Notes feature - note captured', { applicationId: selectedApplication.id, note })
                  }
                }}>Add Notes</Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </>
  )
}