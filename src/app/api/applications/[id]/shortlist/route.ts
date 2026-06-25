import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const applicationId = parseInt(params.id)
  const { isShortlisted } = await request.json()

  // Get application with job info
  const application = await db.jobApplication.findUnique({
    where: { id: applicationId },
    include: { job: true },
  })

  if (!application) {
    return NextResponse.json({ error: "Application not found" }, { status: 404 })
  }

  // Verify employer owns the job or is a company member
  const user = await db.user.findUnique({
    where: { email: userEmail as string },
    include: { companyMemberships: { take: 1 } },
  })

  if (!user) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const isOwner = application.job.employerId === user.clerkId
  const isCompanyMember = user.companyMemberships.length > 0
  if (!isOwner && !isCompanyMember) {
    return NextResponse.json({ error: "Not authorized" }, { status: 403 })
  }

  const updated = await db.jobApplication.update({
    where: { id: applicationId },
    data: { isShortlisted },
  })

  return NextResponse.json({ 
    success: true,
    isShortlisted: updated.isShortlisted 
  })
}