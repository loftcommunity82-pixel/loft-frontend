'use client'

import { useState, useCallback } from 'react'
import { useAuthContext } from '@/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import MultipleSelector, { Option } from '@/components/ui/multiple-selector'
import { Briefcase, Loader2, ArrowLeft, Plus } from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CreateJobPage() {
  const { user } = useAuthContext()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    benefits: '',
    jobType: 'FULL_TIME',
    experienceLevel: 'MID',
    workMode: 'ONSITE',
    location: '',
    city: '',
    salaryMin: '',
    salaryMax: '',
    skills: [] as string[],
  })

  const searchSkills = useCallback(async (value: string): Promise<Option[]> => {
    if (!value) return []
    try {
      const res = await fetch(`/api/skills/search?q=${encodeURIComponent(value)}`)
      const data = await res.json()
      return data.map((s: { id: number; name: string }) => ({ value: s.name, label: s.name }))
    } catch {
      return []
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const payload = {
        title: form.title,
        description: form.description,
        requirements: form.requirements || undefined,
        benefits: form.benefits || undefined,
        jobType: form.jobType,
        experienceLevel: form.experienceLevel,
        workMode: form.workMode,
        location: form.location || undefined,
        city: form.city || undefined,
        salaryMin: form.salaryMin ? parseFloat(form.salaryMin) : undefined,
        salaryMax: form.salaryMax ? parseFloat(form.salaryMax) : undefined,
        skills: form.skills,
      }

      const email = user?.email
      const res = await fetch(`/api/jobs?email=${email}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        toast.success('Job posted successfully!')
        router.push('/employer/dashboard')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create job')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-3xl mx-auto">
        <Link href="/employer/dashboard" className="inline-flex items-center text-muted-foreground hover:text-foreground mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Link>

        <Card className="bg-card border">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-3 text-2xl">
              <Briefcase className="w-6 h-6 text-emerald-400" />
              Post a New Job
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-foreground/80">Job Title *</Label>
                <Input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required className="bg-muted border text-foreground" placeholder="e.g. Senior Software Engineer" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80">Job Type *</Label>
                  <select value={form.jobType} onChange={e => setForm(f => ({ ...f, jobType: e.target.value }))} className="w-full bg-muted border border text-foreground rounded-md px-3 py-2">
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                    <option value="CONTRACT">Contract</option>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="TEMPORARY">Temporary</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">Experience Level *</Label>
                  <select value={form.experienceLevel} onChange={e => setForm(f => ({ ...f, experienceLevel: e.target.value }))} className="w-full bg-muted border border text-foreground rounded-md px-3 py-2">
                    <option value="ENTRY">Entry Level</option>
                    <option value="JUNIOR">Junior</option>
                    <option value="MID">Mid-Level</option>
                    <option value="SENIOR">Senior</option>
                    <option value="LEAD">Lead</option>
                    <option value="EXECUTIVE">Executive</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">Work Mode *</Label>
                  <select value={form.workMode} onChange={e => setForm(f => ({ ...f, workMode: e.target.value }))} className="w-full bg-muted border border text-foreground rounded-md px-3 py-2">
                    <option value="ONSITE">On-site</option>
                    <option value="REMOTE">Remote</option>
                    <option value="HYBRID">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80">Location</Label>
                  <Input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} className="bg-muted border text-foreground" placeholder="e.g. San Francisco, CA" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">City</Label>
                  <Input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="bg-muted border text-foreground" placeholder="e.g. San Francisco" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground/80">Salary Min</Label>
                  <Input type="number" value={form.salaryMin} onChange={e => setForm(f => ({ ...f, salaryMin: e.target.value }))} className="bg-muted border text-foreground" placeholder="e.g. 80000" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground/80">Salary Max</Label>
                  <Input type="number" value={form.salaryMax} onChange={e => setForm(f => ({ ...f, salaryMax: e.target.value }))} className="bg-muted border text-foreground" placeholder="e.g. 150000" />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80">Required Skills</Label>
                <MultipleSelector
                  value={form.skills.map(s => ({ value: s, label: s }))}
                  onChange={(options) => setForm(f => ({ ...f, skills: options.map(o => o.value) }))}
                  onSearch={searchSkills}
                  placeholder="Search or type a skill..."
                  delay={200}
                  creatable
                  className="bg-muted border text-foreground"
                  badgeClassName="bg-emerald-500/20 text-emerald-400"
                  hidePlaceholderWhenSelected
                />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80">Description *</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={6} className="bg-muted border text-foreground" placeholder="Describe the role, responsibilities, and what makes it great..." />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80">Requirements</Label>
                <Textarea value={form.requirements} onChange={e => setForm(f => ({ ...f, requirements: e.target.value }))} rows={4} className="bg-muted border text-foreground" placeholder="List the requirements for this position..." />
              </div>

              <div className="space-y-2">
                <Label className="text-foreground/80">Benefits</Label>
                <Textarea value={form.benefits} onChange={e => setForm(f => ({ ...f, benefits: e.target.value }))} rows={3} className="bg-muted border text-foreground" placeholder="e.g. Health insurance, 401k, Remote work" />
              </div>

              <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700 w-full">
                {saving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Publishing...</> : <><Plus className="w-4 h-4 mr-2" /> Post Job</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
