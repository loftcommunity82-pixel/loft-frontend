import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// In production, this would upload to Supabase/S3
// For now, we'll store the file info in database

export async function POST(request: NextRequest) {
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

  const formData = await request.formData()
  const file = formData.get("file") as File

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  // Validate file type
  if (file.type !== "application/pdf") {
    return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
  }

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 })
  }

  // For MVP - store as base64 or external URL
  // In production: upload to Supabase Storage
  const fileUrl = `/uploads/resumes/${user.clerkId}/${file.name}`

  const resume = await db.resume.upsert({
    where: { userId: user.clerkId },
    update: {
      fileName: file.name,
      fileUrl,
      fileType: "pdf",
      fileSize: file.size,
      isUploaded: true,
    },
    create: {
      userId: user.clerkId,
      fileName: file.name,
      fileUrl,
      fileType: "pdf",
      fileSize: file.size,
      isUploaded: true,
    },
  })

  return NextResponse.json({ 
    success: true, 
    resume: {
      id: resume.id,
      fileName: resume.fileName,
      fileUrl: resume.fileUrl,
    }
  })
}