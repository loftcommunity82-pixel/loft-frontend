import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { cn } from '@/lib/utils'

interface ScrollSplitCardProps {
  children: React.ReactNode
  className?: string
}

export function ScrollSplitCard({ children, className }: ScrollSplitCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.8, 1, 0.8])
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0.3, 1, 1, 0.3])
  const y = useTransform(scrollYProgress, [0, 0.5, 1], [100, 0, -100])

  return (
    <motion.div ref={ref} style={{ scale, opacity, y }} className={cn('rounded-xl', className)}>
      {children}
    </motion.div>
  )
}
