import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  // For demo, allow email param
  if (!email) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const userEmail = email || (await getServerSession(authOptions))?.user?.email

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
    include: {
      profile: {
        include: {
          skills: {
            include: { skill: true },
          },
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json(user)
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  // For demo, allow email param
  if (!email) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  const body = await request.json()
  const { firstName, lastName, jobTitle, summary, experienceYears, remoteWork, relocate, expectedSalary, availability } = body

  const user = await db.user.update({
    where: { email: userEmail as string },
    data: {
      firstName,
      lastName,
    },
  })

  const profile = await db.userProfile.upsert({
    where: { userId: user.clerkId },
    update: { 
      jobTitle, 
      summary, 
      experienceYears, 
      remoteWork, 
      relocate,
      expectedSalary,
      availability: availability || undefined,
    },
    create: {
      userId: user.clerkId,
      jobTitle, 
      summary, 
      experienceYears, 
      remoteWork, 
      relocate,
      expectedSalary,
      availability: availability || undefined,
    },
  })

  return NextResponse.json({ user, profile })
}