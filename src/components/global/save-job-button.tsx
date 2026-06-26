'use client'

import { useState } from 'react'
import { Bookmark, Loader2 } from 'lucide-react'
import { useAuthContext } from '@/providers/auth-provider'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface SaveJobButtonProps {
  jobId: number
  initiallySaved?: boolean
  className?: string
}

export function SaveJobButton({ jobId, initiallySaved = false, className = '' }: SaveJobButtonProps) {
  const { user } = useAuthContext()
  const [saved, setSaved] = useState(initiallySaved)
  const [loading, setLoading] = useState(false)

  if (!user) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <button
              className={`text-muted-foreground hover:text-foreground transition-colors cursor-default ${className}`}
              aria-label="Sign in to save jobs"
              tabIndex={-1}
            >
              <Bookmark className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Sign in to save jobs</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  const toggle = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/users/saved-jobs', {
        method: saved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      })
      if (res.ok) setSaved(!saved)
    } catch {} finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`transition-colors ${
        saved ? 'text-emerald-400' : 'text-muted-foreground hover:text-foreground'
      } ${className}`}
      aria-label={saved ? 'Remove from saved jobs' : 'Save job'}
    >
      {loading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : (
        <Bookmark className={`w-5 h-5 ${saved ? 'fill-emerald-400' : ''}`} />
      )}
    </button>
  )
}
