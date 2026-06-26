import { useState } from 'react'
import { motion } from 'framer-motion'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useReveal } from '@/hooks/useReveal'
import { toast } from 'sonner'
import api from '@/lib/api'

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email'),
  subject: z.string().min(3, 'Subject is required'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
})

type ContactForm = z.infer<typeof contactSchema>

export default function ContactFormSection() {
  const { ref, variants } = useReveal<HTMLDivElement>({ direction: 'right' })
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactForm>({
    resolver: zodResolver(contactSchema),
  })

  async function onSubmit(data: ContactForm) {
    setIsLoading(true)
    try {
      await api.post('/contact', data)
      toast.success('Message sent! We\'ll get back to you soon.')
      reset()
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'Failed to send message. Please try emailing us directly.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div ref={ref} variants={variants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-80px' }} className="glass rounded-2xl p-5 sm:p-6 md:p-8">
      <h3 className="text-lg sm:text-xl font-semibold text-white mb-6">Send us a message</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
          <div className="space-y-2">
            <Label htmlFor="contact-name" className="text-sm text-neutral-300">Name</Label>
            <Input id="contact-name" placeholder="Your name" {...register('name')} className={errors.name ? 'ring-2 ring-red-500' : ''} />
            {errors.name && <p className="text-xs text-red-400">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact-email" className="text-sm text-neutral-300">Email</Label>
            <Input id="contact-email" type="email" placeholder="your@email.com" {...register('email')} className={errors.email ? 'ring-2 ring-red-500' : ''} />
            {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject" className="text-sm text-neutral-300">Subject</Label>
          <Input id="subject" placeholder="How can we help?" {...register('subject')} className={errors.subject ? 'ring-2 ring-red-500' : ''} />
          {errors.subject && <p className="text-xs text-red-400">{errors.subject.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm text-neutral-300">Message</Label>
          <Textarea
            id="message"
            placeholder="Tell us more about your inquiry..."
            rows={5}
            {...register('message')}
            className={errors.message ? 'ring-2 ring-red-500' : ''}
          />
          {errors.message && <p className="text-xs text-red-400">{errors.message.message}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white gap-2" disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Send Message
            </>
          )}
        </Button>
      </form>
    </motion.div>
  )
}
