import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export const dynamic = "force-dynamic"

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)

  const { searchParams } = new URL(request.url)
  const email = searchParams.get("email")
  const userEmail = email || session?.user?.email

  if (!userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await db.user.findUnique({
    where: { email: userEmail },
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  let fileUrl = ""
  let fileName = "Resume.pdf"
  let fileSize = 0
  let fileType = "pdf"

  const contentType = request.headers.get("content-type") || ""

  if (contentType.includes("application/json")) {
    const body = await request.json()
    fileUrl = body.fileUrl || ""
    fileName = body.fileName || "Resume.pdf"
    fileSize = body.fileSize || 0
    fileType = body.fileType || "pdf"
  } else {
    return NextResponse.json(
      { error: "Content-Type must be application/json. Upload files via UploadThing first." },
      { status: 400 }
    )
  }

  if (!fileUrl) {
    return NextResponse.json({ error: "fileUrl is required" }, { status: 400 })
  }

  const resume = await db.resume.upsert({
    where: { userId: user.clerkId },
    update: { fileName, fileUrl, fileType, fileSize, isUploaded: true },
    create: { userId: user.clerkId, fileName, fileUrl, fileType, fileSize, isUploaded: true },
  })

  return NextResponse.json({
    success: true,
    resume: { id: resume.id, fileName: resume.fileName, fileUrl: resume.fileUrl },
  })
}
