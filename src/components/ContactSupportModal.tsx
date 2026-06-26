'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail, Send, HelpCircle, AlertCircle, CheckCircle } from 'lucide-react'

interface ContactForm {
  name: string
  email: string
  subject: string
  message: string
}

export default function ContactSupportModal() {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: '',
  })
  const [sending, setSending] = useState(false)
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string; mailto?: string } | null>(null)

  const reset = () => {
    setForm({ name: '', email: '', subject: '', message: '' })
    setStatus(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setStatus(null)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus({ type: 'success', message: 'Message sent successfully! We will get back to you soon.' })
        setForm({ name: '', email: '', subject: '', message: '' })
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to send. Please try again.',
          mailto: data.mailtoFallback,
        })
      }
    } catch {
      const supportEmail = process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@loftcommunity.com'
      const mailtoHref = `mailto:${supportEmail}?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`)}`
      setStatus({
        type: 'error',
        message: 'Network error. You can email us directly instead.',
        mailto: mailtoHref,
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (!o) reset() }}>
      <DialogTrigger asChild>
        <button className="text-muted-foreground hover:text-emerald-400 text-sm flex items-center gap-1 transition-colors">
          <HelpCircle className="h-4 w-4" />
          Contact Support
        </button>
      </DialogTrigger>
      <DialogContent className="bg-background border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Mail className="h-5 w-5 text-emerald-400" />
            Contact Support
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Have a question or need help? Send us a message and we&apos;ll get back to you.
          </DialogDescription>
        </DialogHeader>

        {status && (
          <div className={`p-3 rounded-lg text-sm flex items-start gap-2 ${
            status.type === 'success'
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
              : 'bg-red-500/20 text-red-400 border border-red-500/50'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
            )}
            <div>
              <p>{status.message}</p>
              {status.mailto && (
                <a
                  href={status.mailto}
                  className="underline text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 mt-1"
                >
                  <Mail className="h-3 w-3" /> Send via email client
                </a>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Name *</label>
              <Input
                placeholder="John Doe"
                className="bg-muted border-border text-foreground"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Email *</label>
              <Input
                type="email"
                placeholder="john@example.com"
                className="bg-muted border-border text-foreground"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Subject *</label>
            <Input
              placeholder="How can we help?"
              className="bg-muted border-border text-foreground"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Message *</label>
            <textarea
              placeholder="Describe your issue or question..."
              rows={5}
              className="w-full bg-muted border-border text-foreground rounded-md p-3 resize-none"
              value={form.message}
              onChange={(e) => setForm({ ...form, message: e.target.value })}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={sending}
              className="bg-emerald-600 hover:bg-emerald-700 flex-1"
            >
              {sending ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Sending...</>
              ) : (
                <><Send className="h-4 w-4 mr-2" /> Send Message</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-border"
              onClick={() => {
                window.location.href = `mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@loftcommunity.com'}`
              }}
            >
              <Mail className="h-4 w-4" />
            </Button>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center">
          Or email us directly at{' '}
          <a href={`mailto:${process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@loftcommunity.com'}`} className="text-emerald-400 hover:underline">
            {process.env.NEXT_PUBLIC_SUPPORT_EMAIL || 'support@loftcommunity.com'}
          </a>
        </p>
      </DialogContent>
    </Dialog>
  )
}
