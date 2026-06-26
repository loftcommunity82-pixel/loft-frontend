import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface ContainerScrollProps {
  children: React.ReactNode
  className?: string
}

export function ContainerScroll({ children, className = '' }: ContainerScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })

  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0.5])
  const y = useTransform(scrollYProgress, [0, 1], [0, -50])

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <motion.div style={{ scale, opacity, y }} className="sticky top-0">
        {children}
      </motion.div>
    </div>
  )
}
