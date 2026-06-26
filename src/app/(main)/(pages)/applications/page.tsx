'use client'

import { useEffect, useState } from 'react'
import { useAuthContext } from '@/providers/auth-provider'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Briefcase, MapPin, Clock, FileText, ArrowRight, Loader2, AlertCircle } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

interface Application {
  id: number
  jobId: number
  status: string
  coverLetter: string
  appliedAt: string
  reviewedAt: string
  interviewAt: string
  job: {
    id: number
    title: string
    slug: string
    location: string
    city: string
    jobType: string
    company: { companyName: string; companyLogo: string; city: string }
  }
}

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400',
  REVIEWING: 'bg-blue-500/20 text-blue-400',
  SHORTLISTED: 'bg-purple-500/20 text-purple-400',
  INTERVIEW: 'bg-emerald-500/20 text-emerald-400',
  OFFERED: 'bg-green-500/20 text-green-400',
  HIRED: 'bg-emerald-500/20 text-emerald-400',
  REJECTED: 'bg-red-500/20 text-red-400',
  WITHDRAWN: 'bg-neutral-500/20 text-muted-foreground',
}

const jobTypeLabels: Record<string, string> = {
  FULL_TIME: 'Full Time', PART_TIME: 'Part Time', CONTRACT: 'Contract',
  INTERNSHIP: 'Internship', TEMPORARY: 'Temporary', FREELANCE: 'Freelance',
}

export default function ApplicationsPage() {
  const { user, status } = useAuthContext()
  const router = useRouter()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth')
      return
    }

    async function fetchApplications() {
      try {
        const res = await fetch('/api/applications')
        if (res.status === 401) {
          router.push('/auth')
          return
        }
        if (!res.ok) throw new Error('Failed to fetch applications')
        const data = await res.json()
        setApplications(data)
      } catch (err) {
        if (err instanceof Error && err.message.includes('401')) {
          router.push('/auth')
          return
        }
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }
    fetchApplications()
  }, [status, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Applications</h1>
            <p className="text-muted-foreground mt-1">{applications.length} application{applications.length !== 1 ? 's' : ''} submitted</p>
          </div>
          <Link href="/jobs">
            <Button className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
              <Briefcase className="w-4 h-4 mr-2" /> Browse Jobs
            </Button>
          </Link>
        </div>

        {applications.length === 0 ? (
          <Card className="bg-card border">
            <CardContent className="p-12 text-center">
              <div className="relative w-48 h-48 mx-auto mb-4">
                <Image
                  src="/images/No%20Applications.png"
                  alt="No applications yet"
                  fill
                  className="object-contain"
                />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">No Applications Yet</h3>
              <p className="text-muted-foreground mb-6">Start applying to jobs that match your skills</p>
              <Link href="/jobs">
                <Button className="bg-emerald-600 hover:bg-emerald-700">Browse Jobs</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <Link key={app.id} href={`/applications/${app.id}`}>
                <Card className="bg-card/50 border hover:border-emerald-500/50 transition-all cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-foreground">{app.job.title}</h3>
                          <Badge className={`${statusColors[app.status] || 'bg-neutral-500/20 text-muted-foreground'}`}>
                            {app.status}
                          </Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{app.job.company?.companyName}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {app.job.location || app.job.city || 'Remote'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="w-3 h-3" /> {jobTypeLabels[app.job.jobType] || app.job.jobType}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {new Date(app.appliedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground ml-4" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
