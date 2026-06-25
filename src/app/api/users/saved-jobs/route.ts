import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const savedJobs = await db.savedJob.findMany({
    where: { userId: user.clerkId },
    include: {
      job: {
        include: {
          employer: { select: { companyName: true, companyLogo: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(savedJobs.map(sj => ({
    id: sj.id,
    jobId: sj.jobId,
    savedAt: sj.createdAt,
    job: {
      id: sj.job.id,
      title: sj.job.title,
      slug: sj.job.slug,
      location: sj.job.location,
      city: sj.job.city,
      remoteWork: sj.job.remoteWork,
      jobType: sj.job.jobType,
      company: sj.job.employer,
    },
  })))
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { jobId } = await request.json()

  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 })
  }

  // Check if already saved
  const existing = await db.savedJob.findFirst({
    where: {
      userId: user.clerkId,
      jobId,
    },
  })

  if (existing) {
    return NextResponse.json({ error: "Job already saved" }, { status: 400 })
  }

  // Check saved jobs limit (100)
  const savedCount = await db.savedJob.count({
    where: { userId: user.clerkId },
  })

  if (savedCount >= 100) {
    return NextResponse.json({ error: "Maximum 100 saved jobs reached" }, { status: 400 })
  }

  const savedJob = await db.savedJob.create({
    data: {
      userId: user.clerkId,
      jobId,
    },
  })

  return NextResponse.json({ success: true, savedJob })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")
  const jobId = searchParams.get("jobId")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!jobId) {
    return NextResponse.json({ error: "jobId required" }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await db.savedJob.delete({
    where: {
      userId_jobId: {
        userId: user.clerkId,
        jobId: parseInt(jobId),
      },
    },
  })

  return NextResponse.json({ success: true })
}