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
    include: {
      profile: true,
    },
  })

  if (!user?.profile) {
    return NextResponse.json([])
  }

  const skills = await db.userSkill.findMany({
    where: { userId: user.profile.id },
    include: { skill: true },
  })

  return NextResponse.json(skills)
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { skillName, level } = await request.json()

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
    include: { profile: true },
  })

  if (!user?.profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  // Find or create skill
  let skill = await db.skill.findUnique({ where: { name: skillName } })
  
  if (!skill) {
    skill = await db.skill.create({
      data: { name: skillName, isCustom: true },
    })
  }

  // Check if already exists
  const existing = await db.userSkill.findFirst({
    where: {
      userId: user.profile.id,
      skillId: skill.id,
    },
  })

  if (existing) {
    return NextResponse.json({ error: "Skill already added" }, { status: 400 })
  }

  const userSkill = await db.userSkill.create({
    data: {
      userId: user.profile.id,
      skillId: skill.id,
      level: level || "INTERMEDIATE",
    },
    include: { skill: true },
  })

  return NextResponse.json(userSkill)
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")
  const skillId = searchParams.get("skillId")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (!skillId) {
    return NextResponse.json({ error: "skillId required" }, { status: 400 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
    include: { profile: true },
  })

  if (!user?.profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 })
  }

  await db.userSkill.delete({
    where: {
      userId_skillId: {
        userId: user.profile.id,
        skillId: parseInt(skillId),
      },
    },
  })

  return NextResponse.json({ success: true })
}