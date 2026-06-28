"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Briefcase, Building, BarChart3, Loader2, FileText, ExternalLink } from "lucide-react"

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState<any>(null)
  const [employers, setEmployers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/analytics").then(r => r.json()),
      fetch("/api/admin/employers").then(r => r.json()),
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
    { label: "Total Users", value: analytics?.totalUsers ?? 0, icon: Users },
    { label: "Job Seekers", value: analytics?.totalSeekers ?? 0, icon: Users },
    { label: "Employers", value: analytics?.totalEmployers ?? 0, icon: Building },
    { label: "Active Jobs", value: analytics?.activeJobs ?? 0, icon: Briefcase },
    { label: "Total Applications", value: analytics?.totalApplications ?? 0, icon: FileText },
    { label: "Hired", value: analytics?.hiredThisMonth ?? 0, icon: Users },
    { label: "Pending Jobs", value: analytics?.pendingJobs ?? 0, icon: Briefcase },
  ]

  const appStatusCards = [
    { label: "Pending", value: analytics?.pendingApps ?? 0, color: "text-yellow-400" },
    { label: "Reviewing", value: analytics?.reviewingApps ?? 0, color: "text-blue-400" },
    { label: "Shortlisted", value: analytics?.shortlistedApps ?? 0, color: "text-purple-400" },
    { label: "Interview", value: analytics?.interviewApps ?? 0, color: "text-indigo-400" },
    { label: "Offered", value: analytics?.offeredApps ?? 0, color: "text-emerald-400" },
    { label: "Rejected", value: analytics?.rejectedApps ?? 0, color: "text-red-400" },
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

        <Card className="bg-card border mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-foreground">Applications Overview</CardTitle>
              <p className="text-sm text-muted-foreground mt-0.5">
                {analytics?.applicationsThisWeek ?? 0} new this week
                {analytics?.applicationsThisWeek > 0 && (
                  <span className="text-emerald-400 ml-1">&uarr;</span>
                )}
              </p>
            </div>
            <Link href="/admin/applications">
              <Button variant="outline" size="sm">
                View All <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {appStatusCards.map((stat) => (
                <div key={stat.label} className="text-center p-3 rounded-lg bg-muted/20">
                  <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-foreground">Employer Members</CardTitle>
            <Link href="/admin/employers">
              <Button variant="outline" size="sm">
                Manage <ExternalLink className="w-3 h-3 ml-1" />
              </Button>
            </Link>
          </CardHeader>
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
                    <tr>
                      <td colSpan={3} className="py-8 text-center text-muted-foreground">
                        No employer members yet
                      </td>
                    </tr>
                  ) : (
                    employers.map((member: any) => (
                      <tr key={member.id} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-foreground">
                          {member.user?.name || `${member.user?.firstName || ""} ${member.user?.lastName || ""}` || "N/A"}
                        </td>
                        <td className="py-3 px-4 text-muted-foreground">{member.user?.email}</td>
                        <td className="py-3 px-4">
                          <Badge variant={member.role === "ADMIN" ? "default" : "secondary"}>
                            {member.role}
                          </Badge>
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
    </div>
  )
}
