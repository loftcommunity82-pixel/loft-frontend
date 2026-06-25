import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const applicationId = parseInt(params.id)
  const { notes } = await request.json()

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { companyMemberships: { take: 1 } },
  })

  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const application = await db.jobApplication.findUnique({
    where: { id: applicationId },
    include: { job: true },
  })

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  const isOwner = application.job.employerId === user.clerkId
  const isCompanyMember = user.companyMemberships.length > 0
  if (!isOwner && !isCompanyMember) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const updated = await db.jobApplication.update({
    where: { id: applicationId },
    data: { employerNotes: notes },
  })

  return NextResponse.json({ success: true, employerNotes: updated.employerNotes })
}
