import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ScheduleInterviewModalProps {
  isOpen: boolean
  onClose: () => void
  applicationId: number
  onScheduled?: () => void
}

export function ScheduleInterviewModal({ isOpen, onClose, applicationId, onScheduled }: ScheduleInterviewModalProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    scheduledAt: '', duration: '60', type: 'VIDEO', meetingLink: '', location: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.scheduledAt) { toast.error('Please select a date and time'); return }
    setLoading(true)
    try {
      const res = await fetch(`/api/applications/${applicationId}/interviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, duration: parseInt(form.duration) }),
      })
      if (res.ok) { toast.success('Interview scheduled!'); onScheduled?.(); onClose() }
      else { const d = await res.json(); toast.error(d.error || 'Failed to schedule') }
    } finally { setLoading(false) }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Schedule Interview</DialogTitle>
          <DialogDescription>Set up an interview with this candidate</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="scheduledAt">Date & Time *</Label>
            <Input id="scheduledAt" type="datetime-local" value={form.scheduledAt} onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input id="duration" type="number" value={form.duration} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Interview Type</Label>
              <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="PHONE">Phone</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="ONSITE">On-site</SelectItem>
                  <SelectItem value="TECHNICAL">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="meetingLink">Meeting Link</Label>
            <Input id="meetingLink" placeholder="https://meet.google.com/..." value={form.meetingLink} onChange={e => setForm(f => ({ ...f, meetingLink: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" placeholder="Room 301, Main Office" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button type="submit" disabled={loading} className="bg-emerald-600 hover:bg-emerald-700">
              {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {loading ? 'Scheduling...' : 'Schedule Interview'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
