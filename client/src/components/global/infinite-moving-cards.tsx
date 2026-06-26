import { useEffect, useState, useRef } from 'react'

interface InfiniteMovingCardsProps {
  items: { name: string; title: string; quote: string }[]
  direction?: 'left' | 'right'
  speed?: 'fast' | 'normal' | 'slow'
  pauseOnHover?: boolean
  className?: string
}

export function InfiniteMovingCards({
  items, direction = 'left', speed = 'fast', pauseOnHover = true, className = '',
}: InfiniteMovingCardsProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const scrollerRef = useRef<HTMLUListElement>(null)
  const [start, setStart] = useState(false)

  useEffect(() => {
    if (scrollerRef.current) {
      const firstChild = scrollerRef.current.children[0]
      if (firstChild) {
        const scrollerContent = Array.from(scrollerRef.current.children)
        scrollerContent.forEach((item) => {
          const duplicatedItem = item.cloneNode(true)
          scrollerRef.current?.appendChild(duplicatedItem)
        })
      }
      getDirection()
      getSpeed()
      setStart(true)
    }
  }, [])

  const getDirection = () => {
    if (containerRef.current) {
      containerRef.current.style.setProperty('--animation-direction', direction === 'left' ? 'forwards' : 'reverse')
    }
  }

  const getSpeed = () => {
    if (containerRef.current) {
      const durations = { fast: '20s', normal: '40s', slow: '80s' }
      containerRef.current.style.setProperty('--animation-duration', durations[speed])
    }
  }

  return (
    <div ref={containerRef} className={`scroller relative z-20 max-w-7xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_20%,white_80%,transparent)] ${className}`}>
      <ul ref={scrollerRef} className={`flex min-w-full shrink-0 gap-4 py-4 w-max flex-nowrap ${start ? 'animate-scroll' : ''}`}
        style={start ? { animation: 'scroll var(--animation-duration, 40s) linear infinite var(--animation-direction, forwards)' } : {}}>
        {items.map((item, idx) => (
          <li key={idx} className="w-[350px] max-w-full relative rounded-2xl border border-border bg-card px-6 py-6 shrink-0"
            style={pauseOnHover ? {} : {}}>
            <blockquote>
              <div className="relative z-20 mt-2 flex flex-col gap-1">
                <span className="text-sm leading-[1.6] text-foreground font-normal">{item.quote}</span>
                <span className="text-sm font-semibold text-foreground mt-4">{item.name}</span>
                <span className="text-sm text-muted-foreground">{item.title}</span>
              </div>
            </blockquote>
          </li>
        ))}
      </ul>
    </div>
  )
}
