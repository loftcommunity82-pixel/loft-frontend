import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useRef } from 'react'

interface ThreeDCardProps {
  children: React.ReactNode
  className?: string
  containerClassName?: string
}

export function ThreeDCard({ children, className = '', containerClassName = '' }: ThreeDCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const mouseXSpring = useSpring(x)
  const mouseYSpring = useSpring(y)
  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['17deg', '-17deg'])
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-17deg', '17deg'])

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    const mouseX = e.clientX - rect.left
    const mouseY = e.clientY - rect.top
    x.set(mouseX / width - 0.5)
    y.set(mouseY / height - 0.5)
  }

  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <div ref={ref} onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className={`flex items-center justify-center ${containerClassName}`}>
      <motion.div style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }} className={className}>
        {children}
      </motion.div>
    </div>
  )
}
