import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Briefcase, Building, BarChart3, Loader2 } from 'lucide-react'

export default function Admin() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [employers, setEmployers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/analytics').then(r => r.json()),
      fetch('/api/admin/employers').then(r => r.json()),
    ]).then(([analyticsData, employersData]) => {
      setAnalytics(analyticsData)
      setEmployers(employersData || [])
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  const stats = [
    { label: 'Total Users', value: analytics?.totalUsers ?? 0, icon: Users },
    { label: 'Job Seekers', value: analytics?.totalSeekers ?? 0, icon: Users },
    { label: 'Employers', value: analytics?.totalEmployers ?? 0, icon: Building },
    { label: 'Active Jobs', value: analytics?.activeJobs ?? 0, icon: Briefcase },
    { label: 'Total Applications', value: analytics?.totalApplications ?? 0, icon: BarChart3 },
    { label: 'Hired This Month', value: analytics?.hiredThisMonth ?? 0, icon: Users },
    { label: 'Pending Jobs', value: analytics?.pendingJobs ?? 0, icon: Briefcase },
  ]

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">Platform overview and analytics</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat) => (
            <Card key={stat.label} className="bg-card border">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <stat.icon className="w-8 h-8 text-emerald-400" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="bg-card border">
          <CardHeader><CardTitle className="text-foreground">Recent Employer Members</CardTitle></CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Name</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Email</th>
                    <th className="text-left py-3 px-4 text-muted-foreground font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {employers.length === 0 ? (
                    <tr><td colSpan={3} className="py-8 text-center text-muted-foreground">No employer members yet</td></tr>
                  ) : (
                    employers.map((member: any) => (
                      <tr key={member.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-foreground">{member.user?.name || `${member.user?.firstName || ''} ${member.user?.lastName || ''}` || 'N/A'}</td>
                        <td className="py-3 px-4 text-muted-foreground">{member.user?.email}</td>
                        <td className="py-3 px-4"><Badge variant={member.role === 'ADMIN' ? 'default' : 'secondary'}>{member.role}</Badge></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
