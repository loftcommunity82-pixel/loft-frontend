import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Code, Database, Palette, Smartphone, Cloud, BarChart, Briefcase, Heart, Shield, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useReveal, useStaggerReveal } from '@/hooks/useReveal'

const categories = [
  { name: 'Software Development', icon: Code, count: 19, search: 'software+developer', gradient: 'from-blue-500/20 to-blue-600/10' },
  { name: 'Data Science', icon: Database, count: 9, search: 'data+scientist', gradient: 'from-purple-500/20 to-purple-600/10' },
  { name: 'Design', icon: Palette, count: 7, search: 'designer', gradient: 'from-pink-500/20 to-pink-600/10' },
  { name: 'Mobile Development', icon: Smartphone, count: 5, search: 'mobile+developer', gradient: 'from-sky-500/20 to-sky-600/10' },
  { name: 'Cloud Computing', icon: Cloud, count: 8, search: 'cloud+engineer', gradient: 'from-cyan-500/20 to-cyan-600/10' },
  { name: 'Business Analyst', icon: BarChart, count: 6, search: 'business+analyst', gradient: 'from-orange-500/20 to-orange-600/10' },
  { name: 'Project Management', icon: Briefcase, count: 15, search: 'product+manager', gradient: 'from-yellow-500/20 to-yellow-600/10' },
  { name: 'Healthcare', icon: Heart, count: 8, search: 'healthcare', gradient: 'from-red-500/20 to-red-600/10' },
  { name: 'Cybersecurity', icon: Shield, count: 3, search: 'cybersecurity', gradient: 'from-indigo-500/20 to-indigo-600/10' },
]

export default function JobCategories() {
  const { ref, variants } = useReveal<HTMLDivElement>()
  const { containerVariants, itemVariants } = useStaggerReveal(0.06)

  return (
    <section className="w-full py-16 sm:py-20 lg:py-24 bg-neutral-950 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 opacity-[0.03]">
        <img
          src="/images/Job%20Category%20Illustrations.png"
          alt=""
          className="w-full h-full object-cover"
          aria-hidden
        />
      </div>
      <div className="container px-4 md:px-6 relative z-10">
        <motion.div variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="text-center mb-10 sm:mb-12 lg:mb-16">
          <h2 className="section-title">
            Browse Jobs by{' '}
            <span className="text-gradient">Category</span>
          </h2>
          <p className="section-subtitle">
            Explore opportunities across various industries and find the perfect role for your skills
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-80px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4"
        >
          {categories.map((category) => (
            <motion.div key={category.name} variants={itemVariants}>
              <Link to={`/jobs?search=${category.search}`} className="block group">
                <Card className="hover:border-emerald-500/30 transition-all duration-300 hover:scale-[1.02] cursor-pointer overflow-hidden">
                  <CardContent className="p-4 sm:p-5 md:p-6 flex items-center gap-3 sm:gap-4">
                    <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${category.gradient} shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                      <category.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm sm:text-base text-white group-hover:text-emerald-400 transition-colors truncate">
                        {category.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-neutral-500">
                        {category.count} open positions
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all shrink-0" />
                  </CardContent>
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-8 sm:mt-10"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <Link to="/jobs">
            <Button variant="link" className="text-emerald-400 hover:text-emerald-300 gap-1">
              View All Categories
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
