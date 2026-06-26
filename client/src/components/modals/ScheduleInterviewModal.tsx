import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2, Calendar } from 'lucide-react'
import { scheduleInterview } from '@/lib/api'
import { toast } from 'sonner'

interface ScheduleInterviewModalProps {
  applicationId: number
  open: boolean
  onClose: () => void
  onScheduled: () => void
}

export function ScheduleInterviewModal({ applicationId, open, onClose, onScheduled }: ScheduleInterviewModalProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    scheduledAt: '',
    scheduledTime: '',
    duration: '60',
    type: 'VIDEO',
    meetingLink: '',
    location: '',
  })

  if (!open) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const scheduledAt = new Date(`${form.scheduledAt}T${form.scheduledTime}`)
      await scheduleInterview(applicationId, {
        scheduledAt,
        duration: parseInt(form.duration),
        type: form.type as any,
        meetingLink: form.meetingLink || undefined,
        location: form.location || undefined,
      })
      toast.success('Interview scheduled successfully')
      onScheduled()
      onClose()
    } catch (err) {
      toast.error('Failed to schedule interview')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl max-w-lg w-full p-6">
        <h2 className="text-xl font-bold text-foreground mb-6">Schedule Interview</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Date *</label>
              <input
                type="date"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
                required
                className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Time *</label>
              <input
                type="time"
                value={form.scheduledTime}
                onChange={(e) => setForm((f) => ({ ...f, scheduledTime: e.target.value }))}
                required
                className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Duration</label>
              <select
                value={form.duration}
                onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
                className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2 text-sm"
              >
                <option value="30">30 minutes</option>
                <option value="45">45 minutes</option>
                <option value="60">60 minutes</option>
                <option value="90">90 minutes</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
                className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2 text-sm"
              >
                <option value="PHONE">Phone</option>
                <option value="VIDEO">Video</option>
                <option value="ONSITE">On-site</option>
                <option value="TECHNICAL">Technical</option>
                <option value="FINAL">Final</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Meeting Link</label>
            <input
              type="url"
              value={form.meetingLink}
              onChange={(e) => setForm((f) => ({ ...f, meetingLink: e.target.value }))}
              placeholder="https://meet.google.com/..."
              className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Location</label>
            <input
              type="text"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              placeholder="Room 301, Main Office"
              className="w-full bg-muted border border-border text-foreground rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 flex-1">
              {saving ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Scheduling...</>
              ) : (
                <><Calendar className="w-4 h-4 mr-2" /> Schedule</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
