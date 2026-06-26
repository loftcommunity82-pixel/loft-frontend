import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Plus, Trash2, Shield, ShieldOff } from 'lucide-react'

export default function AdminEmployers() {
  const [employers, setEmployers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<number | null>(null)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [addRole, setAddRole] = useState('EMPLOYER')
  const [addLoading, setAddLoading] = useState(false)
  const [addError, setAddError] = useState('')

  const fetchEmployers = () => {
    setLoading(true)
    fetch('/api/admin/employers')
      .then(r => r.json())
      .then((data) => { setEmployers(data || []); setLoading(false) })
  }

  useEffect(() => { fetchEmployers() }, [])

  const adminCount = employers.filter((m: any) => m.role === 'ADMIN').length

  const toggleRole = async (member: any) => {
    setActionLoading(member.id)
    const newRole = member.role === 'ADMIN' ? 'EMPLOYER' : 'ADMIN'
    try {
      const res = await fetch(`/api/admin/employers/${member.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) fetchEmployers()
    } finally { setActionLoading(null) }
  }

  const deleteMember = async (member: any) => {
    if (member.role === 'ADMIN' && adminCount <= 1) return
    setActionLoading(member.id)
    try {
      const res = await fetch(`/api/admin/employers/${member.id}`, { method: 'DELETE' })
      if (res.ok) fetchEmployers()
    } finally { setActionLoading(null) }
  }

  const addMember = async () => {
    setAddLoading(true)
    setAddError('')
    try {
      const res = await fetch('/api/admin/employers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: addEmail, role: addRole }),
      })
      const data = await res.json()
      if (!res.ok) { setAddError(data.error || 'Failed to add member'); return }
      setAddDialogOpen(false)
      setAddEmail('')
      setAddRole('EMPLOYER')
      fetchEmployers()
    } finally { setAddLoading(false) }
  }

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-400" /></div>
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Employer Members</h1>
            <p className="text-muted-foreground mt-1">Manage employer accounts and roles</p>
          </div>
          <Button onClick={() => setAddDialogOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Employer
          </Button>
        </div>
        <Card className="bg-card border">
          <CardHeader><CardTitle className="text-foreground">All Members</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th>
                    <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.length === 0 ? (
                    <tr><td colSpan={4} className="py-8 text-center text-muted-foreground">No employer members yet</td></tr>
                  ) : (
                    employers.map((member: any) => (
                      <tr key={member.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-foreground">{member.user?.name || `${member.user?.firstName || ''} ${member.user?.lastName || ''}` || 'N/A'}</td>
                        <td className="py-3 px-4 text-muted-foreground">{member.user?.email}</td>
                        <td className="py-3 px-4"><Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>{member.role}</Badge></td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => toggleRole(member)} disabled={actionLoading === member.id}>
                              {actionLoading === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : member.role === 'ADMIN' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                              <span className="ml-1 hidden sm:inline">{member.role === 'ADMIN' ? 'Demote' : 'Promote'}</span>
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => deleteMember(member)} disabled={actionLoading === member.id || (member.role === 'ADMIN' && adminCount <= 1)} className="text-destructive hover:text-destructive">
                              {actionLoading === member.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Employer Member</DialogTitle>
            <DialogDescription>Add an existing user as an employer member. The user must already have an account.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" placeholder="user@example.com" value={addEmail} onChange={(e) => setAddEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={addRole} onValueChange={setAddRole}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select role" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPLOYER">EMPLOYER</SelectItem>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {addError && <p className="text-sm text-destructive">{addError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddDialogOpen(false)} disabled={addLoading}>Cancel</Button>
            <Button onClick={addMember} disabled={addLoading || !addEmail} className="bg-emerald-600 hover:bg-emerald-700">
              {addLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
              Add Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
