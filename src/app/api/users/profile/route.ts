import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

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
          skillsRelation: {
            include: { skill: true },
          },
        },
      },
      resume: true,
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
  const { 
    firstName, lastName, phone, dateOfBirth, address, city, country, nationality,
    jobTitle, summary, experienceYears, remoteWork, relocate, expectedSalary, availability,
    englishTestScore, englishTestDate, englishTestLevel,
    skills
  } = body

  const user = await db.user.update({
    where: { email: userEmail as string },
    data: {
      firstName,
      lastName,
      phone: phone || undefined,
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      address: address || undefined,
      city: city || undefined,
      country: country || undefined,
      nationality: nationality || undefined,
      englishTestScore: englishTestScore !== undefined ? englishTestScore : undefined,
      englishTestDate: englishTestDate ? new Date(englishTestDate) : undefined,
      englishTestLevel: englishTestLevel || undefined,
    },
  })

  const profile = await db.userProfile.upsert({
    where: { userId: user.clerkId },
    update: { 
      jobTitle: jobTitle || undefined,
      summary: summary || undefined,
      experienceYears: experienceYears !== undefined ? experienceYears : undefined,
      remoteWork: remoteWork !== undefined ? remoteWork : undefined,
      relocate: relocate !== undefined ? relocate : undefined,
      expectedSalary: expectedSalary ? parseFloat(expectedSalary) : undefined,
      availability: availability || undefined,
      skills: skills || undefined,
    },
    create: {
      userId: user.clerkId,
      jobTitle: jobTitle || null,
      summary: summary || null,
      experienceYears: experienceYears || null,
      remoteWork: remoteWork || false,
      relocate: relocate || false,
      expectedSalary: expectedSalary ? parseFloat(expectedSalary) : null,
      availability: availability || null,
      skills: skills || [],
    },
  })

  return NextResponse.json({ user, profile })
}