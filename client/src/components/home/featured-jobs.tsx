import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MapPin, Briefcase, ArrowRight } from 'lucide-react'

interface FeaturedJob {
  id: number
  title: string
  slug: string
  company: { companyName: string; companyLogo: string | null }
  location: string
  city: string
  jobType: string
  workMode: string
  salaryMin: number | null
  salaryMax: number | null
  skills: string[]
}

export function FeaturedJobs() {
  const [jobs, setJobs] = useState<FeaturedJob[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/jobs?limit=6&featured=true')
      .then(r => r.json())
      .then(data => {
        setJobs(data.jobs || data || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return null

  return (
    <section className="py-16 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-foreground">Featured Jobs</h2>
          <p className="text-muted-foreground mt-2">Discover top opportunities from leading companies</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <Link key={job.id} to={`/jobs/${job.slug}`}>
              <Card className="bg-card border hover:border-emerald-500/50 transition-colors h-full">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {job.company?.companyName?.charAt(0) || 'C'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company?.companyName}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <MapPin className="w-3 h-3" />
                    <span>{job.city || job.location || 'Remote'}</span>
                    <span>•</span>
                    <Briefcase className="w-3 h-3" />
                    <span>{job.jobType?.replace('_', ' ')}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(job.skills || []).slice(0, 3).map((skill, i) => (
                      <Badge key={i} variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-xs">{skill}</Badge>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-emerald-400">
                      {job.salaryMin && job.salaryMax ? `$${job.salaryMin.toLocaleString()} - $${job.salaryMax.toLocaleString()}` : job.salaryMin ? `From $${job.salaryMin.toLocaleString()}` : 'Salary not specified'}
                    </span>
                    <Button variant="ghost" size="sm" className="text-emerald-400">
                      Apply <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {jobs.length > 0 && (
          <div className="text-center mt-8">
            <Link to="/jobs">
              <Button variant="outline" className="border-emerald-600 text-emerald-400">
                View All Jobs <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
