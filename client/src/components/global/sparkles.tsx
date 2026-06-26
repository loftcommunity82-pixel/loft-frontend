import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'

interface SparklesProps {
  id?: string
  background?: string
  minSize?: number
  maxSize?: number
  particleDensity?: number
  className?: string
  particleColor?: string
}

interface Particle {
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

export const SparklesCore = ({ id = 'sparkles', background = 'transparent', minSize = 0.4, maxSize = 1, particleDensity = 100, className = '', particleColor = '#FFF' }: SparklesProps) => {
  const [particles, setParticles] = useState<Particle[]>([])

  useEffect(() => {
    const generatedParticles: Particle[] = Array.from({ length: particleDensity }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * (maxSize - minSize) + minSize,
      opacity: Math.random() * 0.5 + 0.1,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    }))
    setParticles(generatedParticles)
  }, [minSize, maxSize, particleDensity])

  return (
    <div id={id} className={`relative ${className}`} style={{ background }}>
      {particles.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size,
            backgroundColor: particleColor,
          }}
          animate={{
            opacity: [particle.opacity, particle.opacity * 2, particle.opacity],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: particle.duration,
            delay: particle.delay,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

export function Sparkles({ children, ...props }: SparklesProps & { children?: React.ReactNode }) {
  return (
    <div className="relative">
      <SparklesCore {...props} />
      {children && <div className="relative z-10">{children}</div>}
    </div>
  )
}
