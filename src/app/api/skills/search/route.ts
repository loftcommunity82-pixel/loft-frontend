import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') || ''
  if (q.length < 1) return NextResponse.json([])

  const skills = await db.skill.findMany({
    where: {
      name: { contains: q, mode: 'insensitive' },
    },
    take: 10,
    orderBy: { name: 'asc' },
  })

  return NextResponse.json(skills)
}
