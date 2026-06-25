import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireCompanyMember } from "@/lib/company"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  let companySession
  try {
    companySession = await requireCompanyMember()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get("status")
  const assignedToMe = searchParams.get("assignedToMe") === "true"

  const where: any = { companyId: companySession.companyId }
  if (status) where.status = status
  if (assignedToMe) where.employerId = companySession.userId

  const jobs = await db.job.findMany({
    where,
    include: {
      employer: {
        select: { companyName: true, companyLogo: true, city: true, contactEmail: true },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return NextResponse.json(jobs)
}