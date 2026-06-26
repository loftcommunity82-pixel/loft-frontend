'use client'

import { useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, DollarSign, ArrowRight, Briefcase, Code, BarChart } from 'lucide-react'
import Link from 'next/link'
import { ScrollSplitCard } from '@/components/ui/scroll-split-card'

const featuredJobs = [
  {
    id: 1,
    title: 'Senior Software Engineer',
    company: 'TechCorp Inc.',
    location: 'San Francisco, CA',
    type: 'Full Time',
    salary: '$120k - $180k',
    posted: '2 days ago',
    tags: ['React', 'Node.js', 'TypeScript'],
    featured: true,
  },
  {
    id: 2,
    title: 'Product Designer',
    company: 'DesignHub',
    location: 'Remote',
    type: 'Full Time',
    salary: '$90k - $140k',
    posted: '1 day ago',
    tags: ['Figma', 'UI/UX', 'Design Systems'],
    featured: true,
  },
  {
    id: 3,
    title: 'Data Scientist',
    company: 'DataMinds',
    location: 'New York, NY',
    type: 'Full Time',
    salary: '$130k - $170k',
    posted: '3 days ago',
    tags: ['Python', 'ML', 'TensorFlow'],
    featured: false,
  },
]

const jobIcons = [Code, Briefcase, BarChart]
const jobColors = ['#0a4d3b', '#1e3a5f', '#3b1f4e']

const scrollCards = featuredJobs.map((job, i) => {
  const Icon = jobIcons[i]
  return {
    title: job.title,
    description: `${job.company}  ·  ${job.location}  ·  ${job.salary}`,
    bgColor: jobColors[i],
    textColor: '#ffffff',
    icon: <Icon className="h-7 w-7 sm:h-8 sm:w-8 opacity-80" />,
    href: `/jobs/${job.id}`,
    content: (
      <Link href={`/jobs/${job.id}`} className="flex flex-col h-full">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <div className="p-2 sm:p-2.5 rounded-lg bg-black/20 border border-white/10">
            <Icon className="h-4 w-4 sm:h-5 sm:w-5 opacity-90" />
          </div>
          {job.featured && (
            <Badge className="bg-emerald-500/30 text-emerald-300 border-0 text-[10px] sm:text-xs px-1.5 sm:px-2 py-0">
              Featured
            </Badge>
          )}
        </div>
        <h3 className="text-sm sm:text-xl font-semibold leading-tight mb-0.5">
          {job.title}
        </h3>
        <p className="text-[11px] sm:text-sm opacity-70 mb-2 sm:mb-3">{job.company}</p>
        <div className="flex flex-wrap gap-1 mb-2 sm:mb-3">
          {job.tags.map((tag) => (
            <span
              key={tag}
              className="text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 rounded-full bg-black/20 border border-white/10 opacity-80"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex flex-col gap-0.5 sm:gap-1 text-[10px] sm:text-xs opacity-60 mb-auto">
          <span className="flex items-center gap-1 sm:gap-1.5">
            <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {job.location}
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5">
            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {job.posted}
          </span>
          <span className="flex items-center gap-1 sm:gap-1.5">
            <DollarSign className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
            {job.salary}
          </span>
        </div>
        <Button className="w-full bg-white/15 hover:bg-white/25 text-white border-0 mt-2 sm:mt-3 text-[10px] sm:text-xs h-7 sm:h-9 rounded-md">
          Apply Now
        </Button>
      </Link>
    ),
  }
})

export function FeaturedJobs() {
  const scrollRef = useRef<HTMLDivElement>(null)

  return (
    <section className="w-full bg-neutral-950">
      <div className="container px-4 md:px-6 pt-16 sm:pt-20 pb-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
              Featured Jobs
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base">
              Scroll to explore featured opportunities
            </p>
          </div>
          <Link href="/jobs" className="shrink-0">
            <Button variant="outline" className="border-neutral-700 text-white hover:bg-neutral-800 w-full sm:w-auto text-xs sm:text-sm">
              View All Jobs
              <ArrowRight className="ml-1.5 sm:ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <div
        ref={scrollRef}
        className="relative h-screen w-full overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      >
        <ScrollSplitCard
          containerRef={scrollRef}
          cards={scrollCards}
        />
      </div>
    </section>
  )
}
