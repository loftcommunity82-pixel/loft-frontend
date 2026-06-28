import { motion } from 'framer-motion'
import { Linkedin, Twitter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { useReveal, useStaggerReveal } from '@/hooks/useReveal'

const team = [
  {
    name: 'James Mitchell',
    role: 'CEO & Founder',
    image: '/team/Ceo.png',
    bio: 'Former executive at Fortune 500 HR tech companies with 20+ years building talent platforms.',
  },
  {
    name: 'Marcus Williams',
    role: 'CTO',
    image: '/team/CTO.png',
    bio: 'Distinguished engineer who scaled SaaS platforms to millions of users across the globe.',
  },
  {
    name: 'Keisha Thomas',
    role: 'Lead Marketer',
    image: '/team/Lead Marketer.png',
    bio: 'Award-winning brand strategist who has driven growth for top B2B and consumer brands.',
  },
  {
    name: 'Priya Sharma',
    role: 'Head of Product',
    image: '/team/Head of Product.png',
    bio: 'Product leader who has shipped market-defining products at Series A through public companies.',
  },
]

export default function TeamSection() {
  const { ref, variants } = useReveal<HTMLDivElement>()
  const { containerVariants, itemVariants } = useStaggerReveal(0.1)

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-neutral-900/50" ref={ref}>
      <div className="container px-4 md:px-6">
        <motion.div variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="section-title">
            Meet Our{' '}
            <span className="text-gradient">Team</span>
          </h2>
          <p className="section-subtitle">
            Passionate people building the future of hiring
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6"
        >
          {team.map((member) => (
            <motion.div key={member.name} variants={itemVariants}>
              <Card className="text-center h-full hover:border-emerald-500/20 transition-all duration-300 group">
                <CardContent className="p-6 sm:p-8 flex flex-col items-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-4 sm:mb-5 group-hover:scale-110 transition-transform duration-300">
                    <img
                      src={member.image}
                      alt={member.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-white">{member.name}</h3>
                  <p className="text-sm text-emerald-400 mb-1">{member.role}</p>
                  <p className="text-xs text-neutral-500 mb-4 max-w-[200px]">{member.bio}</p>
                  <div className="flex gap-2">
                    <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-600/20 text-neutral-400 hover:text-emerald-400 flex items-center justify-center transition-all min-w-[44px] min-h-[44px]">
                      <Linkedin className="h-4 w-4" />
                    </a>
                    <a href="#" className="w-9 h-9 rounded-lg bg-white/5 hover:bg-emerald-600/20 text-neutral-400 hover:text-emerald-400 flex items-center justify-center transition-all min-w-[44px] min-h-[44px]">
                      <Twitter className="h-4 w-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
