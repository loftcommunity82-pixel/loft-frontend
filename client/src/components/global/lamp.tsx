import { motion } from 'framer-motion'

interface LampProps {
  children?: React.ReactNode
  className?: string
}

export function Lamp({ children, className = '' }: LampProps) {
  return (
    <div className={`relative flex min-h-[40vh] flex-col items-center justify-center overflow-hidden bg-background w-full ${className}`}>
      <div className="relative flex w-full flex-1 items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: '15rem' }}
          animate={{ opacity: 1, width: '30rem' }}
          transition={{ duration: 2, ease: 'easeOut' }}
          style={{ transform: 'translateX(-50%)' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[0.75rem] w-[30rem] rounded-full bg-emerald-500/20 blur-[10rem]"
        />
        <motion.div
          initial={{ opacity: 0, width: '8rem' }}
          animate={{ opacity: 0.9, width: '16rem' }}
          transition={{ duration: 2, ease: 'easeOut', delay: 0.5 }}
          style={{ transform: 'translateX(-50%)' }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[0.3rem] w-[16rem] rounded-full bg-emerald-400 blur-[5rem]"
        />
        <div className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-1/2 bg-emerald-400/20 [mask-image:radial-gradient(ellipse_at_center,black,transparent)]" />
      </div>
      {children && <div className="relative z-10 -mt-20">{children}</div>}
    </div>
  )
}
