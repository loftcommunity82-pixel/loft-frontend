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

  const members = await db.companyMember.findMany({
    where: { companyId: 1 },
    include: {
      user: {
        select: {
          id: true,
          clerkId: true,
          email: true,
          firstName: true,
          lastName: true,
          name: true,
          profileImage: true,
          isEmployer: true,
          employerProfile: {
            select: { companyName: true, industry: true, contactEmail: true },
          },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json(
    members.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      createdAt: m.createdAt,
      user: {
        clerkId: m.user.clerkId,
        email: m.user.email,
        firstName: m.user.firstName,
        lastName: m.user.lastName,
        name: m.user.name,
        profileImage: m.user.profileImage,
        isEmployer: m.user.isEmployer,
        companyName: m.user.employerProfile?.companyName || null,
        industry: m.user.employerProfile?.industry || null,
      },
    }))
  )
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { email, role } = await request.json()

  if (!email) {
    return NextResponse.json({ error: "Email required" }, { status: 400 })
  }

  const user = await db.user.findUnique({ where: { email } })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const existing = await db.companyMember.findUnique({
    where: { companyId_userId: { companyId: 1, userId: user.clerkId } },
  })
  if (existing) {
    return NextResponse.json({ error: "User is already a member" }, { status: 409 })
  }

  const member = await db.companyMember.create({
    data: {
      companyId: 1,
      userId: user.clerkId,
      role: role === "ADMIN" ? "ADMIN" : "EMPLOYER",
    },
    include: {
      user: {
        select: {
          email: true, firstName: true, lastName: true, name: true,
        },
      },
    },
  })

  return NextResponse.json({ success: true, member })
}
