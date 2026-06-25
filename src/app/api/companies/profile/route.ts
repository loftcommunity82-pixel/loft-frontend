import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { CompanySize } from "@prisma/client"

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
    include: { employerProfile: true },
  })

  return NextResponse.json(user?.employerProfile || null)
}

export async function PATCH(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")

  const userEmail = email || (await getServerSession(authOptions))?.user?.email
  
  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail as string },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  const body = await request.json()
  const { companyName, industry, size, description, website, city, country } = body

  if (!companyName || !industry || !size) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const sizeEnum = size as CompanySize

  const profile = await db.employerProfile.upsert({
    where: { userId: user.clerkId },
    update: { 
      companyName, 
      industry, 
      companySize: sizeEnum, 
      description, 
      companyWebsite: website, 
      city, 
      country 
    },
    create: {
      userId: user.clerkId,
      companyName,
      industry,
      companySize: sizeEnum,
      description,
      companyWebsite: website,
      city,
      country,
      contactEmail: user.email,
    },
  })

  return NextResponse.json({ success: true, profile })
}