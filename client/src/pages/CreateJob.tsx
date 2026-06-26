import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { JobForm } from '@/features/job-management'
import { createJob } from '@/features/job-management/services/jobService'
import { toast } from 'sonner'

export default function CreateJob() {
  const navigate = useNavigate()
  const [saving, setSaving] = useState(false)

  async function handleSubmit(data: Parameters<typeof createJob>[0]) {
    setSaving(true)
    try {
      await createJob(data)
      toast.success('Job posted successfully!')
      navigate('/employer/dashboard')
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to post job')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="container px-4 md:px-6 py-16 sm:py-20 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>

        <JobForm
          onSubmit={handleSubmit}
          onCancel={() => navigate('/employer/dashboard')}
          loading={saving}
        />
      </motion.div>
    </div>
  )
}
