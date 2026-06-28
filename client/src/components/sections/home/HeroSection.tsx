import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, MapPin, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useReveal } from '@/hooks/useReveal'
import { useAmbient } from '@/hooks/useAmbient'
import { useReducedMotion } from '@/hooks/useReducedMotion'

const stats = [
  { value: '50K+', label: 'Active Jobs' },
  { value: '10K+', label: 'Companies' },
  { value: '100K+', label: 'Hired' },
]

export default function HeroSection() {
  const navigate = useNavigate()
  const { ref, variants } = useReveal<HTMLDivElement>()
  const { orbs } = useAmbient()
  const reduced = useReducedMotion()
  const [searchQuery, setSearchQuery] = useState('')
  const [locationQuery, setLocationQuery] = useState('')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set('search', searchQuery.trim())
    if (locationQuery.trim()) params.set('location', locationQuery.trim())
    navigate(`/jobs${params.toString() ? '?' + params.toString() : ''}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-neutral-950">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {orbs.map((orb, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: orb.size,
              height: orb.size,
              background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
              left: orb.x,
              top: orb.y,
            }}
            animate={{
              x: reduced ? 0 : [0, 30, -20, 0],
              y: reduced ? 0 : [0, -30, 20, 0],
            }}
            transition={{
              duration: orb.duration,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: orb.delay,
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 opacity-[0.04]">
        <img
          src="/images/Hero%20Background.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden
        />
      </div>

      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="container px-4 md:px-6 relative z-10" ref={ref}>
        <motion.div variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="flex flex-col items-center text-center space-y-8">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Badge variant="default" className="px-4 py-1.5 text-sm border border-emerald-500/20">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Trusted by 10,000+ Job Seekers
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-white max-w-5xl leading-[1.1]"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            Find Your{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-emerald-600">
              Dream Job
            </span>
            <br />
            Today
          </motion.h1>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-neutral-400 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            Connect with top employers, showcase your skills, and land your perfect opportunity.
            Your career journey starts here.
          </motion.p>

          <motion.div
            className="w-full max-w-3xl mt-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <div className="flex flex-col sm:flex-row gap-3 p-2 sm:p-3 bg-black/60 backdrop-blur-2xl border border-white/[0.08] rounded-2xl">
              <div className="flex items-center flex-1 gap-3 px-3 sm:px-4 h-12 sm:h-auto">
                <Search className="h-5 w-5 text-neutral-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-neutral-500 text-sm sm:text-base"
                />
              </div>
              <div className="hidden sm:block h-8 w-px bg-white/[0.08] my-auto" />
              <div className="flex items-center flex-1 gap-3 px-3 sm:px-4 h-12 sm:h-auto">
                <MapPin className="h-5 w-5 text-neutral-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Location or remote"
                  value={locationQuery}
                  onChange={(e) => setLocationQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-white placeholder:text-neutral-500 text-sm sm:text-base"
                />
              </div>
              <Button size="lg" onClick={handleSearch} className="bg-emerald-600 hover:bg-emerald-700 text-white h-12 sm:h-auto w-full sm:w-auto">
                <Search className="h-4 w-4 sm:hidden mr-2" />
                Search Jobs
              </Button>
            </div>
          </motion.div>

          <motion.div
            className="flex flex-wrap justify-center gap-6 sm:gap-10 md:gap-16 mt-8 sm:mt-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-neutral-500 mt-1">{stat.label}</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 w-full sm:w-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <Button size="xl" onClick={() => navigate('/jobs')} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 w-full sm:w-auto">
              <Sparkles className="h-5 w-5" />
              Find Jobs
            </Button>
            <Button size="xl" variant="outline" onClick={() => navigate('/login?type=employer')} className="border-white/10 text-white hover:bg-white/5 gap-2 w-full sm:w-auto">
              Post a Job
              <ArrowRight className="h-5 w-5" />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
