import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Loader2, Save } from 'lucide-react'

export default function AdminSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [form, setForm] = useState({ name: '', description: '', website: '', contactEmail: '', logo: '' })

  useEffect(() => {
    fetch('/api/admin/company')
      .then(r => r.json())
      .then((data) => {
        setForm({
          name: data.name || '', description: data.description || '',
          website: data.website || '', contactEmail: data.contactEmail || '',
          logo: data.logo || '',
        })
        setLoading(false)
      })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSuccess(false)
    try {
      const res = await fetch('/api/admin/company', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (res.ok) { setSuccess(true); setTimeout(() => setSuccess(false), 3000) }
    } finally { setSaving(false) }
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Company Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your company profile information</p>
        </div>
        <Card className="bg-card border max-w-2xl">
          <CardHeader><CardTitle className="text-foreground">Company Information</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" placeholder="https://example.com" value={form.website} onChange={(e) => setForm(f => ({ ...f, website: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" placeholder="contact@example.com" value={form.contactEmail} onChange={(e) => setForm(f => ({ ...f, contactEmail: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="logo">Logo URL</Label>
                <Input id="logo" placeholder="https://example.com/logo.png" value={form.logo} onChange={(e) => setForm(f => ({ ...f, logo: e.target.value }))} />
              </div>
              <div className="flex items-center gap-4">
                <Button type="submit" disabled={saving} className="bg-emerald-600 hover:bg-emerald-700">
                  {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                  Save Changes
                </Button>
                {success && <span className="text-sm text-emerald-400 font-medium">Settings saved successfully</span>}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
