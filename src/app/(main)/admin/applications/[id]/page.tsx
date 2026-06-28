"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ExternalLink, Calendar, Building2, MapPin, Briefcase } from "lucide-react"

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

const statusActions = [
  { status: "PENDING", label: "Mark Reviewing", nextStatus: "REVIEWING", color: "bg-blue-600 hover:bg-blue-700" },
  { status: "REVIEWING", label: "Shortlist", nextStatus: "SHORTLISTED", color: "bg-purple-600 hover:bg-purple-700" },
  { status: "SHORTLISTED", label: "Move to Interview", nextStatus: "INTERVIEW", color: "bg-indigo-600 hover:bg-indigo-700" },
  { status: "INTERVIEW", label: "Make Offer", nextStatus: "OFFERED", color: "bg-emerald-600 hover:bg-emerald-700" },
  { status: "OFFERED", label: "Confirm Hired", nextStatus: "HIRED", color: "bg-green-600 hover:bg-green-700" },
  { status: "REJECTED", label: "", nextStatus: "" },
  { status: "HIRED", label: "", nextStatus: "" },
  { status: "WITHDRAWN", label: "", nextStatus: "" },
]

export default function AdminApplicationDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [application, setApplication] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (!params.id) return
    fetch(`/api/admin/applications/${params.id}`)
      .then(r => r.json())
      .then((data) => {
        setApplication(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [params.id])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const res = await fetch(`/api/applications/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setApplication((prev: any) => ({ ...prev, status }))
      }
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
      </div>
    )
  }

  if (!application) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Application not found</p>
          <Button variant="link" onClick={() => router.back()} className="mt-2">
            Go back
          </Button>
        </div>
      </div>
    )
  }

  const nextAction = statusActions.find(a => a.status === application.status)

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container max-w-5xl">
        <Button variant="ghost" onClick={() => router.push("/admin/applications")} className="mb-6 -ml-2">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Applications
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="bg-card border">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle className="text-foreground">Application Review</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Applied {new Date(application.appliedAt).toLocaleDateString("en-US", {
                      month: "long", day: "numeric", year: "numeric",
                    })}
                  </p>
                </div>
                <Badge variant="outline" className={`text-sm px-3 py-1 ${statusColors[application.status] || ""}`}>
                  {application.status}
                </Badge>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Cover Letter</h3>
                  <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {application.coverLetter || "No cover letter provided"}
                  </div>
                </div>

                {application.employerNotes && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Employer Notes</h3>
                    <div className="bg-muted/30 rounded-lg p-4 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                      {application.employerNotes}
                    </div>
                  </div>
                )}

                {application.interview && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-2">Interview</h3>
                    <div className="bg-muted/30 rounded-lg p-4 text-sm space-y-2">
                      <p className="text-foreground">
                        <Calendar className="w-4 h-4 inline mr-2 text-muted-foreground" />
                        {new Date(application.interview.scheduledAt).toLocaleDateString("en-US", {
                          weekday: "long", month: "long", day: "numeric", year: "numeric",
                          hour: "numeric", minute: "2-digit",
                        })}
                      </p>
                      <p className="text-muted-foreground">
                        Type: {application.interview.type} &middot; Duration: {application.interview.duration}min
                      </p>
                      {application.interview.meetingLink && (
                        <a href={application.interview.meetingLink} target="_blank" rel="noopener noreferrer" className="text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1">
                          Join Meeting <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {nextAction?.nextStatus && (
              <Card className="bg-card border">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Update Status</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Move this application to the next stage
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus("REJECTED")}
                        disabled={updating}
                        className="text-red-400 border-red-500/20 hover:bg-red-500/10"
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateStatus(nextAction.nextStatus)}
                        disabled={updating}
                        className={nextAction.color}
                      >
                        {updating ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                        {nextAction.label}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Candidate</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-lg font-medium text-emerald-400">
                    {application.candidate.firstName?.[0] || application.candidate.email?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div>
                    <p className="text-foreground font-medium">
                      {application.candidate.firstName || application.candidate.email}
                    </p>
                    <p className="text-muted-foreground text-sm">{application.candidate.email}</p>
                  </div>
                </div>

                {application.candidate.profile?.jobTitle && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4" />
                    {application.candidate.profile.jobTitle}
                  </div>
                )}

                {application.candidate.profile?.skills?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {application.candidate.profile.skills.map((skill: string) => (
                        <span key={skill} className="px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {application.candidate.phone && (
                  <p className="text-sm text-muted-foreground">
                    Phone: {application.candidate.phone}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="bg-card border">
              <CardHeader>
                <CardTitle className="text-foreground text-lg">Job</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-foreground font-medium">{application.job.title}</p>

                {application.job.company?.companyName && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building2 className="w-4 h-4" />
                    {application.job.company.companyName}
                  </div>
                )}

                {application.job.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    {application.job.location}
                  </div>
                )}

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Briefcase className="w-4 h-4" />
                  {application.job.jobType} &middot; {application.job.experienceLevel}
                </div>

                {application.job.skills?.length > 0 && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-2">Required Skills</p>
                    <div className="flex flex-wrap gap-1.5">
                      {application.job.skills.map((skill: string) => (
                        <span key={skill} className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
