import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET() {
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

  const [
    totalUsers,
    totalSeekers,
    totalEmployers,
    activeJobs,
    totalApplications,
    hiredThisMonth,
    pendingJobs,
    flaggedJobs,
  ] = await Promise.all([
    db.user.count(),
    db.user.count({ where: { isApplicant: true } }),
    db.user.count({ where: { isEmployer: true } }),
    db.job.count({ where: { status: "PUBLISHED", isActive: true } }),
    db.jobApplication.count(),
    db.jobApplication.count({ 
      where: { 
        status: "HIRED",
      } 
    }),
    db.job.count({ where: { status: "DRAFT" } }),
    db.job.count({ where: { isActive: false, status: "PUBLISHED" } }),
  ])

  // Applications this week
  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)
  
  const applicationsThisWeek = await db.jobApplication.count({
    where: {
      appliedAt: { gte: weekAgo },
    },
  })

  const hireRate = totalApplications > 0 
    ? Math.round((hiredThisMonth / totalApplications) * 100) 
    : 0

  return NextResponse.json({
    totalUsers,
    totalSeekers,
    totalEmployers,
    activeJobs,
    totalApplications,
    applicationsThisWeek,
    hiredThisMonth,
    pendingJobs,
    flaggedJobs,
    hireRate,
    updatedAt: new Date().toISOString(),
  })
}