import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { requireAdmin } from "@/lib/company"

export const dynamic = "force-dynamic"

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const memberId = parseInt(params.id)
  const { role } = await request.json()

  if (!role || !["ADMIN", "EMPLOYER"].includes(role)) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 })
  }

  const member = await db.companyMember.findUnique({ where: { id: memberId } })
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }

  const updated = await db.companyMember.update({
    where: { id: memberId },
    data: { role },
    include: {
      user: {
        select: { email: true, firstName: true, lastName: true, name: true },
      },
    },
  })

  return NextResponse.json({ success: true, member: updated })
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const memberId = parseInt(params.id)

  const member = await db.companyMember.findUnique({ where: { id: memberId } })
  if (!member) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 })
  }

  if (member.role === "ADMIN") {
    const adminCount = await db.companyMember.count({
      where: { companyId: 1, role: "ADMIN" },
    })
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last admin" },
        { status: 400 }
      )
    }
  }

  await db.companyMember.delete({ where: { id: memberId } })

  return NextResponse.json({ success: true })
}
