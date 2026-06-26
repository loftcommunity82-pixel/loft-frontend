import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ConnectParallaxProps {
  children: React.ReactNode
  baseVelocity?: number
  className?: string
}

export function ConnectParallax({ children, baseVelocity = -5, className = '' }: ConnectParallaxProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })

  const x = useTransform(scrollYProgress, [0, 1], [0, baseVelocity * 20])

  return (
    <div ref={ref} className={`overflow-hidden ${className}`}>
      <motion.div style={{ x }} className="flex whitespace-nowrap">
        {children}
      </motion.div>
    </div>
  )
}
