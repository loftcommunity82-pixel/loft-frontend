"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2, Search, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  REVIEWING: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  SHORTLISTED: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  INTERVIEW: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
  OFFERED: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  HIRED: "bg-green-500/10 text-green-400 border-green-500/20",
  REJECTED: "bg-red-500/10 text-red-400 border-red-500/20",
  WITHDRAWN: "bg-neutral-500/10 text-neutral-400 border-neutral-500/20",
}

const statuses = [
  { key: "", label: "All", color: "" },
  { key: "PENDING", label: "Pending", color: "bg-yellow-500/10 text-yellow-400" },
  { key: "REVIEWING", label: "Reviewing", color: "bg-blue-500/10 text-blue-400" },
  { key: "SHORTLISTED", label: "Shortlisted", color: "bg-purple-500/10 text-purple-400" },
  { key: "INTERVIEW", label: "Interview", color: "bg-indigo-500/10 text-indigo-400" },
  { key: "OFFERED", label: "Offered", color: "bg-emerald-500/10 text-emerald-400" },
  { key: "HIRED", label: "Hired", color: "bg-green-500/10 text-green-400" },
  { key: "REJECTED", label: "Rejected", color: "bg-red-500/10 text-red-400" },
]

export default function AdminApplicationsPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [page, setPage] = useState(1)
  const limit = 25

  const fetchApplications = () => {
    setLoading(true)
    const params = new URLSearchParams()
    if (statusFilter) params.set("status", statusFilter)
    if (searchQuery) params.set("search", searchQuery)
    params.set("page", String(page))
    params.set("limit", String(limit))

    fetch(`/api/admin/applications?${params.toString()}`)
      .then(r => r.json())
      .then((res) => {
        setData(res)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => {
    fetchApplications()
  }, [statusFilter, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setPage(1)
    fetchApplications()
  }

  const statCards = data?.stats ? [
    { label: "Total", value: data.stats.total, color: "text-foreground" },
    { label: "Pending", value: data.stats.pendingCount, color: "text-yellow-400" },
    { label: "Reviewing", value: data.stats.reviewingCount, color: "text-blue-400" },
    { label: "Shortlisted", value: data.stats.shortlistedCount, color: "text-purple-400" },
    { label: "Interview", value: data.stats.interviewCount, color: "text-indigo-400" },
    { label: "Offered", value: data.stats.offeredCount, color: "text-emerald-400" },
    { label: "Hired", value: data.stats.hiredCount, color: "text-green-400" },
    { label: "Rejected", value: data.stats.rejectedCount, color: "text-red-400" },
  ] : []

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-7xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Applications</h1>
            <p className="text-muted-foreground mt-1">
              Review and manage all candidate applications across the platform
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-8">
          {statCards.map((stat) => (
            <Card key={stat.label} className="bg-card border">
              <CardContent className="p-4 text-center">
                <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="bg-card border mb-8">
          <CardHeader className="pb-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <CardTitle className="text-foreground text-lg">All Applications</CardTitle>
              <form onSubmit={handleSearch} className="flex gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search candidates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" className="shrink-0">
                  Search
                </Button>
              </form>
            </div>
            <div className="flex flex-wrap gap-1.5 mt-3">
              {statuses.map((s) => (
                <button
                  key={s.key}
                  onClick={() => { setStatusFilter(s.key); setPage(1) }}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                    statusFilter === s.key
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                      : "text-muted-foreground border-border hover:text-foreground hover:border-muted-foreground/30"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
              </div>
            ) : !data?.applications?.length ? (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No applications found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Candidate</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Job</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Company</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Status</th>
                      <th className="text-left py-3 px-4 text-muted-foreground font-medium">Applied</th>
                      <th className="text-right py-3 px-4 text-muted-foreground font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.applications.map((app: any) => (
                      <tr key={app.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-xs font-medium text-emerald-400 shrink-0">
                              {app.candidate.firstName?.[0] || app.candidate.email?.[0]?.toUpperCase() || "?"}
                            </div>
                            <div className="min-w-0">
                              <p className="text-foreground font-medium truncate">
                                {app.candidate.firstName || app.candidate.email}
                              </p>
                              <p className="text-muted-foreground text-xs truncate">{app.candidate.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-foreground truncate max-w-[200px]">{app.job.title}</p>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-muted-foreground">{app.job.employer?.companyName || "—"}</p>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant="outline"
                            className={`font-medium ${statusColors[app.status] || "bg-neutral-500/10 text-neutral-400"}`}
                          >
                            {app.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground text-xs">
                          {new Date(app.appliedAt).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/admin/applications/${app.id}`}
                            className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                          >
                            Review <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {data && data.totalPages > 1 && (
              <div className="flex items-center justify-between pt-4 border-t border-border mt-4">
                <p className="text-xs text-muted-foreground">
                  Page {data.page} of {data.totalPages} ({data.stats.total} total)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page <= 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => p + 1)}
                    disabled={page >= (data.totalPages || 1)}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
