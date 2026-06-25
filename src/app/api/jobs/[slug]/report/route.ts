import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest, { params }: { params: { slug: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const jobId = parseInt(params.slug)
  if (isNaN(jobId)) {
    return NextResponse.json({ error: "Invalid job ID" }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email: session.user.email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const { reason } = await request.json()
  if (!reason) {
    return NextResponse.json({ error: "Reason is required" }, { status: 400 })
  }

  await db.report.create({
    data: {
      reporterId: user.clerkId,
      reportedType: "JOB",
      reportedId: jobId,
      reason,
    },
  })

  return NextResponse.json({ success: true, message: "Report submitted. We will review it shortly." })
}
