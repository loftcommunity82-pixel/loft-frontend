import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

// GET /api/admin/jobs - List all jobs for moderation
export async function GET(request: NextRequest) {
  // TODO: Verify admin role using session
  // In production, check session.user.role === 'admin'
  // const session = await getServerSession(authOptions)
  // if (!session || session.user.role !== 'admin') {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  // }
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")

  const whereClause = status ? { status: status as any } : {}

  const jobs = await db.job.findMany({
    where: whereClause,
    include: {
      employer: { 
        select: { 
          companyName: true, 
          contactEmail: true,
          user: { select: { email: true } }
        } 
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  })

  return NextResponse.json(jobs.map(job => ({
    id: job.id,
    title: job.title,
    status: job.status,
    isActive: job.isActive,
    createdAt: job.createdAt,
    publishedAt: job.publishedAt,
    applicationsCount: job.applicationsCount,
    company: {
      name: job.employer?.companyName,
      email: job.employer?.user?.email,
    },
  })))
}

// PATCH /api/admin/jobs - Moderate job (approve/reject/flag)
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  // TODO: Verify admin role using session
  // In production, check session.user.role === 'admin'
  // const session = await getServerSession(authOptions)
  // if (!session || session.user.role !== 'admin') {
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
  // }
  const { jobId, action, reason } = await request.json()

  if (!jobId || !action) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const updateData: any = {}
  
  switch (action) {
    case "approve":
      updateData.status = "PUBLISHED"
      updateData.isActive = true
      break
    case "reject":
      updateData.status = "CLOSED"
      updateData.isActive = false
      break
    case "flag":
      updateData.isActive = false
      break
    default:
      return NextResponse.json({ error: "Invalid action" }, { status: 400 })
  }

  const job = await db.job.update({
    where: { id: jobId },
    data: updateData,
  })

  // Create notification for employer
  const message = action === "approve" 
    ? "Your job has been approved and published"
    : action === "reject"
    ? `Your job has been rejected${reason ? `: ${reason}` : ''}`
    : "Your job has been flagged and requires review"

  await db.notification.create({
    data: {
      userId: job.employerId,
      title: `Job ${action === "approve" ? "Approved" : action === "reject" ? "Rejected" : "Flagged"}`,
      message,
      type: "JOB_RECOMMENDED",
    },
  })

  return NextResponse.json({ success: true, job })
}