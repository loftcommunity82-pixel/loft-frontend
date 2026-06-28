import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Search, MapPin, Briefcase, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import PageShell from '@/components/layout/PageShell'
import SaveJobButton from '@/components/sections/jobs/SaveJobButton'
import JobListSkeleton from '@/components/skeletons/JobListSkeleton'
import { useJobs } from '@/lib/api-hooks'
import { useReducedMotion } from '@/hooks/useReducedMotion'
import { displayJobType, formatSalary, formatRelativeTime } from '@/lib/mappers'

export default function BrowseJobs() {
  const reduced = useReducedMotion()
  const [searchParams] = useSearchParams()
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [type, setType] = useState('')
  const [displayCount, setDisplayCount] = useState(12)
  const location = searchParams.get('location') || ''
  const { jobs, loading } = useJobs({ search, location, jobType: type })

  const filtered = jobs.filter((job) => {
    const q = search.toLowerCase()
    const matchSearch = !search || job.title.toLowerCase().includes(q) || (job.company?.companyName || '').toLowerCase().includes(q)
    const matchLocation = !location || (job.location || '').toLowerCase().includes(location.toLowerCase())
    const matchType = !type || job.jobType === type
    return matchSearch && matchLocation && matchType
  })

  const visible = filtered.slice(0, displayCount)
  const hasMore = filtered.length > displayCount

  return (
    <PageShell>
      <div className="container px-4 md:px-6 py-16 sm:py-20">
        <motion.div initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Browse Jobs</h1>
            <p className="text-neutral-400 max-w-xl mx-auto">Find your next opportunity from top companies</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-500" />
              <Input
                placeholder="Search jobs or companies..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-10 min-h-[44px] rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-white min-w-[140px]"
              aria-label="Filter by job type"
            >
              <option value="">All Types</option>
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="CONTRACT">Contract</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          {loading ? (
            <JobListSkeleton />
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <img
                src="/images/No%20Jobs.png"
                alt="No jobs found"
                className="w-48 h-48 object-contain mx-auto mb-4 opacity-60"
              />
              <p className="text-neutral-400 mb-2">No jobs found matching your criteria</p>
              <p className="text-sm text-neutral-500 mb-6">Try adjusting your search or filters</p>
              <Button
                variant="outline"
                onClick={() => { setSearch(''); setType(''); setDisplayCount(12) }}
                className="border-white/10"
              >
                Clear Filters
              </Button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
                {visible.map((job, i) => (
                  <motion.div
                    key={job.id}
                    initial={reduced ? { opacity: 1 } : { opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ delay: reduced ? 0 : i * 0.05 }}
                  >
                    <Link to={`/jobs/${job.slug}`}>
                      <Card className="h-full hover:border-emerald-500/30 transition-all duration-300 group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center overflow-hidden">
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
                            <div className="flex items-center gap-1">
                              <SaveJobButton jobId={job.id} />
                              {job.isFeatured && <Badge variant="featured">Featured</Badge>}
                            </div>
                          </div>
                          <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors mb-1">{job.title}</h3>
                          <p className="text-sm text-neutral-400 mb-3">{job.company?.companyName}</p>
                          <div className="flex flex-wrap gap-3 text-xs text-neutral-500">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {job.location}
                            </span>
                            <span className="flex items-center gap-1">
                              <Briefcase className="h-3 w-3" />
                              {displayJobType(job.jobType)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between mt-3">
                            {formatSalary(job.salaryMin, job.salaryMax) && (
                              <p className="text-sm text-emerald-400 font-medium">{formatSalary(job.salaryMin, job.salaryMax)}</p>
                            )}
                            {job.publishedAt && (
                              <p className="text-xs text-neutral-500">{formatRelativeTime(job.publishedAt)}</p>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
              {hasMore && (
                <div className="flex justify-center mt-10">
                  <Button
                    variant="outline"
                    onClick={() => setDisplayCount(filtered.length)}
                    className="border-white/10 text-white gap-2 px-8"
                  >
                    <ChevronDown className="h-4 w-4" />
                    Show All ({filtered.length} jobs)
                  </Button>
                </div>
              )}
            </>
          )}
        </motion.div>
      </div>
    </PageShell>
  )
}
