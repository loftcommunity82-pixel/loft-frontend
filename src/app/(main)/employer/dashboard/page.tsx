'use client'

import { useAuthContext } from '@/providers/auth-provider'
import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Briefcase, Users, Plus, Loader2, Pencil, Eye, XCircle, Trash2, Send } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

export default function EmployerDashboardPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [company, setCompany] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchData = useCallback(() => {
    if (!user?.email) return
    setLoading(true)
    Promise.all([
      fetch(`/api/companies/jobs?email=${user.email}`).then(r => r.json()),
      fetch(`/api/companies/profile?email=${user.email}`).then(r => r.json()),
    ]).then(([jobsData, companyData]) => {
      setJobs(jobsData || [])
      setCompany(companyData)
      setLoading(false)
    }).catch(() => {
      setLoading(false)
    })
  }, [user])

  useEffect(() => { fetchData() }, [fetchData])

  const totalApplicants = jobs.reduce((acc: number, j: any) => acc + (j.applicantsCount || j.applicationsCount || 0), 0)
  const activeJobs = jobs.filter((j: any) => j.status === 'PUBLISHED').length
  const draftJobs = jobs.filter((j: any) => j.status === 'DRAFT')
  const publishedJobs = jobs.filter((j: any) => j.status === 'PUBLISHED')
  const closedJobs = jobs.filter((j: any) => j.status === 'CLOSED')

  const handleStatusChange = async (jobId: number, newStatus: string) => {
    try {
      const email = user?.email
      const res = await fetch(`/api/jobs/${jobId}?email=${email}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        toast.success(`Job ${newStatus === 'PUBLISHED' ? 'published' : newStatus === 'CLOSED' ? 'closed' : 'updated'} successfully!`)
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to update job status')
      }
    } catch {
      toast.error('Failed to update job status')
    }
  }

  const handleDelete = async (jobId: number) => {
    if (!confirm('Are you sure you want to delete this job?')) return
    try {
      const email = user?.email
      const res = await fetch(`/api/jobs/${jobId}?email=${email}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Job deleted successfully!')
        fetchData()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to delete job')
      }
    } catch {
      toast.error('Failed to delete job')
    }
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      PUBLISHED: 'default',
      DRAFT: 'secondary',
      CLOSED: 'outline',
    }
    return (
      <Badge variant={variants[status] || 'secondary'} className={status === 'PUBLISHED' ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : ''}>
        {status}
      </Badge>
    )
  }

  const renderJobCard = (job: any) => (
    <Card key={job.id} className="bg-card border">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-foreground font-semibold">{job.title}</h3>
              {getStatusBadge(job.status)}
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {job.applicantsCount || job.applicationsCount || 0} applicants &middot; Created {formatDate(job.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Link href={`/employer/jobs/${job.id}/edit`}>
              <Button variant="outline" size="sm">
                <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
              </Button>
            </Link>
            <Link href={`/employer/jobs/${job.id}/candidates`}>
              <Button variant="outline" size="sm">
                <Eye className="w-3.5 h-3.5 mr-1.5" /> View Candidates
              </Button>
            </Link>
            {job.status === 'DRAFT' && (
              <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/10" onClick={() => handleStatusChange(job.id, 'PUBLISHED')}>
                <Send className="w-3.5 h-3.5 mr-1.5" /> Publish
              </Button>
            )}
            {job.status === 'PUBLISHED' && (
              <Button variant="outline" size="sm" onClick={() => handleStatusChange(job.id, 'CLOSED')}>
                <XCircle className="w-3.5 h-3.5 mr-1.5" /> Close
              </Button>
            )}
            {job.status === 'CLOSED' && (
              <Button variant="outline" size="sm" className="border-emerald-600 text-emerald-400 hover:bg-emerald-600/10" onClick={() => handleStatusChange(job.id, 'PUBLISHED')}>
                <Send className="w-3.5 h-3.5 mr-1.5" /> Reopen
              </Button>
            )}
            <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(job.id)}>
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderEmptyState = (message: string) => (
    <Card className="bg-card border">
      <CardContent className="p-6 text-center">
        <p className="text-muted-foreground">{message}</p>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-bold text-foreground">Employer Dashboard</h1>
          <Link href="/jobs/create">
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Post Job
            </Button>
          </Link>
        </div>

        {!company && (
          <Card className="bg-card border mb-8">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground mb-4">Complete your company profile to post jobs</p>
              <Link href="/employer/company">
                <Button>Create Company Profile</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-card border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Briefcase className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{jobs.length}</p>
                  <p className="text-muted-foreground">Total Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Users className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{totalApplicants}</p>
                  <p className="text-muted-foreground">Total Applicants</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <Briefcase className="w-8 h-8 text-emerald-400" />
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeJobs}</p>
                  <p className="text-muted-foreground">Active Jobs</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="bg-card">
            <TabsTrigger value="active">Active ({publishedJobs.length})</TabsTrigger>
            <TabsTrigger value="drafts">Drafts ({draftJobs.length})</TabsTrigger>
            <TabsTrigger value="closed">Closed ({closedJobs.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-4 space-y-4">
            {publishedJobs.length === 0 ? renderEmptyState('No active jobs. Publish a draft to get started.') : publishedJobs.map(renderJobCard)}
          </TabsContent>

          <TabsContent value="drafts" className="mt-4 space-y-4">
            {draftJobs.length === 0 ? renderEmptyState('No draft jobs. Create a new job to save as draft.') : draftJobs.map(renderJobCard)}
          </TabsContent>

          <TabsContent value="closed" className="mt-4 space-y-4">
            {closedJobs.length === 0 ? renderEmptyState('No closed jobs.') : closedJobs.map(renderJobCard)}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
