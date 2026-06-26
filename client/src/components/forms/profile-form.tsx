import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProfileFormProps {
  initialData?: any
  onSuccess?: () => void
}

export function ProfileForm({ initialData, onSuccess }: ProfileFormProps) {
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    summary: initialData?.profile?.summary || '',
    jobTitle: initialData?.profile?.jobTitle || '',
    experienceYears: initialData?.profile?.experienceYears || '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const res = await fetch('/api/users/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          phone: form.phone,
          profile: {
            summary: form.summary,
            jobTitle: form.jobTitle,
            experienceYears: form.experienceYears ? parseInt(form.experienceYears) : undefined,
          },
        }),
      })
      if (res.ok) { toast.success('Profile updated!'); onSuccess?.() }
      else { toast.error('Failed to update profile') }
    } finally { setSaving(false) }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input id="firstName" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input id="lastName" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input id="phone" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="jobTitle">Job Title</Label>
        <Input id="jobTitle" value={form.jobTitle} onChange={e => setForm(f => ({ ...f, jobTitle: e.target.value }))} placeholder="e.g. Software Engineer" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="experienceYears">Years of Experience</Label>
        <Input id="experienceYears" type="number" value={form.experienceYears} onChange={e => setForm(f => ({ ...f, experienceYears: e.target.value }))} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="summary">Professional Summary</Label>
        <Textarea id="summary" rows={4} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))} placeholder="Brief description of your background and career goals..." />
      </div>
      <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
        {saving ? 'Saving...' : 'Save Profile'}
      </Button>
    </form>
  )
}
