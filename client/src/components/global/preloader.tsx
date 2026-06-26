'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface PreloaderProps {
  onLoadingComplete?: () => void
}

export function Preloader({ onLoadingComplete }: PreloaderProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer)
          return 100
        }
        const increment = Math.random() * 15 + 5
        return Math.min(prev + increment, 100)
      })
    }, 200)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    if (progress >= 100) {
      const timeout = setTimeout(() => {
        setIsLoading(false)
        onLoadingComplete?.()
      }, 500)
      return () => clearTimeout(timeout)
    }
  }, [progress, onLoadingComplete])

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background"
        >
          <div className="relative mb-8 flex flex-col items-center gap-4">
            <img src="/logo.png" alt="LoftCommunity" width={64} height={64} className="object-contain" />
            <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent">
              LoftCommunity
            </div>
          </div>
          <div className="w-64 h-1.5 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-muted-foreground text-sm mt-4">Loading...</p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
