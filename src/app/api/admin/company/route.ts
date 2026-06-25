import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/company"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const company = await db.company.findUnique({ where: { slug: "loft-community" } })
  if (!company) {
    return NextResponse.json({ error: "Company not found" }, { status: 404 })
  }

  return NextResponse.json(company)
}

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  const { name, description, logo, website, contactEmail } = body

  const company = await db.company.update({
    where: { slug: "loft-community" },
    data: {
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(logo !== undefined && { logo }),
      ...(website !== undefined && { website }),
      ...(contactEmail !== undefined && { contactEmail }),
    },
  })

  return NextResponse.json({ success: true, company })
}
